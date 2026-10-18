import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const original=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const online=readFileSync(new URL('./online-demo-preview.html',import.meta.url),'utf8');
const getLine=(data,prefix)=>data.split('\n').find(s=>s.startsWith(prefix));
test('server-linked demo keeps all 28 canonical scenarios and 35 answer nodes',()=>{
 const qLine=getLine(online,'const QUESTIONS=');
 assert.equal(qLine,getLine(original,'const QUESTIONS='));
 const q=JSON.parse(qLine.slice('const QUESTIONS='.length,-1));
 assert.equal(q.length,28);
 assert.equal(q.reduce((n,v)=>n+v.nodes.length,0),35);
});
test('server-linked demo never exposes canonical scoring keys or local scoring',()=>{
 assert.doesNotMatch(online,/const SCORING=|function calc\(|后台试测信息|上一题|prevBtn/);
 assert.match(online,/renderResult\(body\.student_result\)/);
 assert.match(online,/\/assessment-demo/);
 assert.match(online,/fetch\(DEMO_URL/);
});
test('demo requires validated invitation, has single direction and skips without scoring warning',()=>{
 assert.match(online,/startBtn" type="button" disabled/);
 assert.match(online,/inviteToken=token/);
 assert.match(online,/body\.status==="ready"/);
 assert.match(online,/body\.status==="completed"/);
 assert.match(online,/id="skipBtn"/);
 assert.match(online,/id="nextBtn"/);
 assert.match(online,/QUESTIONS\[idx\]\.nodes\.forEach\(n=>delete answers\[n\.node_id\]\)/);
 assert.doesNotMatch(online,/此题不得分|跳过扣分/);
});
test('server response drives results; real names forbidden by demo label',()=>{
 assert.match(online,/student_alias:"DEMO-Student"/);
 assert.match(online,/httpStatus===201/);
 assert.match(online,/httpStatus===409/);
 assert.match(online,/不填写真实学生/);
});
