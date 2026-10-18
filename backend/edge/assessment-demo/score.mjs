// Canonical v0.3.2b grading, copied from existing approved A-form.
const SCORING={"Q01-1": {"ability": "价值认知", "transition": "新星→潜力", "scores": {"A": 0, "B": 1, "C": 3, "D": 1}, "role": "直接计分"}, "Q02-1": {"ability": "情绪觉察与调节", "transition": "新星→潜力", "scores": {"A": 0, "B": 1, "C": 3, "D": 1}, "role": "直接计分"}, "Q03-1": {"ability": "选择与承责", "transition": "新星→潜力", "scores": {"A": 0, "B": 3, "C": 2, "D": 0}, "role": "直接计分"}, "Q04-1": {"ability": "独立认知", "transition": "新星→潜力", "scores": {"A": 1, "B": 1, "C": 3, "D": 0}, "role": "直接计分"}, "Q05-1": {"ability": "相处与自处", "transition": "潜力→铜牌", "scores": {"A": 1, "B": 3, "C": 1, "D": 1}, "role": "直接计分"}, "Q06-1": {"ability": "自我觉察与省察", "transition": "新星→潜力", "scores": {"A": 0, "B": 3, "C": 1, "D": 1}, "role": "直接计分"}, "Q07-1": {"ability": "价值认知", "transition": "潜力→铜牌", "scores": {"A": 0, "B": 3, "C": 1, "D": 0}, "role": "直接计分"}, "Q08-1": {"ability": "选择与承责", "transition": "潜力→铜牌", "scores": {"A": 1, "B": 3, "C": 1, "D": 0}, "role": "直接计分"}, "Q09-1": {"ability": "情绪觉察与调节", "transition": "潜力→铜牌", "scores": {"A": 1, "B": 1, "C": 3, "D": 1}, "role": "直接计分"}, "Q09-2": {"ability": "情绪觉察与调节", "transition": "潜力→铜牌", "scores": {"A": 0, "B": 3, "C": 1, "D": 1}, "role": "直接计分"}, "Q10-1": {"ability": "自我觉察与省察", "transition": "潜力→铜牌", "scores": {"A": 0, "B": 3, "C": 1, "D": 1}, "role": "直接计分"}, "Q11-1": {"ability": "独立认知", "transition": "潜力→铜牌", "scores": {"A": 0, "B": 2, "C": 1, "D": 3}, "role": "直接计分"}, "Q12-1": {"ability": "相处与自处", "transition": "新星→潜力", "scores": {"A": 1, "B": 2, "C": 3, "D": 1}, "role": "直接计分"}, "Q13-1": {"ability": "选择与承责", "transition": "潜力→铜牌", "scores": {"A": 1, "B": 2, "C": 0, "D": 3}, "role": "直接计分"}, "Q14-1": {"ability": "相处与自处", "transition": "潜力→铜牌", "scores": {"A": 0, "B": 2, "C": 3, "D": 0}, "role": "直接计分"}, "Q15-1": {"ability": "自我觉察与省察", "transition": "铜牌→银牌", "scores": {"A": 3, "B": 1, "C": 1, "D": 0}, "role": "直接计分"}, "Q16-1": {"ability": "相处与自处", "transition": "银牌→金牌", "scores": {"A": 0, "B": 1, "C": 3, "D": 2}, "role": "直接计分"}, "Q17-1": {"ability": "独立认知", "transition": "铜牌→银牌", "scores": {"A": 0, "B": 1, "C": 3, "D": 1}, "role": "直接计分"}, "Q18-1": {"ability": "自我觉察与省察", "transition": "潜力→铜牌", "scores": {"A": 1, "B": 3, "C": 1, "D": 0}, "role": "直接计分"}, "Q19-1": {"ability": "情绪觉察与调节", "transition": "铜牌→银牌", "scores": {"A": 0, "B": 2, "C": 1, "D": 3}, "role": "直接计分"}, "Q20-1": {"ability": "价值认知", "transition": "铜牌→银牌", "scores": {"A": 1, "B": 1, "C": 3, "D": 1}, "role": "直接计分"}, "Q20-2": {"ability": "选择与承责", "transition": "铜牌→银牌", "scores": {"A": 0, "B": 1, "C": 3, "D": 1}, "role": "直接计分"}, "Q21-1": {"ability": "独立认知", "transition": "潜力→铜牌", "scores": {"A": 1, "B": 2, "C": 3, "D": 0}, "role": "直接计分"}, "Q22-1": {"ability": "情绪觉察与调节", "transition": "银牌→金牌", "scores": {"A": 0, "B": 1, "C": 3, "D": 1}, "role": "直接计分"}, "Q22-2": {"ability": "情绪觉察与调节", "transition": "银牌→金牌", "scores": {"A": 0, "B": 3, "C": 1, "D": 1}, "role": "直接计分"}, "Q22-3": {"ability": "情绪觉察与调节", "transition": "银牌→金牌", "scores": {"A": 1, "B": 3, "C": 1, "D": 1}, "role": "直接计分"}, "Q23-1": {"ability": "相处与自处", "transition": "铜牌→银牌", "scores": {"A": 1, "B": 3, "C": 2, "D": 0}, "role": "直接计分"}, "Q24-1": {"ability": "自我觉察与省察", "transition": "铜牌→银牌", "scores": {"A": 2, "B": 3, "C": 0, "D": 1}, "role": "直接计分"}, "Q25-1": {"ability": "独立认知", "transition": "银牌→金牌", "scores": {"A": 0, "B": 1, "C": 2, "D": 3}, "role": "直接计分"}, "Q26-1": {"ability": "价值认知", "transition": "铜牌→银牌", "scores": {"A": 1, "B": 1, "C": 3, "D": 0}, "role": "直接计分"}, "Q27-1": {"ability": "价值认知", "transition": "银牌→金牌", "scores": {"A": 0, "B": 1, "C": 2, "D": 3}, "role": "直接计分"}, "Q27-2": {"ability": "价值认知＋选择与承责", "transition": "银牌→金牌", "scores": {"A": 0, "B": 1, "C": 2, "D": 3}, "role": "直接计分"}, "Q27-3": {"ability": "选择与承责", "transition": "银牌→金牌", "scores": {"A": 0, "B": 1, "C": 2, "D": 3}, "role": "直接计分"}, "Q28-1": {"ability": "自我觉察与省察", "transition": "银牌→金牌", "scores": {"A": 0, "B": 1, "C": 2, "D": 3}, "role": "直接计分"}, "Q28-2": {"ability": "自我觉察与省察", "transition": "银牌→金牌", "scores": {"A": null, "B": null, "C": null, "D": null}, "role": "验证节点（不直接计分）"}};
function calculate(answers){
 const layerMax={NP:18,PC:33,CS:24,SG:27};
 const layer={NP:0,PC:0,CS:0,SG:0};
 const ability={};
 Object.keys(SCORING).forEach(function(nodeId){
  const meta=SCORING[nodeId];
  if(meta.role.indexOf("验证")>=0) return;
  const a=answers[nodeId] || null;
  const raw=(a && meta.scores[a]!==undefined && meta.scores[a]!==null)?meta.scores[a]:0;
  const sc=Number(raw);
  let L=meta.transition.indexOf("新星")>=0?"NP":meta.transition.indexOf("潜力")>=0?"PC":meta.transition.indexOf("铜牌")>=0?"CS":"SG";
  layer[L]+=sc;
  meta.ability.split("＋").forEach(function(ab){
   if(!ability[ab]) ability[ab]={score:0,max:0};
   ability[ab].score+=sc; ability[ab].max+=3;
  });
 });
 const rate={};
 Object.keys(layer).forEach(function(k){rate[k]=layer[k]/layerMax[k];});

 const sgSupport={"自我觉察与省察":false,"独立认知":false,"相处与自处":false,"选择与承责":false,"价值认知":false};
 Object.keys(SCORING).forEach(function(nodeId){
  const meta=SCORING[nodeId];
  if(meta.transition.indexOf("银牌")<0 || meta.role.indexOf("验证")>=0) return;
  const choice=answers[nodeId];
  const sc=choice && meta.scores[choice]!==null && meta.scores[choice]!==undefined ? Number(meta.scores[choice]) : 0;
  meta.ability.split("＋").forEach(function(ab){
   if(ab!=="情绪觉察与调节" && sc>=2) sgSupport[ab]=true;
  });
 });
 const erNodes=["Q22-1","Q22-2","Q22-3"];
 let erCount=0;
 erNodes.forEach(function(n){
  const choice=answers[n];
  if(choice && SCORING[n].scores[choice]!==null && Number(SCORING[n].scores[choice])>=2) erCount++;
 });
 sgSupport["情绪觉察与调节"]=erCount>=2;
 let sgCount=0; Object.keys(sgSupport).forEach(function(k){if(sgSupport[k]) sgCount++;});
 const sgPass=sgCount>=4;

 let level="新星级";
 if(rate.NP>=0.6) level="潜力级";
 if(rate.NP>=0.6&&rate.PC>=0.6) level="铜牌级";
 if(rate.NP>=0.6&&rate.PC>=0.6&&rate.CS>=0.6) level="银牌级";
 if(rate.NP>=0.6&&rate.PC>=0.6&&rate.CS>=0.6&&rate.SG>=0.6&&sgPass) level="金牌级";

 const boundary=[],order=["NP","PC","CS","SG"];
 for(let i=0;i<order.length-1;i++){
  const L=order[i];
  let later=false;
  for(let j=i+1;j<order.length;j++) if(rate[order[j]]>=0.6) later=true;
  if(rate[L]>=0.5&&rate[L]<0.6&&later) boundary.push(L);
 }
 return {layer:layer,rate:rate,ability:ability,level:level,sgCount:sgCount,sgPass:sgPass,boundary:boundary};
}
export const FORM_VERSION='v0.3.2b';
export function scoreDemoAnswers(answers){
 if(!answers || typeof answers!=='object'||Array.isArray(answers)) throw Error('Invalid answers');
 if(Object.keys(answers).length>35)throw Error('Too many answers');
 for(const [id,value] of Object.entries(answers)){
  if(!SCORING[id] || !(value in SCORING[id].scores) || typeof value !=='string')throw Error('Invalid node or option');
 }
 return {form_code:'A',form_version:FORM_VERSION,...calculate(answers)};
}
