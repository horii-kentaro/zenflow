"use client";

import dynamic from "next/dynamic";
import { MoodScore } from "@/types";
import { MoodSelector } from "@/components/mood/MoodSelector";
import { MoodInsightCard } from "@/components/mood/InsightCard";
import { WeeklySummary } from "@/components/mood/WeeklySummary";
import { useAppStore } from "@/stores/app-store";
import { useState } from "react";

const MoodHistory = dynamic(
  () => import("@/components/mood/MoodHistory").then((m) => m.MoodHistory),
  { loading: () => <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" /> }
);

const MoodCalendar = dynamic(
  () => import("@/components/mood/MoodCalendar").then((m) => m.MoodCalendar),
  { loading: () => <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" /> }
);

export default function MoodPage() {
  const { todayMood, setTodayMood, plan } = useAppStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const handleSubmit = async (score: MoodScore, note?: string, context?: string) => {
    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, note, context }),
    });
    if (res.ok) {
      const data = await res.json();
      setTodayMood(data.data);
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">気分トラッキング</h1>

      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          {todayMood ? "今日の気分（記録済み）" : "今日の気分を記録"}
        </h2>
        <MoodSelector
          onSubmit={handleSubmit}
          initialScore={todayMood?.score}
        />
      </div>

      <WeeklySummary key={`summary-${refreshKey}`} />

      <MoodInsightCard />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">気分の履歴</h2>
        {plan === "premium" && (
          <div className="flex bg-neutral-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "list" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              リスト
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "calendar" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              カレンダー
            </button>
          </div>
        )}
      </div>

      {viewMode === "list" ? (
        <MoodHistory key={refreshKey} />
      ) : (
        <MoodCalendar key={`cal-${refreshKey}`} />
      )}
    </div>
  );
}
