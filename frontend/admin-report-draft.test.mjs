import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReportDraft,INTRO,ABOUT} from '../backend/edge/report-draft/template.mjs';
import {readFileSync} from 'node:fs';
const ui=readFileSync(new URL('./admin-dashboard-preview.html',import.meta.url),'utf8');
const edge=readFileSync(new URL('../backend/edge/report-draft/index.ts',import.meta.url),'utf8');
const sub={id:'s1',invitation_id:'i1',is_simulation:true,form_code:'A',form_version:'v0.3.2b',scoring_result:{level:'铜牌级'}};
const invite={id:'i1',invitation_code:'DEMO-TEST',student_display_name:'DEMO-Student',student_age:12};
test('current copper-level submission generates draft but never inherits gold-level sample statements',()=>{
 const d=makeReportDraft(sub,invite);
 assert.equal(d.assessment_level,'铜牌级');
 assert.equal(d.sections.length,6);
 assert.deepEqual(d.sections[0].paragraphs,INTRO);
 assert.deepEqual(d.sections[5].paragraphs,ABOUT);
 for(const section of d.sections.slice(1,5)){
  assert.equal(section.editorial_status,'pending_approval');
  assert.ok(section.paragraphs.some(text=>text.includes('【待审核】')));
 }
 assert.ok(d.sections[1].paragraphs[0].includes('铜牌级'));
 assert.equal(d.status,'needs_review');
});
test('report refuses real or mismatched identity, and unsupported scoring level',()=>{
 assert.throws(()=>makeReportDraft({...sub,is_simulation:false},invite));
 assert.throws(()=>makeReportDraft(sub,{...invite,id:'other'}));
 assert.throws(()=>makeReportDraft(sub,{...invite,invitation_code:'REAL-123'}));
 assert.throws(()=>makeReportDraft({...sub,scoring_result:{level:'未知'}},invite));
});
test('admin draft endpoint checks login plus authorization and never approves or exports',()=>{
 assert.match(edge,/auth\/v1\/user/);
 assert.match(edge,/app_admins\?select=user_id/);
 assert.match(edge,/review_status:'needs_review'/);
 assert.doesNotMatch(edge,/review_status:'approved'|export-pdf/);
 assert.match(ui,/id="createDraft"/);
 assert.match(ui,/renderReportDraft\(data.item\)/);
 assert.doesNotMatch(ui,/\.innerHTML=/);
});
