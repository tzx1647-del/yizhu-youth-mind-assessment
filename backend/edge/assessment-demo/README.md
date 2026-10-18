# 模拟数据专用云端测评接口｜2026-10-18

## 已部署（非真实学生服务）
- Supabase 项目：Yizhu Mind Assessment Dev（ap-southeast-1）
- Edge Function：`assessment-demo`，版本 2 / ACTIVE；`verify_jwt=false` 是为了接受一次性 DEMO 邀请令牌，**不是**开放真实用户。
- 数据库迁移：`004_demo_atomic_submission.sql`，服务端专用事务函数 `submit_demo_assessment_once`。
- API 源码：`backend/edge/assessment-demo/index.ts`，评分源码：`score.mjs`。
- 题目和评分沿用主分支 A卷v0.3.2b；评分算法由原 `calc()` 提取，未重新制定。
- 接口仅允许 DEMO 邀请（邀请编号前缀 DEMO-、无监护人联系方式、未使用真实授权），别名只能填 `DEMO-...`，数据库仍有 simulation-only check 与 one-submission unique index。
- 现有正式学生端页面未接入接口；公开 main 不变。

## 开发接口设计
- `POST /functions/v1/assessment-demo/check`，JSON：`{"token":"<43-char random demo token>"}` → status ready/completed/invalid。
- `POST /functions/v1/assessment-demo/submit`，JSON：`{"token":"...","student_alias":"DEMO-Test","form_version":"v0.3.2b","answers":{"Q01-1":"C"}}`。
- 服务器对节点与选项进行白名单校验、独立评分，然后交由数据库事务校验令牌/状态和唯一性并保存。
- 返回公开结果目前只包含层级；正式六步结果、管理员接口、合法家长邀请尚未接入。
- API 中的 token 不应出现于日志、截图或公开 issue；生产端必须另行部署并完成安全及合规审查。

## 当前验证范围及未完成
- 迁移004部署成功，Supabase 函数已显示 ACTIVE v2。
- 数据库查询确认提交函数存在；邀请、答卷、家长报告三表均为0条记录。
- **尚未完成真实HTTP请求端到端测试；不能宣称提交成功、幂等性或云端自动评分已全面验收。**
- 尚缺管理员账号/角色设置、正式监护人授权、受控邀请签发、前端联调、异常重试与跨设备测试、生产级限流、安全审计及真实数据合规。
- 下步：准备两份虚构 DEMO 令牌，在可访问 Supabase Edge URL 的测试环境中发送真实 POST，核对先成功后拒绝重复，并对比权威工作簿的典型评分样例。使用完销毁 DEMO 记录。
