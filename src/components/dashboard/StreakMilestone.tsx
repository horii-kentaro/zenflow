"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/stores/app-store";

const MILESTONES = [7, 14, 30, 60, 100];

function getMilestoneMessage(days: number): string {
  if (days >= 100) return "100日連続達成！驚異的な継続力です！";
  if (days >= 60) return "60日連続達成！素晴らしい習慣ですね！";
  if (days >= 30) return "30日連続達成！1ヶ月続けた自分を誇りに！";
  if (days >= 14) return "14日連続達成！2週間も続けていますね！";
  return "7日連続達成！1週間の習慣化おめでとう！";
}

function computeMilestone(currentStreak: number): number | null {
  if (currentStreak === 0) return null;
  const reached = MILESTONES.filter((m) => currentStreak >= m);
  if (reached.length === 0) return null;
  const highest = reached[reached.length - 1];
  if (typeof window !== "undefined" && localStorage.getItem(`streak-milestone-${highest}`)) {
    return null;
  }
  return highest;
}

export function StreakMilestone() {
  const { streak } = useAppStore();

  const milestone = useMemo(
    () => computeMilestone(streak?.currentStreak ?? 0),
    [streak?.currentStreak]
  );

  const [dismissed, setDismissed] = useState(false);

  if (!milestone || dismissed) return null;

  // Mark as shown in localStorage on first render
  if (typeof window !== "undefined") {
    localStorage.setItem(`streak-milestone-${milestone}`, "true");
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {getMilestoneMessage(milestone)}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              現在 {streak?.currentStreak}日連続
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400 hover:text-amber-600 transition-colors"
          aria-label="閉じる"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
