"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  DollarSign,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  Thermometer,
  GripVertical,
} from "lucide-react";
import { Badge, getStatusBadgeVariant, getTemperatureBadgeVariant } from "@/components/ui/Badge";
import { LEAD_STATUSES } from "@/lib/utils/constants";
import { formatCurrency, formatCompactNumber } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import type { Business } from "@/lib/types/database";

export interface KanbanLead extends Business {
  profiles?: { full_name: string; email: string } | null;
}

interface KanbanBoardProps {
  leads: KanbanLead[];
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>;
  isLoading?: boolean;
}

interface KanbanColumnProps {
  status: { value: string; label: string; color?: string };
  leads: KanbanLead[];
  onDrop: (leadId: string, newStatus: string) => void;
  isDragging: boolean;
  draggedStatus: string | null;
}

interface KanbanCardProps {
  lead: KanbanLead;
  onDragStart: (e: React.DragEvent, leadId: string, currentStatus: string) => void;
  onDragEnd: () => void;
}

function KanbanCard({ lead, onDragStart, onDragEnd }: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id, lead.status ?? "")}
      onDragEnd={onDragEnd}
      className="group cursor-grab active:cursor-grabbing"
    >
      <Link href={`/leads/${lead.id}`}>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              <h4 className="font-medium text-text-primary text-sm line-clamp-1">
                {lead.business_name}
              </h4>
            </div>
            {lead.lead_temperature && (
              <Badge variant={getTemperatureBadgeVariant(lead.lead_temperature)} size="sm">
                {lead.lead_temperature}
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-xs text-text-muted">
            {lead.industry_category && (
              <p className="truncate">{lead.industry_category}</p>
            )}
            {lead.city && (
              <p className="truncate">{lead.city}, {lead.state}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
            {lead.deal_value ? (
              <div className="flex items-center gap-1 text-gold">
                <DollarSign className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {formatCompactNumber(lead.deal_value)}
                </span>
              </div>
            ) : (
              <span className="text-xs text-text-muted">No deal value</span>
            )}

            <div className="flex items-center gap-2">
              {lead.phone && (
                <Phone className="h-3 w-3 text-text-muted" />
              )}
              {lead.email && (
                <Mail className="h-3 w-3 text-text-muted" />
              )}
              {lead.next_follow_up && (
                <Calendar className="h-3 w-3 text-gold" />
              )}
            </div>
          </div>

          {/* Assigned User */}
          {lead.profiles && (
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-[10px] text-gold font-medium">
                  {lead.profiles.full_name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <span className="text-xs text-text-muted truncate">
                {lead.profiles.full_name}
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

function KanbanColumn({ status, leads, onDrop, isDragging, draggedStatus }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (draggedStatus !== status.value) {
      setIsOver(true);
    }
  }, [draggedStatus, status.value]);

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const leadId = e.dataTransfer.getData("leadId");
    if (leadId) {
      onDrop(leadId, status.value);
    }
  }, [onDrop, status.value]);

  const columnLeads = leads.filter((lead) => lead.status === status.value);
  const totalValue = columnLeads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);

  const statusColors: Record<string, string> = {
    new: "border-pipeline-new",
    contacted: "border-pipeline-contacted",
    qualified: "border-pipeline-qualified",
    proposal: "border-pipeline-proposal",
    negotiation: "border-pipeline-negotiation",
    won: "border-pipeline-won",
    lost: "border-pipeline-lost",
    do_not_contact: "border-status-error",
  };

  return (
    <div
      className={cn(
        "flex-shrink-0 w-72 flex flex-col rounded-lg bg-white/5 border-t-2 transition-all",
        statusColors[status.value] || "border-white/20",
        isOver && "ring-2 ring-gold/50 bg-gold/5"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(status.value)} size="sm">
              {status.label}
            </Badge>
            <span className="text-xs text-text-muted">
              {columnLeads.length}
            </span>
          </div>
          <button className="p-1 rounded hover:bg-white/10">
            <MoreVertical className="h-4 w-4 text-text-muted" />
          </button>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-gold">
            {formatCurrency(totalValue)} pipeline
          </p>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
        {columnLeads.length === 0 ? (
          <div
            className={cn(
              "p-4 rounded-lg border border-dashed transition-colors text-center",
              isOver ? "border-gold bg-gold/5" : "border-white/10"
            )}
          >
            <p className="text-xs text-text-muted">
              {isOver ? "Drop here" : "No leads"}
            </p>
          </div>
        ) : (
          columnLeads.map((lead) => (
            <KanbanCard
              key={lead.id}
              lead={lead}
              onDragStart={(e, leadId, currentStatus) => {
                e.dataTransfer.setData("leadId", leadId);
                e.dataTransfer.setData("currentStatus", currentStatus);
              }}
              onDragEnd={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ leads, onStatusChange, isLoading }: KanbanBoardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedStatus, setDraggedStatus] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, leadId: string, currentStatus: string) => {
    setIsDragging(true);
    setDraggedStatus(currentStatus);
    e.dataTransfer.setData("leadId", leadId);
    e.dataTransfer.setData("currentStatus", currentStatus);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedStatus(null);
  }, []);

  const handleDrop = useCallback(async (leadId: string, newStatus: string) => {
    try {
      await onStatusChange(leadId, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }, [onStatusChange]);

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STATUSES.slice(0, 6).map((status) => (
          <div
            key={status.value}
            className="flex-shrink-0 w-72 h-96 rounded-lg bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Filter to show only active pipeline stages (not lost or do_not_contact by default)
  const pipelineStatuses = LEAD_STATUSES.filter(
    (s) => !["lost", "do_not_contact"].includes(s.value)
  );

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-4"
      onDragEnd={handleDragEnd}
    >
      {pipelineStatuses.map((status) => (
        <KanbanColumn
          key={status.value}
          status={status}
          leads={leads}
          onDrop={handleDrop}
          isDragging={isDragging}
          draggedStatus={draggedStatus}
        />
      ))}
    </div>
  );
}
