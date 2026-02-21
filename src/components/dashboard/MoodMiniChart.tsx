"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getMoodEmoji } from "@/lib/utils";

export function MoodMiniChart() {
  const [data, setData] = useState<{ date: string; score: number }[]>([]);

  useEffect(() => {
    fetch("/api/mood?days=7")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setData(d.data.map((e: { date: string; score: number }) => ({ date: e.date.slice(5), score: e.score })));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>感情の推移</CardTitle>
      </CardHeader>
      <div className="h-32">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 6]} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4", fontSize: 12 }}
                formatter={(value) => [getMoodEmoji(value as number), "気分"]}
              />
              <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} dot={{ fill: "#14b8a6", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-neutral-400">気分を記録するとグラフが表示されます</div>
        )}
      </div>
    </Card>
  );
}
