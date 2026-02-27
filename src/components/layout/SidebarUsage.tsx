"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/stores/app-store";
import { Badge } from "@/components/ui/Badge";

interface UsageData {
  selfcareRemaining: number;
  journalRemaining: number;
}

export function SidebarUsage() {
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

  if (plan === "premium") {
    return (
      <div className="rounded-lg bg-primary-50 px-3 py-2 text-center">
        <Badge variant="primary">Pro</Badge>
      </div>
    );
  }

  if (!usage) return null;

  return (
    <Link href="/pricing" className="block rounded-lg bg-neutral-100 px-3 py-2.5 hover:bg-neutral-150 transition-colors">
      <p className="text-xs font-medium text-neutral-500 mb-1.5">今日の残り</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-600">セルフケア</span>
          <span className={`font-medium ${usage.selfcareRemaining === 0 ? "text-red-500" : "text-neutral-700"}`}>
            {usage.selfcareRemaining}回
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-600">ジャーナル</span>
          <span className={`font-medium ${usage.journalRemaining === 0 ? "text-red-500" : "text-neutral-700"}`}>
            {usage.journalRemaining}回/週
          </span>
        </div>
      </div>
    </Link>
  );
}
