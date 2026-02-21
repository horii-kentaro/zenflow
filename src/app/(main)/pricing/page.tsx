"use client";

import { useState, useEffect } from "react";
import { PricingCard } from "@/components/premium/PricingCard";
import { PREMIUM_PRICE } from "@/lib/constants";
import { useAppStore } from "@/stores/app-store";

export default function PricingPage() {
  const { plan, setPlan } = useAppStore();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => { if (d.data?.plan) setPlan(d.data.plan); })
      .catch(console.error);
  }, [setPlan]);

  const handleSelect = async (newPlan: "free" | "premium") => {
    setLoading(newPlan);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      const data = await res.json();
      if (data.data?.plan) setPlan(data.data.plan);
    } catch (e) {
      console.error(e);
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
          buttonLabel="Freeプランにする"
          onSelect={() => handleSelect("free")}
          loading={loading === "free"}
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
          buttonLabel="Proを始める"
          onSelect={() => handleSelect("premium")}
          loading={loading === "premium"}
          current={plan === "premium"}
        />
      </div>
    </div>
  );
}
