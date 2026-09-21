"use client";

import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageAction, MessageActions, MessageContent } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  FileText,
  MemoryStick,
  PanelLeftOpen,
  RefreshCw,
  ScrollText,
  Server,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Composer } from "./composer";
import { createCurrentRoundTaskPlan, diagnosisTrace, submissionTaskPlan, submissionTrace } from "./data";
import { RunTrace } from "./run-trace";
import { TaskDock } from "./task-dock";
import type { ApprovalState, FeedbackValue, InspectorMode, TaskPlan } from "./types";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

function ContextStrip() {
  const items = [
    ["当前集群", "Cluster-A"],
    ["当前对象", "作业 874231"],
    ["来源", "作业详情页"],
    ["数据更新", "10:42"],
  ];
  return (
    <section className="context-strip" aria-label="当前任务上下文">
      <Server aria-hidden="true" />
      {items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
    </section>
  );
}

function planForApproval(state: ApprovalState): TaskPlan {
  if (state === "approved") {
    return {
      ...submissionTaskPlan,
      eyebrow: "当前轮次 · 已完成",
      statusLabel: "已完成",
      statusTone: "complete",
      currentStep: "新作业 874232",
      completed: 5,
      tasks: submissionTaskPlan.tasks.map((task) => ({ ...task, status: "completed" })),
    };
  }
  if (state === "rejected") {
    return {
      ...submissionTaskPlan,
      eyebrow: "当前轮次 · 已取消",
      statusLabel: "已取消",
      statusTone: "rejected",
      currentStep: "用户暂不提交",
      tasks: submissionTaskPlan.tasks.map((task, index) => index === 2 ? { ...task, description: "用户选择暂不提交", status: "waiting" } : task),
    };
  }
  return submissionTaskPlan;
}

export function ConversationView({
  inspector,
  onInspectorChange,
  onSidebarToggle,
  onSubmit,
  onPrepareSubmit,
  sidebarCollapsed,
  submitted,
}: {
  inspector: InspectorMode;
  onInspectorChange: (mode: InspectorMode) => void;
  onSidebarToggle: () => void;
  onSubmit: (message: PromptInputMessage) => void;
  onPrepareSubmit: () => void;
  sidebarCollapsed: boolean;
  submitted: string;
}) {
  const [taskOpen, setTaskOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(true);
  const [approval, setApproval] = useState<ApprovalState>("requested");
  const [feedback, setFeedback] = useState<FeedbackValue>(null);
  const [copied, setCopied] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);

  const taskPlan = useMemo(() => submitted ? createCurrentRoundTaskPlan(submitted) : planForApproval(approval), [approval, submitted]);
  const approvalPart = approval === "requested"
    ? { approval: { id: "submit-874231" }, state: "approval-requested" as const }
    : approval === "approved"
      ? { approval: { id: "submit-874231", approved: true as const }, state: "output-available" as const }
      : { approval: { id: "submit-874231", approved: false as const }, state: "output-denied" as const };

  async function copyAnswer() {
    await navigator.clipboard?.writeText("作业 874231 因内存使用超过申请值被系统终止。建议将单节点内存调整为 80 GB 后重新提交。");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function reanalyze() {
    setReanalyzing(true);
    window.setTimeout(() => setReanalyzing(false), 1800);
  }

  return (
    <section className="agent-main conversation-mode">
      <div className="conversation-stage">
        <header className="conversation-header">
          <div className="conversation-toolbar">
            <div className="flex min-w-0 items-center gap-2">
              {sidebarCollapsed ? <Button aria-label="展开 Session 列表" onClick={onSidebarToggle} size="icon-sm" variant="ghost"><PanelLeftOpen /></Button> : null}
              <strong className="truncate text-sm font-semibold">处理作业 874231</strong>
              <span className={cn("status-badge", approval === "approved" ? "status-badge--complete" : approval === "rejected" ? "status-badge--error" : "status-badge--waiting")}>
                {approval === "approved" ? <Check /> : approval === "rejected" ? <X /> : <span className="size-1.5 rounded-full bg-current" />}
                {approval === "approved" ? "已提交" : approval === "rejected" ? "已取消" : "等待确认"}
              </span>
            </div>
            <nav className="flex items-center gap-1" aria-label="对话工具">
              <Button aria-expanded={contextOpen} onClick={() => setContextOpen((value) => !value)} size="sm" variant="ghost"><Server data-icon="inline-start" />上下文<ChevronRight className={cn("transition-transform", contextOpen && "rotate-90")} data-icon="inline-end" /></Button>
              <Button aria-pressed={inspector === "log"} onClick={() => onInspectorChange(inspector === "log" ? null : "log")} size="sm" variant="ghost"><ScrollText data-icon="inline-start" />运行日志</Button>
            </nav>
          </div>
          {contextOpen ? <div className="conversation-context"><ContextStrip /></div> : null}
        </header>

        <Conversation className="conversation-scroll-region">
          <ConversationContent className="conversation-content">
            <Message from="user"><MessageContent>帮我诊断一下作业 874231 为什么失败，并给出下一步建议。</MessageContent></Message>

            <Message className="max-w-full" from="assistant">
              <div className="assistant-identity"><span><Sparkles /></span><strong>HPC Agent</strong></div>
              <MessageContent className="w-full overflow-visible">
                <RunTrace active={reanalyzing} trace={diagnosisTrace} />
                <div className="assistant-copy">
                  <p>诊断完成。作业因<strong>内存使用超过申请值</strong>被系统终止，应用本身没有发现明显代码异常。</p>
                  <section className="diagnosis-summary">
                    <div className="flex items-center gap-2"><MemoryStick /><h2>诊断结论</h2></div>
                    <dl><div><dt>失败原因</dt><dd>OUT_OF_MEMORY</dd></div><div><dt>申请内存</dt><dd>64 GB</dd></div><div><dt>峰值使用</dt><dd>71.6 GB</dd></div><div><dt>发生时间</dt><dd>10:31:48</dd></div></dl>
                  </section>
                  <p>建议将节点内存调整到 <strong>80 GB</strong> 后重新提交。当前脚本和输入文件可以继续复用；重新提交会创建一个新作业，需要你确认参数后执行。</p>
                </div>

                <Button className="artifact-link" onClick={() => onInspectorChange("artifact")} variant="outline">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"><FileText /></span>
                  <span className="min-w-0 flex-1 text-left"><strong className="block truncate text-sm font-medium">作业诊断报告</strong><small className="block truncate text-xs text-muted-foreground">诊断结论、证据与调整建议 · Markdown</small></span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">查看<ChevronRight /></span>
                </Button>

                <MessageActions>
                  <MessageAction label={copied ? "已复制" : "复制回答"} onClick={copyAnswer} tooltip={copied ? "已复制" : "复制回答"} variant={copied ? "secondary" : "ghost"}>{copied ? <Check /> : <ClipboardCopy />}</MessageAction>
                  <MessageAction label="回答有帮助" onClick={() => setFeedback((value) => value === "up" ? null : "up")} tooltip="回答有帮助" variant={feedback === "up" ? "secondary" : "ghost"}><ThumbsUp /></MessageAction>
                  <MessageAction label="回答没有帮助" onClick={() => setFeedback((value) => value === "down" ? null : "down")} tooltip="回答没有帮助" variant={feedback === "down" ? "secondary" : "ghost"}><ThumbsDown /></MessageAction>
                  <Button disabled={reanalyzing} onClick={reanalyze} size="sm" variant="ghost"><RefreshCw className={reanalyzing ? "animate-spin" : undefined} data-icon="inline-start" />{reanalyzing ? "分析中" : "重新分析"}</Button>
                </MessageActions>

                <section className="next-steps">
                  <h2>接下来你可以</h2>
                  <div>
                    <Button onClick={onPrepareSubmit} variant="outline">按 80 GB 准备重新提交<ChevronRight data-icon="inline-end" /></Button>
                    <Button onClick={() => onInspectorChange("evidence")} variant="outline">查看内存使用证据<ChevronRight data-icon="inline-end" /></Button>
                    <Button onClick={() => onInspectorChange("comparison")} variant="outline">对比最近三次运行<ChevronRight data-icon="inline-end" /></Button>
                  </div>
                </section>
              </MessageContent>
            </Message>

            <Message from="user"><MessageContent>按 80 GB 调整内存，准备重新提交。</MessageContent></Message>

            <Message className="max-w-full" from="assistant">
              <div className="assistant-identity"><span><Sparkles /></span><strong>HPC Agent</strong></div>
              <MessageContent className="w-full overflow-visible">
                <RunTrace trace={submissionTrace} />
                <div className="assistant-copy"><p>已复用原作业脚本和输入文件，并将单节点内存从 <strong>64 GB</strong> 调整为 <strong>80 GB</strong>。提交会创建一个新作业，请先确认本次变更。</p></div>
                <Confirmation approval={approvalPart.approval} className="approval-panel" state={approvalPart.state}>
                  <ConfirmationTitle>关键操作确认</ConfirmationTitle>
                  <ConfirmationRequest>
                    <div className="flex flex-col gap-4">
                      <div><span className="text-xs text-muted-foreground">待执行操作</span><strong className="mt-1 block text-sm">创建新作业并提交到 normal 队列</strong></div>
                      <dl className="approval-metrics"><div><dt>内存</dt><dd>80 GB / 节点</dd></div><div><dt>节点数</dt><dd>1</dd></div><div><dt>预计运行时长</dt><dd>2 小时</dd></div></dl>
                    </div>
                  </ConfirmationRequest>
                  <ConfirmationAccepted><div className="flex items-center gap-2 text-sm"><CheckCircle2 className="text-status-complete" /><span>已批准并提交，新作业 ID：<strong>874232</strong></span></div></ConfirmationAccepted>
                  <ConfirmationRejected><div className="flex items-center gap-2 text-sm"><X className="text-status-error" /><span>已取消本次提交，草稿参数仍然保留。</span></div></ConfirmationRejected>
                  <ConfirmationActions>
                    <ConfirmationAction onClick={() => setApproval("rejected")} variant="outline">暂不提交</ConfirmationAction>
                    <ConfirmationAction onClick={() => setApproval("approved")}>确认并提交</ConfirmationAction>
                  </ConfirmationActions>
                </Confirmation>
              </MessageContent>
            </Message>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <Composer
          onSubmit={(message) => { setTaskOpen(false); onSubmit(message); }}
          placeholder="继续询问，或描述下一步任务…"
          submitted={submitted}
          taskControl={<TaskDock onOpenChange={setTaskOpen} open={taskOpen} plan={taskPlan} />}
        />
      </div>
    </section>
  );
}
