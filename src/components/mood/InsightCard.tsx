"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/stores/app-store";

export function MoodInsightCard() {
  const { plan } = useAppStore();
  const [insight, setInsight] = useState("");
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    fetch("/api/mood/insights")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setInsight(d.data.insight);
          setAvgScore(d.data.averageScore || 0);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AIインサイト</CardTitle>
          {plan !== "premium" && <Badge variant="primary">Pro で詳細分析</Badge>}
        </div>
      </CardHeader>
      <p className="text-sm text-neutral-600 leading-relaxed">{insight || "分析中..."}</p>
      {avgScore > 0 && (
        <p className="text-xs text-neutral-400 mt-3">平均スコア: {avgScore.toFixed(1)}/5</p>
      )}
    </Card>
  );
}
