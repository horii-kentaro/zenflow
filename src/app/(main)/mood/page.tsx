"use client";

import { MoodScore } from "@/types";
import { MoodSelector } from "@/components/mood/MoodSelector";
import { MoodHistory } from "@/components/mood/MoodHistory";
import { MoodInsightCard } from "@/components/mood/InsightCard";
import { useAppStore } from "@/stores/app-store";
import { useState } from "react";

export default function MoodPage() {
  const { todayMood, setTodayMood } = useAppStore();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmit = async (score: MoodScore, note?: string) => {
    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, note }),
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

      <MoodInsightCard />

      <MoodHistory key={refreshKey} />
    </div>
  );
}
