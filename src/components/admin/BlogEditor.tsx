"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getApiBaseUrl, getAuthToken } from "@/lib/api/client";
import { filesApi } from "@/lib/api/files";
import { isMockMode } from "@/lib/config/env";
import { cn } from "@/lib/utils";
import "jodit/es2021/jodit.min.css";

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

type JoditEditorInstance = {
  value: string;
  destruct: () => void;
  events: {
    on: (event: string, handler: (...args: unknown[]) => void) => void;
  };
};

export function BlogEditor({
  value,
  onChange,
  className,
  placeholder = "Write your post…",
}: BlogEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<JoditEditorInstance | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const [ready, setReady] = useState(false);

  onChangeRef.current = onChange;

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder,
      height: 360,
      toolbarAdaptive: false,
      buttons: [
        "source",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "image",
        "video",
        "link",
        "table",
        "|",
        "align",
        "undo",
        "redo",
        "hr",
        "eraser",
        "fullsize",
      ],
      uploader: {
        insertImageAsBase64URI: isMockMode(),
        url: isMockMode() ? undefined : `${getApiBaseUrl()}/files/upload/blog-media`,
        filesVariableName: () => "file",
        format: "json",
        headers: () => {
          const token = getAuthToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        isSuccess: (resp: { url?: string }) => Boolean(resp?.url),
        process: (resp: { url?: string }) => ({
          files: resp?.url ? [resp.url] : [],
          path: "",
          baseurl: "",
        }),
        error: (e: Error) => e?.message ?? "Upload failed",
      },
      events: isMockMode()
        ? {
            beforeUpload: async (files: File[]) => {
              const uploaded = await Promise.all(
                files.map((file) => filesApi.uploadBlogMedia(file))
              );
              return {
                files: uploaded.map((item) => item.url),
                path: "",
                baseurl: "",
              };
            },
          }
        : undefined,
      video: {
        defaultWidth: 560,
        defaultHeight: 315,
      },
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_clear_html" as const,
    }),
    [placeholder]
  );

  useEffect(() => {
    let cancelled = false;
    const textarea = textareaRef.current;
    if (!textarea) return;

    void (async () => {
      const mod = await import("jodit/es2021/jodit");
      if (cancelled || !textareaRef.current) return;

      const Jodit = mod.default ?? mod.Jodit;
      const editor = Jodit.make(textareaRef.current, config);
      editor.value = initialValueRef.current;
      editor.events.on("change", (newValue: unknown) => {
        if (typeof newValue === "string") {
          onChangeRef.current(newValue);
        }
      });

      editorRef.current = editor;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      setReady(false);
      editorRef.current?.destruct();
      editorRef.current = null;
    };
  }, [config]);

  useEffect(() => {
    initialValueRef.current = value;
    const editor = editorRef.current;
    if (!editor || !ready) return;
    if (editor.value !== value) {
      editor.value = value;
    }
  }, [value, ready]);

  return (
    <div
      className={cn(
        "blog-editor overflow-hidden rounded-xl border border-border/60",
        !ready && "min-h-[360px] animate-pulse bg-muted/30",
        className
      )}
    >
      <textarea ref={textareaRef} defaultValue={value} className={cn(!ready && "opacity-0")} />
    </div>
  );
}
