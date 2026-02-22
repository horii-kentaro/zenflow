import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import { requireAuth } from "@/lib/auth-helpers";
import { SELFCARE_SYSTEM_PROMPT, buildSelfcarePrompt } from "@/lib/prompts";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess } from "@/lib/api-error";

const FALLBACK_ROUTINE = {
  type: "breathing",
  title: "4-7-8呼吸法",
  description: "リラックスのための呼吸法です",
  durationMin: 5,
  steps: [
    "楽な姿勢で座ります",
    "4秒間かけて鼻から息を吸います",
    "7秒間息を止めます",
    "8秒間かけて口から息を吐きます",
    "これを4回繰り返します",
  ],
};

export async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.ai, "selfcare");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const days = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
    const dayOfWeek = days[new Date().getDay()];

    const recentMood = await prisma.moodEntry.findFirst({
      where: { userId: userId },
      orderBy: { date: "desc" },
    });

    const recentCompletions = await prisma.selfcareCompletion.findMany({
      where: { userId: userId },
      orderBy: { date: "desc" },
      take: 5,
    });

    const history = recentCompletions.map((c) => c.routineType);
    const prompt = buildSelfcarePrompt(dayOfWeek, recentMood?.score, history);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 500,
      system: SELFCARE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return apiSuccess(FALLBACK_ROUTINE);
    }

    const routine = JSON.parse(jsonMatch[0]);
    return apiSuccess(routine);
  } catch (e) {
    console.error("Selfcare generation error:", e);
    return apiSuccess(FALLBACK_ROUTINE);
  }
}
