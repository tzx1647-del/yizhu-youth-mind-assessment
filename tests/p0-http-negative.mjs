// P0 read-only / rejection-only smoke test. Run with Node.js >=20.
// No service_role key, personal data, invitation tokens, or real student data.
// Usage: node tests/p0-http-negative.mjs
const root='https://imeuogjoxjfkiwpirpop.supabase.co/functions/v1';
const cases=[
 {name:'invalid DEMO token',url:root+'/assessment-demo/submit',method:'POST',body:{token:'INVALID'},expected:[400]},
 {name:'missing DEMO token',url:root+'/assessment-demo/check',method:'POST',body:{},expected:[400]},
 {name:'unauthenticated admin-read',url:root+'/admin-read',method:'GET',expected:[401,403]},
 {name:'unauthenticated report draft',url:root+'/report-draft/submissions/00000000-0000-0000-0000-000000000000/draft',method:'GET',expected:[401,403]}
];
let failed=0;
for(const t of cases){
 try{
  const response=await fetch(t.url,{method:t.method,headers:{'content-type':'application/json'},body:t.body?JSON.stringify(t.body):undefined,redirect:'manual',signal:AbortSignal.timeout(10000)});
  const text=(await response.text()).slice(0,300).replace(/[\r\n]/g,' ');
  const pass=t.expected.includes(response.status);
  console.log(JSON.stringify({name:t.name,status:response.status,expected:t.expected,pass,body_excerpt:text}));
  if(!pass)failed++;
 }catch(err){
  console.log(JSON.stringify({name:t.name,pass:false,error:err.message}));
  failed++;
 }
}
console.log(JSON.stringify({summary:{total:cases.length,passed:cases.length-failed,failed}}));
if(failed)process.exitCode=1;
