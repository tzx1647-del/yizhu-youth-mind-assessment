import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const baseline = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const preview = readFileSync(new URL('../frontend/student-flow-preview.html', import.meta.url), 'utf8');
function dataSource(html, name) {
 const match = html.match(new RegExp('const ' + name + '=(\\\\[[^\\\\n]+\\\\]|\\\\{[^\\\\n]+\\\\});'));
 assert.ok(match, 'Missing ' + name);
 return match[1];
}
test('preview preserves canonical A-form questions and scoring byte-for-byte', () => {
 assert.equal(dataSource(preview, 'QUESTIONS'), dataSource(baseline, 'QUESTIONS'));
 assert.equal(dataSource(preview, 'SCORING'), dataSource(baseline, 'SCORING'));
 const questions = JSON.parse(dataSource(preview, 'QUESTIONS'));
 const scores = JSON.parse(dataSource(preview, 'SCORING'));
 assert.equal(questions.length, 28);
 assert.equal(questions.reduce((sum, question) => sum + question.nodes.length, 0), 35);
 assert.equal(Object.keys(scores).length, 35);
});
test('preview has forward-only navigation and skip without scoring alert', () => {
 assert.match(preview, /id="nextBtn"/);
 assert.match(preview, /id="skipBtn"[^>]*>跳过此题/);
 assert.doesNotMatch(preview, /id="prevBtn"|上一题|prevBtn/);
 assert.match(preview, /skipBtn\.addEventListener\("click"/);
 assert.match(preview, /QUESTIONS\[idx\]\.nodes\.forEach/);
 assert.doesNotMatch(preview, /此题不得分|扣分提示/);
});
test('preview does not display internal scoring information to student', () => {
 assert.doesNotMatch(preview, /后台试测信息|SG跨能力明确支持：|未作答直接计分节点：/);
 assert.match(preview, /模拟开发预览/);
});
