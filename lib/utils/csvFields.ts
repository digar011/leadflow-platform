// CSV field definitions for import/export
// Maps database column names to human-readable CSV headers

export interface CsvField {
  key: string;
  label: string;
}

export interface CsvImportField extends CsvField {
  required: boolean;
}

export const CSV_EXPORT_FIELDS: readonly CsvField[] = [
  { key: "business_name", label: "Business Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status" },
  { key: "lead_temperature", label: "Temperature" },
  { key: "lead_score", label: "Lead Score" },
  { key: "source", label: "Source" },
  { key: "deal_value", label: "Deal Value" },
  { key: "website_url", label: "Website" },
  { key: "street_address", label: "Street Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zip_code", label: "Zip Code" },
  { key: "country", label: "Country" },
  { key: "industry_category", label: "Industry" },
  { key: "business_type", label: "Business Type" },
  { key: "tags", label: "Tags" },
  { key: "notes", label: "Notes" },
  { key: "expected_close_date", label: "Expected Close Date" },
  { key: "next_follow_up", label: "Next Follow-up" },
  { key: "created_at", label: "Created At" },
] as const;

export const CSV_IMPORT_FIELDS: readonly CsvImportField[] = CSV_EXPORT_FIELDS
  .filter((f) => f.key !== "created_at")
  .map((f) => ({ ...f, required: f.key === "business_name" }));

// Build a label→key lookup for auto-mapping CSV headers
export function autoMapColumns(
  csvHeaders: string[]
): Record<string, string> {
  const mapping: Record<string, string> = {};
  const labelToKey = new Map<string, string>();

  for (const field of CSV_IMPORT_FIELDS) {
    labelToKey.set(field.label.toLowerCase(), field.key);
    labelToKey.set(field.key.toLowerCase(), field.key);
    // Also try without underscores
    labelToKey.set(field.key.replace(/_/g, " ").toLowerCase(), field.key);
  }

  for (const header of csvHeaders) {
    const normalized = header.trim().toLowerCase();
    const matched = labelToKey.get(normalized);
    if (matched) {
      mapping[header] = matched;
    }
  }

  return mapping;
}
