// Family report v0.4 source: approved sample DOCX.
// Section 01 and 06 verbatim fixed text. Sections 02-05 require human editorial approval.
export const TEMPLATE_VERSION='v0.4_review_draft';
export const INTRO=[
'每个孩子都有自己的成长节奏。',
'除了学习成绩，我们还可以从孩子如何认识自己、理解他人、面对问题和作出选择，了解他的成长。',
'这份报告依据孩子在28个生活情境中的回答，尝试从心智成长的角度，帮助您发现孩子身上值得关注的特点。',
'这份测评是一面帮助我们认识成长的镜子，而不是评价孩子好坏的标准。',
'心智成长层级与年龄没有固定的对应关系，也不代表孩子作为一个人的价值高低。',
'测评结果仅供成长参考，不构成医疗诊断或心理疾病筛查，也不能替代专业医疗评估。'
];
export const ABOUT=[
'本测评依据《青少年心智学》的相关理论框架，通过生活情境观察青少年心智成长表现。',
'测评采用五个成长层级：新星级、潜力级、铜牌级、银牌级、金牌级。',
'这些层级用于帮助理解成长，不代表人格、道德或个人价值的高低，也不与生理年龄直接对应。',
'本测评仍处于开发验证阶段，尚未完成真实青少年样本的统计校准。结果仅供成长参考，不构成医学或心理疾病诊断。',
'如孩子出现自伤、自杀意念、幻觉或其他严重心理健康风险信号，应优先保障安全，及时寻求专业医疗或危机干预帮助。'
];
const LEVELS=new Set(['新星级','潜力级','铜牌级','银牌级','金牌级']);
export function makeReportDraft(submission,invitation){
 if(!submission||!invitation||submission.invitation_id!==invitation.id)throw Error('Mismatched invitation');
 if(submission.is_simulation!==true || !String(invitation.invitation_code||'').startsWith('DEMO-'))throw Error('Simulation only');
 const level=submission.scoring_result?.level;
 if(!LEVELS.has(level)||submission.form_code!=='A'||submission.form_version!=='v0.3.2b')throw Error('Unsupported assessment');
 return {
  report_kind:'family_reading',
  report_template_version:TEMPLATE_VERSION,
  source_submission_id:submission.id,
  source_form_version:submission.form_version,
  subject_alias:invitation.student_display_name||'DEMO-Student',
  subject_age:invitation.student_age,
  assessment_level:level,
  status:'needs_review',
  sections:[
   {number:'01',title:'在阅读报告之前',paragraphs:INTRO,editorial_status:'fixed_approved'},
   {number:'02',title:'孩子的心智成长画像',paragraphs:['本次测评结果：整体更接近'+level,'【待审核】请根据本次答卷证据撰写本节成长特点与相应解释，不得自动套用金牌级样例。'],editorial_status:'pending_approval'},
   {number:'03',title:'孩子目前处在怎样的成长阶段？',paragraphs:['【待审核】'+level+'的家长版层级解释尚未在当前版本中确认为正式文本。'],editorial_status:'pending_approval'},
   {number:'04',title:'进一步认识孩子',paragraphs:['【待审核】从该份真实答卷中选择充分的跨情境能力证据，审核后形成说明。'],editorial_status:'pending_approval'},
   {number:'05',title:'下一阶段的心智成长建议',paragraphs:['【待审核】根据当前层级与证据形成个性化建议，不采用金牌级案例B的专属建议。'],editorial_status:'pending_approval'},
   {number:'06',title:'关于这份测评',paragraphs:ABOUT,editorial_status:'fixed_approved'}
  ],
  limitations:['此为开发环境模拟草稿','02–05包含明确的待审核内容','未经意竹审核不得作为家长正式报告或导出正式PDF']
 };
}
