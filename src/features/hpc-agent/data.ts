import {
  BrainCircuit,
  CheckCircle2,
  FileText,
  ListTodo,
  ScrollText,
  Server,
} from "lucide-react";

import type { RunTrace, SessionGroup, TaskPlan } from "./types";

export const suggestions = [
  { title: "查看集群状态", description: "了解集群、队列和关键资源的当前状态" },
  { title: "查询我的作业", description: "查找运行中、排队或最近完成的作业" },
  { title: "诊断失败作业", description: "结合日志与资源使用情况分析失败原因" },
  { title: "准备作业提交", description: "整理脚本、资源需求和提交参数" },
];

export const initialSessionGroups: SessionGroup[] = [
  {
    label: "需要处理",
    kind: "attention",
    items: [
      {
        id: "resubmit-874231",
        title: "调整作业内存后重新提交",
        project: "蛋白质模拟",
        updatedAt: "更新于今天 10:45",
        status: "待确认",
        tone: "attention",
      },
    ],
  },
  {
    label: "GPU 性能分析",
    kind: "project",
    items: [
      {
        id: "gpu-analysis",
        title: "分析 GPU 资源使用情况",
        project: "GPU 性能分析",
        updatedAt: "更新于 3 分钟前",
        status: "运行中",
        tone: "running",
      },
    ],
  },
  {
    label: "蛋白质模拟",
    kind: "project",
    items: [
      {
        id: "diagnose-874231",
        title: "诊断作业 874231",
        project: "蛋白质模拟",
        updatedAt: "更新于今天 10:42",
        status: "已完成",
        tone: "completed",
      },
    ],
  },
  {
    label: "集群运维",
    kind: "project",
    items: [
      {
        id: "cluster-status",
        title: "查看集群状态",
        project: "集群运维",
        updatedAt: "更新于昨天 16:08",
        status: "已完成",
        tone: "completed",
      },
      {
        id: "queue-reason",
        title: "解释作业排队原因",
        project: "集群运维",
        updatedAt: "更新于周二 14:26",
        status: "已完成",
        tone: "completed",
      },
      {
        id: "diagnose-873912",
        title: "诊断作业 873912",
        project: "集群运维",
        updatedAt: "更新于 9 月 15 日 09:31",
        status: "已中断",
        tone: "stopped",
      },
    ],
  },
];

export const submissionTaskPlan: TaskPlan = {
  title: "调整内存并重新提交",
  eyebrow: "当前轮次 · 等待确认",
  statusLabel: "待确认",
  statusTone: "waiting",
  currentStep: "确认提交参数",
  completed: 2,
  total: 5,
  tasks: [
    { title: "确认提交需求", description: "确认脚本、队列和资源调整目标", status: "completed" },
    { title: "准备提交配置", description: "将单节点内存由 64 GB 调整为 80 GB", status: "completed" },
    { title: "确认提交参数", description: "等待你确认新作业参数", status: "waiting" },
    { title: "提交新作业", description: "确认后创建新作业", status: "queued" },
    { title: "获取新作业 ID", description: "调度器受理后返回结果", status: "queued" },
  ],
};

export function createCurrentRoundTaskPlan(message: string): TaskPlan {
  const normalizedMessage = message.trim();
  const title = normalizedMessage.length > 20 ? `${normalizedMessage.slice(0, 20)}…` : normalizedMessage;

  return {
    title: title || "处理新一轮请求",
    eyebrow: "当前轮次 · 进行中",
    statusLabel: "进行中",
    statusTone: "active",
    currentStep: "获取相关数据",
    completed: 0,
    total: 3,
    tasks: [
      { title: "获取相关数据", description: "读取本轮请求涉及的对象与状态", status: "active" },
      { title: "执行请求", description: "按照当前审查等级完成业务操作", status: "queued" },
      { title: "返回处理结果", description: "汇总状态、结果与后续建议", status: "queued" },
    ],
  };
}

