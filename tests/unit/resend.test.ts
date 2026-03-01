// Mock the resend module before importing
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation((key: string) => ({ apiKey: key })),
}));

describe("getResend", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("throws when RESEND_API_KEY is not set", () => {
    delete process.env.RESEND_API_KEY;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getResend } = require("@/lib/email/resend");
    expect(() => getResend()).toThrow("RESEND_API_KEY is not configured");
  });

  it("throws when RESEND_API_KEY is empty string", () => {
    process.env.RESEND_API_KEY = "";
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getResend } = require("@/lib/email/resend");
    expect(() => getResend()).toThrow("RESEND_API_KEY is not configured");
  });

  it("returns Resend instance when API key is set", () => {
    process.env.RESEND_API_KEY = "re_test_123";
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getResend } = require("@/lib/email/resend");
    const client = getResend();
    expect(client).toBeDefined();
    expect(client.apiKey).toBe("re_test_123");
  });

  it("returns cached instance on subsequent calls", () => {
    process.env.RESEND_API_KEY = "re_test_456";
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getResend } = require("@/lib/email/resend");
    const first = getResend();
    const second = getResend();
    expect(first).toBe(second);
  });

  it("exports EMAIL_FROM with default value", () => {
    process.env.RESEND_API_KEY = "re_test_789";
    delete process.env.EMAIL_FROM;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EMAIL_FROM } = require("@/lib/email/resend");
    expect(EMAIL_FROM).toBe("Goldyon <noreply@goldyon.com>");
  });
});
