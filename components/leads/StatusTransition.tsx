"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { getTransitionRule, isReasonRequired, STATUS_LABELS } from "@/lib/utils/stageTransitions";
import type { LeadStatus } from "@/lib/types/database";

interface StatusTransitionProps {
  currentStatus: LeadStatus;
  onTransition: (newStatus: LeadStatus, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export function StatusTransition({
  currentStatus,
  onTransition,
  isLoading,
}: StatusTransitionProps) {
  const [showMore, setShowMore] = useState(false);
  const [reasonModal, setReasonModal] = useState<LeadStatus | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rule = getTransitionRule(currentStatus);

  const handleTransition = async (status: LeadStatus) => {
    if (isReasonRequired(currentStatus, status)) {
      setReasonModal(status);
      setReason("");
      return;
    }

    setSubmitting(true);
    try {
      await onTransition(status);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReasonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonModal || !reason.trim()) return;

    setSubmitting(true);
    try {
      await onTransition(reasonModal, reason.trim());
      setReasonModal(null);
      setReason("");
    } finally {
      setSubmitting(false);
    }
  };

  // Other allowed transitions not in suggested
  const otherTransitions = rule.allowed.filter(
    (s) => !rule.suggested.includes(s)
  );

  if (rule.suggested.length === 0 && otherTransitions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-2">
        {/* Suggested transitions */}
        {rule.suggested.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rule.suggested.map((status) => (
              <Button
                key={status}
                size="sm"
                variant="secondary"
                onClick={() => handleTransition(status)}
                disabled={isLoading || submitting}
                className="border-gold/30 hover:border-gold/60 hover:bg-gold/10"
              >
                Move to {STATUS_LABELS[status]}
              </Button>
            ))}
          </div>
        )}

        {/* More options toggle */}
        {otherTransitions.length > 0 && (
          <>
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  showMore && "rotate-180"
                )}
              />
              {showMore ? "Less options" : "More options"}
            </button>
            {showMore && (
              <div className="flex flex-wrap gap-2">
                {otherTransitions.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTransition(status)}
                    disabled={isLoading || submitting}
                    className="opacity-60 hover:opacity-100"
                  >
                    {STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Reason Modal for Won/Lost */}
      <Modal
        isOpen={!!reasonModal}
        onClose={() => setReasonModal(null)}
        title={reasonModal === "won" ? "Deal Won!" : reasonModal === "lost" ? "Mark as Lost" : "Reason Required"}
      >
        <form onSubmit={handleReasonSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {reasonModal === "won"
                ? "What helped close this deal?"
                : "Why was this lead lost?"}
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 resize-none"
              rows={3}
              placeholder={
                reasonModal === "won"
                  ? "e.g., Price matched budget, strong product fit..."
                  : "e.g., Went with competitor, budget constraints..."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setReasonModal(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!reason.trim()}
              isLoading={submitting}
              variant={reasonModal === "won" ? "primary" : "secondary"}
            >
              {reasonModal === "won" ? "Mark as Won" : "Mark as Lost"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
