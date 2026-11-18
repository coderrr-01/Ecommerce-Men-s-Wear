type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel = (process.env.LOG_LEVEL ?? "info") as LogLevel;
const minimumWeight = LEVEL_WEIGHT[configuredLevel] ?? LEVEL_WEIGHT.info;
const SENSITIVE_KEY =
  /password|secret|token|authorization|cookie|api[-_]?key|email|phone|mobile|address/i;

function maskSensitiveText(value: string): string {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/(?<!\d)(?:\+?91[\s-]?)?[6-9]\d{9}(?!\d)/g, "[phone]");
}

function serializeError(error: Error): Record<string, unknown> {
  return {
    name: error.name,
  };
}

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[truncated]";
  if (value instanceof Error) return serializeError(value);
  if (Array.isArray(value)) return value.map((entry) => redact(entry, depth + 1));

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        SENSITIVE_KEY.test(key) ? "[redacted]" : redact(entry, depth + 1),
      ]),
    );
  }

  return typeof value === "string" ? maskSensitiveText(value) : value;
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (LEVEL_WEIGHT[level] < minimumWeight) return;

  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...(meta ? { meta: redact(meta) } : {}),
  };

  const payload = JSON.stringify(entry);
  if (level === "error") {
    console.error(payload);
  } else if (level === "warn") {
    console.warn(payload);
  } else {
    console.info(payload);
  }
}

/** Structured, redacting logger. Never log raw credentials or provider secrets. */
export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => write("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
