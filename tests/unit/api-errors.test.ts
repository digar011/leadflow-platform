/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock next/server before importing api-errors
const mockJson = jest.fn((body: unknown, init?: { status?: number }) => ({
  status: init?.status ?? 200,
  json: () => Promise.resolve(body),
}));

jest.mock("next/server", () => ({
  NextResponse: { json: mockJson },
}));

// Mock the logger to prevent console output during tests
jest.mock("@/lib/utils/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

import { ApiErrors, handleApiError } from "@/lib/utils/api-errors";

describe("ApiErrors", () => {
  beforeEach(() => {
    mockJson.mockClear();
  });

  describe("badRequest", () => {
    it("returns 400 with default message", async () => {
      const res = ApiErrors.badRequest() as any;
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({
        success: false,
        error: { code: "BAD_REQUEST", message: "Bad request" },
      });
    });

    it("returns 400 with custom message and details", async () => {
      const res = ApiErrors.badRequest("Missing field", { field: "name" }) as any;
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Missing field",
          details: { field: "name" },
        },
      });
    });
  });

  describe("unauthorized", () => {
    it("returns 401 with default message", async () => {
      const res = ApiErrors.unauthorized() as any;
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toEqual({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
    });

    it("returns 401 with custom message", async () => {
      const res = ApiErrors.unauthorized("Token expired") as any;
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.message).toBe("Token expired");
    });
  });

  describe("forbidden", () => {
    it("returns 403 with default message", async () => {
      const res = ApiErrors.forbidden() as any;
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body).toEqual({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action",
        },
      });
    });
  });

  describe("notFound", () => {
    it("returns 404 with default resource", async () => {
      const res = ApiErrors.notFound() as any;
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error.message).toBe("Resource not found");
    });

    it("returns 404 with named resource", async () => {
      const res = ApiErrors.notFound("User") as any;
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error.message).toBe("User not found");
    });
  });

  describe("validationError", () => {
    it("returns 422 with details", async () => {
      const details = [{ field: "email", message: "Invalid email" }];
      const res = ApiErrors.validationError(details) as any;
      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body).toEqual({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details,
        },
      });
    });
  });

  describe("rateLimited", () => {
    it("returns 429 with default message", async () => {
      const res = ApiErrors.rateLimited() as any;
      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.error.code).toBe("RATE_LIMITED");
    });

    it("returns 429 with custom message", async () => {
      const res = ApiErrors.rateLimited("Max 5 exports per minute") as any;
      const body = await res.json();
      expect(body.error.message).toBe("Max 5 exports per minute");
    });
  });

  describe("internalError", () => {
    it("returns 500 with default message", async () => {
      const res = ApiErrors.internalError() as any;
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body).toEqual({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      });
    });

    it("never includes stack traces or raw error details", async () => {
      const res = ApiErrors.internalError() as any;
      const body = await res.json();
      expect(body.error.details).toBeUndefined();
      expect(JSON.stringify(body)).not.toContain("stack");
    });
  });

  describe("serviceUnavailable", () => {
    it("returns 503 with default message", async () => {
      const res = ApiErrors.serviceUnavailable() as any;
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.error.code).toBe("SERVICE_UNAVAILABLE");
    });
  });
});

describe("handleApiError", () => {
  const { logger } = jest.requireMock("@/lib/utils/logger");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs the error with context and returns 500", async () => {
    const err = new Error("DB connection failed");
    const res = handleApiError(err, { route: "/api/test", userId: "u1" }) as any;

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(body.error.message).toBe("Internal server error");

    expect(logger.error).toHaveBeenCalledWith("API error", {
      route: "/api/test",
      userId: "u1",
      error: "DB connection failed",
    });
  });

  it("handles non-Error throwables", async () => {
    const res = handleApiError("string error", { route: "/api/test" }) as any;
    expect(res.status).toBe(500);

    expect(logger.error).toHaveBeenCalledWith("API error", {
      route: "/api/test",
      error: "string error",
    });
  });

  it("works without context", async () => {
    handleApiError(new Error("oops"));
    expect(logger.error).toHaveBeenCalledWith("API error", {
      error: "oops",
    });
  });

  it("does not expose internal error details in response", async () => {
    const err = new Error("FATAL: password authentication failed for user 'admin'");
    const res = handleApiError(err) as any;
    const body = await res.json();

    expect(JSON.stringify(body)).not.toContain("password");
    expect(JSON.stringify(body)).not.toContain("FATAL");
  });
});
