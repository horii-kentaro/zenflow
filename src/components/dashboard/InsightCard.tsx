"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

export function InsightCard() {
  const [insight, setInsight] = useState<string>("");

  useEffect(() => {
    fetch("/api/mood/insights")
      .then((r) => r.json())
      .then((d) => { if (d.data?.insight) setInsight(d.data.insight); })
      .catch(() => setInsight("データを蓄積中です。毎日の気分記録を続けると、AIがあなたのパターンを分析します。"));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AIインサイト</CardTitle>
      </CardHeader>
      <p className="text-sm text-neutral-600 leading-relaxed">
        {insight || "データを蓄積中です。毎日の気分記録を続けると、AIがあなたのパターンを分析します。"}
      </p>
    </Card>
  );
}
