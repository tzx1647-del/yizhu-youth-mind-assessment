import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSuggestedSections} from '../backend/edge/report-draft/generator.mjs';
import {SCORING} from '../backend/edge/report-draft/evidence.mjs';
import {readFileSync} from 'node:fs';
const baseline=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const page=readFileSync(new URL('./admin-dashboard-preview.html',import.meta.url),'utf8');
const api=readFileSync(new URL('../backend/edge/report-draft/index.ts',import.meta.url),'utf8');
const sub={id:'s1',invitation_id:'i1',is_simulation:true,form_code:'A',form_version:'v0.3.2b',scoring_result:{level:'铜牌级',rate:{NP:0.6111,PC:0.606,CS:0.542,SG:0.704}},answers:{'Q01-1':'B','Q02-1':'C','Q04-1':'A','Q08-1':'A'}};
const inv={id:'i1',invitation_code:'DEMO-EXAMPLE',student_age:12};
test('generated sections are nonblank personalized drafts for same submission',()=>{
 const result=generateSuggestedSections(sub,inv);
 assert.deepEqual(Object.keys(result.sections),['02','03','04','05']);
 assert.ok(result.sections['02'].includes('铜牌级'));
 assert.ok(result.sections['03'].includes('61.1%'));
 assert.ok(result.sections['04'].includes('情境'));
 assert.ok(result.sections['05'].includes('家长'));
 assert.ok(result.notice.includes('审核'));
});
test('generator rejects non-demo, mismatched or unknown-level inputs',()=>{
 assert.throws(()=>generateSuggestedSections({...sub,is_simulation:false},inv));
 assert.throws(()=>generateSuggestedSections(sub,{...inv,id:'other'}));
 assert.throws(()=>generateSuggestedSections({...sub,scoring_result:{level:'不存在'}},inv));
});
test('private scoring keys exactly match canonical source',()=>{
 const base=JSON.parse(baseline.match(/const SCORING=(\{[^\n]+\});/)[1]);
 assert.deepEqual(SCORING,base);
});
test('existing edits are not overwritten when merely asking for suggestions',()=>{
 assert.ok(api.includes("return respond(200,{suggestion,stored:false,requires_review:true}"));
 assert.ok(page.includes('window.confirm('));
 assert.ok(page.includes('按钮生成或读取待审核家长报告草稿'));
 assert.ok(!page.includes('const SCORING='));
});
