"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  Calendar,
  CalendarClock,
  FileText,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  businessId: string;
  businessName: string;
  onLogActivity: (activity: {
    type: string;
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
  onSetFollowUp?: (date: string) => Promise<void>;
}

const actionTypes = [
  {
    type: "call",
    label: "Log Call",
    icon: Phone,
    color: "text-blue-400 bg-blue-500/20 border-blue-500/30",
  },
  {
    type: "email_sent",
    label: "Log Email",
    icon: Mail,
    color: "text-purple-400 bg-purple-500/20 border-purple-500/30",
  },
  {
    type: "meeting",
    label: "Schedule Meeting",
    icon: Calendar,
    color: "text-orange-400 bg-orange-500/20 border-orange-500/30",
  },
  {
    type: "note",
    label: "Add Note",
    icon: FileText,
    color: "text-gray-400 bg-gray-500/20 border-gray-500/30",
  },
  {
    type: "sms",
    label: "Log SMS",
    icon: MessageSquare,
    color: "text-pink-400 bg-pink-500/20 border-pink-500/30",
  },
  {
    type: "follow_up",
    label: "Set Follow-up",
    icon: CalendarClock,
    color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
  },
];

export function QuickActions({
  businessId,
  businessName,
  onLogActivity,
  onSetFollowUp,
}: QuickActionsProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    outcome: "",
    followUpDate: "",
  });

  const selectedAction = actionTypes.find((a) => a.type === activeAction);

  const handleActionClick = (type: string) => {
    setActiveAction(type);
    setIsModalOpen(true);
    setFormData({
      title: "",
      description: "",
      duration: "",
      outcome: "",
      followUpDate: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAction) return;

    setIsSubmitting(true);
    try {
      if (activeAction === "follow_up" && onSetFollowUp) {
        if (!formData.followUpDate) return;
        await onSetFollowUp(formData.followUpDate);
      } else {
        await onLogActivity({
          type: activeAction,
          title: formData.title || `${selectedAction?.label} with ${businessName}`,
          description: formData.description,
          metadata: {
            ...(formData.duration && { duration: formData.duration }),
            ...(formData.outcome && { outcome: formData.outcome }),
          },
        });
      }
      setIsModalOpen(false);
      setActiveAction(null);
    } catch (error) {
      console.error("Failed to log activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actionTypes.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.type}
              onClick={() => handleActionClick(action.type)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                "hover:scale-105 active:scale-95",
                action.color
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Activity Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveAction(null);
        }}
        title={selectedAction?.label || "Log Activity"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeAction === "follow_up" ? (
            <Input
              label="Follow-up Date"
              type="date"
              value={formData.followUpDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, followUpDate: e.target.value }))
              }
              leftIcon={<CalendarClock className="h-4 w-4" />}
            />
          ) : (
            <>
              <Input
                label="Subject"
                placeholder={`${selectedAction?.label} with ${businessName}`}
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </>
          )}

          {(activeAction === "call" || activeAction === "meeting") && (
            <Input
              label="Duration"
              placeholder="e.g., 30 minutes"
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, duration: e.target.value }))
              }
            />
          )}

          {activeAction === "call" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Outcome
              </label>
              <div className="flex flex-wrap gap-2">
                {["Answered", "Voicemail", "No Answer", "Busy"].map((outcome) => (
                  <button
                    key={outcome}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, outcome }))
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm transition-colors",
                      formData.outcome === outcome
                        ? "bg-gold text-background"
                        : "bg-white/10 text-text-secondary hover:bg-white/20"
                    )}
                  >
                    {outcome}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeAction !== "follow_up" && <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Notes
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 resize-none"
              rows={4}
              placeholder="Add any notes or details..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                setActiveAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={activeAction === "follow_up" ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            >
              {activeAction === "follow_up" ? "Set Follow-up" : "Log Activity"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
