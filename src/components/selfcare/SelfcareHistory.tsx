"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { formatDate } from "@/lib/utils";

interface HistoryEntry {
  id: string;
  routineType: string;
  routineTitle: string;
  durationSec: number;
  date: string;
  createdAt: string;
}

const TYPE_EMOJI: Record<string, string> = {
  breathing: "🌬️",
  stretch: "🧘",
  mindfulness: "🧠",
  bodyscan: "💆",
};

export function SelfcareHistory() {
  const { plan } = useAppStore();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const days = plan === "premium" ? 30 : 7;

  useEffect(() => {
    fetch(`/api/selfcare/history?days=${days}`)
      .then((r) => r.json())
      .then((d) => setEntries(d.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-400 text-sm">まだ完了したルーティンがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-neutral-400">直近{days}日間の記録</p>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-3 bg-white rounded-xl border border-neutral-200 p-4 shadow-sm"
        >
          <span className="text-xl">{TYPE_EMOJI[entry.routineType] || "✨"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">{entry.routineTitle}</p>
            <p className="text-xs text-neutral-400">{formatDate(entry.date)}</p>
          </div>
          <span className="text-xs text-neutral-500 shrink-0">
            {Math.floor(entry.durationSec / 60)}分
          </span>
        </div>
      ))}
    </div>
  );
}
