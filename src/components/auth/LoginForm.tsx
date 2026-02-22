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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("メールアドレスまたはパスワードが正しくありません");
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
