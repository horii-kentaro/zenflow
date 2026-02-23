"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";

const CONSENT_KEY = "cookie-consent";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return localStorage.getItem(CONSENT_KEY);
}

function getServerSnapshot() {
  return "server";
}

export function CookieBanner() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleAccept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    window.dispatchEvent(new Event("storage"));
  }, []);

  if (consent === "server" || consent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg p-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-neutral-600 text-center sm:text-left">
          当サイトでは、認証・セッション管理のためにCookieを使用しています。
          詳しくは
          <Link href="/privacy" className="text-primary-600 hover:underline mx-1">
            プライバシーポリシー
          </Link>
          をご覧ください。
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 bg-primary-600 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          同意する
        </button>
      </div>
    </div>
  );
}
