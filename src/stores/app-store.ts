import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Plan, StreakInfo, MoodEntryData } from "@/types";

interface AppState {
  plan: Plan;
  streak: StreakInfo | null;
  todayMood: MoodEntryData | null;
  sidebarOpen: boolean;
  planFetchedAt: number | null;
  setPlan: (plan: Plan) => void;
  setStreak: (streak: StreakInfo) => void;
  setTodayMood: (mood: MoodEntryData | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  isPlanCacheValid: () => boolean;
}

const PLAN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      plan: "free",
      streak: null,
      todayMood: null,
      sidebarOpen: false,
      planFetchedAt: null,
      setPlan: (plan) => set({ plan, planFetchedAt: Date.now() }),
      setStreak: (streak) => set({ streak }),
      setTodayMood: (mood) => set({ todayMood: mood }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      isPlanCacheValid: () => {
        const { planFetchedAt } = get();
        if (!planFetchedAt) return false;
        return Date.now() - planFetchedAt < PLAN_CACHE_TTL;
      },
    }),
    {
      name: "zenflow-app",
      partialize: (state) => ({
        plan: state.plan,
        sidebarOpen: state.sidebarOpen,
        planFetchedAt: state.planFetchedAt,
      }),
    }
  )
);
