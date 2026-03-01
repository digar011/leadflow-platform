import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  businessSchema,
  contactSchema,
  activitySchema,
  campaignSchema,
} from "@/lib/utils/validation";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "Password1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validData = {
    email: "user@example.com",
    password: "Password1",
    confirmPassword: "Password1",
    fullName: "John Doe",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "password1",
      confirmPassword: "password1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without digit", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "Password",
      confirmPassword: "Password",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short fullName", () => {
    const result = registerSchema.safeParse({
      ...validData,
      fullName: "A",
    });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });
});

describe("businessSchema", () => {
  it("accepts valid business with required field only", () => {
    const result = businessSchema.safeParse({
      business_name: "Acme Corp",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty business name", () => {
    const result = businessSchema.safeParse({
      business_name: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid full business data", () => {
    const result = businessSchema.safeParse({
      business_name: "Acme Corp",
      email: "contact@acme.com",
      phone: "555-123-4567",
      status: "qualified",
      lead_temperature: "hot",
      lead_score: 85,
      deal_value: 50000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative deal value", () => {
    const result = businessSchema.safeParse({
      business_name: "Acme Corp",
      deal_value: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = businessSchema.safeParse({
      business_name: "Acme Corp",
      status: "invalid_status",
    });
    expect(result.success).toBe(false);
  });

  it("rejects lead score above 100", () => {
    const result = businessSchema.safeParse({
      business_name: "Acme Corp",
      lead_score: 150,
    });
    expect(result.success).toBe(false);
  });

  it("defaults status to 'new'", () => {
    const result = businessSchema.safeParse({
      business_name: "Acme Corp",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("new");
    }
  });
});

describe("contactSchema", () => {
  const validUuid = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid contact", () => {
    const result = contactSchema.safeParse({
      business_id: validUuid,
      first_name: "John",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing first_name", () => {
    const result = contactSchema.safeParse({
      business_id: validUuid,
      first_name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid business_id", () => {
    const result = contactSchema.safeParse({
      business_id: "not-a-uuid",
      first_name: "John",
    });
    expect(result.success).toBe(false);
  });
});

describe("activitySchema", () => {
  const validUuid = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid activity", () => {
    const result = activitySchema.safeParse({
      business_id: validUuid,
      activity_type: "email_sent",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid activity type", () => {
    const result = activitySchema.safeParse({
      business_id: validUuid,
      activity_type: "invalid_type",
    });
    expect(result.success).toBe(false);
  });
});

describe("campaignSchema", () => {
  it("accepts valid campaign", () => {
    const result = campaignSchema.safeParse({
      name: "Summer Sale",
      campaign_type: "email",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty campaign name", () => {
    const result = campaignSchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("defaults status to draft", () => {
    const result = campaignSchema.safeParse({
      name: "Summer Sale",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("draft");
    }
  });
});
