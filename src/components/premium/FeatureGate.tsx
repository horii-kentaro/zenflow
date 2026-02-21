"use client";

import { useAppStore } from "@/stores/app-store";
import { UpgradeModal } from "./UpgradeModal";
import { useState } from "react";

interface FeatureGateProps {
  feature: "selfcare" | "journal" | "moodHistory" | "streakFreeze" | "insights";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { plan } = useAppStore();
  const [showModal, setShowModal] = useState(false);

  const premiumFeatures = ["insights", "streakFreeze"];

  if (plan === "premium" || !premiumFeatures.includes(feature)) {
    return <>{children}</>;
  }

  return (
    <>
      <div onClick={() => setShowModal(true)} className="cursor-pointer">
        {fallback || (
          <div className="relative">
            <div className="opacity-50 pointer-events-none">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl">
              <span className="text-sm font-medium text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
                Pro で解放
              </span>
            </div>
          </div>
        )}
      </div>
      <UpgradeModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
