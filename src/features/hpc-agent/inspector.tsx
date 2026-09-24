"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, PanelRight, PanelRightClose, X } from "lucide-react";

import type { InspectorMode } from "./types";

const titles: Record<Exclude<InspectorMode, null>, { title: string; description: string }> = {
  "diagnosis-report": { title: "作业诊断报告", description: "job-874231-diagnosis.md · 生成于 10:42" },
  "memory-trend": { title: "内存使用趋势", description: "作业 874231 · Run 12 · 更新于 10:31" },
  "run-comparison": { title: "最近三次运行对比", description: "任务中间产物 · 生成于 10:40" },
  evidence: { title: "内存使用证据", description: "作业 874231 · Cluster-A" },
  comparison: { title: "最近三次运行", description: "相同脚本与输入数据" },
  log: { title: "运行日志", description: "仅展示可审计事件" },
};

const tabLabels: Record<Exclude<InspectorMode, null>, string> = {
  "memory-trend": "内存趋势",
  "run-comparison": "运行对比",
  "diagnosis-report": "诊断报告",
  evidence: "证据",
  comparison: "运行对比",
  log: "运行日志",
};

export function Inspector({
  mode,
  onCloseTab,
  onCollapse,
  onModeChange,
  tabs,
}: {
  mode: InspectorMode;
  onCloseTab: (mode: Exclude<InspectorMode, null>) => void;
  onCollapse: () => void;
  onModeChange: (mode: InspectorMode) => void;
  tabs: Array<Exclude<InspectorMode, null>>;
}) {
  return (
    <aside className="conversation-inspector" aria-label="右侧信息面板">
      <div className="inspector-tabbar">
        <nav className="inspector-tabs" aria-label="已打开的内容页签">
          {tabs.map((tab) => (
            <div className={mode === tab ? "inspector-tab is-active" : "inspector-tab"} key={tab}>
              <button aria-selected={mode === tab} onClick={() => onModeChange(tab)} role="tab" type="button">{tabLabels[tab]}</button>
              <button aria-label={`关闭${tabLabels[tab]}页签`} className="inspector-tab__close" onClick={() => onCloseTab(tab)} type="button"><X /></button>
            </div>
          ))}
        </nav>
        <Button aria-label="收起右侧面板" className="inspector-collapse" onClick={onCollapse} size="icon-sm" variant="ghost"><PanelRightClose /></Button>
      </div>
      <div className="inspector-content">
          {mode ? <div className="inspector-content__meta">{titles[mode].description}</div> : null}
          {mode === "diagnosis-report" ? <ReportContent /> : null}
          {mode === "memory-trend" ? <MemoryTrendContent /> : null}
          {mode === "run-comparison" ? <ComparisonContent /> : null}
          {mode === "evidence" ? <EvidenceContent /> : null}
          {mode === "comparison" ? <ComparisonContent /> : null}
          {mode === "log" ? <LogContent /> : null}
          {!mode ? <InspectorEmptyState /> : null}
      </div>
    </aside>
  );
}

function InspectorEmptyState() {
  return (
    <div className="inspector-empty">
      <span><PanelRight /></span>
      <strong>右侧面板</strong>
      <p>从对话中打开产物、证据或运行日志，内容会以页签形式保留在这里。</p>
    </div>
  );
}

function MemoryTrendContent() {
  return (
    <div className="flex flex-col gap-4">
      <section className="inspector-section artifact-chart-meta">
        <div><span>峰值内存</span><strong>71.6 GB</strong></div>
        <div><span>申请内存</span><strong>64 GB</strong></div>
        <div><span>数据状态</span><strong className="text-status-running">持续更新</strong></div>
      </section>
      <section className="artifact-chart" aria-label="内存使用趋势图">
        <div className="artifact-chart__legend"><span><i />实际使用</span><span><i />申请上限 64 GB</span></div>
        <svg viewBox="0 0 360 190" role="img" aria-label="内存使用从 42 GB 上升至 71.6 GB">
          <g className="chart-grid"><path d="M35 25H345M35 70H345M35 115H345M35 160H345" /></g>
          <path className="chart-limit" d="M35 62H345" />
          <path className="chart-area" d="M35 145 C75 142 92 132 120 127 S170 105 196 108 S242 82 270 73 S315 42 345 35 L345 160 L35 160Z" />
          <path className="chart-line" d="M35 145 C75 142 92 132 120 127 S170 105 196 108 S242 82 270 73 S315 42 345 35" />
          <circle cx="345" cy="35" r="4" />
          <g className="chart-labels"><text x="4" y="29">80</text><text x="4" y="74">60</text><text x="4" y="119">40</text><text x="4" y="164">20 GB</text><text x="35" y="184">09:50</text><text x="310" y="184">10:31</text></g>
        </svg>
      </section>
      <p className="text-sm leading-6 text-muted-foreground">该数据是 Task 运行期间持续产生的中间产物。作业结束后将停止刷新并保留为历史结果。</p>
    </div>
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
