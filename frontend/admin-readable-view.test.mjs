import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const base=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const dashboard=readFileSync(new URL("./admin-dashboard-preview.html",import.meta.url),"utf8");
function block(html,key){const m=html.match(new RegExp("const "+key+" = (\\{[\\s\\S]*?\\n\\});"));assert.ok(m,key);return m[0]}
test("admin sees canonical 28 scenarios and 35 nodes, without changing question text",()=>{
 const source=base.split("\n").find(x=>x.startsWith("const QUESTIONS="));
 const target=dashboard.split("\n").find(x=>x.startsWith(" const QUESTIONS="));
 assert.equal(target?.trim(),source);
 const questions=JSON.parse(source.slice("const QUESTIONS=".length,-1));
 assert.equal(questions.length,28);
 assert.equal(questions.reduce((n,q)=>n+q.nodes.length,0),35);
});
test("approved student growth texts remain unchanged",()=>{
 for(const name of ["levelText","abilityText","growthText"])assert.ok(dashboard.includes(block(base,name)));
});
test("admin requires authorization and safe DOM rendering",()=>{
 assert.match(dashboard,/adminGet\("me"\)/);
 assert.match(dashboard,/adminGet\("submissions\/"/);
 assert.doesNotMatch(dashboard,/\.innerHTML=|JSON\.stringify\(d\.item,null,2\)/);
 assert.match(dashboard,/textContent=String\(text\)/);
});
test("Chinese overview and answers have clear skipped-state wording",()=>{
 for(const word of ["学生测评概览","成长结果解读","跃迁层计分与能力证据","28道情境题的完整答卷","未作答／跳过","模拟测试"])assert.ok(dashboard.includes(word),word);
});
