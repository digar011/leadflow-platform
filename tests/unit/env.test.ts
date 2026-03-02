import { validateEnv } from "@/lib/utils/env";

describe("validateEnv", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws when required vars are missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_APP_URL;

    expect(() => validateEnv()).toThrow("Missing required environment variables");
  });

  it("throws mentioning specific missing vars", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    expect(() => validateEnv()).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("does not throw when all required vars are set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    expect(() => validateEnv()).not.toThrow();
  });

  it("warns about missing recommended vars", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    delete process.env.STRIPE_SECRET_KEY;

    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    validateEnv();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Missing optional env vars")
    );
    warnSpy.mockRestore();
  });

  it("does not warn when all recommended vars are set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "key";
    process.env.STRIPE_SECRET_KEY = "key";
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "key";
    process.env.STRIPE_WEBHOOK_SECRET = "key";
    process.env.RESEND_API_KEY = "key";
    process.env.STRIPE_PRICE_STARTER_MONTHLY = "price_1";
    process.env.STRIPE_PRICE_STARTER_ANNUAL = "price_2";
    process.env.STRIPE_PRICE_GROWTH_MONTHLY = "price_3";
    process.env.STRIPE_PRICE_GROWTH_ANNUAL = "price_4";
    process.env.STRIPE_PRICE_BUSINESS_MONTHLY = "price_5";
    process.env.STRIPE_PRICE_BUSINESS_ANNUAL = "price_6";

    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    validateEnv();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
