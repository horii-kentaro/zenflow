"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/app-store";
import Link from "next/link";

interface UsageData {
  selfcareRemaining: number;
  journalRemaining: number;
}

export function UsageStatus() {
  const { plan } = useAppStore();
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    if (plan === "premium") return;
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setUsage(d.data);
      })
      .catch(console.error);
  }, [plan]);

  if (plan === "premium" || !usage) return null;

  const isLow = usage.selfcareRemaining === 0 || usage.journalRemaining === 0;

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${
      isLow ? "bg-amber-50 border-amber-200" : "bg-white border-neutral-200"
    }`}>
      <h3 className="text-sm font-semibold text-neutral-900 mb-3">現在の利用状況</h3>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-neutral-600">セルフケア（今日）</span>
            <span className={`font-medium ${usage.selfcareRemaining === 0 ? "text-red-600" : "text-neutral-700"}`}>
              残り{usage.selfcareRemaining}回 / 1回
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usage.selfcareRemaining === 0 ? "bg-red-400" : "bg-green-400"}`}
              style={{ width: `${usage.selfcareRemaining > 0 ? 100 : 0}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-neutral-600">ジャーナル（今週）</span>
            <span className={`font-medium ${usage.journalRemaining === 0 ? "text-red-600" : "text-neutral-700"}`}>
              残り{usage.journalRemaining}回 / 3回
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usage.journalRemaining === 0 ? "bg-red-400" : "bg-green-400"}`}
              style={{ width: `${(usage.journalRemaining / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
      {isLow && (
        <div className="mt-4 pt-3 border-t border-amber-200">
          <Link
            href="/pricing"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Proにアップグレードして無制限に →
          </Link>
        </div>
      )}
    </div>
  );
}
