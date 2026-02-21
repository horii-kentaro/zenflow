"use client";

import { useEffect, useState } from "react";
import { JournalData } from "@/types";
import { JournalCard } from "./JournalCard";
import { Spinner } from "@/components/ui/Spinner";

export function JournalList() {
  const [journals, setJournals] = useState<JournalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/journal")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setJournals(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (journals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-neutral-500 text-sm">まだジャーナルがありません</p>
        <p className="text-neutral-400 text-xs mt-1">新しいジャーナルを始めてみましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {journals.map((journal) => (
        <JournalCard key={journal.id} journal={journal} />
      ))}
    </div>
  );
}
