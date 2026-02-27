"use client";

import { useEffect, useState } from "react";
import { MoodEntryData } from "@/types";
import { formatDate } from "@/lib/utils";
import { MOOD_OPTIONS } from "@/lib/constants";

interface WeekData {
  avg: number;
  bestDay: string | null;
  recordedDays: number;
  prevAvg: number | null;
}

export function WeeklySummary() {
  const [data, setData] = useState<WeekData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mood?days=14")
      .then((r) => r.json())
      .then((d) => {
        const entries: MoodEntryData[] = d.data || [];
        const now = new Date();
        const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const thisWeek = entries.filter((e) => {
          const d = new Date(e.date);
          return d >= weekAgo && d <= today;
        });
        const lastWeek = entries.filter((e) => {
          const d = new Date(e.date);
          return d >= twoWeeksAgo && d < weekAgo;
        });

        const avg = thisWeek.length > 0
          ? thisWeek.reduce((sum, e) => sum + e.score, 0) / thisWeek.length
          : 0;
        const prevAvg = lastWeek.length > 0
          ? lastWeek.reduce((sum, e) => sum + e.score, 0) / lastWeek.length
          : null;

        const bestEntry = thisWeek.length > 0
          ? thisWeek.reduce((best, e) => (e.score > best.score ? e : best))
          : null;

        setData({
          avg: Math.round(avg * 10) / 10,
          bestDay: bestEntry ? formatDate(bestEntry.date) : null,
          recordedDays: thisWeek.length,
          prevAvg: prevAvg !== null ? Math.round(prevAvg * 10) / 10 : null,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-24 bg-neutral-100 rounded-xl animate-pulse" />;
  }

  if (!data || data.recordedDays === 0) return null;

  const trend = data.prevAvg !== null
    ? data.avg > data.prevAvg ? "up" : data.avg < data.prevAvg ? "down" : "flat"
    : null;

  const avgMood = MOOD_OPTIONS.find((m) => m.score === Math.round(data.avg));

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900 mb-3">今週のまとめ</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-900">{data.avg}</p>
          <p className="text-xs text-neutral-500 mt-1">
            平均スコア {avgMood && <span>{avgMood.emoji}</span>}
          </p>
          {trend && (
            <p className={`text-xs mt-0.5 font-medium ${
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-neutral-400"
            }`}>
              {trend === "up" ? "↑ 先週より上昇" : trend === "down" ? "↓ 先週より低下" : "→ 先週と同じ"}
            </p>
          )}
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-900">{data.recordedDays}</p>
          <p className="text-xs text-neutral-500 mt-1">記録日数 / 7日</p>
        </div>
        <div className="text-center">
          {data.bestDay ? (
            <>
              <p className="text-sm font-bold text-neutral-900 mt-1">{data.bestDay}</p>
              <p className="text-xs text-neutral-500 mt-1">最も良かった日</p>
            </>
          ) : (
            <p className="text-xs text-neutral-400">-</p>
          )}
        </div>
      </div>
    </div>
  );
}
