import { logger, createLogger } from "@/lib/utils/logger";

describe("logger", () => {
  let consoleSpy: {
    log: jest.SpiedFunction<typeof console.log>;
    warn: jest.SpiedFunction<typeof console.warn>;
    error: jest.SpiedFunction<typeof console.error>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, "log").mockImplementation(),
      warn: jest.spyOn(console, "warn").mockImplementation(),
      error: jest.spyOn(console, "error").mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("logger.info outputs JSON with timestamp, level, message", () => {
    logger.info("test message");
    expect(consoleSpy.log).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(consoleSpy.log.mock.calls[0][0] as string);
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("test message");
    expect(parsed.timestamp).toBeDefined();
  });

  it("logger.info includes context fields", () => {
    logger.info("with context", { userId: "123", route: "/api/test" });
    const parsed = JSON.parse(consoleSpy.log.mock.calls[0][0] as string);
    expect(parsed.userId).toBe("123");
    expect(parsed.route).toBe("/api/test");
  });

  it("logger.warn uses console.warn", () => {
    logger.warn("warning");
    expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(consoleSpy.warn.mock.calls[0][0] as string);
    expect(parsed.level).toBe("warn");
  });

  it("logger.error uses console.error", () => {
    logger.error("error occurred");
    expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(consoleSpy.error.mock.calls[0][0] as string);
    expect(parsed.level).toBe("error");
  });

  it("logger.debug outputs in non-production", () => {
    logger.debug("debug info");
    // In test env (not production), debug should output
    expect(consoleSpy.log).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(consoleSpy.log.mock.calls[0][0] as string);
    expect(parsed.level).toBe("debug");
  });
});

describe("createLogger", () => {
  let consoleSpy: jest.SpiedFunction<typeof console.log>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("includes default context in all messages", () => {
    const log = createLogger({ route: "/api/leads", requestId: "abc" });
    log.info("test");
    const parsed = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(parsed.route).toBe("/api/leads");
    expect(parsed.requestId).toBe("abc");
    expect(parsed.message).toBe("test");
  });

  it("merges call-specific context with defaults", () => {
    const log = createLogger({ route: "/api/test" });
    log.info("merged", { userId: "u1" });
    const parsed = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(parsed.route).toBe("/api/test");
    expect(parsed.userId).toBe("u1");
  });

  it("call-specific context overrides defaults", () => {
    const log = createLogger({ route: "/default" });
    log.info("override", { route: "/override" });
    const parsed = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(parsed.route).toBe("/override");
  });
});
