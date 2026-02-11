"use client";

import { useState } from "react";
import { MessageSquare, Send, Clock, User, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  useAllSupportTickets,
  useTicketMessages,
  useReplyToTicket,
  useUpdateTicketStatus,
  TICKET_STATUSES,
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
  low: "text-text-muted",
  medium: "text-status-info",
  high: "text-status-warning",
  urgent: "text-status-error",
};

export default function AdminSupportPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: tickets, isLoading } = useAllSupportTickets(statusFilter);
  const replyToTicket = useReplyToTicket();
  const updateStatus = useUpdateTicketStatus();

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    await replyToTicket.mutateAsync({
      ticketId: selectedTicket.id,
      message: replyText,
      isAdminReply: true,
    });
    setReplyText("");
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    await updateStatus.mutateAsync({ ticketId, status: newStatus });
  };

  const openCount = tickets?.filter((t) => t.status === "open").length || 0;
  const inProgressCount = tickets?.filter((t) => t.status === "in_progress").length || 0;
  const resolvedCount = tickets?.filter((t) => t.status === "resolved" || t.status === "closed").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
            <MessageSquare className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Support Tickets</h1>
            <p className="text-text-secondary">Manage user issues and feedback</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card variant="glass" padding="sm">
          <CardContent className="pt-2 text-center">
            <p className="text-2xl font-bold text-text-primary">{tickets?.length || 0}</p>
            <p className="text-sm text-text-muted">Total</p>
          </CardContent>
        </Card>
        <Card variant="glass" padding="sm">
          <CardContent className="pt-2 text-center">
            <p className="text-2xl font-bold text-status-info">{openCount}</p>
            <p className="text-sm text-text-muted">Open</p>
          </CardContent>
        </Card>
        <Card variant="glass" padding="sm">
          <CardContent className="pt-2 text-center">
            <p className="text-2xl font-bold text-gold">{inProgressCount}</p>
            <p className="text-sm text-text-muted">In Progress</p>
          </CardContent>
        </Card>
        <Card variant="glass" padding="sm">
          <CardContent className="pt-2 text-center">
            <p className="text-2xl font-bold text-status-success">{resolvedCount}</p>
            <p className="text-sm text-text-muted">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-text-muted" />
        <span className="text-sm text-text-muted">Status:</span>
        {["all", "open", "in_progress", "resolved", "closed"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              statusFilter === status
                ? "bg-gold/20 text-gold"
                : "text-text-muted hover:text-text-primary hover:bg-white/5"
            )}
          >
            {status === "all" ? "All" : status.replace("_", " ")}
          </button>
        ))}
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
            <p className="text-text-secondary">No support tickets</p>
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
                        <User className="h-3 w-3" />
                        {ticket.profiles?.full_name || ticket.profiles?.email || "Unknown User"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.updated_at!).toLocaleDateString()}
                      </span>
                      <span className="capitalize">{ticket.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[ticket.status ?? "open"] || statusColors.open)}>
                      {(ticket.status ?? "open").replace("_", " ")}
                    </span>
                    <span className={cn("text-xs font-medium", priorityColors[ticket.priority ?? "medium"] || priorityColors.medium)}>
                      {ticket.priority ?? "medium"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <AdminTicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          replyText={replyText}
          setReplyText={setReplyText}
          onReply={handleReply}
          isReplying={replyToTicket.isPending}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

function AdminTicketModal({
  ticket,
  onClose,
  replyText,
  setReplyText,
  onReply,
  isReplying,
  onStatusChange,
}: {
  ticket: SupportTicket;
  onClose: () => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onReply: () => void;
  isReplying: boolean;
  onStatusChange: (ticketId: string, status: string) => void;
}) {
  const { data: messages, isLoading } = useTicketMessages(ticket.id);

  return (
    <Modal isOpen={true} onClose={onClose} title={ticket.subject} size="lg">
      <div className="space-y-4">
        {/* Ticket info + status control */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className={cn("px-2 py-0.5 rounded-full font-medium", statusColors[ticket.status ?? "open"] || statusColors.open)}>
              {(ticket.status ?? "open").replace("_", " ")}
            </span>
            <span className={cn("font-medium", priorityColors[ticket.priority ?? "medium"] || priorityColors.medium)}>
              {ticket.priority ?? "medium"}
            </span>
            <span className="text-text-muted capitalize">{ticket.category}</span>
            <span className="text-text-muted">
              by {ticket.profiles?.full_name || ticket.profiles?.email || "User"}
            </span>
          </div>
          <select
            value={ticket.status ?? "open"}
            onChange={(e) => onStatusChange(ticket.id, e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-primary focus:border-gold focus:outline-none"
          >
            {TICKET_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
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
                      {msg.is_admin_reply ? "Admin" : (msg.profiles?.full_name || "User")}
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

        {/* Admin reply input */}
        <div className="flex gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply to the user..."
            rows={3}
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
      </div>
    </Modal>
  );
}
