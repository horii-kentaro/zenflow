import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const startTime = Date.now();

  let dbStatus: "ok" | "error" = "ok";
  let dbLatency = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
  } catch {
    dbStatus = "error";
  }

  const health = {
    status: dbStatus === "ok" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    uptime: process.uptime(),
    checks: {
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`,
      },
    },
    responseTime: `${Date.now() - startTime}ms`,
  };

  const status = dbStatus === "ok" ? 200 : 503;
  return NextResponse.json(health, { status });
}
