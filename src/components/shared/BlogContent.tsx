"use client";

import DOMPurify from "isomorphic-dompurify";
import { isHtmlContent } from "@/lib/blog/utils";
import { cn } from "@/lib/utils";

interface BlogContentProps {
  content: string;
  className?: string;
}

function renderLegacyContent(content: string) {
  return content.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-8 text-xl font-semibold text-foreground">
          {block.replace("## ", "")}
        </h2>
      );
    }
    return (
      <p key={i} className="mt-4 leading-relaxed text-muted-foreground">
        {block}
      </p>
    );
  });
}

export function BlogContent({ content, className }: BlogContentProps) {
  if (isHtmlContent(content)) {
    const sanitized = DOMPurify.sanitize(content, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target", "rel"],
    });

    return (
      <div
        className={cn("blog-content", className)}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  return <div className={cn("blog-content", className)}>{renderLegacyContent(content)}</div>;
}
