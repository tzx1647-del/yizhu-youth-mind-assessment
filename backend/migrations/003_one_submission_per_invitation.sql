-- 一份邀请只能有一份已保存测评记录，禁止再次提交第二份
-- 开发库当前没有真实/模拟记录。上线前服务器端还需校验邀请令牌、状态和事务幂等。
create unique index if not exists assessment_submissions_one_per_invitation
  on public.assessment_submissions(invitation_id);
comment on index public.assessment_submissions_one_per_invitation is
  'Server-side uniqueness gate for one submitted assessment per invitation; API must handle repeat POST idempotently without opening a new assessment.';
