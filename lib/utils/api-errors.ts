import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

/**
 * Standardized API error response format per CLAUDE.md:
 * { success: false, error: { code, message, details? } }
 *
 * Standardized API success response format:
 * { success: true, data, meta? }
 */

interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Create a standardized error NextResponse.
 */
function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = {
    success: false,
    error: { code, message },
  };
  if (details !== undefined) {
    body.error.details = details;
  }
  return NextResponse.json(body, { status });
}

export const ApiErrors = {
  /** 400 Bad Request */
  badRequest(message = "Bad request", details?: unknown) {
    return errorResponse(400, "BAD_REQUEST", message, details);
  },

  /** 401 Unauthorized */
  unauthorized(message = "Authentication required") {
    return errorResponse(401, "UNAUTHORIZED", message);
  },

  /** 403 Forbidden */
  forbidden(message = "You do not have permission to perform this action") {
    return errorResponse(403, "FORBIDDEN", message);
  },

  /** 404 Not Found */
  notFound(resource = "Resource") {
    return errorResponse(404, "NOT_FOUND", `${resource} not found`);
  },

  /** 422 Validation Error */
  validationError(details: unknown) {
    return errorResponse(422, "VALIDATION_ERROR", "Validation failed", details);
  },

  /** 429 Too Many Requests */
  rateLimited(message = "Rate limit exceeded") {
    return errorResponse(429, "RATE_LIMITED", message);
  },

  /** 500 Internal Server Error — never exposes internal details */
  internalError(message = "Internal server error") {
    return errorResponse(500, "INTERNAL_ERROR", message);
  },

  /** 503 Service Unavailable */
  serviceUnavailable(message = "Service temporarily unavailable") {
    return errorResponse(503, "SERVICE_UNAVAILABLE", message);
  },
} as const;

/**
 * Catch-all error handler for API routes.
 * Logs the real error with context, returns a safe generic response.
 */
export function handleApiError(
  error: unknown,
  context?: { route?: string; action?: string; userId?: string }
): NextResponse<ApiErrorBody> {
  const message = error instanceof Error ? error.message : String(error);
  logger.error("API error", { ...context, error: message });
  return ApiErrors.internalError();
}
