"use client";

import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0 text-sm">
          🌿
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary-600 text-white rounded-br-md"
            : "bg-neutral-100 text-neutral-800 rounded-bl-md"
        )}
      >
        {content}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-neutral-400 ml-0.5 animate-pulse rounded" />
        )}
      </div>
    </div>
  );
}
