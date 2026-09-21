"use client";

import {
  Agent,
  AgentContent,
  AgentHeader,
  AgentInstructions,
  AgentOutput,
} from "@/components/ai-elements/agent";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Bot, ChevronDown, Clock3, Settings2, Wrench } from "lucide-react";
import { useState } from "react";

import type { RunEvent, RunTrace as RunTraceData, SubAgentRun } from "./types";

function AgentRun({ agent }: { agent: SubAgentRun }) {
  const state = agent.status === "完成" ? "output-available" : agent.status === "失败" ? "output-error" : agent.status === "等待" ? "approval-requested" : "input-available";

  return (
    <Tool className="mb-0 bg-background">
      <ToolHeader state={state} title={agent.name} toolName={agent.id} type="dynamic-tool" />
      <ToolContent className="pt-0">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary"><Bot />子 Agent</Badge>
          <span>{agent.role}</span>
          <span className="ml-auto flex items-center gap-1"><Clock3 />{agent.duration}</span>
        </div>
        <ToolInput input={agent.input} />
        <ToolOutput errorText={agent.status === "失败" ? "子 Agent 执行失败" : undefined} output={agent.output} />
        <Collapsible>
          <CollapsibleTrigger render={<Button className="mt-3" size="sm" variant="ghost" />}>
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
      </ToolContent>
    </Tool>
  );
}

function RunEventRow({ event }: { event: RunEvent }) {
  const [open, setOpen] = useState(event.status === "active");
  const hasDetails = Boolean(event.tools?.length || event.agents?.length || event.references?.length);

  return (
    <ChainOfThoughtStep
      icon={event.icon}
      label={
        <button
          aria-expanded={hasDetails ? open : undefined}
          className={cn("flex w-full items-start justify-between gap-3 text-left", hasDetails && "cursor-pointer")}
          disabled={!hasDetails}
          onClick={() => hasDetails && setOpen((value) => !value)}
          type="button"
        >
          <span className="min-w-0">
            <strong className="block text-sm font-medium text-foreground">{event.title}</strong>
            <small className="mt-0.5 block text-xs leading-5 text-muted-foreground">{event.summary}</small>
          </span>
          {hasDetails ? <ChevronDown className={cn("mt-0.5 shrink-0 transition-transform", open && "rotate-180")} /> : null}
        </button>
      }
      status={event.status === "error" ? "active" : event.status}
    >
      {open ? (
        <div className="flex flex-col gap-2 pb-2">
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
          {event.agents?.length ? (
            <div className="flex flex-col gap-2">
              {event.agents.map((agent) => <AgentRun agent={agent} key={agent.id} />)}
            </div>
          ) : null}
        </div>
      ) : null}
    </ChainOfThoughtStep>
  );
}

export function RunTrace({ trace, active = false }: { trace: RunTraceData; active?: boolean }) {
  return (
    <ChainOfThought className="run-trace" defaultOpen={active || trace.defaultOpen}>
      <ChainOfThoughtHeader className="run-trace__header">
        <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <span className="min-w-0">
            <strong className="block text-sm font-medium text-foreground">{trace.title}</strong>
            <small className="block truncate text-xs text-muted-foreground">{active ? "重新分析中 · 正在刷新证据" : trace.summary}</small>
          </span>
          <span className={cn("run-trace__duration", active && "is-active")}>
            <Clock3 />{active ? "运行中" : trace.duration}
          </span>
        </span>
      </ChainOfThoughtHeader>
      <ChainOfThoughtContent className="run-trace__content">
        {trace.events.map((event, index) => (
          <RunEventRow
            event={active && index === trace.events.length - 1 ? { ...event, status: "active", summary: "正在重新汇总最新证据…" } : event}
            key={event.id}
          />
        ))}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
