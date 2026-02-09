"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Phone,
  Mail,
  Calendar,
  FileText,
  Upload,
  Target,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCreateActivity } from "@/lib/hooks/useActivities";
import { getSupabaseClient } from "@/lib/supabase/client";

type ActionType = "call" | "email_sent" | "meeting" | "note";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  href?: string;
  actionType?: ActionType;
  color: string;
}

const actions: QuickAction[] = [
  {
    label: "Add Lead",
    icon: Plus,
    href: "/leads/new",
    color: "bg-gold/20 text-gold hover:bg-gold/30",
  },
  {
    label: "Log Call",
    icon: Phone,
    actionType: "call",
    color: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
  },
  {
    label: "Send Email",
    icon: Mail,
    actionType: "email_sent",
    color: "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
  },
  {
    label: "Meeting",
    icon: Calendar,
    actionType: "meeting",
    color: "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30",
  },
  {
    label: "Add Note",
    icon: FileText,
    actionType: "note",
    color: "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30",
  },
  {
    label: "Import",
    icon: Upload,
    href: "/leads/new",
    color: "bg-green-500/20 text-green-400 hover:bg-green-500/30",
  },
];

const ACTION_TITLES: Record<ActionType, string> = {
  call: "Log a Call",
  email_sent: "Log an Email",
  meeting: "Schedule a Meeting",
  note: "Add a Note",
};

const CALL_OUTCOMES = ["Answered", "Voicemail", "No Answer", "Busy"];

export function QuickActionsPanel() {
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    outcome: "",
  });

  const createActivity = useCreateActivity();

  const resetForm = () => {
    setFormData({ title: "", description: "", duration: "", outcome: "" });
    setActiveAction(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAction) return;

    setIsSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      await createActivity.mutateAsync({
        activity_type: activeAction,
        subject: formData.title || ACTION_TITLES[activeAction],
        description: formData.description || null,
        outcome: activeAction === "call" ? formData.outcome || null : null,
        scheduled_at: activeAction === "meeting" && formData.outcome ? new Date(formData.outcome).toISOString() : null,
        user_id: user?.id || "",
        business_id: "",
        metadata: {
          ...(formData.duration && { duration: formData.duration }),
          source: "quick_action",
        },
      });
      resetForm();
    } catch (error) {
      console.error("Failed to log activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-gold" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              const content = (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-lg transition-colors cursor-pointer aspect-square",
                    action.color
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center">{action.label}</span>
                </div>
              );

              if (action.href) {
                return (
                  <Link key={action.label} href={action.href}>
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={action.label}
                  onClick={() => action.actionType && setActiveAction(action.actionType)}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Activity Modal */}
      <Modal
        isOpen={!!activeAction}
        onClose={resetForm}
        title={activeAction ? ACTION_TITLES[activeAction] : ""}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject"
            placeholder={activeAction ? ACTION_TITLES[activeAction] : ""}
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
          />

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
                {CALL_OUTCOMES.map((outcome) => (
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

          {activeAction === "meeting" && (
            <Input
              label="Date & Time"
              type="datetime-local"
              value={formData.outcome}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, outcome: e.target.value }))
              }
            />
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {activeAction === "note" ? "Note" : "Notes"}
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 resize-none"
              rows={4}
              placeholder={
                activeAction === "note"
                  ? "Write your note..."
                  : "Add any details..."
              }
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Send className="h-4 w-4" />}
            >
              {activeAction === "note" ? "Save Note" : "Log Activity"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
