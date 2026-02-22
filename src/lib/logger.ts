type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function formatLog(entry: LogEntry): string {
  const { level, message, timestamp, ...extra } = entry;
  const extraStr = Object.keys(extra).length > 0 ? ` ${JSON.stringify(extra)}` : "";
  return `[${timestamp}] ${level.toUpperCase()} ${message}${extraStr}`;
}

function log(level: LogLevel, message: string, extra?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...extra,
  };

  const formatted = formatLog(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.debug(formatted);
      }
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  info: (message: string, extra?: Record<string, unknown>) => log("info", message, extra),
  warn: (message: string, extra?: Record<string, unknown>) => log("warn", message, extra),
  error: (message: string, extra?: Record<string, unknown>) => log("error", message, extra),
  debug: (message: string, extra?: Record<string, unknown>) => log("debug", message, extra),
};

export function logRequest(request: Request, response: Response, startTime: number) {
  const duration = Date.now() - startTime;
  const url = new URL(request.url);

  const level = response.status >= 500 ? "error" : response.status >= 400 ? "warn" : "info";
  logger[level](`${request.method} ${url.pathname} ${response.status}`, {
    method: request.method,
    path: url.pathname,
    status: response.status,
    duration: `${duration}ms`,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withLogging<T extends (request: Request, ...args: any[]) => Promise<Response>>(
  handler: T
): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrapped = async (request: Request, ...args: any[]) => {
    const startTime = Date.now();
    const response = await handler(request, ...args);
    logRequest(request, response, startTime);
    return response;
  };
  return wrapped as T;
}
