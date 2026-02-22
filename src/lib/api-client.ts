import { showToast } from "@/stores/toast-store";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface FetchApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  showErrorToast?: boolean;
}

export async function fetchApi<T = unknown>(
  url: string,
  options: FetchApiOptions = {}
): Promise<ApiResponse<T>> {
  const { body, showErrorToast = true, ...init } = options;

  const fetchInit: RequestInit = {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  };

  if (body !== undefined) {
    fetchInit.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchInit);

    if (!response.ok) {
      const json = await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.href = "/login";
        return { success: false, error: { code: "UNAUTHORIZED", message: "認証が必要です" } };
      }

      const errorMessage =
        json?.error?.message || `エラーが発生しました（${response.status}）`;

      if (showErrorToast) {
        showToast(errorMessage, "error");
      }

      return {
        success: false,
        error: json?.error || { code: "UNKNOWN", message: errorMessage },
      };
    }

    const json: ApiResponse<T> = await response.json();
    return json;
  } catch {
    const message = "ネットワークエラーが発生しました。接続を確認してください。";
    if (showErrorToast) {
      showToast(message, "error", 5000);
    }
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message },
    };
  }
}
