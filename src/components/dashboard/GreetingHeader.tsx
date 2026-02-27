"use client";

import { useSession } from "next-auth/react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "おはようございます";
  if (hour >= 11 && hour < 17) return "こんにちは";
  return "お疲れさまです";
}

function getTodayLabel(): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const dow = days[now.getDay()];
  return `${m}月${d}日（${dow}）`;
}

export function GreetingHeader() {
  const { data: session } = useSession();
  const name = session?.user?.name;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">
        {getGreeting()}
        {name ? `、${name}さん` : ""}
      </h1>
      <p className="text-sm text-neutral-500 mt-1">{getTodayLabel()}</p>
    </div>
  );
}
