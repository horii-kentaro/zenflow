"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/stores/app-store";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { plan, setPlan } = useAppStore();
  const [streakInfo, setStreakInfo] = useState<{
    currentStreak: number;
    longestStreak: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => { if (d.data?.plan) setPlan(d.data.plan); })
      .catch(console.error);

    fetch("/api/streak")
      .then((r) => r.json())
      .then((d) => { if (d.data) setStreakInfo(d.data); })
      .catch(console.error);
  }, [setPlan]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">設定</h1>

      {/* プロフィール */}
      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">名前</span>
            <span className="text-sm font-medium text-neutral-900">{session?.user?.name || "未設定"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">メール</span>
            <span className="text-sm font-medium text-neutral-900">{session?.user?.email}</span>
          </div>
        </div>
      </Card>

      {/* プラン */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>プラン</CardTitle>
            <Badge variant={plan === "premium" ? "primary" : "default"}>
              {plan === "premium" ? "Pro" : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <p className="text-sm text-neutral-500 mb-4">
          {plan === "premium"
            ? "Proプランをご利用中です。全機能にアクセスできます。"
            : "Freeプランをご利用中です。Proにアップグレードすると全機能が解放されます。"}
        </p>
        <Link href="/pricing">
          <Button variant="secondary" size="sm">
            プラン管理
          </Button>
        </Link>
      </Card>

      {/* ストリーク */}
      {streakInfo && (
        <Card>
          <CardHeader>
            <CardTitle>ストリーク情報</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">現在のストリーク</span>
              <span className="text-sm font-medium text-neutral-900">{streakInfo.currentStreak}日</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">最長ストリーク</span>
              <span className="text-sm font-medium text-neutral-900">{streakInfo.longestStreak}日</span>
            </div>
          </div>
        </Card>
      )}

      {/* ログアウト */}
      <Card>
        <Button
          variant="danger"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          ログアウト
        </Button>
      </Card>
    </div>
  );
}
