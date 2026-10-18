import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {scoreDemoAnswers, FORM_VERSION} from './score.mjs';
const html=readFileSync(new URL('../../../index.html',import.meta.url),'utf8');
const canonical=html.split('\n').find(x=>x.startsWith('const SCORING='));
const extracted=readFileSync(new URL('./score.mjs',import.meta.url),'utf8').split('\n').find(x=>x.startsWith('const SCORING='));
test('server scorer uses exactly the same canonical A-form scoring keys',()=>{
 assert.equal(extracted,canonical);
 assert.equal(FORM_VERSION,'v0.3.2b');
 assert.equal(Object.keys(JSON.parse(extracted.slice('const SCORING='.length,-1))).length,35);
});
test('unanswered scenario nodes are valid, scored with existing zero rule',()=>{
 const result=scoreDemoAnswers({});
 assert.equal(result.level,'新星级');
 assert.equal(result.layer.NP,0); assert.equal(result.layer.PC,0);
 assert.equal(result.layer.CS,0); assert.equal(result.layer.SG,0);
});
test('server rejects forged or invalid node / choice',()=>{
 assert.throws(()=>scoreDemoAnswers({'FAKE-1':'A'}));
 assert.throws(()=>scoreDemoAnswers({'Q01-1':'Z'}));
 assert.throws(()=>scoreDemoAnswers({'Q01-1':null}));
 assert.throws(()=>scoreDemoAnswers([]));
});
