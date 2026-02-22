import { describe, it, expect } from "vitest";
import {
  apiError,
  apiSuccess,
  validationError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  conflictError,
  internalError,
} from "@/lib/api-error";

describe("apiError", () => {
  it("標準エラーレスポンス形式を返す", async () => {
    const response = apiError({
      code: "VALIDATION_ERROR",
      message: "入力が無効です",
      status: 400,
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "入力が無効です" },
    });
  });

  it("detailsが含まれる場合に追加される", async () => {
    const response = apiError({
      code: "VALIDATION_ERROR",
      message: "入力が無効です",
      status: 400,
      details: { field: "email" },
    });

    const json = await response.json();
    expect(json.error.details).toEqual({ field: "email" });
  });
});

describe("validationError", () => {
  it("400 VALIDATION_ERRORを返す", async () => {
    const response = validationError("メールアドレスが無効です");
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.message).toBe("メールアドレスが無効です");
  });
});

describe("unauthorizedError", () => {
  it("401 UNAUTHORIZEDを返す", async () => {
    const response = unauthorizedError();
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error.code).toBe("UNAUTHORIZED");
    expect(json.error.message).toBe("認証が必要です");
  });

  it("カスタムメッセージをサポートする", async () => {
    const response = unauthorizedError("セッションが切れました");
    const json = await response.json();
    expect(json.error.message).toBe("セッションが切れました");
  });
});

describe("forbiddenError", () => {
  it("403 FORBIDDENを返す", async () => {
    const response = forbiddenError();
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error.code).toBe("FORBIDDEN");
  });
});

describe("notFoundError", () => {
  it("404 NOT_FOUNDを返す", async () => {
    const response = notFoundError("ジャーナルが見つかりません");
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error.code).toBe("NOT_FOUND");
    expect(json.error.message).toBe("ジャーナルが見つかりません");
  });
});

describe("conflictError", () => {
  it("409 CONFLICTを返す", async () => {
    const response = conflictError("既に登録済みです");
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error.code).toBe("CONFLICT");
  });
});

describe("internalError", () => {
  it("500 INTERNAL_ERRORを返す", async () => {
    const response = internalError();
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error.code).toBe("INTERNAL_ERROR");
    expect(json.error.message).toBe("サーバーエラーが発生しました");
  });

  it("カスタムメッセージをサポートする", async () => {
    const response = internalError("データベースエラー");
    const json = await response.json();
    expect(json.error.message).toBe("データベースエラー");
  });
});

describe("apiSuccess", () => {
  it("標準成功レスポンス形式を返す", async () => {
    const response = apiSuccess({ name: "テスト" });
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ success: true, data: { name: "テスト" } });
  });

  it("カスタムステータスコードをサポートする", async () => {
    const response = apiSuccess({ id: "1" }, 201);
    expect(response.status).toBe(201);
  });

  it("SuccessOptionsオブジェクトをサポートする", async () => {
    const response = apiSuccess({ id: "1" }, { status: 201 });
    expect(response.status).toBe(201);
  });

  it("cacheMaxAgeでCache-Controlヘッダーを設定する", () => {
    const response = apiSuccess({ data: "cached" }, { cacheMaxAge: 60 });
    expect(response.headers.get("Cache-Control")).toBe(
      "private, max-age=60, stale-while-revalidate=120"
    );
  });

  it("cacheMaxAgeなしではCache-Controlヘッダーが設定されない", () => {
    const response = apiSuccess({ data: "no-cache" });
    expect(response.headers.get("Cache-Control")).toBeNull();
  });
});
