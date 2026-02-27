"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PricingCard } from "@/components/premium/PricingCard";
import { FAQ } from "@/components/premium/FAQ";
import { FeatureComparison } from "@/components/premium/FeatureComparison";
import { UsageStatus } from "@/components/premium/UsageStatus";
import { PREMIUM_PRICE } from "@/lib/constants";
import { useAppStore } from "@/stores/app-store";

function PricingContent() {
  const searchParams = useSearchParams();
  const { plan, setPlan } = useAppStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => { if (d.data?.plan) setPlan(d.data.plan); })
      .catch(console.error);
  }, [setPlan]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setMessage("Proプランへのアップグレードが完了しました！");
      fetch("/api/subscription")
        .then((r) => r.json())
        .then((d) => { if (d.data?.plan) setPlan(d.data.plan); })
        .catch(console.error);
    }
    if (searchParams.get("canceled") === "true") {
      setMessage("決済がキャンセルされました。");
    }
  }, [searchParams, setPlan]);

  const handleSelectPremium = async () => {
    setLoading("premium");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (data.data?.message) {
        setMessage(data.data.message);
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error || "チェックアウトに失敗しました");
      }
    } catch {
      setMessage("チェックアウトに失敗しました");
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading("manage");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error || "ポータルの表示に失敗しました");
      }
    } catch {
      setMessage("ポータルの表示に失敗しました");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900">料金プラン</h1>
        <p className="text-neutral-500 mt-2">あなたに合ったプランを選びましょう</p>
      </div>

      {message && (
        <div className={`rounded-lg p-3 text-sm text-center ${
          message.includes("完了") ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
        }`}>
          {message}
        </div>
      )}

      <UsageStatus />

      <div className="grid md:grid-cols-2 gap-6">
        <PricingCard
          name="Free"
          price={0}
          period="/月"
          features={[
            "1日1回のセルフケア",
            "週3回のジャーナリング",
            "7日間の気分履歴",
            "基本的なAI対話",
          ]}
          buttonLabel={plan === "premium" ? "プランを管理" : "現在のプラン"}
          onSelect={plan === "premium" ? handleManageSubscription : () => {}}
          loading={loading === "manage" && plan === "premium"}
          current={plan === "free"}
        />
        <PricingCard
          name="Pro"
          price={PREMIUM_PRICE}
          period="/月"
          features={[
            "無制限のセルフケア",
            "無制限のジャーナリング + AI深掘り",
            "無制限の気分履歴 + トレンド分析",
            "月3回のストリークフリーズ",
            "カスタムルーティン作成",
          ]}
          highlighted
          badge="おすすめ"
          buttonLabel={plan === "premium" ? "プランを管理" : "Proを始める"}
          onSelect={plan === "premium" ? handleManageSubscription : handleSelectPremium}
          loading={plan === "premium" ? loading === "manage" : loading === "premium"}
          current={plan === "premium"}
        />
      </div>

      <FeatureComparison />
      <FAQ />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="text-center text-neutral-500 py-8">読み込み中...</div>}>
      <PricingContent />
    </Suspense>
  );
}
