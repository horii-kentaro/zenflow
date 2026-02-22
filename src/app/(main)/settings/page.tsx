"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/stores/app-store";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { plan, setPlan } = useAppStore();
  const [streakInfo, setStreakInfo] = useState<{
    currentStreak: number;
    longestStreak: number;
  } | null>(null);

  // パスワード変更
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // アカウント削除
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 請求履歴
  const [billingHistory, setBillingHistory] = useState<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    description: string | null;
    invoiceUrl: string | null;
    createdAt: string;
  }[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => { if (d.data?.plan) setPlan(d.data.plan); })
      .catch(console.error);

    fetch("/api/streak")
      .then((r) => r.json())
      .then((d) => { if (d.data) setStreakInfo(d.data); })
      .catch(console.error);

    fetch("/api/billing")
      .then((r) => r.json())
      .then((d) => { if (d.data) setBillingHistory(d.data); })
      .catch(console.error);
  }, [setPlan]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmNewPassword) {
      setPasswordError("新しいパスワードが一致しません");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "パスワードの変更に失敗しました");
        return;
      }

      setPasswordSuccess("パスワードが変更されました");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      setPasswordError("パスワードの変更に失敗しました");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError("");
    setDeleteLoading(true);

    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || "削除に失敗しました");
        return;
      }

      signOut({ callbackUrl: "/" });
    } catch {
      setDeleteError("削除に失敗しました");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">設定</h1>

      {/* プロフィール */}
      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">名前</span>
            <span className="text-sm font-medium text-neutral-900">{session?.user?.name || "未設定"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">メール</span>
            <span className="text-sm font-medium text-neutral-900">{session?.user?.email}</span>
          </div>
        </div>
      </Card>

      {/* プラン */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>プラン</CardTitle>
            <Badge variant={plan === "premium" ? "primary" : "default"}>
              {plan === "premium" ? "Pro" : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <p className="text-sm text-neutral-500 mb-4">
          {plan === "premium"
            ? "Proプランをご利用中です。全機能にアクセスできます。"
            : "Freeプランをご利用中です。Proにアップグレードすると全機能が解放されます。"}
        </p>
        <div className="flex gap-2">
          <Link href="/pricing">
            <Button variant="secondary" size="sm">
              プラン変更
            </Button>
          </Link>
          {plan === "premium" && (
            <Button
              variant="secondary"
              size="sm"
              loading={portalLoading}
              onClick={async () => {
                setPortalLoading(true);
                try {
                  const res = await fetch("/api/stripe/portal", { method: "POST" });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } catch { /* ignore */ } finally {
                  setPortalLoading(false);
                }
              }}
            >
              支払い管理（Stripe）
            </Button>
          )}
        </div>
      </Card>

      {/* ストリーク */}
      {streakInfo && (
        <Card>
          <CardHeader>
            <CardTitle>ストリーク情報</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">現在のストリーク</span>
              <span className="text-sm font-medium text-neutral-900">{streakInfo.currentStreak}日</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">最長ストリーク</span>
              <span className="text-sm font-medium text-neutral-900">{streakInfo.longestStreak}日</span>
            </div>
          </div>
        </Card>
      )}

      {/* 請求履歴 */}
      {billingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>請求履歴</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {billingHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="text-sm text-neutral-900">{item.description || "Proプラン"}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-neutral-900">
                    ¥{item.amount.toLocaleString()}
                  </span>
                  {item.invoiceUrl && (
                    <a
                      href={item.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:underline"
                    >
                      領収書
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* パスワード変更 */}
      <Card>
        <CardHeader>
          <CardTitle>パスワード変更</CardTitle>
        </CardHeader>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <Input
            id="currentPassword"
            label="現在のパスワード"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            id="newPassword"
            label="新しいパスワード"
            type="password"
            placeholder="英大小文字・数字・記号を含む8文字以上"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <Input
            id="confirmNewPassword"
            label="新しいパスワード（確認）"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            minLength={8}
          />
          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}
          <Button type="submit" variant="secondary" size="sm" loading={passwordLoading}>
            パスワードを変更
          </Button>
        </form>
      </Card>

      {/* ログアウト */}
      <Card>
        <Button
          variant="danger"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          ログアウト
        </Button>
      </Card>

      {/* アカウント削除 */}
      <Card>
        <CardHeader>
          <CardTitle>アカウント削除</CardTitle>
        </CardHeader>
        <p className="text-sm text-neutral-500 mb-4">
          アカウントを削除すると、すべてのデータ（気分記録・ジャーナル・セルフケア履歴・ストリーク）が完全に削除されます。この操作は取り消せません。
        </p>
        {!showDeleteConfirm ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            アカウントを削除する
          </Button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="space-y-3">
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm font-medium text-red-800">
                本当にアカウントを削除しますか？
              </p>
              <p className="text-xs text-red-600 mt-1">
                確認のため、パスワードを入力してください。
              </p>
            </div>
            <Input
              id="deletePassword"
              label="パスワード"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />
            {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
            <div className="flex gap-2">
              <Button type="submit" variant="danger" size="sm" loading={deleteLoading}>
                完全に削除する
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
              >
                キャンセル
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
