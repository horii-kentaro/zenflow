import { NextResponse } from "next/server";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

interface ApiErrorOptions {
  code: ErrorCode;
  message: string;
  status: number;
  details?: unknown;
}

export function apiError({ code, message, status, details }: ApiErrorOptions): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
    },
    { status }
  );
}

export function validationError(message: string, details?: unknown): NextResponse {
  return apiError({ code: "VALIDATION_ERROR", message, status: 400, details });
}

export function unauthorizedError(message = "認証が必要です"): NextResponse {
  return apiError({ code: "UNAUTHORIZED", message, status: 401 });
}

export function forbiddenError(message = "アクセス権限がありません"): NextResponse {
  return apiError({ code: "FORBIDDEN", message, status: 403 });
}

export function notFoundError(message: string): NextResponse {
  return apiError({ code: "NOT_FOUND", message, status: 404 });
}

export function conflictError(message: string): NextResponse {
  return apiError({ code: "CONFLICT", message, status: 409 });
}

export function internalError(message = "サーバーエラーが発生しました"): NextResponse {
  return apiError({ code: "INTERNAL_ERROR", message, status: 500 });
}

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}
