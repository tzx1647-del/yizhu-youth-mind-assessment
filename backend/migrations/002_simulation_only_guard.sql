-- Dev-only safety gate: reject production submissions until a reviewed migration explicitly removes this constraint.
alter table public.assessment_submissions
  add constraint development_simulation_only check (is_simulation = true);
comment on constraint development_simulation_only on public.assessment_submissions is
  'Development database rejects non-simulation submissions. Explicit review required before production launch.';