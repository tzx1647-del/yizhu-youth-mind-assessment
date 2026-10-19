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
// Next-stage recommendations address the transition, not the abilities described in chapter 04.
// Gold is directed toward adult mind-growth practice, NOT converted into an adult six-tier score.
const NEXT_STEP={
 '新星级':{
 target:'潜力级',goal:'从跟着眼前感觉反应，走向开始留意自己的想法、情绪与判断。',
 scene:'例如，孩子因为朋友临时改变约定而生气时，家长可以先问：“你现在最难受的是什么？你觉得对方可能遇到了什么情况？”',
 action:'先帮助孩子把感受和已经知道的事实分开，再邀请他想一种新的回应方法。'
 },
 '潜力级':{
 target:'铜牌级',goal:'从开始察觉自己的想法，走向能主动调整选择，并逐渐承担选择带来的结果。',
 scene:'例如，孩子自己答应了一项任务，后来发现时间不够，家长可以问：“你现在有哪些办法？选每种办法，需要承担什么？”',
 action:'把决定权适当地留给孩子，事后一起回顾他的选择和结果，而不是替他给出标准答案。'
 },
 '铜牌级':{
 target:'银牌级',goal:'从能够主动思考和承担，继续练习在压力、分歧、两边都重要的情况下，同时看见事实、他人处境和责任。',
 scene:'例如，孩子已经答应朋友周末一起活动，但家里临时需要帮忙时，不急着要求他服从某一方，可以问：“双方各需要什么？哪些承诺必须考虑？有没有办法先沟通，再作选择？”',
 action:'请孩子列出不同选择可能影响的人及后果，练习说明依据、沟通取舍，并为最终选择负责。'
 },
 '银牌级':{
 target:'金牌级',goal:'从复杂情况下能够兼顾多方，继续发展更稳定的内在判断依据、自我检查和自我修正。',
 scene:'例如，孩子坚持一个自己很有把握的观点，后来出现相反的新信息时，可以问：“什么样的证据会让你愿意重新考虑？”',
 action:'鼓励孩子既坚持经过思考的判断，也愿意认真听取反证；过些日子再回看，是否在不同事情里都能做到。'
 },
 '金牌级':{
 target:'成人心智成长方向',goal:'青少年金牌级不是成长终点。下一步是面向成人生活中更长期、更真实的责任、关系与自主选择，持续发展独立思考、自省和实践能力。',
 scene:'例如，逐渐讨论未来学习或生活方向时，家长可以问：“这件事和你长期真正重视的目标有什么关系？你准备怎样持续实践，又怎样面对结果？”',
 action:'让孩子逐步承担与年龄和现实条件相适应的长期计划与责任，定期回看目标、行动、反馈和调整。此处只是成长方向，不把青少年金牌级换算为成人六层级中的任何一级。'
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
 const destination=NEXT_STEP[level];
 const previousLevels=LEVELS.slice(0,LEVELS.indexOf(level));
 const earlier=previousLevels.length?previousLevels.map(x=>'【'+x+'】'+LEVEL_COPY[x]):[];
 const sections={
  '02':'本次测评结果：孩子目前整体心智表现更接近'+level+'。',
  '03':[
   '孩子目前处在'+level+'。成长是逐渐积累的过程，可以把前面已经走过的层级与当前层级连起来理解。',
   ...earlier,
   '【当前层级：'+level+'】'+LEVEL_COPY[level],
   '这些描述是心智成长位置的参考，不是说孩子在每件事中都已经稳定具备全部特点，也不与年龄或个人价值直接对应。'
  ].join('\\n\\n'),
  '04':observation.length?observation.join('\\n\\n'):
    '现有跨情境选择尚不足以形成可靠的具体能力观察。建议先与孩子回顾两三件最近真实发生的小事，了解他当时怎么看、怎么选择。',
  '05':[
   '【下一阶段成长方向：'+level+' → '+destination.target+'】',
   destination.goal,
   '【可以尝试的生活情境】',destination.scene,
   '【家长可以怎样陪伴】',destination.action,
   '成长建议是下一阶段的练习方向，不是要求孩子尽快升级，也不能仅凭一次测评认定孩子已经准备好进入下一层级。'
  ].join('\\n\\n')
 };
 return {sections,level,form_version:submission.form_version,
   evidence_overview:{strongest:strongest?{ability:strongest.name,scenarios:strongest.scenarios,node_ids:strongest.records.map(x=>x.nodeId)}:null,
    development:developing?{ability:developing.name,scenarios:developing.scenarios,node_ids:developing.records.map(x=>x.nodeId)}:null},
   generation_method:'stage_progression_parent_readable_v3',
   notice:'自动初稿仅用于意竹审核；情境描写来自模拟题，不是实际生活经历，未经审核不得发布。'};
}
