# HPC 智能体 Demo：项目启动与前端技术基线

> 状态：已建立可运行基线
> 更新日期：2026-09-21
> 适用阶段：可交互前端 Demo / 体验评审 / 后续概念扩展

## 1. 文档定位

本文件承载会持续变化的项目启动信息，包括技术选型、依赖、目录、运行方式和阶段范围。

长期协作原则、HPC 语境和设计判断仍以《HPC智能体Demo_Agent协作设计指南.md》为基础；后续新增或调整技术方案时，优先更新本文件，避免把易变化的工程信息写进协作指南。

## 2. 当前阶段目标与进展

当前已完成一个可本地运行、可点击、可切换状态的前台 Demo，用于验证：

- HPC 智能体工作台的整体信息架构；
- 对象上下文、任务计划、工具过程、证据和结论如何协同表达；
- 成功、失败、数据不足、权限不足、等待确认、中断和恢复等状态；
- 页面、HPC 对象与 Agent 对话之间的联动；
- 后续不同概念 Demo 是否可以复用同一套外壳和组件。

已落地的主要能力包括：

- Session 需处理项置顶、项目分组、搜索、选择、重命名和归档；
- 新对话推荐任务、附件/文件夹选择和执行审查策略；
- 对话、工作过程、工具输入输出和子 Agent 详情；
- 固定任务托盘、操作确认、诊断报告、资源证据和运行比较；
- 复制反馈、赞踩、重新分析和本地模拟提交闭环。

具体页面状态、组件边界和设计约束见 `docs/current-stage.md`。

当前默认不做：

- 不连接真实调度器、监控、日志或知识库；
- 不接真实模型或 Agent 后端；
- 不执行真实写操作；
- 不引入数据库、登录、权限服务和部署基础设施；
- 不把高保真交互 Demo 当作工程可行性证明。

所有数据、工具调用、推理过程和执行结果均使用可复现的本地模拟数据，并在界面中明确标记为“模拟”。

## 3. 推荐技术基线

| 层级 | 建议 | 当前是否需要 |
|---|---|---|
| 应用框架 | Next.js 16.3.5，使用 App Router 和静态导出 | 已安装 |
| UI 运行时 | React 19、React DOM 19 | 必需 |
| 开发语言 | TypeScript | 必需 |
| 样式 | Tailwind CSS 4 | 必需 |
| 基础组件 | shadcn/ui | 必需，AI Elements CLI 可自动初始化 |
| AI 界面组件 | AI Elements，按需添加组件源码 | 必需 |
| 图标 | `lucide-react`，优先复用组件自带图标体系 | 按组件需要安装 |
| AI SDK | `ai` | 已由 AI Elements 自动安装；`@ai-sdk/react` 和 `zod` 暂缓 |
| 模型访问 | AI Gateway 或具体模型 Provider | 暂缓 |
| 数据层 | 本地 TypeScript/JSON mock data | 必需 |

AI Elements 官方当前要求 Node.js 18+、React 19、Next.js 14+、Tailwind CSS 4，并基于 shadcn/ui。组件通过 CLI 直接加入项目源码，默认位于 `components/ai-elements/`，不是一个需要整包引入的封闭组件库。

## 4. 仅前台 Demo 的最小安装方案

### 4.1 环境前置

- 项目当前使用 Node.js 24.19.0 和 pnpm 11.19.0，并通过 `.node-version` 记录 Node 版本。
- Codex 工作区自带对应运行时，项目已经完成安装和构建验证。
- 用户终端当前未将 Node.js 加入全局 `PATH`；如需脱离 Codex 直接运行，应安装或激活 `.node-version` 指定的版本。

### 4.2 创建项目

如果远端仓库为空，可在仓库根目录执行：

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

如果远端仓库已经有代码，应先拉取并检查现有 `package.json`，不要直接运行以上命令覆盖文件。

### 4.3 按需添加 AI Elements

不要一开始安装所有组件。首轮共享外壳建议先评估并添加：

```bash
npx ai-elements@latest add conversation
npx ai-elements@latest add message
npx ai-elements@latest add prompt-input
npx ai-elements@latest add plan
npx ai-elements@latest add task
npx ai-elements@latest add tool
npx ai-elements@latest add sources
npx ai-elements@latest add reasoning
```

CLI 会把所选组件和它们实际需要的依赖加入项目；如果尚未配置 shadcn/ui，也会引导完成初始化。安装后需要检查自动加入的依赖和源码，不把示例页面中的所有包机械照搬进项目。

首轮不建议安装：

