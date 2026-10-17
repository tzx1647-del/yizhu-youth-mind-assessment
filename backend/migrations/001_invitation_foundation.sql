-- 青少年心智应用测评 正式线上系统 v1.0
-- 数据库基础: 邀请管理 / 年龄 / 监护人确认 / 后续关联
-- 禁止在公开GitHub保存任何真实参与者数据或平台密钥。
create extension if not exists pgcrypto;

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.invitation_records (
  id uuid primary key default gen_random_uuid(),
  invitation_code text not null unique,
  -- 年龄由意竹向家长确认时录入, 孩子无需在学生端填写。
  student_age smallint not null check (student_age between 10 and 20),
  -- 保持最小数据采集: 不收集学校; 可按需分开记录监护人联系方式。
  guardian_contact text,
  consent_status text not null default 'pending'
    check (consent_status in ('pending','confirmed','withdrawn')),
  consent_text_version text,
  consent_confirmed_at timestamptz,
  consent_recorded_by uuid references auth.users(id),
  -- 单独留有记录证明授权方式/核验, 不代表简单勾选即合规。
  consent_evidence_ref text,
  invitation_status text not null default 'draft'
    check (invitation_status in ('draft','ready','started','completed','closed')),
  assessment_form_code text not null default 'A',
  assessment_version text not null default 'v0.3.2b',
  -- 链接原始凭证只提供一次，库里保存 SHA-256 哈希，不保存明文。
  invite_token_hash text not null unique check (length(invite_token_hash) = 64),
  token_expires_at timestamptz not null,
  student_display_name text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (consent_status <> 'confirmed' or
    (consent_text_version is not null and consent_confirmed_at is not null
     and consent_recorded_by is not null and consent_evidence_ref is not null))
);

create index if not exists invitation_records_created_at_idx
  on public.invitation_records(created_at desc);

-- 后续学生提交服务在同一事务内绑定 invitation_id 和 published assessment version.
create table if not exists public.assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitation_records(id) on delete restrict,
  form_code text not null,
  form_version text not null,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  scoring_result jsonb not null check (jsonb_typeof(scoring_result) = 'object'),
  is_simulation boolean not null default true,
  submitted_at timestamptz not null default now()
);
create index if not exists assessment_submissions_invitation_idx
  on public.assessment_submissions(invitation_id);

-- 家长报告经意竹审核后才能导出; 这里先预留状态和引用。
create table if not exists public.parent_report_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.assessment_submissions(id) on delete restrict,
  report_template_version text not null,
  review_status text not null default 'draft'
    check (review_status in ('draft','needs_review','approved','sent')),
  draft_json jsonb,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  check (review_status not in ('approved','sent') or
    (approved_by is not null and approved_at is not null))
);

-- 默认阻断浏览器对所有原始记录的直接查询。
alter table public.app_admins enable row level security;
alter table public.invitation_records enable row level security;
alter table public.assessment_submissions enable row level security;
alter table public.parent_report_reviews enable row level security;
-- 仅允许当前登录用户检查自己是否已被后台管理员授权。
create policy app_admin_self_lookup on public.app_admins
  for select to authenticated using (auth.uid() = user_id);
-- 不给其他表任何 anon/authenticated policy。实际读写必须经服务端二次校验角色。

comment on table public.invitation_records is
  '年龄在家长邀请阶段由管理员录入；学生页面不重复采集或显示；真实跨境数据收集须合规审查后启用。';
