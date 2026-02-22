"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { JournalData } from "@/types";
import { ChatInterface } from "@/components/journal/ChatInterface";
import { SentimentBadge } from "@/components/journal/SentimentBadge";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [journal, setJournal] = useState<JournalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/journal/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setJournal(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("このジャーナルを削除しますか？")) return;
    await fetch(`/api/journal/${params.id}`, { method: "DELETE" });
    router.push("/journal");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">ジャーナルが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/journal")}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-neutral-900">
            {journal.title || formatDate(journal.date)}
          </h1>
          <SentimentBadge sentiment={journal.sentiment} />
        </div>
        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-700 hover:bg-red-50">
          削除
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <ChatInterface
          journalId={journal.id}
          initialMessages={journal.messages || []}
        />
      </div>
    </div>
  );
}
