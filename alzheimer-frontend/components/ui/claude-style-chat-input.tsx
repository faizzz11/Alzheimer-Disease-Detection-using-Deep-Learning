"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Plus,
  ChevronDown,
  ArrowUp,
  X,
  FileText,
  Loader2,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* --- ICONS --- */
export const Icons = {
  Logo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="presentation" {...props}>
      <defs>
        <ellipse id="petal-pair" cx="100" cy="100" rx="90" ry="22" />
      </defs>
      <g fill="#D46B4F" fillRule="evenodd">
        <use href="#petal-pair" transform="rotate(0 100 100)" />
        <use href="#petal-pair" transform="rotate(45 100 100)" />
        <use href="#petal-pair" transform="rotate(90 100 100)" />
        <use href="#petal-pair" transform="rotate(135 100 100)" />
      </g>
    </svg>
  ),
  Plus,
  Thinking: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M10.3857 2.50977C14.3486 2.71054 17.5 5.98724 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 9.72386 2.72386 9.5 3 9.5C3.27614 9.5 3.5 9.72386 3.5 10C3.5 13.5899 6.41015 16.5 10 16.5C13.5899 16.5 16.5 13.5899 16.5 10C16.5 6.5225 13.7691 3.68312 10.335 3.50879L10 3.5L9.89941 3.49023C9.67145 3.44371 9.5 3.24171 9.5 3C9.5 2.72386 9.72386 2.5 10 2.5L10.3857 2.50977ZM10 5.5C10.2761 5.5 10.5 5.72386 10.5 6V9.69043L13.2236 11.0527C13.4706 11.1762 13.5708 11.4766 13.4473 11.7236C13.3392 11.9397 13.0957 12.0435 12.8711 11.9834L12.7764 11.9473L9.77637 10.4473C9.60698 10.3626 9.5 10.1894 9.5 10V6C9.5 5.72386 9.72386 5.5 10 5.5ZM3.66211 6.94141C4.0273 6.94159 4.32303 7.23735 4.32324 7.60254C4.32324 7.96791 4.02743 8.26446 3.66211 8.26465C3.29663 8.26465 3 7.96802 3 7.60254C3.00021 7.23723 3.29676 6.94141 3.66211 6.94141ZM4.95605 4.29395C5.32146 4.29404 5.61719 4.59063 5.61719 4.95605C5.6171 5.3214 5.3214 5.61709 4.95605 5.61719C4.59063 5.61719 4.29403 5.32146 4.29395 4.95605C4.29395 4.59057 4.59057 4.29395 4.95605 4.29395ZM7.60254 3C7.96802 3 8.26465 3.29663 8.26465 3.66211C8.26446 4.02743 7.96791 4.32324 7.60254 4.32324C7.23736 4.32302 6.94159 4.0273 6.94141 3.66211C6.94141 3.29676 7.23724 3.00022 7.60254 3Z" />
    </svg>
  ),
  SelectArrow: ChevronDown,
  ArrowUp,
  X,
  FileText,
  Loader2,
  Archive,
  Clock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10.3857 2.50977C14.3486 2.71054 17.5 5.98724 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 9.72386 2.72386 9.5 3 9.5C3.27614 9.5 3.5 9.72386 3.5 10C3.5 13.5899 6.41015 16.5 10 16.5C13.5899 16.5 16.5 13.5899 16.5 10C16.5 6.5225 13.7691 3.68312 10.335 3.50879L10 3.5L9.89941 3.49023C9.67145 3.44371 9.5 3.24171 9.5 3C9.5 2.72386 9.72386 2.5 10 2.5L10.3857 2.50977ZM10 5.5C10.2761 5.5 10.5 5.72386 10.5 6V9.69043L13.2236 11.0527C13.4706 11.1762 13.5708 11.4766 13.4473 11.7236C13.3392 11.9397 13.0957 12.0435 12.8711 11.9834L12.7764 11.9473L9.77637 10.4473C9.60698 10.3626 9.5 10.1894 9.5 10V6C9.5 5.72386 9.72386 5.5 10 5.5ZM3.66211 6.94141C4.0273 6.94159 4.32303 7.23735 4.32324 7.60254C4.32324 7.96791 4.02743 8.26446 3.66211 8.26465C3.29663 8.26465 3 7.96802 3 7.60254C3.00021 7.23723 3.29676 6.94141 3.66211 6.94141ZM4.95605 4.29395C5.32146 4.29404 5.61719 4.59063 5.61719 4.95605C5.6171 5.3214 5.3214 5.61709 4.95605 5.61719C4.59063 5.61719 4.29403 5.32146 4.29395 4.95605C4.29395 4.59057 4.59057 4.29395 4.95605 4.29395ZM7.60254 3C7.96802 3 8.26465 3.29663 8.26465 3.66211C8.26446 4.02743 7.96791 4.32324 7.60254 4.32324C7.23736 4.32302 6.94159 4.0273 6.94141 3.66211C6.94141 3.29676 7.23724 3.00022 7.60254 3Z" />
    </svg>
  ),
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

