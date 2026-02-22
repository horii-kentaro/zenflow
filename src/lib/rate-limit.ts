import { NextResponse } from "next/server";

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 600_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);

interface RateLimitConfig {
  /** Maximum number of requests in the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

/** Pre-defined rate limit configs */
export const RATE_LIMITS = {
  /** Auth endpoints: 5 requests per 60 seconds */
  auth: { limit: 5, windowSeconds: 60 } satisfies RateLimitConfig,
  /** AI endpoints: 10 requests per 60 seconds */
  ai: { limit: 10, windowSeconds: 60 } satisfies RateLimitConfig,
  /** General API endpoints: 30 requests per 60 seconds */
  api: { limit: 30, windowSeconds: 60 } satisfies RateLimitConfig,
} as const;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.limit) {
    const oldestInWindow = entry.timestamps[0];
    return {
      success: false,
      remaining: 0,
      resetAt: oldestInWindow + windowMs,
    };
  }

  entry.timestamps.push(now);
  return {
    success: true,
    remaining: config.limit - entry.timestamps.length,
    resetAt: now + windowMs,
  };
}

/**
 * Apply rate limiting to an API route.
 * Returns a NextResponse with 429 status if rate limit exceeded, or null if OK.
 */
export function rateLimit(
  request: Request,
  config: RateLimitConfig,
  prefix: string = "api"
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${prefix}:${ip}`;
  const result = checkRateLimit(key, config);

  if (!result.success) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "リクエスト数の上限に達しました。しばらく待ってからお試しください。",
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(config.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetAt),
        },
      }
    );
  }

  return null;
}
