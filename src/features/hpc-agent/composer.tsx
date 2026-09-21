"use client";

import {
  PromptInput,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
  usePromptInputAttachments,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input";
import { Check, FileUp, FolderUp, Paperclip, ShieldCheck } from "lucide-react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import { useRef, useState } from "react";

function AttachmentMenu() {
  const attachments = usePromptInputAttachments();
  const folderInputRef = useRef<HTMLInputElement>(null);

  function addFolder(event: ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.files?.length) {
      attachments.add(event.currentTarget.files);
    }
    event.currentTarget.value = "";
  }

  return (
    <>
      <input
        {...({ webkitdirectory: "" } as InputHTMLAttributes<HTMLInputElement>)}
        className="hidden"
        multiple
        onChange={addFolder}
        ref={folderInputRef}
        type="file"
      />
      <PromptInputActionMenu>
        <PromptInputActionMenuTrigger aria-label="添加附件" title="添加附件">
          <Paperclip />
        </PromptInputActionMenuTrigger>
        <PromptInputActionMenuContent>
          <PromptInputActionMenuItem onClick={attachments.openFileDialog}>
            <FileUp />
            <span>上传文件</span>
          </PromptInputActionMenuItem>
          <PromptInputActionMenuItem onClick={() => folderInputRef.current?.click()}>
            <FolderUp />
            <span>上传文件夹</span>
          </PromptInputActionMenuItem>
        </PromptInputActionMenuContent>
      </PromptInputActionMenu>
    </>
  );
}

function ReviewMenu({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const levels = ["自动", "关键步骤确认", "每步确认"];

  return (
    <PromptInputActionMenu>
      <PromptInputActionMenuTrigger className="gap-1" aria-label={`执行审查：${value}`} title={`执行审查：${value}`}>
        <ShieldCheck data-icon="inline-start" />
        <span>{value}</span>
      </PromptInputActionMenuTrigger>
      <PromptInputActionMenuContent>
        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">执行审查</div>
        {levels.map((level) => (
          <PromptInputActionMenuItem key={level} onClick={() => onChange(level)}>
            <span>{level}</span>
            {value === level ? <Check aria-hidden="true" /> : null}
          </PromptInputActionMenuItem>
        ))}
      </PromptInputActionMenuContent>
    </PromptInputActionMenu>
  );
}

export function Composer({
  placeholder,
  submitted,
  onSubmit,
  taskControl,
}: {
  placeholder: string;
  submitted: string;
  onSubmit: (message: PromptInputMessage) => void;
  taskControl?: ReactNode;
}) {
  const controller = usePromptInputController();
  const [reviewLevel, setReviewLevel] = useState("关键步骤确认");

  return (
    <div className="composer-shell">
      {submitted ? (
        <div className="mx-auto mb-2 flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
          <span className="size-1.5 rounded-full bg-status-running" />
          已进入新一轮：{submitted}
        </div>
      ) : null}
      <div className={taskControl ? "composer-control-stack has-task-dock" : "composer-control-stack"}>
        {taskControl}
        <PromptInput className="composer-input mx-auto w-full rounded-xl border bg-background shadow-lg shadow-foreground/5" multiple onSubmit={onSubmit}>
          <PromptInputBody>
            <PromptInputTextarea className="min-h-16 text-sm" placeholder={placeholder} />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <AttachmentMenu />
              <ReviewMenu onChange={setReviewLevel} value={reviewLevel} />
            </PromptInputTools>
            <PromptInputSubmit disabled={!controller.textInput.value.trim() && controller.attachments.files.length === 0} />
          </PromptInputFooter>
        </PromptInput>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">AI 可能会出错。执行操作前请检查关键信息。</p>
    </div>
  );
}
