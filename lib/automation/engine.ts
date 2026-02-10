import { createClient } from "@supabase/supabase-js";
import { getResend, EMAIL_FROM } from "@/lib/email/resend";
import {
  getWelcomeEmailHtml,
  getWelcomeEmailSubject,
} from "@/lib/email/templates";

// Lazy service role client for server-side automation execution
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface TriggerData {
  businessId: string;
  businessName: string;
  email?: string | null;
  contactName?: string | null;
  [key: string]: unknown;
}

export interface ExecutionResult {
  ruleId: string;
  ruleName: string;
  status: "success" | "failed" | "skipped";
  error?: string;
}

/**
 * Execute all active automation rules matching a trigger type for a user.
 */
export async function executeAutomationRules(
  triggerType: string,
  triggerData: TriggerData,
  userId: string
): Promise<ExecutionResult[]> {
  const supabase = getSupabase();

  const { data: rules, error: fetchError } = await supabase
    .from("automation_rules")
    .select("*")
    .eq("trigger_type", triggerType)
    .eq("is_active", true)
    .eq("created_by", userId)
    .order("priority", { ascending: true });

  if (fetchError || !rules?.length) {
    return [];
  }

  const results: ExecutionResult[] = [];

  for (const rule of rules) {
    const result = await executeRule(rule, triggerData, userId, supabase);
    results.push(result);
  }

  return results;
}

