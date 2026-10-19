create or replace function public.confirm_demo_report_section(p_report_id uuid,p_revision int,p_section text,p_admin uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare b jsonb; v text; c text; i int; part jsonb;
begin
 if auth.role()<>'service_role' and current_user<>'postgres' then raise exception 'service only'; end if;
 if not exists(select 1 from public.app_admins where user_id=p_admin) then raise exception 'admin required';end if;
 if p_section not in ('02','03','04','05') then raise exception 'invalid section';end if;
 select r.draft_json into b from public.parent_report_reviews r
  join public.assessment_submissions s on s.id=r.submission_id
  join public.invitation_records i on i.id=s.invitation_id
  where r.id=p_report_id and r.review_status='needs_review'
   and s.is_simulation=true and i.invitation_code like 'DEMO-%'
  for update of r;
 if b is null or coalesce((b->>'edit_revision')::int,0)<>p_revision then raise exception 'stale or locked';end if;
 for i in 1..4 loop if b->'sections'->i->>'number'=p_section then part=b->'sections'->i;exit;end if;end loop;
 if part is null then raise exception 'missing section';end if;
 select string_agg(value,' ') into c from jsonb_array_elements_text(part->'paragraphs') value;
 if ((p_section='02' and length(trim(coalesce(c,'')))<10) or (p_section<>'02' and length(trim(coalesce(c,'')))<25)) or c like '%【待审核】%' or c like '%这是一条模拟编辑测试%' then raise exception 'unfinished content';end if;
 b=jsonb_set(b,'{review_confirmations}',coalesce(b->'review_confirmations','{}'::jsonb),true);
 b=jsonb_set(b,array['review_confirmations',p_section],to_jsonb(p_revision),true);
 update public.parent_report_reviews set draft_json=b where id=p_report_id;
 return b;
end $$;
revoke all on function public.confirm_demo_report_section(uuid,int,text,uuid) from public,anon,authenticated;
grant execute on function public.confirm_demo_report_section(uuid,int,text,uuid) to service_role;