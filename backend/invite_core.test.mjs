import test from 'node:test';
import assert from 'node:assert/strict';
import {createInviteToken,tokenDigest,tokenMatches,validateInvitationDraft,canStartAssessment} from './invite_core.mjs';
const ready={consent_status:'confirmed',consent_text_version:'test-v1',consent_evidence_ref:'synthetic',
invitation_status:'ready',assessment_form_code:'A',assessment_version:'v0.3.2b',
token_expires_at:'2030-01-01T00:00:00Z'};
test('secure invitation token',()=>{
  const a=createInviteToken(),b=createInviteToken();
  assert.notEqual(a,b);assert.equal(tokenMatches(a,tokenDigest(a)),true);
  assert.equal(tokenMatches(b,tokenDigest(a)),false);assert.equal(tokenMatches('invalid',tokenDigest(a)),false);
});
test('age and fixed A-form version',()=>{
  assert.equal(validateInvitationDraft({studentAge:12}).formVersion,'v0.3.2b');
  for(const age of [9,21,12.5,'12',null])assert.throws(()=>validateInvitationDraft({studentAge:age}));
  assert.throws(()=>validateInvitationDraft({studentAge:12,formVersion:'v0.3.2c'}));
});
test('consent, expiry, status, version gates',()=>{
  const now=new Date('2026-10-17T00:00:00Z');
  assert.equal(canStartAssessment(ready,now),true);
  for(const [k,v] of Object.entries({consent_status:'pending',invitation_status:'closed',
    assessment_version:'v0.3.2c',token_expires_at:'2026-01-01T00:00:00Z',consent_evidence_ref:null}))
    assert.equal(canStartAssessment({...ready,[k]:v},now),false,k);
});