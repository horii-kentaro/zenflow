"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { getToday } from "@/lib/utils";

export function useMoodData() {
  const { todayMood, setTodayMood } = useAppStore();

  useEffect(() => {
    const today = getToday();
    fetch(`/api/mood?days=1`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          const todayEntry = d.data.find((e: { date: string }) => e.date === today);
          setTodayMood(todayEntry || null);
        }
      })
      .catch(console.error);
  }, [setTodayMood]);

  return { todayMood };
}
