"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { JournalList } from "@/components/journal/JournalList";
import { useState } from "react";

export default function JournalPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleNew = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.data?.id) {
        router.push(`/journal/${data.data.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">ジャーナル</h1>
        <Button onClick={handleNew} loading={creating}>
          新しいジャーナル
        </Button>
      </div>
      <JournalList />
    </div>
  );
}
