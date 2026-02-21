"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";

export function TodayRecommendation() {
  return (
    <Link href="/selfcare">
      <Card hover className="flex items-center gap-4">
        <span className="text-3xl">🧘</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900">今日のおすすめ: 5分間の呼吸瞑想</p>
          <p className="text-xs text-neutral-500 mt-0.5">リラックスして集中力を高めましょう</p>
        </div>
        <svg className="w-5 h-5 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </Card>
    </Link>
  );
}
