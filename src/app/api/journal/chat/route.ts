import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import { requireAuth } from "@/lib/auth-helpers";
import { journalChatSchema } from "@/lib/validations";
import { JOURNAL_SYSTEM_PROMPT, SENTIMENT_SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(request: Request) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = journalChatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { journalId, message } = parsed.data;

    const journal = await prisma.journal.findFirst({
      where: { id: journalId, userId: userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!journal) {
      return NextResponse.json({ error: "ジャーナルが見つかりません" }, { status: 404 });
    }

    // Save user message
    await prisma.journalMessage.create({
      data: {
        journalId,
        userId: userId,
        role: "user",
        content: message,
      },
    });

    // Build conversation history
    const messages = [
      ...journal.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250514",
            max_tokens: 300,
            system: JOURNAL_SYSTEM_PROMPT,
            messages,
            stream: true,
          });

          let fullResponse = "";

          for await (const event of response) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              fullResponse += event.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }

          // Save assistant message
          await prisma.journalMessage.create({
            data: {
              journalId,
              userId: userId,
              role: "assistant",
              content: fullResponse,
            },
          });

          // Run sentiment analysis after 3+ exchanges
          const totalMessages = journal.messages.length + 2;
          if (totalMessages >= 6 && !journal.sentiment) {
            runSentimentAnalysis(journalId, messages.concat([{ role: "assistant", content: fullResponse }]));
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (e) {
          console.error("Stream error:", e);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "応答の生成に失敗しました" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json({ error: "チャットの送信に失敗しました" }, { status: 500 });
  }
}

async function runSentimentAnalysis(journalId: string, messages: { role: string; content: string }[]) {
  try {
    const conversationText = messages
      .map((m) => `${m.role === "user" ? "ユーザー" : "AI"}: ${m.content}`)
      .join("\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 200,
      system: SENTIMENT_SYSTEM_PROMPT,
      messages: [{ role: "user", content: conversationText }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      await prisma.journal.update({
        where: { id: journalId },
        data: {
          sentiment: analysis.sentiment,
          sentimentScore: analysis.sentimentScore,
          title: analysis.title,
          summary: analysis.summary,
        },
      });
    }
  } catch (e) {
    console.error("Sentiment analysis error:", e);
  }
}
