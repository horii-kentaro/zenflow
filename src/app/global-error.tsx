"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fafafa",
            padding: "1rem",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <div style={{ fontSize: "3.75rem", marginBottom: "1rem" }}>⚠️</div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#171717",
                marginBottom: "0.5rem",
              }}
            >
              重大なエラーが発生しました
            </h1>
            <p style={{ color: "#737373", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              アプリケーションで予期しないエラーが発生しました。
              ページを再読み込みしてください。
            </p>
            {error.digest && (
              <p style={{ color: "#a3a3a3", fontSize: "0.75rem", marginBottom: "1rem" }}>
                エラーID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: "0.625rem 1.5rem",
                backgroundColor: "#0d9488",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              再読み込み
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
