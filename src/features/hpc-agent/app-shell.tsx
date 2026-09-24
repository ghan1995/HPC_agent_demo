"use client";

import {
  PromptInputProvider,
  type PromptInputMessage,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { PanelRightOpen } from "lucide-react";
import { useCallback, useState } from "react";

import { ConversationView } from "./conversation-view";
import { ArtifactPanel } from "./artifacts";
import { HomeView } from "./home-view";
import { Inspector } from "./inspector";
import { initialSessionGroups } from "./data";
import { SessionSidebar } from "./session-sidebar";
import type { InspectorMode, SessionGroup } from "./types";

type InspectorTab = Exclude<InspectorMode, null>;

function AppContent() {
  const controller = usePromptInputController();
  const [view, setView] = useState<"home" | "history">("home");
  const [inspector, setInspector] = useState<InspectorMode>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorTabs, setInspectorTabs] = useState<InspectorTab[]>([]);
  const [artifactsOpen, setArtifactsOpen] = useState(false);
  const [submitted, setSubmitted] = useState("");
  const [groups, setGroups] = useState<SessionGroup[]>(initialSessionGroups);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  function handleSubmit(message: PromptInputMessage) {
    const text = message.text.trim();
    if (!text && message.files.length === 0) return;
    setSubmitted(text || `已添加 ${message.files.length} 个附件`);
  }

  function selectSession(id: string) {
    setSelectedId(id);
    setView("history");
    setInspector(null);
    setInspectorOpen(false);
    setInspectorTabs([]);
    setArtifactsOpen(false);
    setSubmitted("");
  }

  function renameSession(id: string, title: string) {
    setGroups((current) => current.map((group) => ({
      ...group,
      items: group.items.map((item) => item.id === id ? { ...item, title } : item),
    })));
    setLiveMessage(`已重命名为“${title}”`);
  }

  function archiveSession(id: string) {
    let archivedTitle = "Session";
    setGroups((current) => current
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (item.id === id) archivedTitle = item.title;
          return item.id !== id;
        }),
      }))
      .filter((group) => group.items.length > 0));
    if (selectedId === id) {
      setView("home");
      setSelectedId(null);
    }
    setLiveMessage(`已归档“${archivedTitle}”`);
  }

  function newChat() {
    setView("home");
    setSelectedId(null);
    setInspector(null);
    setInspectorOpen(false);
    setInspectorTabs([]);
    setSubmitted("");
    controller.textInput.clear();
    controller.attachments.clear();
  }

  function prepareSubmit() {
    controller.textInput.setInput("按 80 GB 调整内存，准备重新提交。");
    setLiveMessage("已将重新提交请求放入输入框");
  }

  const openInspectorContent = useCallback((mode: InspectorMode) => {
    if (!mode) return;
    setInspectorTabs((current) => current.includes(mode) ? current : [...current, mode]);
    setInspector(mode);
    setInspectorOpen(true);
  }, []);

  function closeInspectorTab(mode: InspectorTab) {
    setInspectorTabs((current) => {
      const index = current.indexOf(mode);
      const next = current.filter((item) => item !== mode);
      if (inspector === mode) setInspector(next[Math.min(index, next.length - 1)] ?? null);
      return next;
    });
  }

  return (
    <main className="agent-home">
      <p aria-live="polite" className="sr-only">{liveMessage}</p>
      {!sidebarCollapsed ? (
        <>
          <button aria-label="关闭 Session 列表" className="sidebar-backdrop" onClick={() => setSidebarCollapsed(true)} type="button" />
          <SessionSidebar
            groups={groups}
            onArchive={archiveSession}
            onCollapse={() => setSidebarCollapsed(true)}
            onNewChat={newChat}
            onRename={renameSession}
            onSelect={selectSession}
            selectedId={selectedId}
          />
        </>
      ) : null}

      {view === "home" ? (
        <HomeView
          onSidebarToggle={() => setSidebarCollapsed(false)}
          onSubmit={handleSubmit}
          sidebarCollapsed={sidebarCollapsed}
          submitted={submitted}
        />
      ) : (
        <ConversationView
          inspector={inspector}
          inspectorOpen={inspectorOpen}
          artifactsOpen={artifactsOpen}
          onArtifactsOpenChange={setArtifactsOpen}
          onInspectorChange={openInspectorContent}
          onPrepareSubmit={prepareSubmit}
          onSidebarToggle={() => setSidebarCollapsed(false)}
          onSubmit={handleSubmit}
          sidebarCollapsed={sidebarCollapsed}
          submitted={submitted}
        />
      )}
      {view === "history" && artifactsOpen ? <ArtifactPanel onClose={() => setArtifactsOpen(false)} onOpen={(id) => { openInspectorContent(id); setArtifactsOpen(false); }} /> : null}
      {!inspectorOpen ? (
        <Button aria-label="展开右侧面板" className="inspector-edge-toggle" onClick={() => setInspectorOpen(true)} size="icon-sm" variant="ghost">
          <PanelRightOpen />
        </Button>
      ) : null}
      {inspectorOpen ? (
        <Inspector
          mode={inspector}
          onCloseTab={closeInspectorTab}
          onCollapse={() => setInspectorOpen(false)}
          onModeChange={setInspector}
          tabs={inspectorTabs}
        />
      ) : null}
    </main>
  );
}

export function HpcAgentApp() {
  return <PromptInputProvider><AppContent /></PromptInputProvider>;
}
