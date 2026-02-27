"use client";

import { cn } from "@/lib/utils";

const ROUTINE_TYPES = [
  { id: "auto", label: "おまかせ", emoji: "✨" },
  { id: "breathing", label: "呼吸法", emoji: "🌬️" },
  { id: "stretch", label: "ストレッチ", emoji: "🧘" },
  { id: "mindfulness", label: "マインドフルネス", emoji: "🧠" },
  { id: "bodyscan", label: "ボディスキャン", emoji: "💆" },
];

interface RoutineTypeSelectorProps {
  selected: string;
  onChange: (type: string) => void;
}

export function RoutineTypeSelector({ selected, onChange }: RoutineTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ROUTINE_TYPES.map((type) => (
        <button
          key={type.id}
          onClick={() => onChange(type.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            selected === type.id
              ? "bg-primary-100 text-primary-700 border border-primary-300"
              : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
          )}
        >
          <span>{type.emoji}</span>
          <span>{type.label}</span>
        </button>
      ))}
    </div>
  );
}
