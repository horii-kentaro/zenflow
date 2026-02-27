"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface ProgressItem {
  label: string;
  done: boolean;
  href: string;
}

export function TodayProgress() {
  const [items, setItems] = useState<ProgressItem[]>([
    { label: "気分記録", done: false, href: "/mood" },
    { label: "セルフケア", done: false, href: "/selfcare" },
    { label: "ジャーナル", done: false, href: "/journal" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = formatDate(new Date().toISOString());
    Promise.all([
      fetch("/api/mood?days=1").then((r) => r.json()),
      fetch("/api/selfcare/today-status").then((r) => r.json()),
      fetch(`/api/journal?limit=1`).then((r) => r.json()),
    ])
      .then(([moodData, selfcareData, journalData]) => {
        const hasMood = (moodData.data || []).some(
          (e: { date: string }) => formatDate(e.date) === today
        );
        const hasSelfcare = selfcareData.data?.completed === true;
        const hasJournal = (journalData.data?.journals || []).some(
          (j: { date: string }) => formatDate(j.date) === today
        );
        setItems([
          { label: "気分記録", done: hasMood, href: "/mood" },
          { label: "セルフケア", done: hasSelfcare, href: "/selfcare" },
          { label: "ジャーナル", done: hasJournal, href: "/journal" },
        ]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allDone = items.every((i) => i.done);
  const doneCount = items.filter((i) => i.done).length;

  if (loading) {
    return <div className="h-24 bg-neutral-100 rounded-xl animate-pulse" />;
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-neutral-900">
          今日のアクティビティ
        </h2>
        <span className="text-xs text-neutral-400">{doneCount}/3 完了</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                item.done
                  ? "bg-green-100 text-green-600"
                  : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {item.done ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-lg leading-none">-</span>
              )}
            </div>
            <span className={`text-xs font-medium ${item.done ? "text-green-700" : "text-neutral-500"}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
      {allDone && (
        <div className="mt-3 text-center text-sm text-green-600 font-medium animate-fade-in">
          今日もすべて完了！素晴らしいです！
        </div>
      )}
    </div>
  );
}
