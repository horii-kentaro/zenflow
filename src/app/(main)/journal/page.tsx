"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { JournalList } from "@/components/journal/JournalList";
import { JournalSearch } from "@/components/journal/JournalSearch";
import { useState, useCallback } from "react";

export default function JournalPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => setDebouncedSearch(value), 300);
    setDebounceTimer(timer);
  }, [debounceTimer]);

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
      <JournalSearch
        search={search}
        onSearchChange={handleSearchChange}
        sentiment={sentiment}
        onSentimentChange={setSentiment}
        favorite={favorite}
        onFavoriteChange={setFavorite}
      />
      <JournalList search={debouncedSearch} sentiment={sentiment} favorite={favorite} />
    </div>
  );
}
