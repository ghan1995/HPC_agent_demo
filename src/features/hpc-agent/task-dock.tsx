"use client";

import { Task } from "@/components/ai-elements/task";
import { CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, ChevronRight, Circle, Clock3, ListTodo } from "lucide-react";

import type { TaskPlan } from "./types";

export function TaskDock({ open, onOpenChange, plan }: { open: boolean; onOpenChange: (open: boolean) => void; plan: TaskPlan }) {
  return (
    <Task className={`task-dock${open ? " task-dock--open" : ""}`} onOpenChange={onOpenChange} open={open}>
      <section aria-label="任务详情" className={open ? "task-dock-panel" : undefined}>
        <CollapsibleTrigger
          aria-label={open ? "收起任务详情" : "展开任务详情"}
          className={open ? "task-dock-panel__header" : "task-dock-trigger"}
          type="button"
        >
          {open ? (
            <>
              <span className="task-dock-panel__heading">
                <strong>{plan.title}</strong>
                <small>{plan.eyebrow}</small>
              </span>
              <span className="task-dock-panel__status">
                <strong>{plan.completed} / {plan.total}</strong>
                <ChevronRight />
              </span>
            </>
          ) : (
            <>
              <span className="task-dock-trigger__main">
                <span className="task-dock-trigger__icon"><ListTodo /></span>
                <span className="task-dock-trigger__copy">
                  <strong>{plan.title}</strong>
                </span>
              </span>
              <span className="task-dock-trigger__status">
                <span className={`is-${plan.statusTone}`}><Clock3 />{plan.currentStep}</span>
                <small>{plan.completed} / {plan.total}</small>
                <ChevronRight />
              </span>
            </>
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="task-dock-panel__content">
          <ol aria-label="任务步骤" tabIndex={0}>
            {plan.tasks.map((task) => (
              <li className={`is-${task.status}`} key={task.title}>
                {task.status === "completed" ? <CheckCircle2 /> : task.status === "active" || task.status === "waiting" ? <Clock3 /> : <Circle />}
                <span>
                  <strong>{task.title}</strong>
                  <small>{task.description}</small>
                </span>
                {task.status === "waiting" ? <em>待确认</em> : null}
                {task.status === "active" ? <em>进行中</em> : null}
              </li>
            ))}
          </ol>
        </CollapsibleContent>
      </section>
    </Task>
  );
}
