"use client";

import { type PromptInputMessage, usePromptInputController } from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { Activity, ArrowUpRight, Gauge, PanelLeftOpen, Search, Send, Wrench } from "lucide-react";

import { Composer } from "./composer";
import { suggestions } from "./data";

const icons = [Activity, Search, Gauge, Wrench];

export function HomeView({
  onSidebarToggle,
  sidebarCollapsed,
  submitted,
  onSubmit,
}: {
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
  submitted: string;
  onSubmit: (message: PromptInputMessage) => void;
}) {
  const controller = usePromptInputController();

  return (
    <section className="agent-main home-view">
      {sidebarCollapsed ? <Button aria-label="展开 Session 列表" className="absolute left-4 top-4" onClick={onSidebarToggle} size="icon" variant="ghost"><PanelLeftOpen /></Button> : null}
      <div className="home-content">
        <div className="home-heading">
          <span className="flex size-10 items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground"><Send /></span>
          <div><h1>今天要处理什么？</h1><p>查询集群、诊断作业，或准备一次新的作业提交。</p></div>
        </div>
        <div className="suggestion-list" aria-label="推荐案例">
          {suggestions.map((suggestion, index) => {
            const Icon = icons[index];
            return (
              <Button
                className="suggestion-card"
                key={suggestion.title}
                onClick={() => controller.textInput.setInput(suggestion.title)}
                variant="outline"
              >
                <span className="suggestion-card__icon flex size-8 items-center justify-center text-muted-foreground"><Icon /></span>
                <span className="min-w-0 flex-1 text-left"><strong>{suggestion.title}</strong><small>{suggestion.description}</small></span>
                <ArrowUpRight />
              </Button>
            );
          })}
        </div>
      </div>
      <Composer onSubmit={onSubmit} placeholder="描述你的 HPC 任务…" submitted={submitted} />
    </section>
  );
}