- `@ai-sdk/react`：静态或本地状态驱动的 Demo 不需要 `useChat`；
- 模型 Provider SDK、API Key：当前不发起模型请求；
- `@xyflow/react`：只有确定需要可编辑工作流画布时再引入；
- `shiki`：只有需要高质量代码高亮时再引入；
- `nanoid`：React 状态中的稳定演示 ID 可先由 mock data 明确提供；
- `sonner`：只有出现跨区域轻提示需求时再引入；
- 数据库、认证、状态管理框架：初版没有对应需求。

### 4.4 接入真实对话时再增加

当 Demo 需要真实流式回复或 React 对话 Hook 时，再执行：

```bash
pnpm add @ai-sdk/react zod
```

此时还需要新增服务端 Route Handler，并根据模型接入方案配置 AI Gateway 或 Provider API Key。密钥只写入 `.env.local`，不得进入 Git。

## 5. 推荐的首轮组件映射

| HPC Agent 体验对象 | AI Elements 候选组件 | 备注 |
|---|---|---|
| 对话时间线 | `conversation`、`message` | 只承载交流，不替代主工作区 |
| 用户任务输入 | `prompt-input` | 初期可禁用真实文件上传和模型选择 |
| 执行计划 | `plan` | 表达计划及展开详情 |
| 当前/历史任务 | `task` | 与具体 HPC 对象关联 |
| 工具调用 | `tool` | 区分待授权、运行、成功、失败、拒绝 |
| 原始证据 | `sources` | 除 URL 外，还需扩展系统、对象和更新时间 |
| Agent 推断 | `reasoning` | 不应把内部思维链直接展示为产品内容；用于可解释的分析摘要 |
| 等待状态 | `spinner` 或组件自身状态 | 同时显示等待对象和原因，不能只有动画 |

AI Elements 提供的是交互积木，不等于完整的 HPC 工作台。对象上下文、资源表格、日志/指标、权限影响范围和事实/推断/建议/动作的视觉语义仍需在项目内设计。

## 6. 建议目录

```text
src/
├── app/
│   ├── page.tsx
│   └── concepts/
├── components/
│   ├── ai-elements/      # CLI 添加的 AI Elements 源码
│   ├── ui/               # shadcn/ui 基础组件
│   ├── shell/            # 共享工作台外壳
│   └── hpc/              # HPC 领域组件
├── data/                 # 可复现的模拟数据
├── domain/               # HPC 对象类型、状态和领域规则
└── lib/

knowledge/                # 长期领域知识
research/                 # 研究材料与结论
public/                   # 图片和静态资源
```

概念数量增加后，再将独立 Demo 放到 `src/app/concepts/[concept]/`。初期先完成一个共享外壳和一个代表性场景，不急于建立大量空目录。

## 7. Git 仓库状态

- 目标仓库：`https://atomgit.com/weixin_44520172/HPC_agent`
- 当前本地目录已初始化为 Git 仓库，默认分支为 `main`。
- 已复用现有 AtomGit SSH 密钥完成身份验证，账号为 `weixin_44520172`。
- 远端仓库已确认没有分支、标签或提交，并已绑定为 `origin`。
- 当前已完成首轮前端原型与文档整理，本轮将创建首个基线提交。

推荐后续顺序：

1. 以基线提交作为后续迭代和回退起点；
2. 接入真实后端前，继续使用明确的本地演示状态；
3. 需要共享时再推送到 `origin`；
4. 后续如需在其他设备使用，应单独配置有仓库权限的 SSH 身份。

## 8. 真实接入前仍需确认的问题

以下问题会直接影响真实数据模型、权限边界和后续信息架构，应在接入后端前由产品、设计和工程共同确认：

1. 第一位目标用户是普通科研用户、应用工程师，还是集群/调度管理员？
2. 首个代表性任务选择“作业失败诊断”“排队原因解释”还是其他场景？
3. Demo 更偏向概念评审、用户测试，还是对管理层演示？
4. 是否已有产品视觉规范、截图、Token 或必须沿用的导航结构？
5. 默认使用哪一类调度器语义，例如 Slurm、OpenPBS，还是产品自有抽象？
6. 哪些建议允许直接执行，哪些操作必须经过二次确认或更高权限审批？

在这些信息尚未明确时，继续使用明确标注的本地演示状态，不应自行编造调度规则、权限边界或实时数据。

## 9. 参考资料

- AI Elements Setup：https://elements.ai-sdk.dev/docs/setup
- AI Elements Chatbot Example：https://elements.ai-sdk.dev/examples/chatbot
- 原始协作基线：`HPC智能体Demo_Agent协作设计指南.md`
