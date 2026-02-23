"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "" : "無効なリンクです。");

  useEffect(() => {
    if (!token) return;

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("メールアドレスが確認されました。");
        } else {
          setStatus("error");
          setMessage(data.error?.message || "確認に失敗しました。");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("確認に失敗しました。");
      });
  }, [token]);

  return (
    <div className="text-center space-y-4">
      {status === "loading" && (
        <p className="text-sm text-neutral-500">メールアドレスを確認中...</p>
      )}
      {status === "success" && (
        <>
          <div className="text-4xl">&#10003;</div>
          <p className="text-sm text-neutral-700">{message}</p>
          <Link href="/login">
            <Button className="w-full">ログインページへ</Button>
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-sm text-red-500">{message}</p>
          <Link href="/login">
            <Button variant="secondary" className="w-full">
              ログインページへ
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Zenflow</h1>
          <p className="text-neutral-500 mt-1">メール認証</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <Suspense fallback={<p className="text-center text-sm text-neutral-500">読み込み中...</p>}>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
