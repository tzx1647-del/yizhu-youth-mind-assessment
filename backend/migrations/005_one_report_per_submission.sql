-- One draft or approved parent report per assessment submission.
-- Never permit duplicate report records for the same child response.
create unique index if not exists parent_report_reviews_one_per_submission
 on public.parent_report_reviews(submission_id);
comment on index public.parent_report_reviews_one_per_submission is
 'One reviewed parent report per assessment submission; draft may be revised and approved later.';
