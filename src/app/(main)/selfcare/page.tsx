"use client";

import { useState, useEffect } from "react";
import { RoutineData } from "@/types";
import { RoutineCard } from "@/components/selfcare/RoutineCard";
import { RoutineTimer } from "@/components/selfcare/RoutineTimer";
import { useAppStore } from "@/stores/app-store";
import { Spinner } from "@/components/ui/Spinner";

export default function SelfcarePage() {
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"browse" | "timer" | "complete">("browse");
  const { setStreak } = useAppStore();

  useEffect(() => {
    fetchRoutine();
  }, []);

  const fetchRoutine = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/selfcare");
      const data = await res.json();
      if (data.data) setRoutine(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (durationSec: number) => {
    if (!routine) return;
    try {
      const res = await fetch("/api/selfcare/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routineType: routine.type,
          routineTitle: routine.title,
          routineData: routine,
          durationSec,
        }),
      });
      const data = await res.json();
      if (data.data?.streak) setStreak(data.data.streak);
      setMode("complete");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">セルフケア</h1>

      {mode === "browse" && routine && (
        <RoutineCard routine={routine} onStart={() => setMode("timer")} />
      )}

      {mode === "timer" && routine && (
        <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
          <RoutineTimer
            routine={routine}
            onComplete={handleComplete}
            onCancel={() => setMode("browse")}
          />
        </div>
      )}

      {mode === "complete" && (
        <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm text-center animate-fade-in">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">お疲れさまでした！</h2>
          <p className="text-neutral-500 mb-6">今日のセルフケアを完了しました</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setMode("browse"); fetchRoutine(); }}
              className="h-10 px-4 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors active:scale-[0.98]"
            >
              別のルーティンを試す
            </button>
            <a
              href="/dashboard"
              className="h-10 px-4 bg-neutral-100 text-neutral-800 rounded-md text-sm font-medium hover:bg-neutral-200 transition-colors inline-flex items-center"
            >
              ダッシュボードへ
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
