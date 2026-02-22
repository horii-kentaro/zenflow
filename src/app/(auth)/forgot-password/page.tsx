"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "送信に失敗しました");
        return;
      }

      setSuccess(true);
    } catch {
      setError("送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Zenflow</h1>
          <p className="text-neutral-500 mt-1">パスワードリセット</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-neutral-700">
                パスワードリセットのメールを送信しました。メールをご確認ください。
              </p>
              <Link href="/login">
                <Button variant="secondary" className="w-full">
                  ログインページに戻る
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-neutral-600">
                登録済みのメールアドレスを入力してください。パスワードリセットのリンクをお送りします。
              </p>
              <Input
                id="email"
                label="メールアドレス"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" loading={loading}>
                リセットメールを送信
              </Button>
              <p className="text-center text-sm text-neutral-500">
                <Link href="/login" className="text-primary-600 hover:underline">
                  ログインページに戻る
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
