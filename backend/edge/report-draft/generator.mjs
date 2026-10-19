// Rule-based draft wording, grounded in cross-scenario scored evidence.
// All generated text is unapproved and must be reviewed by administrator.
import {SCORING} from './evidence.mjs';
const names=['新星级','潜力级','铜牌级','银牌级','金牌级'];
const orderedAbilities=['自我觉察与省察','情绪觉察与调节','独立认知','相处与自处','选择与承责','价值认知'];
const focus={
 '自我觉察与省察':'陪伴孩子回看最近经历：当时注意到了什么、为什么那样反应，以及下次可以怎样调整。',
 '情绪觉察与调节':'遇到情绪起伏时，可以先帮助孩子说清自己的感受，再一起商量怎样处理眼前的事。',
 '独立认知':'鼓励孩子说出判断依据，并练习寻找能够支持或修正判断的新信息。',
 '相处与自处':'讨论同伴关系中的分歧，让孩子练习理解别人，同时表达自己的需要与边界。',
 '选择与承责':'让孩子参与适当的自主选择，再一起回顾选择、结果和承担的责任。',
 '价值认知':'当两种重要需求发生冲突时，邀请孩子说清楚自己更看重什么、为什么。'
};
export function generateSuggestedSections(submission,invitation){
 if(!submission||!invitation||submission.invitation_id!==invitation.id ||
    submission.is_simulation!==true||!String(invitation.invitation_code||'').startsWith('DEMO-') ||
    submission.form_code!=='A'||submission.form_version!=='v0.3.2b')throw Error('Unsupported simulation assessment');
 const r=submission.scoring_result||{},level=r.level;
 if(!names.includes(level))throw Error('Unsupported level');
 const answers=submission.answers||{};
 const grouping=new Map(orderedAbilities.map(a=>[a,{scenarios:new Set(),count:0,total:0,earned:0}]));
 for(const [nodeId,meta] of Object.entries(SCORING)){
  if(meta.role.includes('验证')||!Object.prototype.hasOwnProperty.call(answers,nodeId))continue;
  const opt=answers[nodeId],score=meta.scores[opt];
  if(typeof score!=='number')continue;
  for(const name of meta.ability.split('＋')){
   const entry=grouping.get(name);if(!entry)continue;
   entry.scenarios.add(nodeId.split('-')[0]);
   entry.count++;entry.total+=3;entry.earned+=score;
  }
 }
 const evidence=orderedAbilities.map(name=>({...grouping.get(name),name,scenario_count:grouping.get(name).scenarios.size}))
  .filter(x=>x.scenario_count>=2&&x.count>=2)
  .sort((a,b)=>(b.earned/b.total)-(a.earned/a.total));
 const highest=evidence[0],lowest=evidence[evidence.length-1];
 const summary=x=>x?x.name+'（本次共涉及'+x.scenario_count+'个不同情境、'+x.count+'个计分节点，证据得分'+x.earned+'/'+x.total+'）':'目前没有足够跨情境节点形成该项概括';
 const cautions='这些只是本次生活情境回答所提供的线索，不等于孩子在所有场合都如此；单一答案不能独立证明一项心智能力。';
 const count=Object.keys(answers).filter(id=>Object.prototype.hasOwnProperty.call(SCORING,id)).length;
 const sections={
 '02':[
  '本次测评结果：孩子整体心智表现更接近'+level+'。五级成长地图：新星级 → 潜力级 → 铜牌级 → 银牌级 → 金牌级。',
  '本次共有'+count+'个响应节点提供了作答信息（测评总计35个响应节点，其中含1个验证节点）。',
  highest?'在这份答卷中，相对较有支持的能力证据出现在'+summary(highest)+'。':'本次跨情境证据尚不足以形成明确的相对优势概括。',
  lowest?'另一个值得继续观察的方向是'+summary(lowest)+'。':'对于其他能力，需要结合更多生活实例继续观察。',
  cautions
 ].join('\n\n'),
 '03':[
  '当前测评位置：'+level+'（五级成长地图中的第'+(names.indexOf(level)+1)+'级）。',
  '此结果来自固定A卷v0.3.2b的整体跃迁计分及跨能力证据规则，不是依据某道题单独判断。层级是当前成长位置的参考，不代表孩子的好坏或个人价值。',
  '四段跃迁的得分率分别为：新星→潜力 '+((Number(r.rate?.NP)||0)*100).toFixed(1)+'%；潜力→铜牌 '+((Number(r.rate?.PC)||0)*100).toFixed(1)+'%；铜牌→银牌 '+((Number(r.rate?.CS)||0)*100).toFixed(1)+'%；银牌→金牌 '+((Number(r.rate?.SG)||0)*100).toFixed(1)+'%。系统按顺序跃迁，不允许跳级。',
  '上述比例用于内部核查和草稿审核；正式家长报告是否展示数值，须经意竹确认。'
 ].join('\n\n'),
 '04':[
  '成长观察一｜'+(highest?highest.name:'继续观察孩子的多情境表现'),
  highest?'本次在'+highest.scenario_count+'个不同情境中的相关回答，为观察'+highest.name+'提供了一组相对较强的计分证据。可和孩子讨论这些选择背后的真实想法，并观察是否在日常生活中也有所体现。':'现有可用证据不足以形成这项跨情境判断。',
  '成长观察二｜'+(lowest?lowest.name:'需要补充生活实例的能力'),
  lowest?'本次在'+lowest.scenario_count+'个不同情境中的相关证据相对较弱，建议结合孩子的真实经历进一步理解，不能仅凭得分推断能力缺失。':'可先从近期实际发生的生活情境继续观察。',
  cautions
 ].join('\n\n'),
 '05':[
  '下一阶段可以从近期的一件真实小事开始，不要求孩子立即改变很多。',
  highest?'对于目前已有相对支持的'+highest.name+'，家长可以邀请孩子分享自己当时的思考和做法，帮助这些表现在不同情境中逐渐稳定。':'先鼓励孩子说出自己的真实想法和选择依据。',
  lowest?'对于值得继续发展的'+lowest.name+'，可尝试：'+focus[lowest.name]:'选择一项家长与孩子都愿意尝试的小练习。',
  '建议以对话和生活实践为主，不把测评层级作为要求孩子达到某种标准的标签；后续建议需由意竹根据具体证据审核。'
 ].join('\n\n')
 };
 return {sections,level,form_version:submission.form_version,
  evidence_overview:{strongest:highest?{ability:highest.name,scenarios:highest.scenario_count}:null,development:lowest?{ability:lowest.name,scenarios:lowest.scenario_count}:null},
  notice:'系统生成的个性化初稿，仅供意竹审核修改，不是已经批准的报告。'};
}
