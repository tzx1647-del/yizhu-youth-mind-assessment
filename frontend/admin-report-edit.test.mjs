import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=readFileSync(new URL('./admin-dashboard-preview.html',import.meta.url),'utf8');
const edge=readFileSync(new URL('../backend/edge/report-draft/index.ts',import.meta.url),'utf8');
const sql=readFileSync(new URL('../backend/migrations/006_demo_report_edit_revision.sql',import.meta.url),'utf8');
test('only report sections 02 to 05 have editing textareas',()=>{
 assert.match(ui,/\["02","03","04","05"\]\.includes\(section\.number\)/);
 assert.match(ui,/get\("saveDraft"\)/);
 assert.match(ui,/expected_revision:expected/);
 assert.match(ui,/\.querySelector\('textarea\[data-section=/);
 assert.doesNotMatch(ui,/\.innerHTML=/);
});
test('backend requires JWT+administrator and restricts report edits',()=>{
 assert.match(edge,/auth\/v1\/user/);
 assert.match(edge,/app_admins\?select=user_id/);
 assert.match(edge,/Object\.keys\(body\.sections\)\.sort\(\)\.join\(','\)!=='02,03,04,05'/);
 assert.match(edge,/save_demo_report_sections/);
});
test('atomic SQL restricts sections, checks revision and maintains review state',()=>{
 assert.match(sql,/p_editable_sections \?& array\['02','03','04','05'\]/);
 assert.match(sql,/rev <> p_expected_revision/);
 assert.match(sql,/v\.review_status not in \('draft','needs_review'\)/);
 assert.match(sql,/set draft_json=updated,review_status='needs_review'/);
 assert.match(sql,/n in \('02','03','04','05'\)/);
});
