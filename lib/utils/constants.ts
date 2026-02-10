// Lead statuses
export const LEAD_STATUSES = [
  { value: "new", label: "New", color: "pipeline-new" },
  { value: "contacted", label: "Contacted", color: "pipeline-contacted" },
  { value: "qualified", label: "Qualified", color: "pipeline-qualified" },
  { value: "proposal", label: "Proposal", color: "pipeline-proposal" },
  { value: "negotiation", label: "Negotiation", color: "pipeline-negotiation" },
  { value: "won", label: "Won", color: "pipeline-won" },
  { value: "lost", label: "Lost", color: "pipeline-lost" },
  { value: "do_not_contact", label: "Do Not Contact", color: "text-muted" },
] as const;

// Lead temperatures
export const LEAD_TEMPERATURES = [
  { value: "cold", label: "Cold", color: "blue-500" },
  { value: "warm", label: "Warm", color: "orange-500" },
  { value: "hot", label: "Hot", color: "red-500" },
] as const;

// Activity types
export const ACTIVITY_TYPES = [
  { value: "email_sent", label: "Email Sent", icon: "Mail" },
  { value: "email_received", label: "Email Received", icon: "MailOpen" },
  { value: "email_opened", label: "Email Opened", icon: "Eye" },
  { value: "email_clicked", label: "Email Clicked", icon: "MousePointer" },
  { value: "call_outbound", label: "Outbound Call", icon: "PhoneOutgoing" },
  { value: "call_inbound", label: "Inbound Call", icon: "PhoneIncoming" },
  { value: "call_voicemail", label: "Voicemail", icon: "Voicemail" },
  { value: "sms_sent", label: "SMS Sent", icon: "MessageSquare" },
  { value: "sms_received", label: "SMS Received", icon: "MessageCircle" },
  { value: "meeting_scheduled", label: "Meeting Scheduled", icon: "Calendar" },
  { value: "meeting_completed", label: "Meeting Completed", icon: "CalendarCheck" },
  { value: "mailer_sent", label: "Mailer Sent", icon: "Send" },
  { value: "social_dm", label: "Social DM", icon: "AtSign" },
  { value: "social_comment", label: "Social Comment", icon: "MessageCircle" },
  { value: "landing_page_visit", label: "Page Visit", icon: "Globe" },
  { value: "landing_page_conversion", label: "Conversion", icon: "Target" },
  { value: "note", label: "Note", icon: "FileText" },
  { value: "status_change", label: "Status Change", icon: "RefreshCw" },
  { value: "task_completed", label: "Task Completed", icon: "CheckSquare" },
] as const;

// Campaign types
export const CAMPAIGN_TYPES = [
  { value: "email", label: "Email Campaign" },
  { value: "cold_call", label: "Cold Call Campaign" },
  { value: "mailer", label: "Direct Mail Campaign" },
  { value: "social", label: "Social Media Campaign" },
  { value: "multi_channel", label: "Multi-Channel Campaign" },
] as const;

// Campaign statuses
export const CAMPAIGN_STATUSES = [
  { value: "draft", label: "Draft", color: "text-muted" },
  { value: "active", label: "Active", color: "status-success" },
  { value: "paused", label: "Paused", color: "status-warning" },
  { value: "completed", label: "Completed", color: "status-info" },
] as const;

// Industry categories
export const INDUSTRY_CATEGORIES = [
  "Healthcare",
  "Technology",
  "Finance",
  "Real Estate",
  "Retail",
  "Manufacturing",
  "Construction",
  "Education",
  "Food & Beverage",
  "Professional Services",
  "Legal",
  "Automotive",
  "Travel & Hospitality",
  "Media & Entertainment",
  "Non-Profit",
  "Other",
] as const;

// Industries (for forms)
export const INDUSTRIES = [
  { value: "healthcare", label: "Healthcare" },
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "real_estate", label: "Real Estate" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "construction", label: "Construction" },
  { value: "education", label: "Education" },
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "professional_services", label: "Professional Services" },
  { value: "legal", label: "Legal" },
  { value: "automotive", label: "Automotive" },
  { value: "travel_hospitality", label: "Travel & Hospitality" },
  { value: "media_entertainment", label: "Media & Entertainment" },
  { value: "non_profit", label: "Non-Profit" },
  { value: "other", label: "Other" },
] as const;

// Lead sources
export const LEAD_SOURCES = [
  { value: "google_maps", label: "Google Maps" },
  { value: "yelp", label: "Yelp" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "cold_outreach", label: "Cold Outreach" },
  { value: "trade_show", label: "Trade Show" },
  { value: "social_media", label: "Social Media" },
  { value: "manual", label: "Manual Entry" },
  { value: "import", label: "Data Import" },
  { value: "webhook", label: "Webhook/API" },
  { value: "other", label: "Other" },
] as const;

// Automation triggers
export const AUTOMATION_TRIGGERS = [
  { value: "lead_created", label: "Lead Created" },
  { value: "lead_updated", label: "Lead Updated" },
  { value: "status_changed", label: "Status Changed" },
  { value: "score_threshold", label: "Score Threshold Reached" },
  { value: "inactivity", label: "Inactivity Period" },
  { value: "date_based", label: "Date-Based Trigger" },
  { value: "form_submission", label: "Form Submission" },
] as const;

// Automation actions
export const AUTOMATION_ACTIONS = [
  { value: "send_email", label: "Send Email Notification" },
  { value: "create_task", label: "Create Task" },
  { value: "assign_user", label: "Assign to User" },
  { value: "update_status", label: "Update Status" },
  { value: "update_score", label: "Update Lead Score" },
  { value: "add_to_campaign", label: "Add to Campaign" },
  { value: "send_webhook", label: "Send Webhook" },
  { value: "add_tag", label: "Add Tag" },
] as const;

// Report types
export const REPORT_TYPES = [
  { value: "leads", label: "Leads Report" },
  { value: "activities", label: "Activity Report" },
  { value: "campaigns", label: "Campaign Report" },
  { value: "pipeline", label: "Pipeline Report" },
  { value: "team", label: "Team Performance Report" },
  { value: "custom", label: "Custom Report" },
] as const;

// Date range presets
export const DATE_RANGE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "last_quarter", label: "Last Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// App info
export const APP_NAME = "Goldyon";
export const APP_DESCRIPTION = "Lead Intelligence & CRM Platform";
export const APP_VERSION = "1.0.0";

// API rate limits
export const RATE_LIMITS = {
  api: { requests: 100, windowMs: 60000 },
  auth: { requests: 10, windowMs: 60000 },
  webhook: { requests: 100, windowMs: 60000 },
  export: { requests: 5, windowMs: 60000 },
} as const;
