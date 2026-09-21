import type { LucideIcon } from "lucide-react";

export type InspectorMode = "artifact" | "evidence" | "comparison" | "log" | null;
export type ApprovalState = "requested" | "approved" | "rejected";
export type FeedbackValue = "up" | "down" | null;
export type TaskStatus = "completed" | "active" | "waiting" | "queued";
export type RunStatus = "complete" | "active" | "pending" | "error";

export type ToolRun = {
  id: string;
  name: string;
  title: string;
  state:
    | "input-streaming"
    | "input-available"
    | "approval-requested"
    | "approval-responded"
    | "output-available"
    | "output-denied"
    | "output-error";
  input: Record<string, unknown>;
  output?: Record<string, unknown> | string;
  errorText?: string;
};

export type SubAgentRun = {
  id: string;
  name: string;
  role: string;
  status: "完成" | "运行中" | "等待" | "失败";
  duration: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | string;
  model: string;
  instructions: string;
  tools: string[];
};

export type RunEvent = {
  id: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  status: RunStatus;
  tools?: ToolRun[];
  agents?: SubAgentRun[];
  references?: string[];
};

export type RunTrace = {
  title: string;
  summary: string;
  duration: string;
  defaultOpen: boolean;
  events: RunEvent[];
};

export type TaskPlan = {
  title: string;
  eyebrow: string;
  statusLabel: string;
  statusTone: "active" | "waiting" | "complete" | "rejected";
  currentStep: string;
  completed: number;
  total: number;
  tasks: Array<{
    title: string;
    description: string;
    status: TaskStatus;
  }>;
};

export type SessionTone = "attention" | "running" | "completed" | "stopped";

export type SessionItem = {
  id: string;
  title: string;
  project: string;
  updatedAt: string;
  status: string;
  tone: SessionTone;
};

export type SessionGroup = {
  label: string;
  kind: "attention" | "project";
  items: SessionItem[];
};
