"use client";

import { useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAppStore } from "@/stores/app-store";

export function StreakCounter() {
  const { streak, setStreak } = useAppStore();

  useEffect(() => {
    fetch("/api/streak")
      .then((r) => r.json())
      .then((d) => { if (d.data) setStreak(d.data); })
      .catch(console.error);
  }, [setStreak]);

  const current = streak?.currentStreak ?? 0;
  const target = 30;
  const progress = Math.min(current / target, 1);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - progress);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ストリーク</CardTitle>
      </CardHeader>
      <div className="flex flex-col items-center">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e7e5e4" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#14b8a6" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 50 50)" className="transition-all duration-1000" />
          <text x="50" y="46" textAnchor="middle" className="text-2xl font-bold" fill="#1c1917">{current}</text>
          <text x="50" y="62" textAnchor="middle" className="text-xs" fill="#78716c">日連続</text>
        </svg>
        <p className="text-xs text-neutral-500 mt-2">目標: {target}日</p>
      </div>
    </Card>
  );
}
