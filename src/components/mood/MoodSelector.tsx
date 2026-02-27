"use client";

import { useState } from "react";
import { MOOD_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MoodScore } from "@/types";
import { Button } from "@/components/ui/Button";
import { MoodContextTags } from "./MoodContextTags";

interface MoodSelectorProps {
  onSubmit: (score: MoodScore, note?: string, context?: string) => Promise<void>;
  initialScore?: MoodScore;
}

export function MoodSelector({ onSubmit, initialScore }: MoodSelectorProps) {
  const [selected, setSelected] = useState<MoodScore | null>(initialScore || null);
  const [note, setNote] = useState("");
  const [contextTags, setContextTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const context = contextTags.length > 0 ? contextTags.join(",") : undefined;
      await onSubmit(selected, note || undefined, context);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3" role="group" aria-label="気分を選択">
        {MOOD_OPTIONS.map((mood) => (
          <button
            key={mood.score}
            onClick={() => setSelected(mood.score)}
            aria-pressed={selected === mood.score}
            aria-label={mood.labelJa}
            className={cn(
              "flex flex-col items-center gap-2 py-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
              selected === mood.score
                ? "bg-primary-50 border-2 border-primary-400 scale-105 shadow-sm"
                : "bg-white border border-neutral-200 hover:border-primary-300"
            )}
          >
            <span className="text-3xl" aria-hidden="true">{mood.emoji}</span>
            <span className="text-xs font-medium text-neutral-600">{mood.labelJa}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="space-y-3 animate-fade-in">
          <MoodContextTags selected={contextTags} onChange={setContextTags} />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="今日の気分について一言メモ（任意）"
            className="w-full h-24 px-4 py-3 rounded-lg border border-neutral-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            maxLength={500}
          />
          <Button onClick={handleSubmit} loading={loading} className="w-full">
            気分を記録する
          </Button>
        </div>
      )}
    </div>
  );
}
