"use client";

import { cn } from "@/lib/utils";

const CONTEXT_TAGS = [
  { id: "work", label: "仕事" },
  { id: "relationship", label: "人間関係" },
  { id: "health", label: "健康" },
  { id: "weather", label: "天気" },
  { id: "sleep", label: "睡眠" },
  { id: "exercise", label: "運動" },
  { id: "other", label: "その他" },
];

interface MoodContextTagsProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function MoodContextTags({ selected, onChange }: MoodContextTagsProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((t) => t !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <p className="text-xs text-neutral-500 mb-2">きっかけ（任意）</p>
      <div className="flex flex-wrap gap-2">
        {CONTEXT_TAGS.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              selected.includes(tag.id)
                ? "bg-primary-100 text-primary-700 border border-primary-300"
                : "bg-neutral-100 text-neutral-500 border border-transparent hover:bg-neutral-200"
            )}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
