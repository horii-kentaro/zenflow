"use client";

import { RoutineData } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface RoutineCardProps {
  routine: RoutineData;
  onStart: () => void;
}

const typeEmoji: Record<string, string> = {
  breathing: "🫁",
  stretch: "🧘",
  mindfulness: "🧠",
  bodyscan: "💆",
};

export function RoutineCard({ routine, onStart }: RoutineCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{typeEmoji[routine.type] || "🧘"}</span>
          <div>
            <CardTitle>{routine.title}</CardTitle>
            <p className="text-sm text-neutral-500 mt-0.5">{routine.description}</p>
          </div>
        </div>
      </CardHeader>

      <div className="space-y-2 mb-4">
        {routine.steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-neutral-700">{step}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">{routine.durationMin}分</span>
        <Button onClick={onStart}>始める</Button>
      </div>
    </Card>
  );
}
