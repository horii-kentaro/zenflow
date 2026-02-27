"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/stores/app-store";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "プロフィール" },
  { id: "subscription", label: "サブスクリプション" },
  { id: "security", label: "セキュリティ" },
  { id: "data", label: "データ" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { plan, setPlan } = useAppStore();

  // Tab state from URL hash
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as Tab;
    if (TABS.some((t) => t.id === hash)) setActiveTab(hash);
    const onHash = () => {
      const h = window.location.hash.replace("#", "") as Tab;
      if (TABS.some((t) => t.id === h)) setActiveTab(h);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Profile editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    paymentEmail: true,
    weeklyReport: false,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // Streak
  const [streakInfo, setStreakInfo] = useState<{
    currentStreak: number;
    longestStreak: number;
  } | null>(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Billing
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

  useEffect(() => {
    if (session?.user?.name) setNameValue(session.user.name);
  }, [session?.user?.name]);

  const handleSaveName = async () => {
    setNameSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue }),
      });
      if (res.ok) {
        setEditingName(false);
        await updateSession();
      }
    } catch { /* ignore */ } finally {
      setNameSaving(false);
    }
  };

  const handleSaveNotifs = useCallback(async (prefs: typeof notifPrefs) => {
    setNotifSaving(true);
    try {
      await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationPrefs: prefs }),
      });
    } catch { /* ignore */ } finally {
      setNotifSaving(false);
    }
  }, []);

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
        setPasswordError(data.error?.message || "パスワードの変更に失敗しました");
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
        setDeleteError(data.error?.message || "削除に失敗しました");
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

      {/* Tab navigation */}
      <div className="flex border-b border-neutral-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>プロフィール</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">名前</span>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="text-sm font-medium text-neutral-900 border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      maxLength={50}
                    />
                    <Button size="sm" onClick={handleSaveName} loading={nameSaving}>
                      保存
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditingName(false);
                      setNameValue(session?.user?.name || "");
                    }}>
                      取消
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900">{session?.user?.name || "未設定"}</span>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      編集
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">メール</span>
                <span className="text-sm font-medium text-neutral-900">{session?.user?.email}</span>
              </div>
            </div>
          </Card>

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

          {/* Notification prefs */}
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">支払い通知メール</span>
                <input
                  type="checkbox"
                  checked={notifPrefs.paymentEmail}
                  onChange={(e) => {
                    const next = { ...notifPrefs, paymentEmail: e.target.checked };
                    setNotifPrefs(next);
                    handleSaveNotifs(next);
                  }}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">週間レポートメール</span>
                <input
                  type="checkbox"
                  checked={notifPrefs.weeklyReport}
                  onChange={(e) => {
                    const next = { ...notifPrefs, weeklyReport: e.target.checked };
                    setNotifPrefs(next);
                    handleSaveNotifs(next);
                  }}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
              {notifSaving && <p className="text-xs text-neutral-400">保存中...</p>}
            </div>
          </Card>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === "subscription" && (
        <div className="space-y-6">
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
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
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

          <Card>
            <Button
              variant="danger"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              ログアウト
            </Button>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>アカウント削除</CardTitle>
            </CardHeader>
            <p className="text-sm text-neutral-500 mb-4">
              アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
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
      )}

      {/* Data Tab */}
      {activeTab === "data" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>データエクスポート</CardTitle>
            </CardHeader>
            <p className="text-sm text-neutral-500 mb-4">
              あなたのすべてのデータ（気分記録・ジャーナル・セルフケア履歴）をJSON形式でダウンロードできます。
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                window.location.href = "/api/auth/export-data";
              }}
            >
              データをエクスポート
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
