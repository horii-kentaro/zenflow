"use client";

import { useState, useCallback } from "react";
import { UpgradeModal } from "@/components/premium/UpgradeModal";

export function useFeatureGate() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const checkAccess = useCallback(async (feature: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/subscription/check?feature=${feature}`);
      const data = await res.json();

      if (!data.data?.allowed) {
        setUpgradeMessage(data.data?.message || "この機能はProプランで利用できます");
        setShowUpgrade(true);
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }, []);

  return {
    checkAccess,
    showUpgrade,
    setShowUpgrade,
    upgradeMessage,
    UpgradeModal,
  };
}
