"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Archive,
  Clock3,
  Folder,
  MessageSquarePlus,
  MoreHorizontal,
  PanelLeftClose,
  Pencil,
  Search,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import type { SessionGroup, SessionItem } from "./types";

const toneClass = {
  attention: "session-status--attention",
  running: "session-status--running",
  completed: "session-status--completed",
  stopped: "session-status--stopped",
};

export function SessionSidebar({
  groups,
  selectedId,
  onArchive,
  onCollapse,
  onNewChat,
  onRename,
  onSelect,
}: {
  groups: SessionGroup[];
  selectedId: string | null;
  onArchive: (id: string) => void;
  onCollapse: () => void;
  onNewChat: () => void;
  onRename: (id: string, title: string) => void;
  onSelect: (id: string) => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [renameTarget, setRenameTarget] = useState<SessionItem | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.title.toLowerCase().includes(normalized)),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  function beginRename(item: SessionItem) {
    setRenameTarget(item);
    setRenameValue(item.title);
  }

  function submitRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = renameValue.trim();
    if (renameTarget && title) {
      onRename(renameTarget.id, title);
      setRenameTarget(null);
    }
  }

  return (
    <>
      <aside className="agent-sidebar" aria-label="Session 列表">
        <header className="flex h-10 items-center justify-between px-1">
          <strong className="text-sm font-semibold tracking-tight">HPC Agent</strong>
          <div className="flex items-center gap-0.5">
            <Button aria-expanded={searchOpen} aria-label="搜索对话" onClick={() => setSearchOpen((value) => !value)} size="icon-sm" variant="ghost"><Search /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button aria-label="侧栏更多操作" size="icon-sm" variant="ghost" />}><MoreHorizontal /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuItem>Session 设置</DropdownMenuItem>
                  <DropdownMenuItem>查看已归档</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button aria-label="收起 Session 列表" onClick={onCollapse} size="icon-sm" title="收起 Session 列表" variant="ghost"><PanelLeftClose /></Button>
          </div>
        </header>

        {searchOpen ? (
          <div className="absolute inset-x-3 top-13 z-20 rounded-xl border bg-popover p-2 shadow-lg">
            <div className="flex items-center gap-1">
              <Search aria-hidden="true" className="session-search-icon ml-2" />
              <Input aria-label="搜索 Session" autoFocus className="border-0 shadow-none focus-visible:ring-0" onChange={(event) => setQuery(event.target.value)} placeholder="搜索 Session" value={query} />
              <Button aria-label="关闭搜索" onClick={() => setSearchOpen(false)} size="icon-sm" variant="ghost"><X /></Button>
            </div>
            <p className="px-2 pt-1 text-xs text-muted-foreground">{query ? `找到 ${filteredGroups.reduce((sum, group) => sum + group.items.length, 0)} 条` : "输入关键词查找对话"}</p>
          </div>
        ) : null}

        <Button className="mx-1 mt-2 justify-start" onClick={onNewChat} variant="default"><MessageSquarePlus data-icon="inline-start" />新建对话</Button>

        <nav className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1" aria-label="Session 分组">
          {filteredGroups.map((group) => (
            <section className="mb-5" key={group.label}>
              <h2 className="session-group-title mb-1.5 flex h-6 items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground">
                {group.kind === "project" ? <Folder aria-hidden="true" /> : null}
                <span className="truncate">{group.label}</span>
              </h2>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <div
                    className={cn("session-row-wrap", selectedId === item.id && "is-selected")}
                    key={item.id}
                    onKeyDownCapture={(event) => {
                      if ((event.key === "Enter" || event.key === " ") && (event.target as HTMLElement).closest(".session-row")) onSelect(item.id);
                    }}
                    onPointerDownCapture={(event) => {
                      if (event.button === 0 && (event.target as HTMLElement).closest(".session-row")) onSelect(item.id);
                    }}
                  >
                    <HoverCard>
                      <HoverCardTrigger
                        render={
                          <button
                            aria-label={`${item.status}，${item.title}`}
                            className="session-row"
                            type="button"
                          />
                        }
                      >
                        <span className={cn("session-status", toneClass[item.tone])} title={item.status}><i aria-hidden="true" /><span className="sr-only">{item.status}</span></span>
                        <span className="truncate">{item.title}</span>
                      </HoverCardTrigger>
                      <HoverCardContent align="start" className="w-72" side="right" sideOffset={10}>
                        <strong className="block truncate text-sm font-medium">{item.title}</strong>
                        <div className="session-hover-meta mt-3 flex flex-col gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-2"><span className={cn("session-status", toneClass[item.tone])}><i aria-hidden="true" /></span>{item.status}</span>
                          <span className="flex items-center gap-2"><Folder aria-hidden="true" />{item.project}</span>
                          <span className="flex items-center gap-2"><Clock3 aria-hidden="true" />{item.updatedAt}</span>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button aria-label={`更多操作：${item.title}`} className="session-more" size="icon-sm" variant="ghost" />}><MoreHorizontal /></DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-36" side="right">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => beginRename(item)}><Pencil />重命名</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => onArchive(item.id)}><Archive />归档</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </nav>

        <div className="mt-2 flex items-center gap-2 border-t px-2 pt-3">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">U</span>
          <span className="min-w-0 flex-1"><strong className="block truncate text-sm font-medium">hpcuser</strong><small className="block text-xs text-muted-foreground">普通用户</small></span>
          <Button aria-label="用户菜单" size="icon-sm" variant="ghost"><MoreHorizontal /></Button>
        </div>
      </aside>

      <Dialog onOpenChange={(open) => { if (!open) setRenameTarget(null); }} open={Boolean(renameTarget)}>
        <DialogContent>
          <form onSubmit={submitRename}>
            <DialogHeader>
              <DialogTitle>重命名 Session</DialogTitle>
              <DialogDescription>修改后会立即更新左侧列表中的标题。</DialogDescription>
            </DialogHeader>
            <Input autoFocus className="my-4" onChange={(event) => setRenameValue(event.target.value)} value={renameValue} />
            <DialogFooter>
              <Button onClick={() => setRenameTarget(null)} type="button" variant="outline">取消</Button>
              <Button disabled={!renameValue.trim()} type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
