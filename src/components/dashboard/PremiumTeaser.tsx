"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/stores/app-store";

export function PremiumTeaser() {
  const { plan } = useAppStore();
  if (plan === "premium") return null;

  return (
    <Link href="/pricing">
      <Card hover className="bg-gradient-to-r from-primary-50 to-primary-100/50 border-primary-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary-800">Proにアップグレード</p>
            <p className="text-xs text-primary-600 mt-0.5">無制限のAI対話やトレンド分析を解放</p>
          </div>
          <svg className="w-5 h-5 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </Card>
    </Link>
  );
}
