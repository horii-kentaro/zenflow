import { create } from 'zustand';

type Plan = 'free' | 'premium';

type TodayStatus = {
  mood: boolean;
  selfcare: boolean;
  journal: boolean;
};

type AppState = {
  plan: Plan;
  sidebarOpen: boolean;
  todayStatus: TodayStatus;
  onboardingDone: boolean;
  setPlan: (plan: Plan) => void;
  toggleSidebar: () => void;
  setTodayStatus: (status: Partial<TodayStatus>) => void;
  setOnboardingDone: (done: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  plan: 'free',
  sidebarOpen: false,
  todayStatus: { mood: false, selfcare: false, journal: false },
  onboardingDone: false,
  setPlan: (plan) => set({ plan }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTodayStatus: (status) =>
    set((s) => ({ todayStatus: { ...s.todayStatus, ...status } })),
  setOnboardingDone: (done) => set({ onboardingDone: done }),
}));