const diagnosisAgents = [
  {
    id: "scheduler-agent",
    name: "调度分析 Agent",
    role: "检查作业状态、退出码与调度事件",
    status: "完成" as const,
    duration: "1.2s",
    input: { jobId: "874231", scope: ["状态", "退出码", "终止事件"] },
    output: { status: "FAILED", reason: "OUT_OF_MEMORY", terminatedAt: "10:31:48" },
    model: "HPC Scheduler Analyst",
    instructions: "核对调度器状态和事件，只返回可审计的事实与时间点。",
    tools: ["scheduler.getJob", "scheduler.getEvents"],
  },
  {
    id: "log-agent",
    name: "日志诊断 Agent",
    role: "定位内存不足相关错误与时间点",
    status: "完成" as const,
    duration: "2.8s",
    input: { jobId: "874231", logs: ["stdout", "stderr", "system"], window: "±5 分钟" },
    output: "未发现应用代码异常；stderr 记录 cgroup memory limit exceeded。",
    model: "HPC Log Analyst",
    instructions: "交叉检查应用日志与系统事件，区分应用错误和资源限制。",
    tools: ["logs.read", "logs.search"],
  },
  {
    id: "resource-agent",
    name: "资源分析 Agent",
    role: "对比申请资源与峰值内存使用",
    status: "完成" as const,
    duration: "1.9s",
    input: { requestedMemory: "64 GB", metrics: "job-874231 memory series" },
    output: { peakMemory: "71.6 GB", recommendation: "80 GB", headroom: "约 11%" },
    model: "HPC Resource Analyst",
    instructions: "分析资源峰值并给出保守、可解释的申请建议。",
    tools: ["metrics.query", "metrics.compare"],
  },
];

const submissionAgents = [
  {
    id: "config-agent",
    name: "作业配置 Agent",
    role: "复用原作业配置并生成 80 GB 调整方案",
    status: "完成" as const,
    duration: "1.4s",
    input: { sourceJob: "874231", memory: "80 GB" },
    output: { nodes: 1, memory: "80 GB", queue: "normal", reuseInputs: true },
    model: "HPC Job Configurator",
    instructions: "仅调整用户明确要求的资源参数，并保留原脚本和输入文件。",
    tools: ["job.readConfig", "job.createDraft"],
  },
  {
    id: "policy-agent",
    name: "策略检查 Agent",
    role: "核对提交规范、配额与审批要求",
    status: "完成" as const,
    duration: "0.8s",
    input: { cluster: "Cluster-A", queue: "normal", memory: "80 GB" },
    output: { valid: true, approvalRequired: true, quotaAvailable: true },
    model: "HPC Policy Checker",
    instructions: "验证提交参数、用户配额和关键操作确认策略。",
    tools: ["policy.validate", "quota.check"],
  },
  {
    id: "submit-agent",
    name: "调度提交 Agent",
    role: "确认后调用调度器创建新作业",
    status: "等待" as const,
    duration: "—",
    input: { draft: "resubmit-874231", approval: "等待用户确认" },
    output: "尚未执行；确认后提交并返回新作业 ID。",
    model: "HPC Submitter",
    instructions: "必须在获得明确批准后调用调度器提交作业。",
    tools: ["scheduler.submit"],
  },
];

