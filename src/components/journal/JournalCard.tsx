"use client";

import Link from "next/link";
import { JournalData } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface JournalCardProps {
  journal: JournalData;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
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

export function JournalCard({ journal, onToggleFavorite }: JournalCardProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/journal/${journal.id}`} className="flex-1 min-w-0">
          <h3 className="font-medium text-neutral-900 text-sm truncate">
            {journal.title || formatDate(journal.date)}
          </h3>
          {journal.summary && (
            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{journal.summary}</p>
          )}
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          {journal.sentiment && (
            <Badge variant={sentimentVariant[journal.sentiment] || "default"}>
              {sentimentLabel[journal.sentiment] || journal.sentiment}
            </Badge>
          )}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(journal.id, !journal.isFavorite);
              }}
              className="p-1 hover:bg-neutral-100 rounded transition-colors"
              aria-label={journal.isFavorite ? "お気に入りを解除" : "お気に入りに追加"}
            >
              <svg
                className={`w-4 h-4 ${journal.isFavorite ? "text-red-500" : "text-neutral-300"}`}
                fill={journal.isFavorite ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <Link href={`/journal/${journal.id}`}>
        <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
          <span>{formatDate(journal.date)}</span>
          {journal.messages && journal.messages.length > 0 && (
            <span>· {journal.messages.length}件のメッセージ</span>
          )}
        </div>
      </Link>
    </div>
  );
}
