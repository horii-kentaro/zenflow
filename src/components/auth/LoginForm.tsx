"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailNotVerified(false);
    setResendSuccess(false);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "AccessDenied") {
          setEmailNotVerified(true);
          setError("メールアドレスが未認証です。受信トレイの確認メールをご確認ください。");
        } else {
          setError("メールアドレスまたはパスワードが正しくありません");
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(false);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setResendSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error?.message || "再送信に失敗しました");
      }
    } catch {
      setError("再送信に失敗しました");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        placeholder="8文字以上"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      {emailNotVerified && (
        <div className="space-y-2">
          {resendSuccess ? (
            <p className="text-sm text-green-600">認証メールを再送信しました。受信トレイをご確認ください。</p>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              loading={resendLoading}
              onClick={handleResendVerification}
            >
              認証メールを再送信
            </Button>
          )}
        </div>
      )}
      <div className="text-right">
        <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline">
          パスワードを忘れた方
        </Link>
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        ログイン
      </Button>
      <p className="text-center text-sm text-neutral-500">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="text-primary-600 hover:underline">
          新規登録
        </Link>
      </p>
    </form>
  );
}
