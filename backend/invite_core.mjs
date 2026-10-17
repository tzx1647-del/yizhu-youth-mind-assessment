import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
export const FORM_CODE='A', FORM_VERSION='v0.3.2b';
export function createInviteToken(){return randomBytes(32).toString('base64url')}
export function tokenDigest(token){
  if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))throw new TypeError('Invalid invitation token');
  return createHash('sha256').update(token,'utf8').digest('hex')
}
export function tokenMatches(token,storedDigest){
  try{
    if(typeof storedDigest!=='string'||!/^[0-9a-f]{64}$/.test(storedDigest))return false;
    return timingSafeEqual(Buffer.from(tokenDigest(token),'hex'),Buffer.from(storedDigest,'hex'))
  }catch{return false}
}
export function validateInvitationDraft({studentAge,formCode=FORM_CODE,formVersion=FORM_VERSION}){
  if(!Number.isInteger(studentAge)||studentAge<10||studentAge>20)throw new RangeError('Age must be an integer from 10 to 20');
  if(formCode!==FORM_CODE||formVersion!==FORM_VERSION)throw new RangeError('Unsupported assessment version');
  return {studentAge,formCode,formVersion};
}
export function canStartAssessment(record,now=new Date()){
  return Boolean(record&&record.consent_status==='confirmed'&&record.consent_text_version&&
    record.consent_evidence_ref&&record.invitation_status==='ready'&&
    record.assessment_form_code===FORM_CODE&&record.assessment_version===FORM_VERSION&&
    Number.isFinite(Date.parse(record.token_expires_at))&&
    Date.parse(record.token_expires_at)>now.getTime())
}