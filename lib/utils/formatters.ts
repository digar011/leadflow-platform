import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

// Date formatting
export function formatDate(date: string | Date, pattern: string = "MMM d, yyyy"): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "Invalid date";
  return format(parsedDate, pattern);
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "MMM d, yyyy h:mm a");
}

export function formatRelativeTime(date: string | Date): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "Invalid date";
  return formatDistanceToNow(parsedDate, { addSuffix: true });
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

// Currency formatting
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyCompact(
  amount: number,
  currency: string = "USD"
): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount, currency);
}

// Number formatting
export function formatNumber(num: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Phone formatting
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
export const formatPhoneNumber = formatPhone;

// Name formatting
export function formatName(firstName?: string | null, lastName?: string | null): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(" ") || "Unknown";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

// Address formatting
export function formatAddress(
  street?: string | null,
  city?: string | null,
  state?: string | null,
  zipCode?: string | null,
  country?: string | null
): string {
  const parts = [
    street,
    [city, state].filter(Boolean).join(", "),
    zipCode,
    country !== "US" ? country : null,
  ].filter(Boolean);
  return parts.join(", ");
}

// Lead status formatting
const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
  do_not_contact: "Do Not Contact",
};

export function formatLeadStatus(status: string): string {
  return statusLabels[status] || status;
}

// Temperature formatting
const temperatureLabels: Record<string, string> = {
  cold: "Cold",
  warm: "Warm",
  hot: "Hot",
};

export function formatLeadTemperature(temperature: string): string {
  return temperatureLabels[temperature] || temperature;
}

// Activity type formatting
const activityTypeLabels: Record<string, string> = {
  email_sent: "Email Sent",
  email_received: "Email Received",
  email_opened: "Email Opened",
  email_clicked: "Email Clicked",
  call_outbound: "Outbound Call",
  call_inbound: "Inbound Call",
  call_voicemail: "Voicemail",
  sms_sent: "SMS Sent",
  sms_received: "SMS Received",
  meeting_scheduled: "Meeting Scheduled",
  meeting_completed: "Meeting Completed",
  mailer_sent: "Mailer Sent",
  social_dm: "Social DM",
  social_comment: "Social Comment",
  landing_page_visit: "Page Visit",
  landing_page_conversion: "Conversion",
  note: "Note",
  status_change: "Status Change",
  task_completed: "Task Completed",
};

export function formatActivityType(type: string): string {
  return activityTypeLabels[type] || type;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

// Pluralize
export function pluralize(count: number, singular: string, plural?: string): string {
  const pluralForm = plural || `${singular}s`;
  return count === 1 ? singular : pluralForm;
}

// File size formatting
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// URL formatting
export function formatUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ensureHttps(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}