async function executeRule(
  rule: Record<string, unknown>,
  triggerData: TriggerData,
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<ExecutionResult> {
  const ruleId = rule.id as string;
  const ruleName = rule.name as string;
  const actionType = rule.action_type as string;
  const actionConfig = (rule.action_config || {}) as Record<string, unknown>;

  // Create log entry
  const { data: logEntry } = await supabase
    .from("automation_logs")
    .insert({
      rule_id: ruleId,
      business_id: triggerData.businessId,
      status: "running",
      trigger_data: triggerData,
    })
    .select("id")
    .single();

  try {
    let actionResult: Record<string, unknown> = {};

    switch (actionType) {
      case "send_email":
        actionResult = await executeSendEmail(
          actionConfig,
          triggerData,
          userId,
          supabase
        );
        break;
      case "create_task":
        actionResult = await executeCreateTask(
          actionConfig,
          triggerData,
          ruleId,
          userId,
          supabase
        );
        break;
      case "update_status":
        actionResult = await executeUpdateStatus(
          actionConfig,
          triggerData,
          userId,
          supabase
        );
        break;
      case "assign_user":
        actionResult = await executeAssignUser(
          actionConfig,
          triggerData,
          userId,
          supabase
        );
        break;
      case "send_webhook":
        actionResult = await executeSendWebhook(
          actionConfig,
          triggerData,
          userId,
          supabase
        );
        break;
      default:
        throw new Error(`Unsupported action type: ${actionType}`);
    }

    // Update log as success
    if (logEntry?.id) {
      await supabase
        .from("automation_logs")
        .update({
          status: "success",
          action_result: actionResult,
          completed_at: new Date().toISOString(),
        })
        .eq("id", logEntry.id);
    }

    // Update rule stats
    await supabase
      .from("automation_rules")
      .update({
        trigger_count: ((rule.trigger_count as number) || 0) + 1,
        success_count: ((rule.success_count as number) || 0) + 1,
        last_triggered_at: new Date().toISOString(),
      })
      .eq("id", ruleId);

    return { ruleId, ruleName, status: "success" };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Update log as failed
    if (logEntry?.id) {
      await supabase
        .from("automation_logs")
        .update({
          status: "failed",
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq("id", logEntry.id);
    }

    // Update rule failure count
    await supabase
      .from("automation_rules")
      .update({
        trigger_count: ((rule.trigger_count as number) || 0) + 1,
        failure_count: ((rule.failure_count as number) || 0) + 1,
        last_triggered_at: new Date().toISOString(),
      })
      .eq("id", ruleId);

    return { ruleId, ruleName, status: "failed", error: errorMessage };
  }
}

async function executeSendEmail(
  actionConfig: Record<string, unknown>,
  triggerData: TriggerData,
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<Record<string, unknown>> {
  const recipientEmail = (actionConfig.to as string) || triggerData.email;
  if (!recipientEmail) {
    throw new Error(
      "No recipient email available for send_email action"
    );
  }

  const templateType = (actionConfig.template as string) || "welcome";

  let subject: string;
  let html: string;

  switch (templateType) {
    case "welcome": {
      const templateData = {
        businessName: triggerData.businessName,
        contactName: triggerData.contactName || undefined,
        companyName: (actionConfig.company_name as string) || "Goldyon",
        senderName: (actionConfig.sender_name as string) || undefined,
      };
      subject =
        (actionConfig.subject as string) ||
        getWelcomeEmailSubject(templateData);
      html =
        (actionConfig.html as string) || getWelcomeEmailHtml(templateData);
      break;
    }
    default: {
      subject =
        (actionConfig.subject as string) || "Hello from Goldyon";
      html =
        (actionConfig.html as string) ||
        "<p>Thank you for your interest.</p>";
    }
  }

  // Send via Resend
  const { data, error } = await getResend().emails.send({
    from: EMAIL_FROM,
    to: [recipientEmail],
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }

  // Log activity
  await supabase.from("activities").insert({
    business_id: triggerData.businessId,
    user_id: userId,
    activity_type: "email_sent",
    subject,
    description: `Automated email sent to ${recipientEmail}`,
    metadata: {
      email_to: recipientEmail,
      resend_id: data?.id,
      template: templateType,
      automated: true,
    },
  });

  return {
    messageId: data?.id,
    recipientEmail,
    template: templateType,
  };
}

async function executeCreateTask(
  actionConfig: Record<string, unknown>,
  triggerData: TriggerData,
  ruleId: string,
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<Record<string, unknown>> {
  const taskType = (actionConfig.task_type as string) || "follow_up";
  const dueDays = (actionConfig.due_days as number) || 1;
  const description =
    (actionConfig.description as string) ||
    `Follow up with ${triggerData.businessName}`;

  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + dueDays);

  const { data, error } = await supabase
    .from("scheduled_tasks")
    .insert({
      rule_id: ruleId,
      business_id: triggerData.businessId,
      task_type: taskType,
      task_config: { description, ...actionConfig },
      scheduled_for: scheduledFor.toISOString(),
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  await supabase.from("activities").insert({
    business_id: triggerData.businessId,
    user_id: userId,
    activity_type: "task_completed",
    subject: `Automated task created: ${taskType}`,
    description: `Task "${description}" scheduled for ${scheduledFor.toLocaleDateString()}`,
    metadata: { task_id: data?.id, task_type: taskType, automated: true },
  });

  return { taskId: data?.id, taskType, scheduledFor: scheduledFor.toISOString() };
}

async function executeUpdateStatus(
  actionConfig: Record<string, unknown>,
  triggerData: TriggerData,
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<Record<string, unknown>> {
  const newStatus = actionConfig.new_status as string;
  if (!newStatus) {
    throw new Error("Missing new_status in action config");
  }

  const { error } = await supabase
    .from("businesses")
    .update({ status: newStatus })
    .eq("id", triggerData.businessId);

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }

  await supabase.from("activities").insert({
    business_id: triggerData.businessId,
    user_id: userId,
    activity_type: "status_change",
    subject: `Status changed to ${newStatus}`,
    description: `Lead status automatically changed to "${newStatus}" by automation`,
    metadata: { new_status: newStatus, automated: true },
  });

  return { newStatus, businessId: triggerData.businessId };
}

async function executeAssignUser(
  actionConfig: Record<string, unknown>,
  triggerData: TriggerData,
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<Record<string, unknown>> {
  const assignTo = actionConfig.assign_to as string;
  if (!assignTo) {
    throw new Error("Missing assign_to in action config");
  }

  const { error } = await supabase
    .from("businesses")
    .update({ assigned_to: assignTo })
    .eq("id", triggerData.businessId);

  if (error) {
    throw new Error(`Failed to assign user: ${error.message}`);
  }

  // Look up assignee name for the activity log
  const { data: assignee } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", assignTo)
    .single();

  const assigneeName = assignee?.full_name || assignTo;

  await supabase.from("activities").insert({
    business_id: triggerData.businessId,
    user_id: userId,
    activity_type: "note",
    subject: `Lead assigned to ${assigneeName}`,
    description: `Lead "${triggerData.businessName}" automatically assigned to ${assigneeName} by automation`,
    metadata: { assign_to: assignTo, assignee_name: assigneeName, automated: true },
  });

  return { assignedTo: assignTo, assigneeName, businessId: triggerData.businessId };
}

async function executeSendWebhook(
  actionConfig: Record<string, unknown>,
  triggerData: TriggerData,
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<Record<string, unknown>> {
  const url = actionConfig.url as string;
  if (!url) {
    throw new Error("Missing url in action config");
  }

  // SSRF prevention: only allow HTTPS URLs
  if (!url.startsWith("https://")) {
    throw new Error("Webhook URL must use HTTPS");
  }

  const customHeaders = (actionConfig.headers as Record<string, string>) || {};

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
      },
      body: JSON.stringify({
        event: "automation_trigger",
        data: triggerData,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
    }

    await supabase.from("activities").insert({
      business_id: triggerData.businessId,
      user_id: userId,
      activity_type: "note",
      subject: "Webhook sent",
      description: `Automated webhook sent to ${new URL(url).hostname}`,
      metadata: {
        webhook_url: url,
        response_status: response.status,
        automated: true,
      },
    });

    return { url, status: response.status, success: true };
  } finally {
    clearTimeout(timeout);
  }
}
