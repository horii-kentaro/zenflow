import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type TodayStatus = {
  mood: boolean;
  selfcare: boolean;
  journal: boolean;
};

type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
};

export function useDashboard() {
  const [todayStatus, setTodayStatus] = useState<TodayStatus>({
    mood: false,
    selfcare: false,
    journal: false,
  });
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [moodRes, selfcareRes, streakRes] = await Promise.allSettled([
        api.get<any[]>('/api/mood?days=1'),
        api.get<{ completed: boolean }>('/api/selfcare/today-status'),
        api.get<StreakData>('/api/streak'),
      ]);

      setTodayStatus({
        mood: moodRes.status === 'fulfilled' && moodRes.value.length > 0,
        selfcare:
          selfcareRes.status === 'fulfilled' && selfcareRes.value.completed,
        journal: false, // TODO: journal today status API
      });

      if (streakRes.status === 'fulfilled') {
        setStreak(streakRes.value);
      }
    } catch {
      // silently fail - show defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { todayStatus, streak, loading, refetch: fetchData };
}
