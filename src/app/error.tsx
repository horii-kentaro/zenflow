"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          エラーが発生しました
        </h1>
        <p className="text-neutral-500 mb-6">
          予期しないエラーが発生しました。もう一度お試しください。
          問題が続く場合はしばらく時間をおいてからアクセスしてください。
        </p>
        {error.digest && (
          <p className="text-xs text-neutral-400 mb-4">
            エラーID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>もう一度試す</Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            トップページへ
          </Button>
        </div>
      </div>
    </div>
  );
}
