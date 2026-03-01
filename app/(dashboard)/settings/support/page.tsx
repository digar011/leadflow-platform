"use client";

import { useState } from "react";
import { MessageSquare, Plus, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import {
  useSupportTickets,
  useCreateTicket,
  useTicketMessages,
  useReplyToTicket,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type SupportTicket,
} from "@/lib/hooks/useSupportTickets";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  open: "bg-status-info/20 text-status-info",
  in_progress: "bg-gold/20 text-gold",
  resolved: "bg-status-success/20 text-status-success",
  closed: "bg-text-muted/20 text-text-muted",
};

const priorityColors: Record<string, string> = {
  low: "bg-text-muted/20 text-text-muted",
  medium: "bg-status-info/20 text-status-info",
  high: "bg-status-warning/20 text-status-warning",
  urgent: "bg-status-error/20 text-status-error",
};

export default function SupportPage() {
  const { data: tickets, isLoading } = useSupportTickets();
  const createTicket = useCreateTicket();
  const replyToTicket = useReplyToTicket();

  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    category: "general",
    priority: "medium",
  });
  const [replyText, setReplyText] = useState("");

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) return;

    await createTicket.mutateAsync(newTicket);
    setNewTicket({ subject: "", description: "", category: "general", priority: "medium" });
    setShowNewTicket(false);
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    await replyToTicket.mutateAsync({
      ticketId: selectedTicket.id,
      message: replyText,
      isAdminReply: false,
    });
    setReplyText("");
  };

  const openTickets = tickets?.filter((t) => t.status === "open" || t.status === "in_progress").length || 0;
  const resolvedTickets = tickets?.filter((t) => t.status === "resolved" || t.status === "closed").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Support</h2>
          <p className="text-sm text-text-secondary">
            Submit issues or feedback for the admin team
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowNewTicket(true)}
        >
          New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="glass" padding="sm">
          <CardContent className="pt-2 text-center">
            <p className="text-2xl font-bold text-text-primary">{tickets?.length || 0}</p>
            <p className="text-sm text-text-muted">Total Tickets</p>
          </CardContent>
        </Card>
        <Card variant="glass" padding="sm">
          <CardContent className="pt-2 text-center">
            <p className="text-2xl font-bold text-status-info">{openTickets}</p>
            <p className="text-sm text-text-muted">Open</p>
          </CardContent>
        </Card>
        <Card variant="glass" padding="sm">
          <CardContent className="pt-2 text-center">
            <p className="text-2xl font-bold text-status-success">{resolvedTickets}</p>
            <p className="text-sm text-text-muted">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Ticket List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-text-muted">
            Loading tickets...
          </CardContent>
        </Card>
      ) : !tickets?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">No support tickets yet</p>
            <p className="text-sm text-text-muted mt-1">
              Click &quot;New Ticket&quot; to submit an issue or feedback
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              hover
              className="cursor-pointer"
              onClick={() => setSelectedTicket(ticket)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-text-primary truncate">
                        {ticket.subject}
                      </h3>
                    </div>
                    <p className="text-sm text-text-muted line-clamp-1">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at!).toLocaleDateString()}
                      </span>
                      <span className="capitalize">{ticket.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[ticket.status ?? "open"] || statusColors.open)}>
                      {(ticket.status ?? "open").replace("_", " ")}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs", priorityColors[ticket.priority ?? "medium"] || priorityColors.medium)}>
                      {ticket.priority ?? "medium"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      <Modal
        isOpen={showNewTicket}
        onClose={() => setShowNewTicket(false)}
        title="New Support Ticket"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Subject
            </label>
            <Input
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              placeholder="Brief summary of your issue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Category
            </label>
            <select
              value={newTicket.category}
              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-gold focus:outline-none"
            >
              {TICKET_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Priority
            </label>
            <select
              value={newTicket.priority}
              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-gold focus:outline-none"
            >
              {TICKET_PRIORITIES.map((pri) => (
                <option key={pri.value} value={pri.value}>
                  {pri.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <textarea
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              placeholder="Describe your issue or feedback in detail..."
              rows={5}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowNewTicket(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTicket}
              disabled={!newTicket.subject.trim() || !newTicket.description.trim() || createTicket.isPending}
              isLoading={createTicket.isPending}
            >
              Submit Ticket
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          replyText={replyText}
          setReplyText={setReplyText}
          onReply={handleReply}
          isReplying={replyToTicket.isPending}
        />
      )}
    </div>
  );
}

function TicketDetailModal({
  ticket,
  onClose,
  replyText,
  setReplyText,
  onReply,
  isReplying,
}: {
  ticket: SupportTicket;
  onClose: () => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onReply: () => void;
  isReplying: boolean;
}) {
  const { data: messages, isLoading } = useTicketMessages(ticket.id);

  return (
    <Modal isOpen={true} onClose={onClose} title={ticket.subject} size="lg">
      <div className="space-y-4">
        {/* Ticket info */}
        <div className="flex items-center gap-3 text-sm">
          <span className={cn("px-2 py-0.5 rounded-full font-medium", statusColors[ticket.status ?? "open"] || statusColors.open)}>
            {(ticket.status ?? "open").replace("_", " ")}
          </span>
          <span className={cn("px-2 py-0.5 rounded-full", priorityColors[ticket.priority ?? "medium"] || priorityColors.medium)}>
            {ticket.priority ?? "medium"}
          </span>
          <span className="text-text-muted capitalize">{ticket.category}</span>
          <span className="text-text-muted">
            {new Date(ticket.created_at!).toLocaleDateString()}
          </span>
        </div>

        {/* Messages thread */}
        <div className="border border-white/10 rounded-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-text-muted">Loading messages...</div>
          ) : !messages?.length ? (
            <div className="p-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-text-primary">{ticket.description}</p>
                <p className="text-xs text-text-muted mt-2">
                  {new Date(ticket.created_at!).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "rounded-lg p-3",
                    msg.is_admin_reply
                      ? "bg-gold/10 border border-gold/20 ml-4"
                      : "bg-white/5 mr-4"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-text-secondary">
                      {msg.is_admin_reply ? "Admin" : "You"}
                    </span>
                    {msg.is_admin_reply && (
                      <span className="text-xs bg-gold/20 text-gold px-1.5 py-0.5 rounded">
                        Staff
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(msg.created_at!).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply input */}
        {(ticket.status ?? "open") !== "closed" && (
          <div className="flex gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={2}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none resize-none"
            />
            <Button
              size="icon"
              onClick={onReply}
              disabled={!replyText.trim() || isReplying}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
