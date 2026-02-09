import type { LeadStatus } from "@/lib/types/database";

export interface TransitionRule {
  suggested: LeadStatus[];
  allowed: LeadStatus[];
  requiresReason: boolean;
}

export const STAGE_TRANSITIONS: Record<LeadStatus, TransitionRule> = {
  new: {
    suggested: ["contacted"],
    allowed: ["contacted", "qualified", "lost", "do_not_contact"],
    requiresReason: false,
  },
  contacted: {
    suggested: ["qualified", "lost"],
    allowed: ["new", "qualified", "proposal", "lost", "do_not_contact"],
    requiresReason: false,
  },
  qualified: {
    suggested: ["proposal"],
    allowed: ["contacted", "proposal", "negotiation", "lost", "do_not_contact"],
    requiresReason: false,
  },
  proposal: {
    suggested: ["negotiation", "lost"],
    allowed: ["qualified", "negotiation", "won", "lost", "do_not_contact"],
    requiresReason: false,
  },
  negotiation: {
    suggested: ["won", "lost"],
    allowed: ["proposal", "won", "lost", "do_not_contact"],
    requiresReason: false,
  },
  won: {
    suggested: [],
    allowed: ["negotiation"],
    requiresReason: true,
  },
  lost: {
    suggested: ["new", "contacted"],
    allowed: ["new", "contacted", "qualified"],
    requiresReason: true,
  },
  do_not_contact: {
    suggested: [],
    allowed: ["new"],
    requiresReason: true,
  },
};

export function getTransitionRule(status: LeadStatus): TransitionRule {
  return STAGE_TRANSITIONS[status];
}

export function isReasonRequired(from: LeadStatus, to: LeadStatus): boolean {
  return to === "won" || to === "lost";
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
  do_not_contact: "Do Not Contact",
};
