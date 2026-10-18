// DEMO ONLY. No real child data; no parent details; no public access to raw scores.
import { scoreDemoAnswers, FORM_VERSION } from './score.mjs';
const base=Deno.env.get('SUPABASE_URL')||'';
const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const common={'Content-Type':'application/json','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'POST,OPTIONS'};
const respond=(code,data)=>new Response(JSON.stringify(data),{status:code,headers:common});
const digest=async(s)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(n=>n.toString(16).padStart(2,'0')).join('');
const apiHeaders={'apikey':service,'Authorization':'Bearer '+service};
function validToken(t){return typeof t==='string' && /^[A-Za-z0-9_-]{43}$/.test(t);}
async function findDemoInvite(token){
 const hash=await digest(token);
 const fields='invitation_code,invitation_status,assessment_version,assessment_form_code,token_expires_at,guardian_contact,consent_status,consent_evidence_ref';
 const u=base+'/rest/v1/invitation_records?invite_token_hash=eq.'+hash+'&select='+encodeURIComponent(fields)+'&limit=1';
 const r=await fetch(u,{headers:apiHeaders});
 if(!r.ok)throw Error('Backend unavailable');
 const rows=await r.json();
 const v=rows[0];
 if(!v||!v.invitation_code.startsWith('DEMO-')||v.guardian_contact!==null||v.consent_status!=='pending'||v.consent_evidence_ref!==null||v.assessment_form_code!=='A'||v.assessment_version!==FORM_VERSION||Date.parse(v.token_expires_at)<=Date.now())return {status:'invalid'};
 return {status:v.invitation_status==='completed'?'completed':v.invitation_status==='ready'?'ready':'invalid'};
}
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:common});
 if(req.method!=='POST')return respond(405,{error:'POST required'});
 if(!base||!service)return respond(503,{error:'Service not configured'});
 if(Number(req.headers.get('content-length')||0)>20000)return respond(413,{error:'Payload too large'});
 let data;
 try{data=await req.json();}catch{return respond(400,{error:'Invalid JSON'});}
 if(!data||!validToken(data.token))return respond(400,{error:'Invalid demo token'});
 const url=new URL(req.url);
 if(url.pathname.endsWith('/check')){
  try{return respond(200,await findDemoInvite(data.token));}catch{return respond(503,{error:'Backend unavailable'});}
 }
 if(!url.pathname.endsWith('/submit'))return respond(404,{error:'Unknown action'});
 if(typeof data.student_alias!=='string'||!/^DEMO-[A-Za-z0-9_-]{1,32}$/.test(data.student_alias))return respond(400,{error:'Simulation alias DEMO-* required. Do not enter real names.'});
 if(data.form_version!==FORM_VERSION)return respond(400,{error:'Unsupported form version'});
 let calculated;
 try{calculated=scoreDemoAnswers(data.answers);}catch{return respond(400,{error:'Invalid answers'});}
 try{
  const state=await findDemoInvite(data.token);
  if(state.status==='completed')return respond(409,{error:'Assessment already completed'});
  if(state.status!=='ready')return respond(403,{error:'Invitation not ready'});
  const hash=await digest(data.token);
  const r=await fetch(base+'/rest/v1/rpc/submit_demo_assessment_once',{method:'POST',headers:{...apiHeaders,'Content-Type':'application/json'},body:JSON.stringify({p_token_digest:hash,p_student_alias:data.student_alias,p_answers:data.answers,p_scoring_result:calculated,p_form_version:FORM_VERSION})});
  if(!r.ok){
   if([400,409].includes(r.status))return respond(409,{error:'Submission rejected or already completed'});
   const e=await r.json().catch(()=>({}));
   if(e.code==='P0001'||e.code==='23505')return respond(409,{error:'Invitation no longer available'});
   return respond(503,{error:'Submission unavailable'});
  }
  const id=await r.json();
  return respond(201,{status:'completed',submission_id:id,student_result:{level:calculated.level}});
 }catch{return respond(503,{error:'Backend unavailable'});}
});
