import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=readFileSync(new URL('./admin-dashboard-preview.html',import.meta.url),'utf8');
test('PDF print view is gated by freshly fetched approved revision',()=>{
 assert.match(ui,/record\?\.review_status!=="approved"/);
 assert.match(ui,/doc\?\.status!=="approved"/);
 assert.match(ui,/Number\(doc.approved_revision\)!==Number\(doc.edit_revision\|\|0\)/);
 assert.match(ui,/doc.sections.length!==6/);
 assert.match(ui,/const record=data.item,doc=record\?\.draft_json/);
});
test('A4 Chinese long-form print styles preserve readability',()=>{
 assert.match(ui,/@page\{size:A4;margin:20mm 20mm 22mm 20mm\}/);
 assert.match(ui,/line-height:1.95/);
 assert.match(ui,/orphans:3;widows:3/);
 assert.match(ui,/page-break-after:avoid/);
 assert.match(ui,/white-space:pre-wrap/);
 assert.match(ui,/打印／保存为PDF/);
});
test('three approved quotes remain in their report positions',()=>{
 const quotes=['成绩记录孩子学会了什么，心智成长让我们看见孩子正在成为怎样的人。','AI时代，心智为王。','教育不只是让孩子学会知识，更是帮助孩子认识自己。'];
 for(const quote of quotes)assert.ok(ui.includes(quote));
});
test('approved report is never filled with raw scoring keys or editable draft',()=>{
 assert.doesNotMatch(ui,/const SCORING=/);
 assert.match(ui,/if\(locked\)\{/);
 assert.match(ui,/printDoc.createElement/);
 assert.match(ui,/node.textContent=String\(txt\)/);
});
