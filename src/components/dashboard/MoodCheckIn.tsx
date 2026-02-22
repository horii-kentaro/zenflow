"use client";

import { useState } from "react";
import { MOOD_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MoodScore } from "@/types";
import { useAppStore } from "@/stores/app-store";

export function MoodCheckIn() {
  const { todayMood, setTodayMood } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [selectedScore, setSelectedScore] = useState<MoodScore | null>(
    todayMood ? (todayMood.score as MoodScore) : null
  );

  const handleSelect = (score: MoodScore) => {
    setSelectedScore(score);
    setShowNote(true);
  };

  const handleSubmit = async () => {
    if (!selectedScore) return;
    setLoading(true);
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: selectedScore, note: note || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setTodayMood(data.data);
        setShowNote(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (todayMood) {
    const mood = MOOD_OPTIONS.find((m) => m.score === todayMood.score);
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{mood?.emoji}</span>
          <div>
            <p className="text-sm font-medium text-neutral-900">今日の気分: {mood?.labelJa}</p>
            {todayMood.note && <p className="text-sm text-neutral-500 mt-0.5">{todayMood.note}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
      <p className="text-sm font-medium text-neutral-700 mb-4">今日の気分はどうですか？</p>
      <div className="grid grid-cols-5 gap-3" role="group" aria-label="気分を選択">
        {MOOD_OPTIONS.map((mood) => (
          <button
            key={mood.score}
            onClick={() => handleSelect(mood.score)}
            aria-pressed={selectedScore === mood.score}
            aria-label={mood.labelJa}
            className={cn(
              "flex flex-col items-center gap-1 py-3 rounded-lg transition-all text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
              selectedScore === mood.score
                ? "bg-primary-50 border-2 border-primary-400 scale-105 shadow-sm"
                : "bg-neutral-50 border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50"
            )}
          >
            <span className="text-2xl" aria-hidden="true">{mood.emoji}</span>
            <span className="text-xs text-neutral-600">{mood.labelJa}</span>
          </button>
        ))}
      </div>
      {showNote && (
        <div className="mt-4 space-y-3 animate-fade-in">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="一言メモ（任意）"
            className="w-full h-20 px-3 py-2 rounded-lg border border-neutral-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-10 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? "記録中..." : "記録する"}
          </button>
        </div>
      )}
    </div>
  );
}