export interface AttachedFile {
  id: string;
  file: File;
  type: string;
  preview: string | null;
  uploadStatus: string;
  content?: string;
}

export interface PastedSnippet {
  id: string;
  content: string;
  timestamp: Date;
}

export type ChatComposerMode = "chat" | "do";

export interface ClaudeChatSendPayload {
  message: string;
  files: AttachedFile[];
  pastedSnippets: PastedSnippet[];
  isThinkingEnabled: boolean;
  /** Chat = conversational; Do = step-by-step / actionable plans (Orbit-style). */
  chatMode: ChatComposerMode;
}

/** Soft pill chips below the composer (icon + label). */
export interface ChatQuickChip {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** Merged into the chip button (e.g. highlight when PDF attached). */
  className?: string;
}

/** Orbit-style suggestion row: emoji tile + title + subtitle; click fills composer (does not auto-send). */
export interface ChatIdeaPreset {
  emoji: string;
  thumbBg: string;
  /** Optional `/public` image for suggestion cards (e.g. Orbit `feature-*.png` under `/orbit-icons/`). */
  thumbSrc?: string;
  title: string;
  subtitle: string;
  prompt: string;
}

interface FilePreviewCardProps {
  file: AttachedFile;
  onRemove: (id: string) => void;
}

const FilePreviewCard: React.FC<FilePreviewCardProps> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith("image/") && file.preview;
  const ext = file.file.name.includes(".") ? file.file.name.split(".").pop() : "";

  return (
    <div
      className={cn(
        "group relative shrink-0 animate-fade-in overflow-hidden rounded-xl border border-neutral-200/60 bg-neutral-50/90 transition-colors hover:border-neutral-300/80",
        isImage ? "h-20 w-20" : "inline-flex h-8 max-w-[min(16rem,72vw)] items-stretch",
      )}
    >
      {isImage ? (
        <div className="relative h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={file.preview!} alt={file.file.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/0" />
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1">
          <Icons.FileText className="size-3.5 shrink-0 text-neutral-400" strokeWidth={1.75} aria-hidden />
          <div className="min-w-0 flex-1 leading-none">
            <p className="truncate text-[11px] font-medium tracking-tight text-neutral-800" title={file.file.name}>
              {file.file.name}
            </p>
            <p className="mt-0.5 text-[10px] tabular-nums text-neutral-400">
              {ext ? `${ext.toUpperCase()} · ` : ""}
              {formatFileSize(file.file.size)}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onRemove(file.id)}
        className={cn(
          "absolute flex items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-200/80 hover:text-neutral-700",
          isImage
            ? "top-1 right-1 bg-black/40 p-1 text-white opacity-0 hover:bg-black/55 group-hover:opacity-100"
            : "inset-y-0 right-1 my-auto size-6 opacity-70 group-hover:opacity-100",
        )}
        aria-label="Remove file"
      >
        <Icons.X className="size-3" />
      </button>

      {file.uploadStatus === "uploading" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <Icons.Loader2 className="size-4 animate-spin text-neutral-500" />
        </div>
      ) : null}
    </div>
  );
};

interface PastedContentCardProps {
  snippet: PastedSnippet;
  onRemove: (id: string) => void;
}

const PastedContentCard: React.FC<PastedContentCardProps> = ({ snippet, onRemove }) => {
  return (
    <div className="group relative flex h-28 w-28 shrink-0 animate-fade-in flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-[#30302E] dark:bg-[#20201F]">
      <div className="w-full overflow-hidden">
        <p className="line-clamp-4 select-none font-mono text-[10px] leading-[1.4] wrap-break-word whitespace-pre-wrap text-[#9CA3AF]">
          {snippet.content}
        </p>
      </div>

      <div className="mt-2 flex w-full items-center justify-between">
        <div className="inline-flex items-center justify-center rounded border border-[#E5E5E5] bg-white px-1.5 py-[2px] dark:border-[#404040] dark:bg-transparent">
          <span className="font-sans text-[9px] font-bold tracking-wider text-[#6B7280] uppercase dark:text-[#9CA3AF]">
            PASTED
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(snippet.id)}
        className="absolute top-2 right-2 rounded-full border border-[#E5E5E5] bg-white p-[3px] text-[#9CA3AF] shadow-sm opacity-0 transition-colors hover:text-[#6B7280] group-hover:opacity-100 dark:border-[#404040] dark:bg-[#30302E] dark:hover:text-white"
      >
        <Icons.X className="h-2 w-2" />
      </button>
    </div>
  );
};

