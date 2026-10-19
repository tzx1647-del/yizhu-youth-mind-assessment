import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildNodeEvidence,SCORING} from '../backend/edge/admin-read/evidence.mjs';
const baseline=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const ui=readFileSync(new URL('./admin-dashboard-preview.html',import.meta.url),'utf8');
const canonical=JSON.parse(baseline.match(/const SCORING=(\{[^\n]+\});/)[1]);
test('all administrator node evidence uses frozen A-form scoring',()=>{
 assert.deepEqual(SCORING,canonical);
 assert.equal(Object.keys(SCORING).length,35);
});
test('Q01 B and skipped choice score correctly, validation is not scored',()=>{
 const out=buildNodeEvidence({'Q01-1':'B'});
 assert.equal(out['Q01-1'].ability,'价值认知');
 assert.equal(out['Q01-1'].transition,'新星→潜力');
 assert.equal(out['Q01-1'].score,1);
 assert.equal(out['Q02-1'].score,0);
 assert.equal(out['Q02-1'].missing,true);
 assert.equal(out['Q28-2'].score,null);
 assert.equal(out['Q28-2'].max_score,null);
});
test('public administrator HTML displays four fields but contains no scoring key',()=>{
 for(const field of ['对应能力','层级跃迁','节点性质','本节点证据分数'])assert.ok(ui.includes(field));
 assert.ok(!ui.includes('const SCORING='));
 assert.ok(ui.includes('record.node_evidence?.[node.node_id]'));
 assert.ok(!ui.includes('JSON.stringify(d.item,null,2)'));
});
