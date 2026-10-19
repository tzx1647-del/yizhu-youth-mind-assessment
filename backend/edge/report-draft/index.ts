// Protected family report draft creation / lookup. Only a real authorized Supabase administrator may call.
import {makeReportDraft,TEMPLATE_VERSION} from './template.mjs';
import {generateSuggestedSections} from './generator.mjs';
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
 const m=path.match(/\/submissions\/([0-9a-f-]{36})\/draft(\/edit|\/suggest)?$/);
 if(!m)return respond(404,{error:'Not found'},origin);
 const id=m[1],editing=m[2]==='/edit',suggesting=m[2]==='/suggest';
 if(suggesting&&req.method!=='POST')return respond(405,{error:'POST required'},origin);
 if(editing&&req.method!=='POST')return respond(405,{error:'POST required'},origin);
 try{
  const admin=await authorized(req);
  if(!admin)return respond(403,{error:'Administrator access denied'},origin);
  const found=await api('parent_report_reviews?select=id,submission_id,report_template_version,review_status,draft_json,created_at&submission_id=eq.'+id+'&limit=1');
  if(suggesting){
   const submissions=await api('assessment_submissions?select=id,invitation_id,form_code,form_version,is_simulation,answers,scoring_result&is_simulation=eq.true&id=eq.'+id+'&limit=1');
   if(submissions.length!==1)return respond(404,{error:'Simulation submission not found'},origin);
   const source=submissions[0];
   const invitations=await api('invitation_records?select=id,invitation_code,student_age,student_display_name&id=eq.'+source.invitation_id+'&limit=1');
   if(invitations.length!==1)return respond(404,{error:'Invitation not found'},origin);
   const suggestion=generateSuggestedSections(source,invitations[0]);
   return respond(200,{suggestion,stored:false,requires_review:true},origin);
  }
  if(editing){
   if(found.length!==1)return respond(404,{error:'Report draft not found'},origin);
   if(found[0].review_status!=='needs_review'&&found[0].review_status!=='draft')return respond(409,{error:'Report already locked'},origin);
   if(Number(req.headers.get('content-length')||0)>60000)return respond(413,{error:'Payload too large'},origin);
   let body;
   try{body=await req.json();}catch{return respond(400,{error:'Invalid JSON'},origin);}
   if(!body||!Number.isInteger(body.expected_revision)||body.expected_revision<0||
      !body.sections||typeof body.sections!=='object'||Array.isArray(body.sections)||
      Object.keys(body.sections).sort().join(',')!=='02,03,04,05'||
      !Object.values(body.sections).every(v=>typeof v==='string'&&v.trim().length>0&&v.length<=12000)){
      return respond(400,{error:'Only four editable nonempty sections 02-05 are allowed'},origin);
   }
   const saved=await fetch(base+'/rest/v1/rpc/save_demo_report_sections',{
    method:'POST',headers:{...hdr,'Content-Type':'application/json'},
    body:JSON.stringify({p_report_id:found[0].id,p_expected_revision:body.expected_revision,p_editable_sections:body.sections})
   });
   if(!saved.ok){
    const err=await saved.json().catch(()=>({}));
    if(err.code==='40001')return respond(409,{error:'版本已变化，请重新打开草稿后再编辑'},origin);
    if(err.code==='22023')return respond(400,{error:'报告内容格式不正确'},origin);
    if(err.code==='P0001')return respond(409,{error:'报告不可继续编辑'},origin);
    return respond(503,{error:'无法保存报告'},origin);
   }
   const updated=await saved.json();
   return respond(200,{item:{...found[0],draft_json:updated,review_status:'needs_review'},saved:true},origin);
  }
  if(found.length)return respond(200,{item:found[0],reused:true},origin);
  if(req.method==='GET')return respond(404,{error:'No report draft yet'},origin);
  const submissions=await api('assessment_submissions?select=id,invitation_id,form_code,form_version,is_simulation,scoring_result&is_simulation=eq.true&id=eq.'+id+'&limit=1');
  if(submissions.length!==1)return respond(404,{error:'Simulation submission not found'},origin);
  const source=submissions[0];
  const invitations=await api('invitation_records?select=id,invitation_code,student_age,student_display_name&id=eq.'+source.invitation_id+'&limit=1');
  if(invitations.length!==1)return respond(404,{error:'Invitation not found'},origin);
  const draft=makeReportDraft(source,invitations[0]);
  const suggested=generateSuggestedSections(source,invitations[0]);
  for(const section of draft.sections){
   if(Object.prototype.hasOwnProperty.call(suggested.sections,section.number)){
    section.paragraphs=suggested.sections[section.number].split('\n\n');
    section.editorial_status='pending_approval';
   }
  }
  draft.generation_method='scenario_evidence_parent_readable_v2';
  draft.status='needs_review';
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