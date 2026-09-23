<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Demo 发布同步规范

本项目有两个面向用户的在线 Demo，发布或更新 Demo 时必须同步维护，不能只更新其中一个：

- 主站：`https://hpc-agent-demo.gaohan199581.chatgpt.site`
- GitHub Pages 备用站：`https://ghan1995.github.io/HPC_agent_demo/`

执行发布、同步或合并交付时：

1. 运行 `pnpm build`，确保 `out/` 与 Sites 使用的 `dist/` 都来自当前源码。
2. 将源码提交同步到 AtomGit 与 GitHub；合并交付时同步两个远端的 `main`。
3. 更新并部署 `.openai/hosting.json` 对应的 Sites 项目。
4. 将最新 `out/` 内容同步到 GitHub 的 `gh-pages` 分支根目录，同时保留 `.nojekyll` 和 `docs/agent-conversation-output-spec.html`。
5. 分别访问两个线上入口，确认它们已加载本次构建的新资源或新交互；仅更新 `main` 不等于 GitHub Pages 已发布。

除非用户明确要求只更新某一个环境，否则以上两个 Demo 必须作为同一次发布完成。
