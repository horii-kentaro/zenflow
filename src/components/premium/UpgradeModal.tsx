"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PREMIUM_PRICE } from "@/lib/constants";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export function UpgradeModal({ open, onClose, message }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // フォールバック
      window.location.href = "/pricing";
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="upgrade-modal-title">
      <div className="text-center">
        <div className="text-4xl mb-3">&#10024;</div>
        <h2 id="upgrade-modal-title" className="text-xl font-bold text-neutral-900 mb-2">Proにアップグレード</h2>
        <p className="text-sm text-neutral-500 mb-4">
          {message || "この機能はProプランでご利用いただけます"}
        </p>
        <div className="text-3xl font-bold text-neutral-900 mb-1">
          ¥{PREMIUM_PRICE.toLocaleString()}<span className="text-sm font-normal text-neutral-500">/月</span>
        </div>
        <ul className="text-left text-sm text-neutral-600 space-y-2 my-6">
          {[
            "無制限のセルフケア",
            "無制限のジャーナリング + AI深掘り",
            "無制限の気分履歴 + トレンド分析",
            "月3回のストリークフリーズ",
          ].map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <Button className="w-full" onClick={handleUpgrade} loading={loading}>
            Proを始める
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            あとで
          </Button>
        </div>
      </div>
    </Modal>
  );
}