export const diagnosisTrace: RunTrace = {
  title: "思考过程",
  summary: "已完成 · 6 项活动",
  duration: "30s",
  narrative: [
    "先检查调度终止原因，再用运行日志与资源曲线交叉验证，避免只根据单一退出码判断。",
    "三类证据一致指向内存超限，应用日志中没有发现独立的代码异常。",
  ],
  defaultOpen: false,
  defaultAgentsOpen: false,
  events: [
    {
      id: "understand",
      title: "理解任务并制定诊断计划",
      summary: "识别诊断目标，确定需要调度、日志和资源三类证据。",
      icon: BrainCircuit,
      status: "complete",
    },
    {
      id: "guidance",
      title: "查看诊断指导与当前上下文",
      summary: "读取诊断规范和作业来源信息。",
      icon: FileText,
      status: "complete",
      references: ["作业失败诊断指南", "作业 874231 上下文"],
    },
    {
      id: "scheduler",
      title: "查询作业调度状态",
      summary: "状态 FAILED，退出原因 OUT_OF_MEMORY。",
      icon: Server,
      status: "complete",
      tools: [
        {
          id: "scheduler-query",
          name: "scheduler_get_job",
          title: "读取调度状态",
          state: "output-available",
          input: { jobId: "874231", includeEvents: true },
          output: { status: "FAILED", reason: "OUT_OF_MEMORY", terminatedAt: "10:31:48" },
        },
      ],
    },
    {
      id: "delegation",
      title: "并行委派专业分析",
      summary: "3 个子 Agent 完成调度、日志与资源分析。",
      icon: BrainCircuit,
      status: "complete",
      agentIds: diagnosisAgents.map((agent) => agent.id),
    },
    {
      id: "logs",
      title: "读取并分析运行日志",
      summary: "发现 cgroup memory limit exceeded，未发现应用代码异常。",
      icon: ScrollText,
      status: "complete",
    },
    {
      id: "conclusion",
      title: "汇总证据并形成结论",
      summary: "证据相互印证，建议将内存调整至 80 GB。",
      icon: CheckCircle2,
      status: "complete",
    },
  ],
  agents: diagnosisAgents,
  simulation: [
    {
      summary: "正在理解任务并准备证据",
      duration: "运行中",
      eventStatuses: { understand: "active", guidance: "pending", scheduler: "pending", delegation: "pending", logs: "pending", conclusion: "pending" },
      agentStatuses: { "scheduler-agent": "待启动", "log-agent": "待启动", "resource-agent": "待启动" },
    },
    {
      summary: "3 个子 Agent 正在并行分析",
      duration: "运行中",
      eventStatuses: { understand: "complete", guidance: "complete", scheduler: "active", delegation: "active", logs: "pending", conclusion: "pending" },
      agentStatuses: { "scheduler-agent": "运行中", "log-agent": "运行中", "resource-agent": "运行中" },
    },
    {
      summary: "2 个已完成，1 个仍在分析",
      duration: "运行中",
      eventStatuses: { understand: "complete", guidance: "complete", scheduler: "complete", delegation: "active", logs: "active", conclusion: "pending" },
      agentStatuses: { "scheduler-agent": "完成", "log-agent": "完成", "resource-agent": "运行中" },
    },
    {
      summary: "专业分析已完成，正在汇总结论",
      duration: "运行中",
      eventStatuses: { understand: "complete", guidance: "complete", scheduler: "complete", delegation: "complete", logs: "complete", conclusion: "active" },
      agentStatuses: { "scheduler-agent": "完成", "log-agent": "完成", "resource-agent": "完成" },
    },
    {
      summary: "已完成 · 6 项活动",
      duration: "30s",
      eventStatuses: { understand: "complete", guidance: "complete", scheduler: "complete", delegation: "complete", logs: "complete", conclusion: "complete" },
      agentStatuses: { "scheduler-agent": "完成", "log-agent": "完成", "resource-agent": "完成" },
    },
  ],
};

export const submissionTrace: RunTrace = {
  title: "思考过程",
  summary: "等待确认 · 4 项活动",
  duration: "8s",
  narrative: [
    "已读取原作业配置，并将单节点内存参数从 64 GB 调整为 80 GB。",
    "策略与配额检查已通过；创建新作业属于外部写操作，正在等待你的确认。",
  ],
  defaultOpen: true,
  defaultAgentsOpen: true,
  events: [
    {
      id: "submit-understand",
      title: "理解提交目标",
      summary: "调整内存并复用原作业重新提交。",
      icon: BrainCircuit,
      status: "complete",
    },
    {
      id: "submit-guidance",
      title: "读取提交指导",
      summary: "检查 Cluster-A 提交规范、资源限制与确认策略。",
      icon: FileText,
      status: "complete",
      references: ["Cluster-A 作业提交规范", "关键步骤确认策略"],
    },
    {
      id: "submit-agents",
      title: "准备并校验提交配置",
      summary: "2 个已完成，1 个等待用户确认。",
      icon: Server,
      status: "active",
      agentIds: submissionAgents.map((agent) => agent.id),
      tools: [
        {
          id: "read-config",
          name: "job_read_config",
          title: "读取原作业配置",
          state: "output-available",
          input: { jobId: "874231" },
          output: { script: "run.sh", nodes: 1, memory: "64 GB", queue: "normal" },
        },
      ],
    },
    {
      id: "submit-plan",
      title: "生成任务计划",
      summary: "形成 5 个用户可见的业务执行阶段。",
      icon: ListTodo,
      status: "complete",
    },
  ],
  agents: submissionAgents,
};
