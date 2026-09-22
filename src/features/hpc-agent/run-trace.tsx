"use client";

import {
  Agent,
  AgentContent,
  AgentHeader,
  AgentInstructions,
  AgentOutput,
} from "@/components/ai-elements/agent";
import {
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  GitBranch,
  LoaderCircle,
  Settings2,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type {
  RunEvent,
  RunFrame,
  RunTrace as RunTraceData,
  SubAgentRun,
  SubAgentStatus,
} from "./types";

const agentStatusMeta = {
  "完成": { icon: CheckCircle2, className: "status-complete" },
  "运行中": { icon: LoaderCircle, className: "status-running" },
  "待启动": { icon: Circle, className: "status-pending" },
  "等待": { icon: Clock3, className: "status-waiting" },
  "失败": { icon: XCircle, className: "status-error" },
} satisfies Record<SubAgentStatus, { icon: typeof Circle; className: string }>;

function summarizeAgents(agents: SubAgentRun[]) {
  const counts = new Map<SubAgentStatus, number>();
  agents.forEach((agent) => counts.set(agent.status, (counts.get(agent.status) ?? 0) + 1));

  return (["运行中", "等待", "失败", "完成", "待启动"] as SubAgentStatus[])
    .flatMap((status) => {
      const count = counts.get(status);
      return count ? [`${count} 个${status}`] : [];
    })
    .join("，");
}

function SectionHeader({
  icon: Icon,
  summary,
  title,
}: {
  icon: typeof GitBranch;
  summary: string;
  title: string;
}) {
  return (
    <CollapsibleTrigger className="run-section__trigger">
      <Icon aria-hidden="true" className="run-section__icon" />
      <span className="run-section__heading">
        <strong>{title}</strong>
        <small aria-live="polite">{summary}</small>
      </span>
      <ChevronDown aria-hidden="true" className="run-section__chevron" />
    </CollapsibleTrigger>
  );
}

function AgentRun({ agent, highlighted }: { agent: SubAgentRun; highlighted: boolean }) {
  const [open, setOpen] = useState(agent.status === "等待" || agent.status === "失败");
  const StatusIcon = agentStatusMeta[agent.status].icon;
  const showInput = agent.status !== "待启动";
  const showOutput = agent.status === "完成" || agent.status === "等待" || agent.status === "失败";

  return (
    <Collapsible
      className={cn("subagent-item", highlighted && "is-highlighted")}
      onOpenChange={setOpen}
      open={open}
    >
      <CollapsibleTrigger
        className="subagent-item__trigger"
        id={`subagent-${agent.id}`}
      >
        <Bot aria-hidden="true" className="subagent-item__bot" />
        <span className="subagent-item__identity">
          <strong>{agent.name}</strong>
          <small>{agent.role}</small>
        </span>
        <span className={cn("subagent-item__status", agentStatusMeta[agent.status].className)}>
          <StatusIcon aria-hidden="true" className={agent.status === "运行中" ? "animate-spin" : undefined} />
          {agent.status}
        </span>
        <span className="subagent-item__duration">{agent.duration}</span>
        <ChevronDown aria-hidden="true" className="subagent-item__chevron" />
      </CollapsibleTrigger>
      <CollapsibleContent className="subagent-item__content">
        {showInput ? <ToolInput input={agent.input} /> : <p className="subagent-item__pending">等待前置阶段完成后启动。</p>}
        {showOutput ? (
          <ToolOutput
            errorText={agent.status === "失败" ? "子 Agent 执行失败" : undefined}
            output={agent.output}
          />
        ) : agent.status === "运行中" ? (
          <p className="subagent-item__pending">正在分析并生成可审计结果…</p>
        ) : null}
        <Collapsible>
          <CollapsibleTrigger render={<Button className="subagent-item__config" size="sm" variant="ghost" />}>
            <Settings2 data-icon="inline-start" />配置详情<ChevronDown data-icon="inline-end" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <Agent>
              <AgentHeader model={agent.model} name={agent.name} />
              <AgentContent>
                <AgentInstructions>{agent.instructions}</AgentInstructions>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground">可用工具</span>
                  <div className="flex flex-wrap gap-2">
                    {agent.tools.map((tool) => <Badge key={tool} variant="secondary"><Wrench />{tool}</Badge>)}
                  </div>
                </div>
                <AgentOutput schema={'{ status: "success" | "error"; evidence: unknown[]; summary: string }'} />
              </AgentContent>
            </Agent>
          </CollapsibleContent>
        </Collapsible>
      </CollapsibleContent>
    </Collapsible>
  );
}

function RunEventRow({
  agentMap,
  event,
  onAgentSelect,
}: {
  agentMap: Map<string, SubAgentRun>;
  event: RunEvent;
  onAgentSelect: (agentId: string) => void;
}) {
  const [open, setOpen] = useState(event.status === "active");
  const linkedAgents = event.agentIds?.flatMap((id) => {
    const agent = agentMap.get(id);
    return agent ? [agent] : [];
  }) ?? [];
  const hasDetails = Boolean(event.tools?.length || event.references?.length);
  const summary = linkedAgents.length ? summarizeAgents(linkedAgents) : event.summary;

  return (
    <ChainOfThoughtStep
      icon={event.icon}
      label={
        <button
          aria-expanded={hasDetails ? open : undefined}
          className={cn("run-event__trigger", hasDetails && "cursor-pointer")}
          disabled={!hasDetails}
          onClick={() => hasDetails && setOpen((value) => !value)}
          type="button"
        >
          <span className="min-w-0">
            <strong>{event.title}</strong>
            <small>{summary}</small>
          </span>
          {hasDetails ? <ChevronDown className={cn("run-event__chevron", open && "rotate-180")} /> : null}
        </button>
      }
      status={event.status === "error" ? "active" : event.status}
    >
      {linkedAgents.length ? (
        <button
          className="run-event__agents"
          onClick={() => onAgentSelect(linkedAgents[0].id)}
          type="button"
        >
          <Users aria-hidden="true" />
          <span>{linkedAgents.map((agent) => agent.name.replace(" Agent", "")).join("、")}</span>
          <span>查看协作</span>
        </button>
      ) : null}
      {open ? (
        <div className="run-event__details">
          {event.references?.length ? (
            <ChainOfThoughtSearchResults>
              {event.references.map((reference) => <ChainOfThoughtSearchResult key={reference}>{reference}</ChainOfThoughtSearchResult>)}
            </ChainOfThoughtSearchResults>
          ) : null}
          {event.tools?.map((tool) => (
            <Tool className="mb-0 bg-background" key={tool.id}>
              <ToolHeader state={tool.state} title={tool.title} toolName={tool.name} type="dynamic-tool" />
              <ToolContent>
                <ToolInput input={tool.input} />
                <ToolOutput errorText={tool.errorText} output={tool.output} />
              </ToolContent>
            </Tool>
          ))}
        </div>
      ) : null}
    </ChainOfThoughtStep>
  );
}

function applyFrame(trace: RunTraceData, frame?: RunFrame) {
  if (!frame) return { agents: trace.agents, events: trace.events };

  return {
    agents: trace.agents.map((agent) => ({
      ...agent,
      status: frame.agentStatuses[agent.id] ?? agent.status,
      duration: frame.agentStatuses[agent.id] === "运行中" ? "运行中" : agent.duration,
    })),
    events: trace.events.map((event) => ({
      ...event,
      status: frame.eventStatuses[event.id] ?? event.status,
    })),
  };
}

export function RunTrace({
  runPhase = null,
  trace,
}: {
  runPhase?: number | null;
  trace: RunTraceData;
}) {
  const active = runPhase !== null;
  const frame = active ? trace.simulation?.[runPhase] : undefined;
  const projected = useMemo(() => applyFrame(trace, frame), [frame, trace]);
  const agentMap = useMemo(() => new Map(projected.agents.map((agent) => [agent.id, agent])), [projected.agents]);
  const [workOpen, setWorkOpen] = useState(trace.defaultWorkOpen);
  const [agentsOpen, setAgentsOpen] = useState(trace.defaultAgentsOpen);
  const [targetAgent, setTargetAgent] = useState<string | null>(null);
  const previousActive = useRef(active);
  const agentsTouched = useRef(false);

  useEffect(() => {
    if (active && !previousActive.current) {
      setWorkOpen(true);
      setAgentsOpen(false);
      setTargetAgent(null);
      agentsTouched.current = false;
    }
    previousActive.current = active;
  }, [active]);

  useEffect(() => {
    const needsAttention = projected.agents.some((agent) => agent.status === "等待" || agent.status === "失败");
    if (needsAttention && !agentsTouched.current) setAgentsOpen(true);
  }, [projected.agents]);

  useEffect(() => {
    if (!(agentsOpen && targetAgent)) return;
    const timer = window.setTimeout(() => {
      const trigger = document.getElementById(`subagent-${targetAgent}`);
      trigger?.focus({ preventScroll: true });
      trigger?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [agentsOpen, targetAgent]);

  function selectAgent(agentId: string) {
    agentsTouched.current = true;
    setTargetAgent(agentId);
    setAgentsOpen(true);
  }

  const workSummary = frame?.summary ?? trace.summary;
  const agentSummary = summarizeAgents(projected.agents);
  const duration = frame?.duration ?? trace.duration;

  return (
    <div className="run-trace">
      <Collapsible className="run-section run-section--work" onOpenChange={setWorkOpen} open={workOpen}>
        <SectionHeader icon={GitBranch} summary={`${workSummary} · ${duration}`} title="工作过程" />
        <CollapsibleContent className="run-section__content run-section__content--work">
          {projected.events.map((event) => (
            <RunEventRow agentMap={agentMap} event={event} key={event.id} onAgentSelect={selectAgent} />
          ))}
        </CollapsibleContent>
      </Collapsible>

      {projected.agents.length ? (
        <Collapsible
          className="run-section run-section--agents"
          onOpenChange={(open) => {
            agentsTouched.current = true;
            setAgentsOpen(open);
          }}
          open={agentsOpen}
        >
          <SectionHeader icon={Users} summary={agentSummary} title="Subagent 协作" />
          <CollapsibleContent className="run-section__content run-section__content--agents">
            {projected.agents.map((agent) => (
              <AgentRun agent={agent} highlighted={agent.id === targetAgent} key={agent.id} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  );
}
