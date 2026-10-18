// Administrator-only read API. Never accept data-changing requests.
const urlBase=Deno.env.get("SUPABASE_URL")||"";
const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const allowedOrigin="https://tzx1647-del.github.io";
const headers={"Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin","Referrer-Policy":"no-referrer"};
function reply(status,obj,origin){return new Response(JSON.stringify(obj),{status,headers:{...headers,...(origin===allowedOrigin?{"Access-Control-Allow-Origin":allowedOrigin}:{})}});}
const serverHeaders={"apikey":secret,"Authorization":"Bearer "+secret};
async function adminIdentity(jwt){
 const auth=await fetch(urlBase+"/auth/v1/user",{headers:{"apikey":secret,"Authorization":"Bearer "+jwt}});
 if(!auth.ok)return null;
 const u=await auth.json();
 if(!u||!u.id||typeof u.id!=="string")return null;
 const res=await fetch(urlBase+"/rest/v1/app_admins?user_id=eq."+encodeURIComponent(u.id)+"&select=user_id&limit=1",{headers:serverHeaders});
 if(!res.ok)throw new Error("Administrator verification unavailable");
 const permitted=await res.json();
 return Array.isArray(permitted)&&permitted.length===1?u.id:null;
}
async function listInvitations(){
 const select="id,invitation_code,student_age,invitation_status,assessment_form_code,assessment_version,student_display_name,consent_status,created_at,token_expires_at";
 const u=urlBase+"/rest/v1/invitation_records?select="+encodeURIComponent(select)+"&order=created_at.desc&limit=50";
 const res=await fetch(u,{headers:serverHeaders});
 if(!res.ok)throw new Error("Invitation list unavailable");
 return await res.json();
}
async function listSubmissions(){
 const select="id,invitation_id,form_code,form_version,is_simulation,submitted_at,scoring_result";
 const res=await fetch(urlBase+"/rest/v1/assessment_submissions?select="+encodeURIComponent(select)+"&order=submitted_at.desc&limit=50",{headers:serverHeaders});
 if(!res.ok)throw new Error("Submission list unavailable");
 return (await res.json()).map(s=>({id:s.id,invitation_id:s.invitation_id,form_code:s.form_code,form_version:s.form_version,is_simulation:s.is_simulation,submitted_at:s.submitted_at,level:s.scoring_result?.level||null}));
}
async function submissionDetail(id){
 const select="id,invitation_id,form_code,form_version,is_simulation,submitted_at,answers,scoring_result";
 const res=await fetch(urlBase+"/rest/v1/assessment_submissions?id=eq."+id+"&select="+encodeURIComponent(select)+"&limit=1",{headers:serverHeaders});
 if(!res.ok)throw new Error("Submission unavailable");
 const values=await res.json();
 return values[0]||null;
}
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS"){
  if(origin!==allowedOrigin)return new Response(null,{status:403,headers});
  return new Response(null,{status:204,headers:{...headers,"Access-Control-Allow-Origin":allowedOrigin,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"GET,OPTIONS"}});
 }
 if(req.method!=="GET")return reply(405,{error:"Read only"},origin);
 if(!urlBase||!secret)return reply(503,{error:"Service unavailable"},origin);
 const bearer=req.headers.get("authorization")||"";
 if(!/^Bearer [A-Za-z0-9._-]+$/.test(bearer))return reply(401,{error:"Sign in required"},origin);
 try{
  const identity=await adminIdentity(bearer.slice(7));
  if(!identity)return reply(403,{error:"Administrator access denied"},origin);
  const path=new URL(req.url).pathname;
  if(path.endsWith("/invitations"))return reply(200,{items:await listInvitations()},origin);
  if(path.endsWith("/submissions"))return reply(200,{items:await listSubmissions()},origin);
  const m=path.match(/\/submissions\/([0-9a-f]{8}-[0-9a-f-]{27,})$/);
  if(m)return reply(200,{item:await submissionDetail(m[1])},origin);
  if(path.endsWith("/me"))return reply(200,{authorized:true},origin);
  return reply(404,{error:"Not found"},origin);
 }catch{return reply(503,{error:"Service unavailable"},origin);}
});