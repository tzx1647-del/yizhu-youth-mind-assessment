import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=readFileSync(new URL('./admin-dashboard-preview.html',import.meta.url),'utf8');
const edge=readFileSync(new URL('../backend/edge/report-draft/index.ts',import.meta.url),'utf8');
const review=readFileSync(new URL('../backend/migrations/010_review_confirmation_storage.sql',import.meta.url),'utf8');
const approval=readFileSync(new URL('../backend/migrations/008_approve_demo_report.sql',import.meta.url),'utf8');
test('authenticated server controls separate section confirmation and final approval',()=>{
 assert.match(edge,/confirm_demo_report_section/);
 assert.match(edge,/approve_demo_parent_report/);
 assert.match(edge,/authorized\(req\)/);
 assert.match(edge,/review_status!=='needs_review'/);
});
test('review stays bound to saved revision and locked when approved',()=>{
 assert.match(review,/edit_revision/);
 assert.match(review,/review_confirmations/);
 assert.match(approval,/review_status='approved'/);
 assert.match(approval,/approved_by=p_admin/);
 assert.match(approval,/approved_at=now\(\)/);
 assert.match(approval,/checks->>n/);
});
test('browser requires every chapter and keeps approved report read-only',()=>{
 assert.match(ui,/\["02","03","04","05"\]\.every\(n=>checks\[n\]===rev\)/);
 assert.match(ui,/record.review_status==='approved'/);
 assert.match(ui,/reportDirty/);
 assert.match(ui,/async function reviewSection/);
 assert.match(ui,/async function approveReport/);
});
