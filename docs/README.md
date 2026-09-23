# HPC Agent 文档导航

本目录是项目文档的统一入口。文档按“当前实现”、“工程基线”、“长期原则”和“产品决策”分层，避免把会频繁变化的实现状态混入长期协作原则。

## 建议阅读顺序

1. [Agent 对话流输出规范](agent-conversation-output-spec.html)（[浏览器直接打开](https://ghan1995.github.io/HPC_agent_demo/docs/agent-conversation-output-spec.html)）
2. [当前阶段工作进展与实现约束](current-stage.md)
3. [项目启动与前端技术基线](../HPC智能体Demo_项目启动与前端技术基线.md)
4. [Agent 协作设计指南](../HPC智能体Demo_Agent协作设计指南.md)
5. [产品决策记录](../knowledge/decisions.md)
6. [下一步设计待办](next-design-todos.md)

## 文档职责

| 文档 | 职责 | 更新时机 |
|---|---|---|
| `docs/agent-conversation-output-spec.html` | Agent 对话输出结构、折叠边界、人工交互、状态披露和格式化示例 | 对话流程或输出组件规范变化时 |
| `docs/current-stage.md` | 当前已实现能力、组件映射、视觉 Token、互动约束和未完成项 | 完成一个明确阶段后 |
| `HPC智能体Demo_项目启动与前端技术基线.md` | 技术选型、运行方式、依赖和项目范围 | 框架、依赖或阶段边界变化时 |
| `HPC智能体Demo_Agent协作设计指南.md` | 长期协作方式、HPC 语境、设计方法和安全原则 | 长期方法论变化时 |
| `knowledge/decisions.md` | 已形成共识的产品和交互决策 | 新决策或原决策被修订时 |
| `docs/next-design-todos.md` | 下一步需要展开的体验设计、状态和完成标准 | 新增设计待办或待办完成时 |

## 维护规则

- 文档只记录已实现、已确认或明确标注为待验证的内容。
- 页面局部变化先更新 `current-stage.md`；形成长期产品结论后再写入 `knowledge/decisions.md`。
- 依赖版本以 `package.json` 和锁文件为准，文档中不重复维护详细子依赖清单。
- 不在文档中记录密钥、真实账号、未脱敏数据或其他敏感信息。
