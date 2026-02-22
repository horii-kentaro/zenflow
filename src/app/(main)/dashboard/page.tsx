import dynamic from "next/dynamic";
import { MoodCheckIn } from "@/components/dashboard/MoodCheckIn";
import { StreakCounter } from "@/components/dashboard/StreakCounter";
import { TodayRecommendation } from "@/components/dashboard/TodayRecommendation";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { PremiumTeaser } from "@/components/dashboard/PremiumTeaser";

const WeeklySummaryCard = dynamic(
  () => import("@/components/dashboard/WeeklySummaryCard").then((m) => m.WeeklySummaryCard),
  { loading: () => <div className="col-span-2 h-56 bg-neutral-100 rounded-xl animate-pulse" /> }
);

const MoodMiniChart = dynamic(
  () => import("@/components/dashboard/MoodMiniChart").then((m) => m.MoodMiniChart),
  { loading: () => <div className="h-48 bg-neutral-100 rounded-xl animate-pulse" /> }
);

export const metadata = {
  title: "ダッシュボード",
  description: "今日の気分チェックイン、ストリーク、ウィークリーサマリーを確認しましょう。",
};

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <MoodCheckIn />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WeeklySummaryCard />
        <StreakCounter />
      </div>
      <TodayRecommendation />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MoodMiniChart />
        <InsightCard />
      </div>
      <PremiumTeaser />
    </div>
  );
}
