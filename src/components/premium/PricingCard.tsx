"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface PricingCardProps {
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  buttonLabel: string;
  onSelect: () => void;
  loading?: boolean;
  current?: boolean;
}

export function PricingCard({
  name,
  price,
  period,
  features,
  highlighted,
  badge,
  buttonLabel,
  onSelect,
  loading,
  current,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-6 text-left relative",
        highlighted
          ? "border-2 border-primary-500 bg-white shadow-md"
          : "border border-neutral-200 bg-white shadow-sm"
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-6 bg-primary-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">
          {badge}
        </div>
      )}
      <h3 className="text-lg font-semibold text-neutral-900">{name}</h3>
      <div className="mt-2 text-3xl font-bold text-neutral-900">
        ¥{price.toLocaleString()}
        <span className="text-sm font-normal text-neutral-500">{period}</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
            <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {current ? (
          <Button variant="secondary" className="w-full" disabled>
            現在のプラン
          </Button>
        ) : (
          <Button
            variant={highlighted ? "primary" : "secondary"}
            className="w-full"
            onClick={onSelect}
            loading={loading}
          >
            {buttonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
