"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-red-500">無効なリンクです。</p>
        <Link href="/forgot-password">
          <Button variant="secondary" className="w-full">
            パスワードリセットを再申請
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "リセットに失敗しました");
        return;
      }

      setSuccess(true);
    } catch {
      setError("リセットに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return success ? (
    <div className="text-center space-y-4">
      <p className="text-sm text-neutral-700">
        パスワードが正常にリセットされました。新しいパスワードでログインしてください。
      </p>
      <Link href="/login">
        <Button className="w-full">ログインページへ</Button>
      </Link>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="password"
        label="新しいパスワード"
        type="password"
        placeholder="英大小文字・数字・記号を含む8文字以上"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />
      <Input
        id="confirmPassword"
        label="パスワード確認"
        type="password"
        placeholder="もう一度入力してください"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength={8}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" loading={loading}>
        パスワードを変更
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Zenflow</h1>
          <p className="text-neutral-500 mt-1">パスワードリセット</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <Suspense fallback={<p className="text-center text-sm text-neutral-500">読み込み中...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
