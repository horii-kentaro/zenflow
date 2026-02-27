"use client";

import { useEffect, useState, useCallback } from "react";
import { JournalData } from "@/types";
import { JournalCard } from "./JournalCard";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 10;

interface JournalListProps {
  search?: string;
  sentiment?: string;
  favorite?: boolean;
}

export function JournalList({ search = "", sentiment = "", favorite = false }: JournalListProps) {
  const [journals, setJournals] = useState<JournalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const buildUrl = useCallback((offset: number) => {
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));
    if (search) params.set("search", search);
    if (sentiment) params.set("sentiment", sentiment);
    if (favorite) params.set("favorite", "true");
    return `/api/journal?${params.toString()}`;
  }, [search, sentiment, favorite]);

  const fetchJournals = useCallback(async (offset: number) => {
    const res = await fetch(buildUrl(offset));
    const d = await res.json();
    return d.data as { journals: JournalData[]; total: number; hasMore: boolean };
  }, [buildUrl]);

  useEffect(() => {
    setLoading(true);
    fetchJournals(0)
      .then((data) => {
        setJournals(data.journals);
        setHasMore(data.hasMore);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchJournals]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await fetchJournals(journals.length);
      setJournals((prev) => [...prev, ...data.journals]);
      setHasMore(data.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await fetch(`/api/journal/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite }),
      });
      setJournals((prev) =>
        prev.map((j) => (j.id === id ? { ...j, isFavorite } : j))
      );
    } catch (e) {
      console.error(e);
    }
  };

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
        <p className="text-neutral-500 text-sm">
          {search || sentiment || favorite ? "該当するジャーナルがありません" : "まだジャーナルがありません"}
        </p>
        {!search && !sentiment && !favorite && (
          <p className="text-neutral-400 text-xs mt-1">新しいジャーナルを始めてみましょう</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {journals.map((journal) => (
        <JournalCard
          key={journal.id}
          journal={journal}
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" onClick={handleLoadMore} loading={loadingMore}>
            もっと読み込む
          </Button>
        </div>
      )}
    </div>
  );
}
