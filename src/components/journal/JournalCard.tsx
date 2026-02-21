"use client";

import Link from "next/link";
import { JournalData } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface JournalCardProps {
  journal: JournalData;
}

const sentimentVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
  positive: "success",
  neutral: "default",
  negative: "danger",
  mixed: "warning",
};

const sentimentLabel: Record<string, string> = {
  positive: "ポジティブ",
  neutral: "ニュートラル",
  negative: "ネガティブ",
  mixed: "複合的",
};

export function JournalCard({ journal }: JournalCardProps) {
  return (
    <Link href={`/journal/${journal.id}`}>
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-neutral-900 text-sm truncate">
              {journal.title || journal.date}
            </h3>
            {journal.summary && (
              <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{journal.summary}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {journal.sentiment && (
              <Badge variant={sentimentVariant[journal.sentiment] || "default"}>
                {sentimentLabel[journal.sentiment] || journal.sentiment}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
          <span>{journal.date}</span>
          {journal.messages && journal.messages.length > 0 && (
            <span>· {journal.messages.length}件のメッセージ</span>
          )}
        </div>
      </div>
    </Link>
  );
}
