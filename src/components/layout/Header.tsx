"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { getGreeting } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();
  const name = session?.user?.name || "ユーザー";

  return (
    <header className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          {getGreeting()}、{name}さん
        </h2>
      </div>
      <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
        ログアウト
      </Button>
    </header>
  );
}
