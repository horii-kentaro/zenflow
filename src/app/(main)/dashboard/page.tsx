import { MoodCheckIn } from "@/components/dashboard/MoodCheckIn";
import { WeeklySummaryCard } from "@/components/dashboard/WeeklySummaryCard";
import { StreakCounter } from "@/components/dashboard/StreakCounter";
import { TodayRecommendation } from "@/components/dashboard/TodayRecommendation";
import { MoodMiniChart } from "@/components/dashboard/MoodMiniChart";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { PremiumTeaser } from "@/components/dashboard/PremiumTeaser";

export const metadata = { title: "ダッシュボード - Zenflow" };

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
