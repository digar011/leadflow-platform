import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDateRange,
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatCompactNumber,
  formatPercentage,
  formatPhone,
  formatPhoneNumber,
  formatName,
  getInitials,
  formatAddress,
  formatLeadStatus,
  formatLeadTemperature,
  formatActivityType,
  truncateText,
  pluralize,
  formatFileSize,
  formatUrl,
  ensureHttps,
} from "@/lib/utils/formatters";

describe("formatDate", () => {
  it("formats a date string with default pattern", () => {
    expect(formatDate("2025-06-15T10:30:00Z")).toBe("Jun 15, 2025");
  });

  it("formats a Date object", () => {
    expect(formatDate(new Date(2025, 0, 1))).toBe("Jan 1, 2025");
  });

  it("formats with a custom pattern", () => {
    expect(formatDate("2025-06-15T10:30:00Z", "yyyy-MM-dd")).toBe("2025-06-15");
  });

  it("returns 'Invalid date' for invalid input", () => {
    expect(formatDate("not-a-date")).toBe("Invalid date");
  });
});

describe("formatDateTime", () => {
  it("includes time in the output", () => {
    const result = formatDateTime("2025-06-15T10:30:00Z");
    expect(result).toMatch(/Jun 15, 2025/);
    expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
  });
});

describe("formatRelativeTime", () => {
  it("returns a relative time string", () => {
    const recent = new Date(Date.now() - 60000).toISOString();
    expect(formatRelativeTime(recent)).toMatch(/minute/);
  });

  it("returns 'Invalid date' for invalid input", () => {
    expect(formatRelativeTime("bad")).toBe("Invalid date");
  });
});

describe("formatDateRange", () => {
  it("returns a formatted date range", () => {
    expect(formatDateRange("2025-01-01", "2025-12-31")).toBe(
      "Jan 1, 2025 - Dec 31, 2025"
    );
  });
});

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    expect(formatCurrency(1500)).toBe("$1,500");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats large numbers", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000");
  });
});

describe("formatCurrencyCompact", () => {
  it("formats millions as M", () => {
    expect(formatCurrencyCompact(2500000)).toBe("$2.5M");
  });

  it("formats thousands as K", () => {
    expect(formatCurrencyCompact(15000)).toBe("$15.0K");
  });

  it("returns standard format for small amounts", () => {
    expect(formatCurrencyCompact(500)).toBe("$500");
  });
});

describe("formatNumber", () => {
  it("formats with locale separators", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });
});

describe("formatCompactNumber", () => {
  it("formats millions as M", () => {
    expect(formatCompactNumber(5000000)).toBe("5.0M");
  });

  it("formats thousands as K", () => {
    expect(formatCompactNumber(2500)).toBe("2.5K");
  });

  it("returns plain number for small values", () => {
    expect(formatCompactNumber(42)).toBe("42");
  });
});

describe("formatPercentage", () => {
  it("formats with default precision", () => {
    expect(formatPercentage(85.678)).toBe("85.7%");
  });

  it("formats with custom precision", () => {
    expect(formatPercentage(85.678, 2)).toBe("85.68%");
  });
});

describe("formatPhone", () => {
  it("formats 10-digit US phone", () => {
    expect(formatPhone("5551234567")).toBe("(555) 123-4567");
  });

  it("formats 11-digit US phone with country code", () => {
    expect(formatPhone("15551234567")).toBe("+1 (555) 123-4567");
  });

  it("returns original for non-standard format", () => {
    expect(formatPhone("+44 20 7123 4567")).toBe("+44 20 7123 4567");
  });

  it("strips non-digits for matching", () => {
    expect(formatPhone("(555) 123-4567")).toBe("(555) 123-4567");
  });

  it("is aliased as formatPhoneNumber", () => {
    expect(formatPhoneNumber).toBe(formatPhone);
  });
});

