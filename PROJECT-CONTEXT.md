# 项目上下文

**模板版本：** 7.0

本文件位于目标工程根目录并由目标工程 Git 管理，只记录 AI Framework 无法推断的共享项目事实。`<agent-workspace>` 由 `./tools/ai-framework path` 定位；角色职责和流程规则以其中的 `agents/AGENTS.md` 与 `governance/` 为准，不在这里重复。

不得记录个人绝对路径、密码、token、个人偏好或仅对单台设备有效的配置。

## 项目

- **产品 / 服务：** bahar 会员营销系统（`manifest.json` 应用名，appid `__UNI__958B06E`，版本 2.0.0）
- **主要用户：** C 端会员 / 商户营销用户
- **仓库、模块与目录结构：** HBuilderX 版 uni-app 工程，源码平铺在仓库根：`pages/`（主包页面）、`subPages/`、`merchantPages/`、`components/`、`api/`、`store/`、`utils/`、`common/`、`static/`，UI 库 `uview-ui/`，插件 `uni_modules/`。
- **现有架构与依赖方向：** Vue + uni-app 多端编译；页面通过 `api/` 访问后端，`store/` 管理状态；依赖方向以各文件 import 为准，不臆断。

## 工程命令

- **语言与框架：** Vue 2 + uni-app（HBuilderX 工程结构），UI 组件库 uview-ui，样式含 `uni.scss` / `app.scss`
- **构建命令：** 由 HBuilderX 执行「运行 / 发行」；**本工程非 vue-cli 结构，没有 npm run build 入口**
- **快速测试命令：** HBuilderX 运行到浏览器 / 小程序模拟器 / 真机
- **模块 / 集成测试命令：** 未配置自动化测试；多端改动需在涉及端分别运行验证
- **Lint / 格式化命令：** 未配置，不改无关格式
- **本地开发前置条件：** HBuilderX；真机或小程序端验证需对应运行环境

## Git 与交付

- **稳定 / 受保护分支：** `main`
- **日常集成分支：** `main`
- **Task 分支命名：** 建议 `task/<task-id>-<slug>`（待团队确认后固化）
- **Worktree 或等价隔离方式：** 遵循 `governance/git-worktree-governance.md`；`agent_bootstrap/` 只存在于主工作树，不得复制到 worktree
- **必需的 CI 检查：** 待补充
- **合并、发布与回滚流程：** 小程序 / App 发行流程待补充

## 人工授权

- **授权记录方式：** 当前对话，或本地 DP / Task 中记录授权来源与范围
- **必须单独授权的操作：** 小程序提审与发布、App 发行、涉及营销资金与会员权益的改动；其余待补充

## 环境与部署

不存在的示例环境应删除；存在多个同类环境时分别使用唯一且稳定的 `Environment ID`。

| Environment ID | Type | Platform / Location | Purpose | Deployment Entry | Protection |
| --- | --- | --- | --- | --- | --- |
| `dev` | development | HBuilderX 本地运行 | 开发联调 | HBuilderX「运行」 | 无 |
| `prod` | production | 小程序 / App 发行 | 正式运行 | HBuilderX「发行」 | 需要人工授权 |

- 部署 Task 必须引用具体的 `Environment ID`。
- 新增环境或改变环境保护规则时更新本节。
- 本节只记录长期稳定事实；单次部署目标、执行边界、授权、attempt 和结果记录在对应 Task。
- 生产部署、资源删除、数据迁移和权限扩大需要明确人工授权。

## 风险与敏感边界

- **认证 / 授权：** 会员登录态与后端鉴权联动，改动按 High 风险处理
- **数据库与迁移：** 前端不持有库表脚本；数据语义变更需与后端接口同步
- **外部 API / 队列 / 存储：** 通过 `api/` 调用后端 bahar 系服务；`manifest.json` 已启用 Payment 模块
- **不得读取或提交的敏感位置：** 会员个人信息、支付相关配置与密钥，不得提交或外传
- **部署与运行环境限制：** 多端编译（H5 / 小程序 / App），同一改动在不同端表现可能不同，需按受影响端验证

## 项目覆盖项

- **现有命名、代码或模块约定：** 目录 `pages/` 主包、`subPages/` 分包、`merchantPages/` 商户端页面；分包页面新增需同步 `pages.json`
- **项目专属 Gate 或更严格规则：** 涉及会员权益、营销资金、支付流程的改动按 High 风险处理；涉及真机或小程序端的交付适用硬件 / 目标环境 Gate，不能用浏览器模拟结果代替
