import { Badge } from "@/components/ui/Badge";

interface SentimentBadgeProps {
  sentiment: string | null | undefined;
}

const sentimentConfig: Record<string, { label: string; variant: "success" | "warning" | "danger" | "default" }> = {
  positive: { label: "ポジティブ", variant: "success" },
  neutral: { label: "ニュートラル", variant: "default" },
  negative: { label: "ネガティブ", variant: "danger" },
  mixed: { label: "複合的", variant: "warning" },
};

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  if (!sentiment) return null;
  const config = sentimentConfig[sentiment];
  if (!config) return null;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
