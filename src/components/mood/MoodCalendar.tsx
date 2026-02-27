"use client";

import { useEffect, useState } from "react";
import { MoodEntryData, MoodScore } from "@/types";
import { MOOD_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const MOOD_COLORS: Record<number, string> = {
  1: "bg-red-400",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-green-400",
  5: "bg-emerald-500",
};

export function MoodCalendar() {
  const [entries, setEntries] = useState<MoodEntryData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    fetch("/api/mood?days=90")
      .then((r) => r.json())
      .then((d) => setEntries(d.data || []))
      .catch(console.error);
  }, []);

  const entryMap = new Map<string, MoodEntryData>();
  for (const e of entries) {
    entryMap.set(formatDate(e.date), e);
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const selectedEntry = selectedDate ? entryMap.get(selectedDate) : null;
  const selectedMood = selectedEntry
    ? MOOD_OPTIONS.find((m) => m.score === selectedEntry.score as MoodScore)
    : null;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-neutral-100 rounded" aria-label="前の月">
          <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-neutral-900">
          {year}年{month + 1}月
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-neutral-100 rounded" aria-label="次の月">
          <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <span key={d} className="text-xs text-neutral-400 font-medium py-1">{d}</span>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              if (day === null) return <div key={di} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const entry = entryMap.get(dateStr);
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={di}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative flex flex-col items-center py-1.5 rounded-md text-xs transition-colors ${
                    isSelected ? "bg-primary-50 ring-1 ring-primary-300" : "hover:bg-neutral-50"
                  }`}
                >
                  <span className="text-neutral-600">{day}</span>
                  {entry && (
                    <span className={`w-2 h-2 rounded-full mt-0.5 ${MOOD_COLORS[entry.score] || "bg-neutral-300"}`} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selectedEntry && selectedMood && (
        <div className="mt-4 pt-4 border-t border-neutral-100 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{selectedMood.emoji}</span>
            <span className="text-sm font-medium text-neutral-900">{selectedMood.labelJa}</span>
            <span className="text-xs text-neutral-400">{selectedDate}</span>
          </div>
          {selectedEntry.note && (
            <p className="text-xs text-neutral-500 mt-1">{selectedEntry.note}</p>
          )}
        </div>
      )}
    </div>
  );
}
