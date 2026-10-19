create or replace function public.save_demo_report_sections(
 p_report_id uuid,
 p_expected_revision integer,
 p_editable_sections jsonb
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare v public.parent_report_reviews%rowtype; body jsonb; sections jsonb; patch jsonb; n text; i integer; updated jsonb; rev integer;
begin
 if auth.role() <> 'service_role' and current_user <> 'postgres' then
  raise exception 'Service role required' using errcode='42501';
 end if;
 if jsonb_typeof(p_editable_sections) <> 'object'
    or (select count(*) from jsonb_object_keys(p_editable_sections)) <> 4
    or not (p_editable_sections ?& array['02','03','04','05']) then
  raise exception 'Expected only sections 02-05' using errcode='22023';
 end if;
 select * into v from public.parent_report_reviews where id=p_report_id for update;
 if not found or v.review_status not in ('draft','needs_review') then
  raise exception 'Report not editable' using errcode='P0001';
 end if;
 if not exists(select 1 from public.assessment_submissions s
              join public.invitation_records inv on inv.id=s.invitation_id
              where s.id=v.submission_id and s.is_simulation=true
              and inv.invitation_code like 'DEMO-%') then
  raise exception 'Simulation reports only' using errcode='42501';
 end if;
 body=v.draft_json;
 if jsonb_typeof(body) <> 'object' or jsonb_typeof(body->'sections') <> 'array'
   or jsonb_array_length(body->'sections')<>6 then
  raise exception 'Bad report structure' using errcode='22023';
 end if;
 rev=coalesce((body->>'edit_revision')::integer,0);
 if rev <> p_expected_revision then
  raise exception 'Revision conflict' using errcode='40001';
 end if;
 sections=body->'sections';
 for i in 0..5 loop
  n=sections->i->>'number';
  if n in ('02','03','04','05') then
   patch=p_editable_sections->n;
   if jsonb_typeof(patch)<>'string' or length(trim(patch #>> '{}'))=0
      or length(patch #>> '{}')>12000 then
    raise exception 'Invalid section content' using errcode='22023';
   end if;
   sections=jsonb_set(sections,array[i::text,'paragraphs'],jsonb_build_array(patch #>> '{}'),false);
   sections=jsonb_set(sections,array[i::text,'editorial_status'],'"pending_approval"'::jsonb,false);
  elsif n not in ('01','06') then
   raise exception 'Unexpected section numbering' using errcode='22023';
  end if;
 end loop;
 updated=jsonb_set(body,'{sections}',sections,false);
 updated=jsonb_set(updated,'{edit_revision}',to_jsonb(rev+1),true);
 updated=jsonb_set(updated,'{status}','"needs_review"'::jsonb,true);
 update public.parent_report_reviews
  set draft_json=updated,review_status='needs_review'
  where id=p_report_id;
 return updated;
end $$;
revoke all on function public.save_demo_report_sections(uuid,integer,jsonb) from public,anon,authenticated;
grant execute on function public.save_demo_report_sections(uuid,integer,jsonb) to service_role;
comment on function public.save_demo_report_sections(uuid,integer,jsonb) is
 'Atomic simulation-only draft section edit, preserves fixed 01/06, requires revision match and remains unapproved.';