import { create } from "zustand";
import { Plan, StreakInfo, MoodEntryData } from "@/types";

interface AppState {
  plan: Plan;
  streak: StreakInfo | null;
  todayMood: MoodEntryData | null;
  sidebarOpen: boolean;
  setPlan: (plan: Plan) => void;
  setStreak: (streak: StreakInfo) => void;
  setTodayMood: (mood: MoodEntryData | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  plan: "free",
  streak: null,
  todayMood: null,
  sidebarOpen: false,
  setPlan: (plan) => set({ plan }),
  setStreak: (streak) => set({ streak }),
  setTodayMood: (mood) => set({ todayMood: mood }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
