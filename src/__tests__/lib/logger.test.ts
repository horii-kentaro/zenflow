import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger, logRequest, withLogging } from "@/lib/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("info はconsole.logを呼ぶ", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("テストメッセージ");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain("INFO テストメッセージ");
  });

  it("warn はconsole.warnを呼ぶ", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("警告メッセージ");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain("WARN 警告メッセージ");
  });

  it("error はconsole.errorを呼ぶ", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("エラーメッセージ");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain("ERROR エラーメッセージ");
  });

  it("extraデータがJSON形式で含まれる", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("テスト", { key: "value", count: 42 });
    expect(spy.mock.calls[0][0]).toContain('"key":"value"');
    expect(spy.mock.calls[0][0]).toContain('"count":42');
  });

  it("タイムスタンプが含まれる", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("テスト");
    expect(spy.mock.calls[0][0]).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
  });
});

describe("logRequest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("200レスポンスはinfoレベル", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const request = new Request("http://localhost:3000/api/test");
    const response = new Response(null, { status: 200 });
    logRequest(request, response, Date.now() - 10);

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain("INFO");
    expect(spy.mock.calls[0][0]).toContain("GET /api/test 200");
  });

  it("400レスポンスはwarnレベル", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const request = new Request("http://localhost:3000/api/test", { method: "POST" });
    const response = new Response(null, { status: 400 });
    logRequest(request, response, Date.now());

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain("WARN");
    expect(spy.mock.calls[0][0]).toContain("POST /api/test 400");
  });

  it("500レスポンスはerrorレベル", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const request = new Request("http://localhost:3000/api/test");
    const response = new Response(null, { status: 500 });
    logRequest(request, response, Date.now());

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain("ERROR");
  });

  it("durationが含まれる", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const request = new Request("http://localhost:3000/api/test");
    const response = new Response(null, { status: 200 });
    logRequest(request, response, Date.now() - 50);

    expect(spy.mock.calls[0][0]).toContain("ms");
  });
});

describe("withLogging", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("ハンドラの結果を返しログを出力する", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const handler = async (request: Request) => {
      void request;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };

    const wrapped = withLogging(handler);
    const request = new Request("http://localhost:3000/api/test");
    const response = await wrapped(request);

    expect(response.status).toBe(200);
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain("GET /api/test 200");
  });

  it("追加引数をハンドラに渡す", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const handler = async (_request: Request, ctx: { params: Promise<{ id: string }> }) => {
      const params = await ctx.params;
      return new Response(params.id, { status: 200 });
    };

    const wrapped = withLogging(handler);
    const request = new Request("http://localhost:3000/api/journal/j1");
    const response = await wrapped(request, { params: Promise.resolve({ id: "j1" }) });

    expect(await response.text()).toBe("j1");
  });
});