describe("formatName", () => {
  it("joins first and last name", () => {
    expect(formatName("John", "Doe")).toBe("John Doe");
  });

  it("returns first name only", () => {
    expect(formatName("John", null)).toBe("John");
  });

  it("returns 'Unknown' if no name", () => {
    expect(formatName(null, null)).toBe("Unknown");
  });

  it("returns 'Unknown' for undefined", () => {
    expect(formatName()).toBe("Unknown");
  });
});

describe("getInitials", () => {
  it("returns two initials", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns single initial for single name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("caps at two characters", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });
});

describe("formatAddress", () => {
  it("formats a full US address", () => {
    expect(formatAddress("123 Main St", "Springfield", "IL", "62704", "US")).toBe(
      "123 Main St, Springfield, IL, 62704"
    );
  });

  it("includes country when not US", () => {
    expect(formatAddress("10 Downing St", "London", null, "SW1A 2AA", "UK")).toBe(
      "10 Downing St, London, SW1A 2AA, UK"
    );
  });

  it("handles missing fields", () => {
    expect(formatAddress(null, "Denver", "CO")).toBe("Denver, CO");
  });
});

describe("formatLeadStatus", () => {
  it("maps known statuses", () => {
    expect(formatLeadStatus("new")).toBe("New");
    expect(formatLeadStatus("won")).toBe("Won");
    expect(formatLeadStatus("do_not_contact")).toBe("Do Not Contact");
  });

  it("returns raw value for unknown status", () => {
    expect(formatLeadStatus("unknown_status")).toBe("unknown_status");
  });
});

describe("formatLeadTemperature", () => {
  it("maps known temperatures", () => {
    expect(formatLeadTemperature("cold")).toBe("Cold");
    expect(formatLeadTemperature("warm")).toBe("Warm");
    expect(formatLeadTemperature("hot")).toBe("Hot");
  });

  it("returns raw value for unknown", () => {
    expect(formatLeadTemperature("lukewarm")).toBe("lukewarm");
  });
});

describe("formatActivityType", () => {
  it("maps known activity types", () => {
    expect(formatActivityType("email_sent")).toBe("Email Sent");
    expect(formatActivityType("call_outbound")).toBe("Outbound Call");
    expect(formatActivityType("note")).toBe("Note");
  });

  it("returns raw value for unknown type", () => {
    expect(formatActivityType("something")).toBe("something");
  });
});

describe("truncateText", () => {
  it("does not truncate short text", () => {
    expect(truncateText("hello", 10)).toBe("hello");
  });

  it("truncates long text with ellipsis", () => {
    expect(truncateText("hello world this is long", 10)).toBe("hello w...");
  });

  it("handles exact boundary", () => {
    expect(truncateText("12345", 5)).toBe("12345");
  });
});

describe("pluralize", () => {
  it("returns singular for 1", () => {
    expect(pluralize(1, "lead")).toBe("lead");
  });

  it("returns plural for 0", () => {
    expect(pluralize(0, "lead")).toBe("leads");
  });

  it("returns plural for > 1", () => {
    expect(pluralize(5, "lead")).toBe("leads");
  });

  it("uses custom plural form", () => {
    expect(pluralize(3, "person", "people")).toBe("people");
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500.0 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(5242880)).toBe("5.0 MB");
  });

  it("formats gigabytes", () => {
    expect(formatFileSize(2147483648)).toBe("2.0 GB");
  });
});

describe("formatUrl", () => {
  it("strips http://", () => {
    expect(formatUrl("http://example.com/")).toBe("example.com");
  });

  it("strips https://", () => {
    expect(formatUrl("https://example.com/page")).toBe("example.com/page");
  });
});

describe("ensureHttps", () => {
  it("returns empty string for empty input", () => {
    expect(ensureHttps("")).toBe("");
  });

  it("preserves existing https://", () => {
    expect(ensureHttps("https://example.com")).toBe("https://example.com");
  });

  it("preserves existing http://", () => {
    expect(ensureHttps("http://example.com")).toBe("http://example.com");
  });

  it("prepends https:// to bare domains", () => {
    expect(ensureHttps("example.com")).toBe("https://example.com");
  });
});
