"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          エラーが発生しました
        </h1>
        <p className="text-neutral-500 mb-6">
          ページの読み込み中にエラーが発生しました。もう一度お試しください。
        </p>
        {error.digest && (
          <p className="text-xs text-neutral-400 mb-4">
            エラーID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>もう一度試す</Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/dashboard")}>
            ダッシュボードへ
          </Button>
        </div>
      </div>
    </div>
  );
}
