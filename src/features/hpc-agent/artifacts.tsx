"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BarChart3, ChevronRight, FileText, LineChart, PackageOpen, X } from "lucide-react";

import type { ArtifactId, ArtifactItem } from "./types";

export const artifacts: ArtifactItem[] = [
  {
    id: "memory-trend",
    title: "内存使用趋势",
    description: "资源采样数据 · 48 个时间点",
    kind: "chart",
    status: "updating",
    stage: "运行中生成",
    updatedAt: "10:31",
    task: "诊断作业 874231",
  },
  {
    id: "run-comparison",
    title: "最近三次运行对比",
    description: "内存申请、峰值与运行结果",
    kind: "table",
    status: "complete",
    stage: "运行中生成",
    updatedAt: "10:40",
    task: "诊断作业 874231",
  },
  {
    id: "diagnosis-report",
    title: "作业诊断报告",
    description: "诊断结论、证据与调整建议",
    kind: "document",
    status: "complete",
    stage: "任务完成后生成",
    updatedAt: "10:42",
    task: "诊断作业 874231",
  },
];

const icons = { chart: LineChart, table: BarChart3, document: FileText };

function ArtifactRow({ artifact, compact = false, onOpen }: { artifact: ArtifactItem; compact?: boolean; onOpen: (id: ArtifactId) => void }) {
  const Icon = icons[artifact.kind];
  return (
    <button className={cn("artifact-row", compact && "artifact-row--compact")} onClick={() => onOpen(artifact.id)} type="button">
      <span className="artifact-row__icon"><Icon /></span>
      <span className="artifact-row__body">
        <strong>{artifact.title}</strong>
        <small>{compact ? artifact.description : `${artifact.stage} · ${artifact.updatedAt}`}</small>
      </span>
      {artifact.status === "updating" ? <span className="artifact-updating"><i />持续更新</span> : <ChevronRight className="artifact-row__chevron" />}
    </button>
  );
}

export function ArtifactCollection({ onOpen }: { onOpen: (id: ArtifactId) => void }) {
  return (
    <section className="artifact-collection" aria-label="本次生成 3 个产物">
      <header>
        <span><PackageOpen /></span>
        <div><h2>本次生成 3 个产物</h2><p>来自任务“诊断作业 874231”</p></div>
      </header>
      <div className="artifact-collection__list">
        {artifacts.map((artifact) => <ArtifactRow artifact={artifact} compact key={artifact.id} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

export function ArtifactPanel({ inspectorOpen, onClose, onOpen }: { inspectorOpen: boolean; onClose: () => void; onOpen: (id: ArtifactId) => void }) {
  return (
    <aside className={cn("artifact-panel", inspectorOpen && "artifact-panel--with-inspector")} aria-label="产物面板">
      <header className="artifact-panel__header">
        <div><h2>产物</h2><p>当前 Session · 3 个</p></div>
        <Button aria-label="关闭产物面板" onClick={onClose} size="icon-sm" variant="ghost"><X /></Button>
      </header>
      <div className="artifact-panel__task">
        <span>所属 Task</span><strong>诊断作业 874231</strong>
      </div>
      <div className="artifact-panel__list">
        <p className="artifact-panel__section-label">运行过程中</p>
        {artifacts.filter((item) => item.stage === "运行中生成").map((artifact) => <ArtifactRow artifact={artifact} key={artifact.id} onOpen={onOpen} />)}
        <p className="artifact-panel__section-label">任务完成后</p>
        {artifacts.filter((item) => item.stage === "任务完成后生成").map((artifact) => <ArtifactRow artifact={artifact} key={artifact.id} onOpen={onOpen} />)}
      </div>
    </aside>
  );
}
