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
  const minutes = Math.floor((totalSeconds - elapsed) / 60);
  const seconds = (totalSeconds - elapsed) % 60;
  const isComplete = elapsed >= totalSeconds;

  return (
    <div className="flex flex-col items-center">
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
          <text x="100" y="90" textAnchor="middle" className="text-3xl font-bold" fill="#1c1917">
            {isComplete ? "✓" : `${minutes}:${seconds.toString().padStart(2, "0")}`}
          </text>
          <text x="100" y="115" textAnchor="middle" className="text-sm" fill="#78716c">
            {isComplete ? "完了！" : "残り"}
          </text>
        </svg>
        {running && !isComplete && (
          <div className="absolute inset-0 rounded-full animate-breathe opacity-10 bg-primary-400" />
        )}
      </div>

      {!isComplete && routine.steps[currentStep] && (
        <div className="text-center mb-6 animate-fade-in" key={currentStep}>
          <p className="text-sm text-neutral-500 mb-1">ステップ {currentStep + 1}/{routine.steps.length}</p>
          <p className="text-lg font-medium text-neutral-900">{routine.steps[currentStep]}</p>
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
