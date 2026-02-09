"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Mail,
  Phone,
  Globe,
  MapPin,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Badge, getStatusBadgeVariant, getTemperatureBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { formatDate, formatCurrency, truncateText } from "@/lib/utils/formatters";
import { formatLeadStatus, formatLeadTemperature } from "@/lib/utils/formatters";
import type { Business, LeadStatus } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "do_not_contact", label: "Do Not Contact" },
];

interface LeadWithProfile extends Business {
  profiles: { full_name: string; email: string } | null;
}

interface LeadTableProps {
  leads: LeadWithProfile[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSort: (column: string) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: LeadStatus) => void;
  selectedLeads?: string[];
  onSelectionChange?: (ids: string[]) => void;
  isLoading?: boolean;
}

export function LeadTable({
  leads,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onSort,
  sortColumn,
  sortDirection,
  onDelete,
  onStatusChange,
  selectedLeads = [],
  onSelectionChange,
  isLoading,
}: LeadTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);

  const handleRowClick = (e: React.MouseEvent, leadId: string) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, [role='menu']")) return;
    router.push(`/leads/${leadId}`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? leads.map((l) => l.id) : []);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(
        checked
          ? [...selectedLeads, id]
          : selectedLeads.filter((i) => i !== id)
      );
    }
  };

  const SortHeader = ({
    column,
    children,
  }: {
    column: string;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => onSort(column)}
      className="flex items-center gap-1 hover:text-text-primary transition-colors"
    >
      {children}
      <ArrowUpDown
        className={`h-3 w-3 ${
          sortColumn === column ? "text-gold" : "text-text-muted"
        }`}
      />
    </button>
  );

  if (isLoading) {
    return (
      <div className="rounded-xl bg-background-card border border-white/5 overflow-hidden">
        <div className="p-8 text-center text-text-muted">
          <div className="animate-spin h-8 w-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4" />
          Loading leads...
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-xl bg-background-card border border-white/5 overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-text-muted mb-4">No leads found</div>
          <Link href="/leads/new">
            <Button>Add Your First Lead</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl bg-background-card border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {onSelectionChange && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === leads.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-background-secondary text-gold focus:ring-gold"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  <SortHeader column="business_name">Business</SortHeader>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  <SortHeader column="status">Status</SortHeader>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  <SortHeader column="lead_temperature">Temp</SortHeader>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  <SortHeader column="deal_value">Value</SortHeader>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  <SortHeader column="lead_score">Score</SortHeader>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  <SortHeader column="created_at">Created</SortHeader>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={(e) => handleRowClick(e, lead.id)}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  {onSelectionChange && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) =>
                          handleSelectOne(lead.id, e.target.checked)
                        }
                        className="h-4 w-4 rounded border-white/20 bg-background-secondary text-gold focus:ring-gold"
                      />
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="group flex flex-col"
                    >
                      <span className="font-medium text-text-primary group-hover:text-gold transition-colors">
                        {truncateText(lead.business_name, 30)}
                      </span>
                      {lead.industry_category && (
                        <span className="text-xs text-text-muted">
                          {lead.industry_category}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    {onStatusChange ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatusMenuOpen(statusMenuOpen === lead.id ? null : lead.id);
                          }}
                          className="cursor-pointer"
                        >
                          <Badge variant={getStatusBadgeVariant(lead.status)} className="hover:ring-1 hover:ring-gold/50 transition-all">
                            {formatLeadStatus(lead.status)}
                          </Badge>
                        </button>
                        {statusMenuOpen === lead.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setStatusMenuOpen(null)}
                            />
                            <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-lg bg-background-secondary border border-white/10 py-1 shadow-lg">
                              {LEAD_STATUSES.map((s) => (
                                <button
                                  key={s.value}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStatusChange(lead.id, s.value);
                                    setStatusMenuOpen(null);
                                  }}
                                  className={cn(
                                    "flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors",
                                    s.value === lead.status
                                      ? "text-gold bg-gold/10"
                                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                                  )}
                                >
                                  <Badge variant={getStatusBadgeVariant(s.value)} className="text-[10px] px-1.5 py-0">
                                    {s.label}
                                  </Badge>
                                  {s.value === lead.status && (
                                    <span className="ml-auto text-xs text-gold">current</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <Badge variant={getStatusBadgeVariant(lead.status)}>
                        {formatLeadStatus(lead.status)}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getTemperatureBadgeVariant(lead.lead_temperature)}>
                      {formatLeadTemperature(lead.lead_temperature)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-text-muted hover:text-gold transition-colors"
                          title={lead.email}
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-text-muted hover:text-gold transition-colors"
                          title={lead.phone}
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                      {lead.website_url && (
                        <a
                          href={lead.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-muted hover:text-gold transition-colors"
                          title={lead.website_url}
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {(lead.city || lead.state) && (
                      <div className="flex items-center gap-1 text-sm text-text-secondary">
                        <MapPin className="h-3 w-3" />
                        {[lead.city, lead.state].filter(Boolean).join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {lead.deal_value ? (
                      <span className="font-medium text-gold">
                        {formatCurrency(lead.deal_value)}
                      </span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-background-secondary overflow-hidden">
                        <div
                          className="h-full bg-gold transition-all"
                          style={{ width: `${lead.lead_score}%` }}
                        />
                      </div>
                      <span className="text-sm text-text-secondary">
                        {lead.lead_score}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-secondary">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative flex justify-end">
                      <button
                        onClick={() =>
                          setMenuOpen(menuOpen === lead.id ? null : lead.id)
                        }
                        className="rounded-lg p-1.5 text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuOpen === lead.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpen(null)}
                          />
                          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg bg-background-secondary border border-white/10 py-1 shadow-lg">
                            <Link
                              href={`/leads/${lead.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Link>
                            <Link
                              href={`/leads/${lead.id}/edit`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                              Edit Lead
                            </Link>
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                            >
                              <UserPlus className="h-4 w-4" />
                              Add Contact
                            </button>
                            <hr className="my-1 border-white/5" />
                            <button
                              onClick={() => {
                                setMenuOpen(null);
                                setDeleteId(lead.id);
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-status-error hover:bg-white/5 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Lead
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
          <div className="text-sm text-text-muted">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, total)} of {total} leads
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-text-secondary">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId && onDelete) {
            onDelete(deleteId);
          }
          setDeleteId(null);
        }}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