export interface ClaudeChatInputProps {
  onSendMessage: (data: ClaudeChatSendPayload) => void;
  disabled?: boolean;
  className?: string;
  /** Optional Orbit-style “Ideas” list above the composer; click prefills the textarea. */
  ideaPresets?: ChatIdeaPreset[];
  ideasLabel?: string;
  /** Renders inside the composer card above the textarea (e.g. follow-up chips). */
  composerSlot?: React.ReactNode;
  /** Pill chips below the composer card (under the input + toolbar). */
  quickChips?: ChatQuickChip[];
  /** Optional chip inside the bottom toolbar, after Chat/Do and before Send (e.g. Quick call). */
  toolbarEndChip?: ChatQuickChip;
  /** Fires when attachments change (for Podcast chip highlight, etc.). */
  onAttachmentsChange?: (files: AttachedFile[]) => void;
}

export interface ClaudeChatInputHandle {
  applyIdeaPreset: (prompt: string) => void;
  getAttachedFiles: () => AttachedFile[];
  clearAttachments: () => void;
  getDraftText: () => string;
  clearDraft: () => void;
}

export const ClaudeChatInput = forwardRef<ClaudeChatInputHandle, ClaudeChatInputProps>(function ClaudeChatInput(
  {
    onSendMessage,
    disabled,
    className,
    ideaPresets,
    ideasLabel = "Ideas",
    composerSlot,
    quickChips,
    toolbarEndChip,
    onAttachmentsChange,
  },
  ref,
) {
  const [message, setMessage] = useState("");
  const [ideasOpen, setIdeasOpen] = useState(true);
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [pastedSnippets, setPastedSnippets] = useState<PastedSnippet[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(false);
  const [chatMode, setChatMode] = useState<ChatComposerMode>("chat");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onAttachmentsChange?.(files);
  }, [files, onAttachmentsChange]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 384)}px`;
    }
  }, [message]);

  const handleFiles = useCallback((newFilesList: FileList | File[]) => {
    const newFiles: AttachedFile[] = Array.from(newFilesList).map((file) => {
      const isImage =
        file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
      return {
        id: Math.random().toString(36).slice(2, 11),
        file,
        type: isImage ? "image/unknown" : file.type || "application/octet-stream",
        preview: isImage ? URL.createObjectURL(file) : null,
        uploadStatus: "pending",
      };
    });

    setFiles((prev) => [...prev, ...newFiles]);

    setMessage((prev) => {
      if (prev) return prev;
      if (newFiles.length === 1) {
        const f = newFiles[0]!;
        if (f.type.startsWith("image/")) return "Analyzed image…";
        return "Analyzed document…";
      }
      return `Analyzed ${newFiles.length} files…`;
    });

    newFiles.forEach((f) => {
      setTimeout(() => {
        setFiles((prev) => prev.map((p) => (p.id === f.id ? { ...p, uploadStatus: "complete" } : p)));
      }, 800 + Math.random() * 1000);
    });
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const pastedFileList: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i]!.kind === "file") {
        const file = items[i]!.getAsFile();
        if (file) pastedFileList.push(file);
      }
    }

    if (pastedFileList.length > 0) {
      e.preventDefault();
      handleFiles(pastedFileList);
      return;
    }

    const text = e.clipboardData.getData("text");
    if (text.length > 300) {
      e.preventDefault();
      const snippet: PastedSnippet = {
        id: Math.random().toString(36).slice(2, 11),
        content: text,
        timestamp: new Date(),
      };
      setPastedSnippets((prev) => [...prev, snippet]);

      if (!message) {
        setMessage("Analyzed pasted text…");
      }
    }
  };

  const handleSend = () => {
    if (disabled) return;
    if (!message.trim() && files.length === 0 && pastedSnippets.length === 0) return;
    onSendMessage({
      message,
      files,
      pastedSnippets,
      isThinkingEnabled,
      chatMode,
    });
    setMessage("");
    setFiles([]);
    setPastedSnippets([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = Boolean(message.trim() || files.length > 0 || pastedSnippets.length > 0);

  const applyIdeaPreset = useCallback(
    (prompt: string) => {
      if (disabled) return;
      setMessage(prompt);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 384)}px`;
      });
    },
    [disabled],
  );

  const getAttachedFiles = useCallback(() => files, [files]);
  const clearAttachments = useCallback(() => {
    setFiles([]);
    setPastedSnippets([]);
  }, []);

  const getDraftText = useCallback(() => message.trim(), [message]);

  const clearDraft = useCallback(() => {
    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      applyIdeaPreset,
      getAttachedFiles,
      clearAttachments,
      getDraftText,
      clearDraft,
    }),
    [applyIdeaPreset, getAttachedFiles, clearAttachments, getDraftText, clearDraft],
  );

  return (
    <div
      className={cn("relative mx-auto w-full max-w-2xl font-sans transition-all duration-300", className)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {ideaPresets && ideaPresets.length > 0 ? (
        <div className="mb-3 w-full">
          <button
            type="button"
            onClick={() => setIdeasOpen((o) => !o)}
                className="mb-1.5 flex w-full cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-left text-neutral-700 transition-colors hover:text-neutral-900"
            aria-expanded={ideasOpen}
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px]"
              style={{ background: "linear-gradient(135deg, #EE602C22, #EE602C11)" }}
              aria-hidden
            >
              💡
            </span>
            <span className="flex-1 text-[12.5px] font-medium">{ideasLabel}</span>
            <Icons.SelectArrow
              className={cn("h-3.5 w-3.5 shrink-0 opacity-60 transition-transform", ideasOpen ? "" : "-rotate-90")}
            />
          </button>
          <div
            className={cn(
              "flex flex-col gap-1.5 overflow-hidden transition-[max-height,opacity] duration-200 ease-out",
              ideasOpen ? "max-h-[min(280px,42vh)] opacity-100" : "pointer-events-none max-h-0 opacity-0",
            )}
            role="region"
            aria-label="Suggested prompts"
          >
            {ideaPresets.map((idea, idx) => (
              <button
                key={`${idea.title}-${idx}`}
                type="button"
                onClick={() => applyIdeaPreset(idea.prompt)}
                disabled={disabled}
                className="flex w-full items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-left shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:shadow disabled:pointer-events-none disabled:opacity-50"
              >
                <span
                  className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg text-base"
                  style={{ background: idea.thumbBg }}
                  aria-hidden
                >
                  {idea.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-neutral-900">{idea.title}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-neutral-500">{idea.subtitle}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "relative z-10 box-content! flex cursor-text flex-col items-stretch rounded-[1.25rem] border border-neutral-200/90 bg-white/95 font-sans antialiased shadow-[0_4px_24px_-4px_rgba(15,23,42,0.07)] backdrop-blur-[1px] transition-all duration-200 hover:border-neutral-300/90 hover:shadow-[0_8px_32px_-6px_rgba(15,23,42,0.1)] focus-within:border-[#EE602C]/35 focus-within:shadow-[0_0_0_1px_rgba(238,96,44,0.15),0_8px_32px_-8px_rgba(238,96,44,0.08)]",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <div className="flex flex-col gap-1.5 px-3.5 pt-3.5 pb-2.5">
          {(files.length > 0 || pastedSnippets.length > 0) && (
            <div className="custom-scrollbar flex gap-3 overflow-x-auto px-1 pb-2">
              {pastedSnippets.map((s) => (
                <PastedContentCard
                  key={s.id}
                  snippet={s}
                  onRemove={(id) => setPastedSnippets((prev) => prev.filter((c) => c.id !== id))}
                />
              ))}
              {files.map((file) => (
                <FilePreviewCard
                  key={file.id}
                  file={file}
                  onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
                />
              ))}
            </div>
          )}

          {composerSlot ? (
            <div className="mb-2 border-b border-neutral-100/90 pb-2.5">{composerSlot}</div>
          ) : null}

          <div className="relative mb-1">
            <div className="custom-scrollbar max-h-96 min-h-10 w-full overflow-y-auto pl-0.5 font-sans wrap-break-word transition-opacity duration-200">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                placeholder={
                  chatMode === "do"
                    ? "What should we tackle step by step?"
                    : "How can I help you today?"
                }
                disabled={disabled}
                className="block w-full resize-none overflow-hidden border-0 bg-transparent py-0.5 text-[15px] leading-[1.55] font-normal antialiased text-neutral-800 placeholder:text-neutral-400/90 focus:outline-none"
                rows={1}
                style={{ minHeight: "1.5em" }}
              />
            </div>
          </div>

          <div className="flex w-full items-center gap-1 border-t border-neutral-100 pt-2">
            <div className="relative flex min-w-0 flex-1 shrink items-center gap-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-800 active:scale-[0.97]"
                aria-label="Attach files"
              >
                <Icons.Plus className="h-[18px] w-[18px]" />
              </button>

              <div className="relative flex min-w-8 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsThinkingEnabled(!isThinkingEnabled)}
                  className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 active:scale-[0.97]",
                    isThinkingEnabled
                      ? "bg-[#EE602C]/10 text-[#EE602C]"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800",
                  )}
                  aria-pressed={isThinkingEnabled}
                  aria-label="Extended thinking"
                >
                  <Icons.Thinking className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>

            <div className="flex min-w-0 flex-row items-center gap-1">
              <div
                className="inline-flex shrink-0 rounded-full bg-neutral-100/95 p-px ring-1 ring-black/5"
                role="group"
                aria-label="Chat or Do mode"
              >
                <button
                  type="button"
                  onClick={() => setChatMode("chat")}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium tracking-tight transition-all",
                    chatMode === "chat"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700",
                  )}
                  aria-pressed={chatMode === "chat"}
                >
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setChatMode("do")}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium tracking-tight transition-all",
                    chatMode === "do"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700",
                  )}
                  aria-pressed={chatMode === "do"}
                >
                  Do
                </button>
              </div>

              {toolbarEndChip ? (
                <button
                  type="button"
                  onClick={toolbarEndChip.onClick}
                  disabled={disabled || toolbarEndChip.disabled}
                  className="inline-flex h-8 max-w-[min(42vw,9.5rem)] shrink-0 items-center gap-1 rounded-full border border-zinc-200/90 bg-linear-to-b from-white to-white px-2.5 text-[11px] font-medium tracking-tight text-zinc-900 shadow-[0_2px_8px_rgba(15,23,42,0.06)] ring-1 ring-white/80 transition-all hover:border-zinc-300/90 hover:shadow-[0_4px_14px_rgba(15,23,42,0.09)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 sm:max-w-none"
                  aria-label={toolbarEndChip.label}
                >
                  <span className="flex shrink-0 text-zinc-600 [&_svg]:size-3.5" aria-hidden>
                    {toolbarEndChip.icon}
                  </span>
                  <span className="truncate">{toolbarEndChip.label}</span>
                </button>
              ) : null}

              <div>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!hasContent || disabled}
                  className={cn(
                    "relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all active:scale-[0.97]",
                    hasContent && !disabled
                      ? "bg-[#EE602C] text-white shadow-[0_2px_8px_-2px_rgba(238,96,44,0.5)] hover:bg-[#d35420]"
                      : "cursor-not-allowed bg-neutral-200/70 text-neutral-400",
                  )}
                  aria-label="Send message"
                >
                  <Icons.ArrowUp className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {quickChips && quickChips.length > 0 ? (
        <div
          className="mt-2 flex w-full flex-wrap justify-center gap-1.5 pb-0"
          role="toolbar"
          aria-label="Quick actions"
        >
          {quickChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={chip.onClick}
              disabled={disabled || chip.disabled}
              className={cn(
                "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-zinc-200/80 bg-white/95 px-2.5 text-[11px] font-medium tracking-tight text-zinc-800 shadow-[0_1px_6px_rgba(15,23,42,0.05)] ring-1 ring-white/70 transition-all hover:border-zinc-300/80 hover:bg-white hover:shadow-[0_2px_10px_rgba(15,23,42,0.07)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
                chip.className,
              )}
            >
              <span className="flex shrink-0 text-zinc-500 [&_svg]:size-3" aria-hidden>
                {chip.icon}
              </span>
              {chip.label}
            </button>
          ))}
        </div>
      ) : null}

      {isDragging ? (
        <div className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EE602C] bg-neutral-50/98">
          <Icons.Archive className="mb-2 h-10 w-10 animate-bounce text-[#EE602C]" />
          <p className="font-medium text-[#EE602C]">Drop files to upload</p>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

    </div>
  );
});

ClaudeChatInput.displayName = "ClaudeChatInput";

export default ClaudeChatInput;
