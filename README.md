# HPC Agent Demo

面向浏览器的 HPC 智能体交互 Demo。项目使用 Next.js 开发，并静态导出为 HTML；不包含 Electron、Tauri 或其他桌面运行时。

当前已完成一轮可交互前端原型，包括 Session 项目分组、新对话首页、对话区、可审计工作过程、工具与子 Agent 详情、任务托盘、执行确认和右侧 Inspector。所有业务数据与执行结果仍为本地演示状态，未接入真实 HPC 后端。

## Demo 体验入口

直接点击进入：**[HPC Agent 在线 Demo](https://ghan1995.github.io/HPC_agent_demo/)**

无需安装环境或执行命令。Demo 展示的业务数据和执行结果均为本地模拟，不会连接或操作真实 HPC 系统。

备用入口：[Sites Demo](https://hpc-agent-demo.gaohan199581.chatgpt.site)

<details>
<summary>本地备用预览方式</summary>

仓库同时保留了构建完成的 `out/` 静态 Demo。在仓库根目录执行：

```bash
python3 -m http.server 4173 -d out
```

然后打开 [http://localhost:4173](http://localhost:4173)。

</details>

## 文档入口

- **[直接打开 Agent 对话流输出规范](https://ghan1995.github.io/HPC_agent_demo/docs/agent-conversation-output-spec.html)**
- [Agent 对话流输出规范（仓库文件）](docs/agent-conversation-output-spec.html)
- [下一步设计待办](docs/next-design-todos.md)
- [文档导航](docs/README.md)
- [当前阶段工作进展与实现约束](docs/current-stage.md)
- [项目启动与前端技术基线](HPC智能体Demo_项目启动与前端技术基线.md)
- [Agent 协作设计指南](HPC智能体Demo_Agent协作设计指南.md)
- [产品决策记录](knowledge/decisions.md)

## 环境

- Node.js 24.19.0
- pnpm 11.19.0

## 命令

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

`pnpm build` 会刷新已纳入版本控制的 `out/` Demo 交付物。构建后可使用任意静态文件服务器预览，例如：

```bash
python3 -m http.server 4173 -d out
```

## 技术组成

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- AI Elements（组件源码位于 `src/components/ai-elements/`）

## 当前边界

- 已完成前端组件化、视觉层级和本地交互闭环。
- 不展示模型私有原始思维，只展示判断摘要、步骤、工具调用和子 Agent 的可审计输入输出。
- 不连接真实调度器、监控、日志、知识库或模型服务。
- 写操作和新作业结果均为前端演示，不产生真实外部影响。
