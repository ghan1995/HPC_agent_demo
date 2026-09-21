"use client";

import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from "@/components/ai-elements/artifact";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, FileText } from "lucide-react";

import type { InspectorMode } from "./types";

const titles: Record<Exclude<InspectorMode, null>, { title: string; description: string }> = {
  artifact: { title: "作业诊断报告", description: "job-874231-diagnosis.md · 生成于 10:42" },
  evidence: { title: "内存使用证据", description: "作业 874231 · Cluster-A" },
  comparison: { title: "最近三次运行", description: "相同脚本与输入数据" },
  log: { title: "运行日志", description: "仅展示可审计事件" },
};

export function Inspector({ mode, onClose }: { mode: Exclude<InspectorMode, null>; onClose: () => void }) {
  const title = titles[mode];

  return (
    <aside className="conversation-inspector" aria-label={title.title}>
      <Artifact className="h-full rounded-none border-0 shadow-none">
        <ArtifactHeader>
          <div className="min-w-0">
            <ArtifactTitle className="truncate">{title.title}</ArtifactTitle>
            <ArtifactDescription className="truncate text-xs">{title.description}</ArtifactDescription>
          </div>
          <ArtifactActions>
            <ArtifactAction icon={Copy} label="复制" tooltip="复制内容" />
            {mode === "artifact" ? <ArtifactAction icon={Download} label="下载" tooltip="下载报告" /> : null}
            <ArtifactClose aria-label="关闭详情" onClick={onClose} />
          </ArtifactActions>
        </ArtifactHeader>
        <ArtifactContent className="inspector-content">
          {mode === "artifact" ? <ReportContent /> : null}
          {mode === "evidence" ? <EvidenceContent /> : null}
          {mode === "comparison" ? <ComparisonContent /> : null}
          {mode === "log" ? <LogContent /> : null}
        </ArtifactContent>
      </Artifact>
    </aside>
  );
}

function ReportContent() {
  return (
    <article className="document-content">
      <div className="mb-6 flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-background text-muted-foreground"><FileText /></span>
        <span><strong className="block text-sm font-medium">job-874231-diagnosis.md</strong><small className="text-xs text-muted-foreground">Markdown · 3.2 KB</small></span>
      </div>
      <h2>作业 874231 诊断报告</h2>
      <h3>结论</h3>
      <p>作业因节点内存使用超过申请值被系统终止，退出原因是 <code>OUT_OF_MEMORY</code>。</p>
      <h3>关键证据</h3>
      <ul><li>申请内存：64 GB</li><li>峰值内存：71.6 GB</li><li>终止时间：10:31:48</li><li>系统日志：cgroup memory limit exceeded</li></ul>
      <h3>建议</h3>
      <p>将单节点内存调整到 80 GB，保留现有脚本和输入文件，确认后创建新作业。</p>
    </article>
  );
}

function EvidenceContent() {
  return (
    <div className="flex flex-col gap-4">
      <section className="inspector-section">
        <div className="flex items-center justify-between"><strong>资源峰值</strong><Badge className="status-badge status-badge--error">超出申请值</Badge></div>
        <dl className="metric-list"><div><dt>申请内存</dt><dd>64 GB</dd></div><div><dt>峰值内存</dt><dd>71.6 GB</dd></div><div><dt>超出比例</dt><dd>11.9%</dd></div><div><dt>采样时间</dt><dd>10:31:44</dd></div></dl>
      </section>
      <section className="inspector-section">
        <strong>日志证据</strong>
        <pre className="mt-3 overflow-auto rounded-lg bg-muted p-3 text-xs leading-5">{`10:31:44 memory.current=76880871424\n10:31:47 memory.events oom_kill=1\n10:31:48 cgroup memory limit exceeded`}</pre>
      </section>
    </div>
  );
}

function ComparisonContent() {
  const runs = [
    { id: "874231", memory: "64 GB", peak: "71.6 GB", result: "失败", tone: "error" },
    { id: "873912", memory: "64 GB", peak: "63.2 GB", result: "完成", tone: "complete" },
    { id: "873501", memory: "56 GB", peak: "54.8 GB", result: "完成", tone: "complete" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-muted-foreground">最近一次运行的内存需求明显高于前两次。建议使用 80 GB 为输入规模波动留出余量。</p>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th>作业</th><th>申请</th><th>峰值</th><th>结果</th></tr></thead>
          <tbody>{runs.map((run) => <tr className="border-t" key={run.id}><td>{run.id}</td><td>{run.memory}</td><td>{run.peak}</td><td><span className={`status-badge status-badge--${run.tone}`}>{run.result}</span></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function LogContent() {
  const logs = [
    ["10:38:12", "读取作业 874231 状态"],
    ["10:38:46", "调度分析 Agent 完成"],
    ["10:39:28", "日志诊断 Agent 完成"],
    ["10:40:17", "资源分析 Agent 完成"],
    ["10:42:03", "生成诊断报告"],
  ];
  return (
    <div>
      <p className="mb-4 text-sm leading-6 text-muted-foreground">运行日志只记录任务事件、工具状态和可审计结果，不展示模型私有思维过程。</p>
      <ol className="flex flex-col">
        {logs.map(([time, label]) => <li className="grid grid-cols-[64px_1fr] gap-3 border-b py-3 text-sm" key={time}><time className="font-mono text-xs text-muted-foreground">{time}</time><span>{label}</span></li>)}
      </ol>
    </div>
  );
}
