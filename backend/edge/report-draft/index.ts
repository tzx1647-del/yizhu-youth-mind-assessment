// Protected family report draft creation / lookup. Only a real authorized Supabase administrator may call.
import {makeReportDraft,TEMPLATE_VERSION} from './template.mjs';
const base=Deno.env.get('SUPABASE_URL')||'';
const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const originAllowed='https://tzx1647-del.github.io';
const basic={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','Referrer-Policy':'no-referrer'};
const respond=(status,data,origin)=>new Response(JSON.stringify(data),{status,headers:{...basic,...(origin===originAllowed?{'Access-Control-Allow-Origin':originAllowed}:{})}});
const hdr={'apikey':service,'Authorization':'Bearer '+service};
async function api(path,opts={}){
 const r=await fetch(base+'/rest/v1/'+path,{...opts,headers:{...hdr,...opts.headers}});
 if(!r.ok)throw Error('Database unavailable');
 return await r.json();
}
async function authorized(req){
 const bearer=req.headers.get('authorization')||'';
 if(!/^Bearer [A-Za-z0-9._-]+$/.test(bearer))return null;
 const jwt=bearer.slice(7);
 const r=await fetch(base+'/auth/v1/user',{headers:{apikey:service,Authorization:'Bearer '+jwt}});
 if(!r.ok)return null;
 const u=await r.json();
 if(!u||typeof u.id!=='string')return null;
 const a=await api('app_admins?select=user_id&user_id=eq.'+encodeURIComponent(u.id)+'&limit=1');
 return Array.isArray(a)&&a.length===1?u.id:null;
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 if(req.method==='OPTIONS'){
  if(origin!==originAllowed)return new Response(null,{status:403,headers:basic});
  return new Response(null,{status:204,headers:{...basic,'Access-Control-Allow-Origin':originAllowed,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});
 }
 if(!['GET','POST'].includes(req.method))return respond(405,{error:'Method not allowed'},origin);
 if(!base||!service)return respond(503,{error:'Backend unavailable'},origin);
 const path=new URL(req.url).pathname;
 const m=path.match(/\/submissions\/([0-9a-f-]{36})\/draft$/);
 if(!m)return respond(404,{error:'Not found'},origin);
 const id=m[1];
 try{
  const admin=await authorized(req);
  if(!admin)return respond(403,{error:'Administrator access denied'},origin);
  const found=await api('parent_report_reviews?select=id,submission_id,report_template_version,review_status,draft_json,created_at&submission_id=eq.'+id+'&limit=1');
  if(found.length)return respond(200,{item:found[0],reused:true},origin);
  if(req.method==='GET')return respond(404,{error:'No report draft yet'},origin);
  const submissions=await api('assessment_submissions?select=id,invitation_id,form_code,form_version,is_simulation,scoring_result&is_simulation=eq.true&id=eq.'+id+'&limit=1');
  if(submissions.length!==1)return respond(404,{error:'Simulation submission not found'},origin);
  const source=submissions[0];
  const invitations=await api('invitation_records?select=id,invitation_code,student_age,student_display_name&id=eq.'+source.invitation_id+'&limit=1');
  if(invitations.length!==1)return respond(404,{error:'Invitation not found'},origin);
  const draft=makeReportDraft(source,invitations[0]);
  const response=await fetch(base+'/rest/v1/parent_report_reviews?on_conflict=submission_id',{method:'POST',
   headers:{...hdr,'Content-Type':'application/json','Prefer':'resolution=ignore-duplicates,return=representation'},
   body:JSON.stringify({submission_id:source.id,report_template_version:TEMPLATE_VERSION,review_status:'needs_review',draft_json:draft})});
  if(!response.ok)throw Error('Unable to save report draft');
  const inserted=await response.json();
  if(inserted.length)return respond(201,{item:inserted[0],reused:false},origin);
  const existing=await api('parent_report_reviews?select=id,submission_id,report_template_version,review_status,draft_json,created_at&submission_id=eq.'+id+'&limit=1');
  return respond(200,{item:existing[0],reused:true},origin);
 }catch{return respond(503,{error:'Unable to generate report draft'},origin);}
});