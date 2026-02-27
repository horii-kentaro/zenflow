"use client";

import { cn } from "@/lib/utils";

interface JournalSearchProps {
  search: string;
  onSearchChange: (v: string) => void;
  sentiment: string;
  onSentimentChange: (v: string) => void;
  favorite: boolean;
  onFavoriteChange: (v: boolean) => void;
}

const SENTIMENT_FILTERS = [
  { value: "", label: "すべて" },
  { value: "positive", label: "ポジティブ" },
  { value: "neutral", label: "ニュートラル" },
  { value: "negative", label: "ネガティブ" },
];

export function JournalSearch({
  search,
  onSearchChange,
  sentiment,
  onSentimentChange,
  favorite,
  onFavoriteChange,
}: JournalSearchProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="キーワードで検索..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {SENTIMENT_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onSentimentChange(f.value)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              sentiment === f.value
                ? "bg-primary-100 text-primary-700 border border-primary-300"
                : "bg-neutral-100 text-neutral-500 border border-transparent hover:bg-neutral-200"
            )}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => onFavoriteChange(!favorite)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1",
            favorite
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-neutral-100 text-neutral-500 border border-transparent hover:bg-neutral-200"
          )}
        >
          <svg className="w-3 h-3" fill={favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          お気に入り
        </button>
      </div>
    </div>
  );
}
