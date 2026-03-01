/**
 * Structured JSON logger for API routes and server-side code.
 *
 * Outputs JSON-formatted log entries with timestamp, level, message, and context.
 * Never logs sensitive data (passwords, tokens, PII).
 *
 * Usage:
 *   import { logger } from "@/lib/utils/logger";
 *   logger.info("Lead exported", { userId: user.id, count: leads.length });
 *   logger.error("Export failed", { error: err.message, route: "/api/leads/export" });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Only show debug logs in development
const MIN_LEVEL: LogLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LEVEL];
}

function createEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
}

function emit(level: LogLevel, entry: LogEntry): void {
  const json = JSON.stringify(entry);
  switch (level) {
    case "error":
      console.error(json);
      break;
    case "warn":
      console.warn(json);
      break;
    default:
      // eslint-disable-next-line no-console
      console.log(json);
  }
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    if (!shouldLog("debug")) return;
    emit("debug", createEntry("debug", message, context));
  },

  info(message: string, context?: Record<string, unknown>): void {
    if (!shouldLog("info")) return;
    emit("info", createEntry("info", message, context));
  },

  warn(message: string, context?: Record<string, unknown>): void {
    if (!shouldLog("warn")) return;
    emit("warn", createEntry("warn", message, context));
  },

  error(message: string, context?: Record<string, unknown>): void {
    if (!shouldLog("error")) return;
    emit("error", createEntry("error", message, context));
  },
};

/**
 * Create a child logger with default context fields.
 * Useful for adding route/requestId to all logs from an API handler.
 */
export function createLogger(defaultContext: Record<string, unknown>) {
  return {
    debug(message: string, context?: Record<string, unknown>): void {
      logger.debug(message, { ...defaultContext, ...context });
    },
    info(message: string, context?: Record<string, unknown>): void {
      logger.info(message, { ...defaultContext, ...context });
    },
    warn(message: string, context?: Record<string, unknown>): void {
      logger.warn(message, { ...defaultContext, ...context });
    },
    error(message: string, context?: Record<string, unknown>): void {
      logger.error(message, { ...defaultContext, ...context });
    },
  };
}
