// Family-facing simulated report draft: scenarios and selected responses, not scoring diagnostics.
// Every output remains unapproved. Scores select themes internally; no invented personal history.
import {SCORING} from './evidence.mjs';
import {QUESTIONS} from './questions.mjs';
const LEVELS=['新星级','潜力级','铜牌级','银牌级','金牌级'];
const ABILITIES=['自我觉察与省察','情绪觉察与调节','独立认知','相处与自处','选择与承责','价值认知'];
const CONTEXT={
 Q01:'评价一位受同学欢迎的人',Q02:'朋友临时取消周末约定',
 Q03:'自己报名的活动比想象中费时',Q04:'小组展示时与同学意见不同',
 Q05:'家人希望聊天、自己还想继续手头的事',Q06:'以为同学故意先走，后来发现是误会',
 Q07:'同学想给没有参与任务的人署名',Q08:'自己调整准备方法后取得不错结果',
 Q09:'在同学群里被误解、很想立刻回复',Q10:'答应给同学发材料却忘记了',
 Q11:'自己看中的东西被家人质疑',Q12:'体育课同伴希望放慢练习',
 Q13:'自己的周末安排与重要任务发生冲突',Q14:'好朋友想参考已完成的个人作业',
 Q15:'家人提醒事情时容易马上不高兴',Q16:'家人期待的长期方向与自己意愿不完全一致',
 Q17:'听到不同的人对机器人社团的意见',Q18:'认真完成的小组任务被要求修改',
 Q19:'家人不同意自己的安排，情绪越来越强烈',
 Q20:'保护好友秘密与避免他人受到伤害之间出现冲突',
 Q21:'得到新信息后重新评价原先不看好的同学',
 Q22:'看到关于自己的消息很不舒服',Q23:'已答应朋友的活动与家里的临时需要冲突',
 Q24:'回看近期不同事情中相似的反应',Q25:'同学表现与自己过去的印象不同',
 Q26:'活动名额分配涉及公平与他人的困难',Q27:'回看近期一次重要的自主决定',
 Q28:'发现自己在不同事件中反复出现相似反应'
};
const PRACTICE={
 '自我觉察与省察':{
  scene:'例如，孩子在被提醒、被误解或事后回想时，家长可以先问：“刚才你最在意的是什么？后来有没有发现另一种可能？”',
  action:'先听孩子说完，再邀请他比较当时的反应与事后的想法，不急着评价对错。'
 },
 '情绪觉察与调节':{
  scene:'例如，当周末安排临时改变、同学在群里说了让人不舒服的话时，家长可以问：“你当时最强烈的感觉是什么？你想怎样处理？”',
  action:'一起商量一个短暂停顿的方法，再讨论怎样回应。重点不是压住情绪，而是情绪出现后仍能选择行动。'
 },
 '独立认知':{
  scene:'例如，孩子说“大家都觉得某个人不好”时，可以问：“你自己看到了什么？你是怎样作出这个判断的？”',
  action:'陪孩子把“别人说的”“自己看到的”“目前还不知道的”分开，再允许他形成自己的看法。'
 },
 '相处与自处':{
  scene:'例如，孩子想继续手头的事，而家人希望马上聊一会儿时，可以一起商量怎样表达现在的需要，同时照顾对方的感受。',
  action:'先邀请孩子说出自己的边界，再练习一句具体而尊重的表达，例如“我还需要十分钟，之后我们再聊”。'
 },
 '选择与承责':{
  scene:'例如，孩子自己报了活动，后来发现比想象中花时间时，可以一起回顾当初为什么报名、答应过什么、现在有哪些可行选择。',
  action:'家长先不替孩子决定是否坚持，而是让他讲清每种选择可能带来的结果，练习为自己的决定负责。'
 },
 '价值认知':{
  scene:'例如，一位朋友希望你帮忙，但这样可能影响另一位同学时，家长可以和孩子讨论：“友情、公平与责任都重要时，怎么决定更合适？”',
  action:'帮助孩子把自己重视的原则说清楚，也认真考虑这些原则应用到现实情境时可能产生的后果。'
 }
};
const LEVEL_COPY={
 '新星级':'孩子目前更多在学习留意自己的感受、判断和反应，成长空间在于逐渐看见“我为什么会这样想”。',
 '潜力级':'孩子已经开始注意自己的想法和选择，接下来可以练习把这种思考更稳定地带入不同生活情境。',
 '铜牌级':'孩子在一些情境中已经会主动思考、调整，并开始将选择与后果联系起来；面对更复杂的压力和分歧时，仍有继续练习的空间。',
 '银牌级':'孩子在较复杂的选择中逐渐能兼顾自己的想法、他人的处境和责任；接下来值得关注的是这种表现能否保持稳定。',
 '金牌级':'孩子在多个情境中展现出较成熟的判断与自我修正线索；这仍是成长过程中的阶段位置，不是终点。'
};
function safeText(s){return String(s||'').replace(/\s+/g,' ').trim();}
function scenarioLines(ability,records){
 const items=records.filter(x=>x.abilities.includes(ability));
 const selected=[],seen=new Set();
 for(const x of items){
  if(seen.has(x.questionId))continue;
  seen.add(x.questionId);
  selected.push(x);
  if(selected.length===2)break;
 }
 return selected.map((x)=>{
  const context=CONTEXT[x.questionId]||safeText(x.stem);
  const answer=safeText(x.option);
  return '例如，在测评设定的“'+context+'”情境中，孩子选择了接近“'+answer+'”的处理方式。这只是他在该情境题中的选择，可以和日常生活中相似的经历对照看看。';
 });
}
export function generateSuggestedSections(submission,invitation){
 if(!submission||!invitation||submission.invitation_id!==invitation.id||
    submission.is_simulation!==true||!String(invitation.invitation_code||'').startsWith('DEMO-')||
    submission.form_code!=='A'||submission.form_version!=='v0.3.2b')throw Error('Unsupported simulation assessment');
 const r=submission.scoring_result||{},level=r.level;
 if(!LEVELS.includes(level))throw Error('Unsupported level');
 const answers=submission.answers||{};
 const records=[];
 for(const q of QUESTIONS){
  for(const n of q.nodes){
   const meta=SCORING[n.node_id],choice=answers[n.node_id];
   if(!meta||meta.role.includes('验证')||typeof choice!=='string'||
      !Object.prototype.hasOwnProperty.call(n.options,choice)||
      typeof meta.scores[choice]!=='number')continue;
   records.push({questionId:q.id,nodeId:n.node_id,stem:q.stem,option:n.options[choice],
    score:meta.scores[choice],abilities:meta.ability.split('＋')});
  }
 }
 const evidence=ABILITIES.map(name=>{
  const values=records.filter(x=>x.abilities.includes(name));
  return {name,records:values,scenarios:new Set(values.map(x=>x.questionId)).size,
   ratio:values.length?values.reduce((sum,x)=>sum+x.score,0)/(values.length*3):null};
 }).filter(x=>x.scenarios>=2&&x.records.length>=2)
   .sort((a,b)=>b.ratio-a.ratio);
 const strongest=evidence[0]||null;
 const developing=evidence.length>=2?evidence[evidence.length-1]:null;
 const focusNames=[strongest?.name,developing?.name].filter(Boolean);
 const observation=focusNames.map((ability,i)=>{
  const examples=scenarioLines(ability,records);
  const qualifier=i===0?'在这份答卷中，'+ability+'方面出现了一些值得肯定的选择线索。':
     '与此同时，'+ability+'是一个可以在日常生活里继续观察、练习的方向。';
  return ['【'+(i===0?'值得肯定的成长线索':'下一步值得关注的地方')+'｜'+ability+'】',
    qualifier,...examples,
    '这些是测评中的情境选择，并非已核实发生过的生活事件，也不能说明孩子在每种情况下都会这样做。'].join('\n\n');
 });
 const advice=focusNames.map((ability,i)=>['【'+(i===0?'巩固已有的表现':'尝试新的成长练习')+'｜'+ability+'】',
   PRACTICE[ability].scene,PRACTICE[ability].action,
   '可以先选择一件孩子愿意谈论的真实小事，试一周后再一起回顾，不必要求立刻达到某个标准。'].join('\n\n'));
 const sections={
  '02':['从本次测评的不同生活情境回答来看，孩子目前整体心智表现更接近'+level+'。',
    LEVEL_COPY[level],
    strongest?'一个值得肯定的方向是'+strongest.name+'；这份答卷还提示，可以继续关注'+(developing?.name||'其他情境中的表现')+'。':
     '当前跨情境证据不足以突出某一项能力，建议结合日常经历进一步了解。',
    '这是一份帮助家长理解孩子的成长参考，而不是给孩子贴标签。'].join('\n\n'),
  '03':['孩子当前更接近'+level+'，这是五级心智成长地图中的一个位置。',
    LEVEL_COPY[level],
    '同一个孩子，在熟悉的情境和遇到压力、分歧时，表现也可能不同。因此比起要求孩子达到某个层级，更值得留意他面对实际事情时怎样判断、表达和承担。',
    '测评结果不与年龄直接对应，也不代表孩子的个人价值。'].join('\n\n'),
  '04':observation.length?observation.join('\n\n'):
    '现有跨情境选择尚不足以形成可靠的具体能力观察。建议先与孩子回顾两三件最近真实发生的小事，了解他当时怎么看、怎么选择。',
  '05':advice.length?['不必一下改变很多，家长可以从日常生活里一件小事开始。',...advice,
    '家长的任务不是替孩子作出“标准选择”，而是帮助他逐渐看清自己的想法、事实和后果。'].join('\n\n'):
    '可以先邀请孩子讲讲最近遇到的一件小事：“你当时怎么想？还有什么选择？下次会想怎么做？”先从理解开始，不急着给答案。'
 };
 return {sections,level,form_version:submission.form_version,
   evidence_overview:{strongest:strongest?{ability:strongest.name,scenarios:strongest.scenarios,node_ids:strongest.records.map(x=>x.nodeId)}:null,
    development:developing?{ability:developing.name,scenarios:developing.scenarios,node_ids:developing.records.map(x=>x.nodeId)}:null},
   generation_method:'scenario_evidence_parent_readable_v2',
   notice:'自动初稿仅用于意竹审核；情境描写来自模拟题，不是实际生活经历，未经审核不得发布。'};
}
