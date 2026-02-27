"use client";

import { useState, useEffect, useRef } from "react";
import { RoutineData } from "@/types";
import { Button } from "@/components/ui/Button";

interface RoutineTimerProps {
  routine: RoutineData;
  onComplete: (durationSec: number) => void;
  onCancel: () => void;
}

export function RoutineTimer({ routine, onComplete, onCancel }: RoutineTimerProps) {
  const totalSeconds = routine.durationMin * 60;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= totalSeconds) {
            clearInterval(intervalRef.current!);
            return totalSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, totalSeconds]);

  const currentStep = routine.steps.length > 0
    ? Math.min(Math.floor(elapsed / (totalSeconds / routine.steps.length)), routine.steps.length - 1)
    : 0;

  const progress = elapsed / totalSeconds;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference * (1 - progress);
  const remaining = totalSeconds - elapsed;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isComplete = elapsed >= totalSeconds;

  return (
    <div className="flex flex-col items-center">
      {/* Current step name - prominently displayed */}
      {!isComplete && routine.steps[currentStep] && (
        <div className="text-center mb-6 animate-fade-in" key={currentStep}>
          <p className="text-xs text-neutral-400 mb-1">
            ステップ {currentStep + 1} / {routine.steps.length}
          </p>
          <p className="text-lg font-semibold text-neutral-900">{routine.steps[currentStep]}</p>
        </div>
      )}

      {/* Progress ring with time in center */}
      <div className="relative mb-8">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#e7e5e4" strokeWidth="10" />
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke={isComplete ? "#22c55e" : "#14b8a6"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
            className="transition-all duration-1000"
          />
          {isComplete ? (
            <>
              <text x="100" y="95" textAnchor="middle" className="text-4xl font-bold" fill="#22c55e">
                ✓
              </text>
              <text x="100" y="120" textAnchor="middle" className="text-sm" fill="#78716c">
                完了！
              </text>
            </>
          ) : (
            <>
              <text x="100" y="95" textAnchor="middle" className="text-3xl font-bold" fill="#1c1917">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </text>
              <text x="100" y="120" textAnchor="middle" className="text-xs" fill="#a8a29e">
                残り
              </text>
            </>
          )}
        </svg>
        {running && !isComplete && (
          <div className="absolute inset-0 rounded-full animate-breathe opacity-10 bg-primary-400" />
        )}
      </div>

      {/* Step progress dots */}
      {!isComplete && routine.steps.length > 1 && (
        <div className="flex items-center gap-1.5 mb-6">
          {routine.steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i <= currentStep ? "bg-primary-500" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {isComplete ? (
          <Button onClick={() => onComplete(elapsed)} size="lg">
            完了する
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setRunning(!running)}>
              {running ? "一時停止" : "再開"}
            </Button>
            <Button variant="ghost" onClick={onCancel}>
              キャンセル
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
