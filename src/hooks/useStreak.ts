"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

export function useStreak() {
  const { streak, setStreak } = useAppStore();

  useEffect(() => {
    fetch("/api/streak")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setStreak(d.data);
      })
      .catch(console.error);
  }, [setStreak]);

  return { streak };
}
