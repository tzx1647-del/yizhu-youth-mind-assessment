-- Simulation-only atomic submission function. NEVER use with real student data.
create or replace function public.submit_demo_assessment_once(
  p_token_digest text,
  p_student_alias text,
  p_answers jsonb,
  p_scoring_result jsonb,
  p_form_version text
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_inv public.invitation_records%rowtype; v_id uuid;
begin
  if current_user <> 'postgres' and auth.role() <> 'service_role' then
    raise exception 'service_role required' using errcode='42501';
  end if;
  if p_token_digest !~ '^[0-9a-f]{64}$'
    or p_student_alias !~ '^DEMO-[A-Za-z0-9_-]{1,32}$'
    or p_form_version <> 'v0.3.2b'
    or jsonb_typeof(p_answers) <> 'object'
    or jsonb_typeof(p_scoring_result) <> 'object' then
    raise exception 'Invalid demo submission' using errcode='22023';
  end if;
  select * into v_inv from public.invitation_records
    where invite_token_hash=p_token_digest for update;
  if not found or v_inv.invitation_code not like 'DEMO-%'
     or v_inv.consent_status <> 'pending'
     or v_inv.consent_evidence_ref is not null
     or v_inv.guardian_contact is not null
     or v_inv.invitation_status <> 'ready'
     or v_inv.assessment_form_code <> 'A'
     or v_inv.assessment_version <> p_form_version
     or v_inv.token_expires_at <= now() then
    raise exception 'Demo invite invalid, expired, or already completed' using errcode='P0001';
  end if;
  insert into public.assessment_submissions (
    invitation_id, form_code, form_version, answers, scoring_result, is_simulation
  ) values (v_inv.id,'A',p_form_version,p_answers,p_scoring_result,true)
  returning id into v_id;
  update public.invitation_records
    set invitation_status='completed',student_display_name=p_student_alias,updated_at=now()
    where id=v_inv.id;
  return v_id;
end $$;
revoke all on function public.submit_demo_assessment_once(text,text,jsonb,jsonb,text) from public, anon, authenticated;
grant execute on function public.submit_demo_assessment_once(text,text,jsonb,jsonb,text) to service_role;
comment on function public.submit_demo_assessment_once(text,text,jsonb,jsonb,text) is
  'DEVELOPMENT ONLY: atomic one-submission flow for synthetic DEMO invitations; not for real minors.';
