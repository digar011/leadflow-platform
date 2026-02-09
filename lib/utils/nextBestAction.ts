import type { LeadStatus, LeadTemperature } from "@/lib/types/database";

export interface NextAction {
  id: string;
  label: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionType?: string; // maps to quick action type if clickable
}

interface ActionContext {
  status: LeadStatus;
  temperature: LeadTemperature;
  daysSinceLastActivity: number | null;
  hasFollowUp: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasDealValue: boolean;
}

export function getNextBestActions(ctx: ActionContext): NextAction[] {
  const actions: NextAction[] = [];

  // Status-specific suggestions
  switch (ctx.status) {
    case "new":
      if (ctx.hasPhone) {
        actions.push({
          id: "intro-call",
          label: "Make introduction call",
          description: "First contact via phone to introduce yourself and learn their needs",
          priority: "high",
          actionType: "call",
        });
      }
      if (ctx.hasEmail) {
        actions.push({
          id: "intro-email",
          label: "Send introduction email",
          description: "Reach out with a personalized intro email",
          priority: ctx.hasPhone ? "medium" : "high",
          actionType: "email_sent",
        });
      }
      if (!ctx.hasPhone && !ctx.hasEmail) {
        actions.push({
          id: "research",
          label: "Research contact info",
          description: "Find email or phone number for this lead",
          priority: "high",
          actionType: "note",
        });
      }
      break;

    case "contacted":
      if (ctx.daysSinceLastActivity !== null && ctx.daysSinceLastActivity >= 3) {
        actions.push({
          id: "follow-up",
          label: "Send follow-up",
          description: `No activity for ${ctx.daysSinceLastActivity} days — time for a follow-up`,
          priority: "high",
          actionType: ctx.hasEmail ? "email_sent" : "call",
        });
      }
      actions.push({
        id: "qualify",
        label: "Qualify this lead",
        description: "Ask discovery questions to determine fit and budget",
        priority: "medium",
        actionType: "call",
      });
      break;

    case "qualified":
      actions.push({
        id: "schedule-meeting",
        label: "Schedule a meeting",
        description: "Set up a demo or discovery call to discuss solutions",
        priority: "high",
        actionType: "meeting",
      });
      if (!ctx.hasDealValue) {
        actions.push({
          id: "set-deal-value",
          label: "Set deal value",
          description: "Estimate the potential deal size for pipeline tracking",
          priority: "medium",
        });
      }
      break;

    case "proposal":
      actions.push({
        id: "follow-up-proposal",
        label: "Follow up on proposal",
        description: "Check if they've reviewed the proposal and address questions",
        priority: "high",
        actionType: ctx.hasPhone ? "call" : "email_sent",
      });
      break;

    case "negotiation":
      actions.push({
        id: "address-objections",
        label: "Address objections",
        description: "Work through concerns and negotiate terms",
        priority: "high",
        actionType: "call",
      });
      actions.push({
        id: "close-deal",
        label: "Push for close",
        description: "Summarize agreed terms and ask for commitment",
        priority: "medium",
        actionType: "meeting",
      });
      break;
  }

  // Cross-cutting suggestions
  if (!ctx.hasFollowUp && !["won", "lost", "do_not_contact"].includes(ctx.status)) {
    actions.push({
      id: "set-follow-up",
      label: "Set a follow-up date",
      description: "Schedule a reminder so this lead doesn't fall through the cracks",
      priority: actions.length === 0 ? "high" : "medium",
      actionType: "follow_up",
    });
  }

  // Hot lead urgency
  if (
    ctx.temperature === "hot" &&
    ctx.daysSinceLastActivity !== null &&
    ctx.daysSinceLastActivity >= 2 &&
    !["won", "lost", "do_not_contact"].includes(ctx.status)
  ) {
    actions.unshift({
      id: "hot-urgent",
      label: "Urgent: Hot lead going cold",
      description: `This hot lead hasn't been contacted in ${ctx.daysSinceLastActivity} days — act now`,
      priority: "high",
      actionType: ctx.hasPhone ? "call" : "email_sent",
    });
  }

  // Return max 3
  return actions.slice(0, 3);
}
