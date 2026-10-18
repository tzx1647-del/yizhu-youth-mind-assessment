-- Run manually in the DEV database; all DEMO test rows are rolled back.
begin;
insert into public.invitation_records(invitation_code,student_age,invite_token_hash,token_expires_at,invitation_status)
values('DEMO-TWICE-TEST',13,repeat('d',64),now()+interval '1 hour','ready');
select public.submit_demo_assessment_once(
 repeat('d',64),'DEMO-Beta','{}'::jsonb,'{"simulation":true}'::jsonb,'v0.3.2b');
do $$
declare rejected boolean := false;
begin
 begin
  perform public.submit_demo_assessment_once(
   repeat('d',64),'DEMO-Beta','{}'::jsonb,'{"simulation":true}'::jsonb,'v0.3.2b');
 exception when raise_exception then rejected := true;
 end;
 if not rejected then raise exception 'FAILED: duplicate accepted'; end if;
end $$;
select count(*) as submissions_saved_once from public.assessment_submissions
where invitation_id=(select id from public.invitation_records where invitation_code='DEMO-TWICE-TEST');
rollback;
