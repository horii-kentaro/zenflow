"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

export function useSubscription() {
  const { plan, setPlan } = useAppStore();

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.plan) setPlan(d.data.plan);
      })
      .catch(console.error);
  }, [setPlan]);

  return { plan };
}
