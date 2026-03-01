import {
  CSV_EXPORT_FIELDS,
  CSV_IMPORT_FIELDS,
  autoMapColumns,
} from "@/lib/utils/csvFields";

describe("CSV_EXPORT_FIELDS", () => {
  it("has business_name as first field", () => {
    expect(CSV_EXPORT_FIELDS[0].key).toBe("business_name");
  });

  it("includes created_at", () => {
    expect(CSV_EXPORT_FIELDS.some((f) => f.key === "created_at")).toBe(true);
  });
});

describe("CSV_IMPORT_FIELDS", () => {
  it("excludes created_at from import fields", () => {
    expect(CSV_IMPORT_FIELDS.some((f) => f.key === "created_at")).toBe(false);
  });

  it("marks business_name as required", () => {
    const bnField = CSV_IMPORT_FIELDS.find((f) => f.key === "business_name");
    expect(bnField?.required).toBe(true);
  });

  it("marks other fields as not required", () => {
    const emailField = CSV_IMPORT_FIELDS.find((f) => f.key === "email");
    expect(emailField?.required).toBe(false);
  });
});

describe("autoMapColumns", () => {
  it("maps exact label matches (case-insensitive)", () => {
    const result = autoMapColumns(["Business Name", "Email", "Phone"]);
    expect(result["Business Name"]).toBe("business_name");
    expect(result["Email"]).toBe("email");
    expect(result["Phone"]).toBe("phone");
  });

  it("maps column key names (snake_case)", () => {
    const result = autoMapColumns(["business_name", "email", "phone"]);
    expect(result["business_name"]).toBe("business_name");
    expect(result["email"]).toBe("email");
  });

  it("maps column names with spaces instead of underscores", () => {
    const result = autoMapColumns(["business name", "lead temperature"]);
    expect(result["business name"]).toBe("business_name");
    expect(result["lead temperature"]).toBe("lead_temperature");
  });

  it("ignores unrecognized columns", () => {
    const result = autoMapColumns(["Business Name", "Random Column"]);
    expect(result["Business Name"]).toBe("business_name");
    expect(result["Random Column"]).toBeUndefined();
  });

  it("handles empty headers", () => {
    const result = autoMapColumns([]);
    expect(result).toEqual({});
  });

  it("handles headers with extra whitespace", () => {
    const result = autoMapColumns(["  Business Name  ", "  Email  "]);
    expect(result["  Business Name  "]).toBe("business_name");
    expect(result["  Email  "]).toBe("email");
  });
});
