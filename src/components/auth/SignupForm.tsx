"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "登録に失敗しました");
        return;
      }

      setSuccess(true);
    } catch {
      setError("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">📧</div>
        <h3 className="text-lg font-semibold text-neutral-900">確認メールを送信しました</h3>
        <p className="text-sm text-neutral-600">
          <strong>{email}</strong> に確認メールを送信しました。<br />
          メール内のリンクをクリックして、アカウントを有効化してください。
        </p>
        <p className="text-xs text-neutral-500">
          メールが届かない場合は、迷惑メールフォルダをご確認ください。
        </p>
        <Link href="/login">
          <Button variant="secondary" className="w-full">
            ログインページへ
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        label="お名前"
        placeholder="山田太郎"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        id="email"
        label="メールアドレス"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        id="password"
        label="パスワード"
        type="password"
        placeholder="英大小文字・数字・記号を含む8文字以上"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      <Button type="submit" className="w-full" loading={loading}>
        無料で始める
      </Button>
      <p className="text-center text-sm text-neutral-500">
        既にアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-primary-600 hover:underline">
          ログイン
        </Link>
      </p>
    </form>
  );
}
