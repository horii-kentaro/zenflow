"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function WeeklySummaryCard() {
  const [avgScore, setAvgScore] = useState(0);
  const [chartData, setChartData] = useState<{ day: string; score: number }[]>([]);

  useEffect(() => {
    fetch("/api/mood?days=7")
      .then((r) => r.json())
      .then((d) => {
        const entries = d.data || [];
        const days = ["月", "火", "水", "木", "金", "土", "日"];
        const chart = days.map((day, i) => {
          const entry = entries.find((e: { date: string }) => {
            const dt = new Date(e.date);
            return dt.getDay() === (i + 1) % 7;
          });
          return { day, score: entry ? entry.score * 20 : 0 };
        });
        const scores = entries.map((e: { score: number }) => e.score * 20);
        const avg = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
        setChartData(chart);
        setAvgScore(avg);
      })
      .catch(console.error);
  }, []);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>週間ウェルネススコア</CardTitle>
          <span className="text-2xl font-bold text-primary-700">
            {avgScore}<span className="text-sm font-normal text-primary-500">/100</span>
          </span>
        </div>
      </CardHeader>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4", fontSize: 12 }}
              formatter={(value) => [`${value}`, "スコア"]}
            />
            <Area type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} fill="url(#scoreGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
