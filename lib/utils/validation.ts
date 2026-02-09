import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Business/Lead schemas
export const businessSchema = z.object({
  business_name: z
    .string()
    .min(1, "Business name is required")
    .max(255)
    .trim(),
  business_type: z.string().max(100).optional().nullable(),
  industry_category: z.string().max(100).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  website_url: z.string().max(500).optional().or(z.literal("")).nullable(),
  street_address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  zip_code: z.string().max(20).optional().nullable(),
  country: z.string().max(100).default("US"),
  linkedin_url: z.string().max(500).optional().or(z.literal("")).nullable(),
  facebook_url: z.string().max(500).optional().or(z.literal("")).nullable(),
  instagram_url: z.string().max(500).optional().or(z.literal("")).nullable(),
  status: z.enum([
    "new",
    "contacted",
    "qualified",
    "proposal",
    "negotiation",
    "won",
    "lost",
    "do_not_contact",
  ]).default("new"),
  lead_temperature: z.enum(["cold", "warm", "hot"]).default("cold"),
  lead_score: z.number().int().min(0).max(100).default(0),
  source: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
  deal_value: z.number().positive().max(999999999).optional().nullable(),
  expected_close_date: z.string().optional().nullable(),
  next_follow_up: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
});

// Contact schema
export const contactSchema = z.object({
  business_id: z.string().uuid("Invalid business ID"),
  first_name: z.string().min(1, "First name is required").max(100).trim(),
  last_name: z.string().max(100).optional().nullable(),
  title: z.string().max(100).optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().max(30).optional().nullable(),
  linkedin_url: z.string().max(500).optional().or(z.literal("")).nullable(),
  is_primary: z.boolean().default(false),
});

// Activity schema
export const activitySchema = z.object({
  business_id: z.string().uuid("Invalid business ID"),
  contact_id: z.string().uuid().optional().nullable(),
  activity_type: z.enum([
    "email_sent",
    "email_received",
    "email_opened",
    "email_clicked",
    "call_outbound",
    "call_inbound",
    "call_voicemail",
    "sms_sent",
    "sms_received",
    "meeting_scheduled",
    "meeting_completed",
    "mailer_sent",
    "social_dm",
    "social_comment",
    "landing_page_visit",
    "landing_page_conversion",
    "note",
    "status_change",
    "task_completed",
  ]),
  subject: z.string().max(255).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  outcome: z.enum(["positive", "negative", "neutral", "pending"]).optional().nullable(),
  scheduled_at: z.string().datetime().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

// Campaign schema
export const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(255).trim(),
  description: z.string().max(2000).optional().nullable(),
  campaign_type: z.enum(["email", "cold_call", "mailer", "social", "multi_channel"]).optional().nullable(),
  status: z.enum(["draft", "active", "paused", "completed"]).default("draft"),
  target_criteria: z.record(z.unknown()).optional().nullable(),
  budget: z.number().positive().max(999999999).optional().nullable(),
  started_at: z.string().datetime().optional().nullable(),
  ended_at: z.string().datetime().optional().nullable(),
});

// Automation rule schema
export const automationRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required").max(255).trim(),
  description: z.string().max(1000).optional().nullable(),
  trigger_type: z.enum([
    "lead_created",
    "lead_updated",
    "status_changed",
    "score_threshold",
    "inactivity",
    "date_based",
    "form_submission",
  ]),
  trigger_config: z.record(z.unknown()),
  action_type: z.enum([
    "send_email",
    "create_task",
    "assign_user",
    "update_status",
    "update_score",
    "add_to_campaign",
    "send_webhook",
    "add_tag",
  ]),
  action_config: z.record(z.unknown()),
  is_active: z.boolean().default(true),
  priority: z.number().int().min(1).max(100).default(50),
});

// Webhook payload schema
export const webhookPayloadSchema = z.object({
  event: z.enum([
    "lead.created",
    "lead.updated",
    "lead.deleted",
    "contact.created",
    "contact.updated",
    "activity.logged",
    "status.changed",
  ]),
  data: z.record(z.unknown()),
  timestamp: z.string().datetime(),
});

// Report schema
export const reportSchema = z.object({
  name: z.string().min(1, "Report name is required").max(255).trim(),
  description: z.string().max(1000).optional().nullable(),
  report_type: z.enum(["leads", "activities", "campaigns", "pipeline", "team", "custom"]),
  filters: z.record(z.unknown()),
  columns: z.array(z.string()),
  grouping: z.record(z.unknown()).optional().nullable(),
  schedule: z.enum(["daily", "weekly", "monthly", "none"]).optional().nullable(),
  recipients: z.array(z.string().email()).optional().nullable(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type BusinessInput = z.infer<typeof businessSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type AutomationRuleInput = z.infer<typeof automationRuleSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
