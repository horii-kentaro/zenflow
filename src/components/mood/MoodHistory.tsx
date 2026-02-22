"use client";

import { useEffect, useState } from "react";
import { MoodEntryData } from "@/types";
import { getMoodEmoji, formatDate } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function MoodHistory() {
  const [entries, setEntries] = useState<MoodEntryData[]>([]);

  useEffect(() => {
    fetch("/api/mood?days=30")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setEntries(d.data);
      })
      .catch(console.error);
  }, []);

  const chartData = entries.map((e) => ({
    date: formatDate(e.date).slice(5),
    score: e.score,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">気分の推移</h3>
        <div className="h-48">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 6]} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4", fontSize: 12 }}
                  formatter={(value) => [`${getMoodEmoji(value as number)} (${value}/5)`, "気分"]}
                />
                <Area type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} fill="url(#moodGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-neutral-400">
              データがまだありません
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">記録一覧</h3>
        {entries.length > 0 ? (
          <div className="space-y-2">
            {entries.slice().reverse().map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-neutral-100 last:border-0">
                <span className="text-xl">{getMoodEmoji(entry.score)}</span>
                <div className="flex-1">
                  <span className="text-sm text-neutral-700">{formatDate(entry.date)}</span>
                  {entry.note && <p className="text-xs text-neutral-500 mt-0.5">{entry.note}</p>}
                </div>
                <span className="text-sm font-medium text-neutral-500">{entry.score}/5</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-400">気分を記録するとここに表示されます</p>
        )}
      </div>
    </div>
  );
}
