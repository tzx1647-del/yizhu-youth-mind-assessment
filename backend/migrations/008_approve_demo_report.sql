create or replace function public.approve_demo_parent_report(p_report_id uuid,p_revision int,p_admin uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare b jsonb; checks jsonb; j int; n text; row_id uuid;
begin
 if auth.role()<>'service_role' and current_user<>'postgres' then raise exception 'service only' using errcode='42501';end if;
 if not exists(select 1 from public.app_admins where user_id=p_admin) then raise exception 'admin required' using errcode='42501';end if;
 select r.draft_json,r.id into b,row_id from public.parent_report_reviews r
  join public.assessment_submissions s on s.id=r.submission_id
  join public.invitation_records i on i.id=s.invitation_id
  where r.id=p_report_id and r.review_status='needs_review' and s.is_simulation=true and i.invitation_code like 'DEMO-%'
  for update of r;
 if b is null then raise exception 'missing or locked demo report' using errcode='P0001';end if;
 if coalesce((b->>'edit_revision')::int,0)<>p_revision then raise exception 'stale report revision' using errcode='40001';end if;
 checks=coalesce(b->'review_confirmations','{}'::jsonb);
 if jsonb_typeof(b->'sections')<>'array' or jsonb_array_length(b->'sections')<>6 then raise exception 'invalid report structure';end if;
 for j in 0..5 loop
  n=lpad((j+1)::text,2,'0');
  if b->'sections'->j->>'number'<>n then raise exception 'wrong chapter order';end if;
  if j between 1 and 4 and (not checks?n or (checks->>n)::int<>p_revision) then
    raise exception 'each chapter must be confirmed for current revision' using errcode='P0002';
  end if;
 end loop;
 b=jsonb_set(jsonb_set(b,'{status}','"approved"'::jsonb,true),'{approved_revision}',to_jsonb(p_revision),true);
 update public.parent_report_reviews set draft_json=b,review_status='approved',approved_by=p_admin,approved_at=now() where id=row_id;
 return b;
end $$;
revoke all on function public.approve_demo_parent_report(uuid,int,uuid) from public,anon,authenticated;
grant execute on function public.approve_demo_parent_report(uuid,int,uuid) to service_role;