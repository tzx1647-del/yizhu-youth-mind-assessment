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
 assert.ok(result.sections['03'].includes('铜牌级'));
 assert.doesNotMatch(Object.values(result.sections).join(' '),/61\.1%|60\.6%|节点|计分证据|得分率|18分|33分/);
 assert.ok(result.sections['04'].includes('情境'));
 assert.ok(result.sections['05'].includes('家长'));
 assert.equal(result.generation_method,'stage_progression_parent_readable_v3');
 assert.equal(result.sections['02'],'本次测评结果：孩子目前整体心智表现更接近铜牌级。');
 assert.ok(result.sections['03'].includes('【潜力级】'));
 assert.ok(result.sections['03'].includes('【当前层级：铜牌级】'));
 assert.ok(result.sections['05'].includes('铜牌级 → 银牌级'));
 assert.ok(!result.sections['05'].includes('【巩固已有的表现'));
 assert.ok(result.notice.includes('不是实际生活经历'));
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

test('two real answer contexts are used for an ability when cross-scenario evidence supports it',()=>{
 const x={...sub,answers:{'Q03-1':'B','Q10-1':'A','Q13-1':'C','Q23-1':'A','Q01-1':'B','Q17-1':'C'}};
 const result=generateSuggestedSections(x,inv);
 assert.ok(result.sections['04'].includes('测评设定的'));
 assert.ok(result.sections['04'].includes('孩子选择了接近'));
 assert.ok(result.sections['04'].includes('并非已核实发生过的生活事件'));
 assert.ok(result.sections['05'].includes('例如'));
});
test('one answered scenario cannot justify a confident individual ability conclusion',()=>{
 const x={...sub,answers:{'Q01-1':'B'}};
 const result=generateSuggestedSections(x,inv);
 assert.ok(result.sections['04'].includes('不足以形成可靠'));
 assert.ok(result.sections['05'].includes('先邀请孩子讲讲'));
});

test('each level targets only the next growth stage, gold moves toward adult mind growth without conversion',()=>{
 const targets=[['新星级','潜力级'],['潜力级','铜牌级'],['铜牌级','银牌级'],['银牌级','金牌级'],['金牌级','成人心智成长方向']];
 for(const [level,next] of targets){
  const report=generateSuggestedSections({...sub,scoring_result:{level}},inv);
  assert.ok(report.sections['05'].includes(level+' → '+next));
  assert.equal(report.sections['02'],'本次测评结果：孩子目前整体心智表现更接近'+level+'。');
 }
 const gold=generateSuggestedSections({...sub,scoring_result:{level:'金牌级'}},inv);
 assert.ok(gold.sections['05'].includes('不把青少年金牌级换算为成人六层级'));
});
