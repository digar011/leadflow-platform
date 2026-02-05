"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  User,
  Clock,
  Globe,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuditLogs, useAuditLogStats, type AuditLog } from "@/lib/hooks/useAdmin";
import { cn } from "@/lib/utils";

const actionColors: Record<string, string> = {
  create: "bg-green-500/20 text-green-400",
  update: "bg-blue-500/20 text-blue-400",
  delete: "bg-red-500/20 text-red-400",
  login: "bg-purple-500/20 text-purple-400",
  logout: "bg-gray-500/20 text-gray-400",
};

const ITEMS_PER_PAGE = 25;

export default function AdminAuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [offset, setOffset] = useState(0);

  const { data: logsData, isLoading } = useAuditLogs({
    limit: ITEMS_PER_PAGE,
    offset,
    action: selectedAction || undefined,
    resourceType: selectedResource || undefined,
  });

  const { data: stats } = useAuditLogStats();

  const logs = logsData?.logs || [];
  const total = logsData?.total || 0;

  const toggleExpand = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  // Filter logs client-side for search
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.resource_type.toLowerCase().includes(query) ||
      log.profiles?.full_name?.toLowerCase().includes(query) ||
      log.profiles?.email?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Audit Logs</h1>
        <p className="text-text-secondary mt-1">
          Track all actions and changes made in the system
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
                <FileText className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.totalLogs.toLocaleString() || 0}
                </p>
                <p className="text-sm text-text-muted">Total Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.logsToday || 0}
                </p>
                <p className="text-sm text-text-muted">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <Filter className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.uniqueActions || 0}
                </p>
                <p className="text-sm text-text-muted">Action Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="glass">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setOffset(0);
              }}
              className="bg-surface-elevated border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>

            <select
              value={selectedResource}
              onChange={(e) => {
                setSelectedResource(e.target.value);
                setOffset(0);
              }}
              className="bg-surface-elevated border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              <option value="">All Resources</option>
              <option value="businesses">Leads</option>
              <option value="contacts">Contacts</option>
              <option value="activities">Activities</option>
              <option value="campaigns">Campaigns</option>
              <option value="profiles">Users</option>
              <option value="automation_rules">Automation</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card variant="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Activity Log</CardTitle>
          <span className="text-sm text-text-muted">
            Showing {filteredLogs.length} of {total} logs
          </span>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : !filteredLogs.length ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-secondary">No audit logs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <LogEntry
                  key={log.id}
                  log={log}
                  isExpanded={expandedLogs.has(log.id)}
                  onToggle={() => toggleExpand(log.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - ITEMS_PER_PAGE))}
              >
                Previous
              </Button>
              <span className="text-sm text-text-muted">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setOffset(offset + ITEMS_PER_PAGE)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LogEntry({
  log,
  isExpanded,
  onToggle,
}: {
  log: AuditLog;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const actionColor = actionColors[log.action] || "bg-gray-500/20 text-gray-400";
  const hasDetails = log.old_values || log.new_values || Object.keys(log.metadata || {}).length > 0;

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex-shrink-0">
          {hasDetails ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronRight className="h-4 w-4 text-text-muted" />
            )
          ) : (
            <div className="w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-4">
          <Badge variant="default" className={cn("capitalize", actionColor)}>
            {log.action}
          </Badge>

          <span className="text-text-primary font-medium">
            {log.resource_type}
          </span>

          {log.resource_id && (
            <span className="text-text-muted text-sm truncate">
              {log.resource_id.substring(0, 8)}...
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-text-muted">
          {log.profiles && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {log.profiles.full_name || log.profiles.email}
            </span>
          )}

          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {format(new Date(log.created_at), "MMM d, HH:mm")}
          </span>

          {log.ip_address && (
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {log.ip_address}
            </span>
          )}
        </div>
      </button>

      {isExpanded && hasDetails && (
        <div className="px-4 pb-4 pt-0 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {log.old_values && (
              <div>
                <p className="text-sm font-medium text-text-muted mb-2">
                  Previous Values
                </p>
                <pre className="text-xs bg-white/5 p-3 rounded-lg overflow-auto max-h-48 text-text-secondary">
                  {JSON.stringify(log.old_values, null, 2)}
                </pre>
              </div>
            )}

            {log.new_values && (
              <div>
                <p className="text-sm font-medium text-text-muted mb-2">
                  New Values
                </p>
                <pre className="text-xs bg-white/5 p-3 rounded-lg overflow-auto max-h-48 text-text-secondary">
                  {JSON.stringify(log.new_values, null, 2)}
                </pre>
              </div>
            )}

            {Object.keys(log.metadata || {}).length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-text-muted mb-2">
                  Metadata
                </p>
                <pre className="text-xs bg-white/5 p-3 rounded-lg overflow-auto max-h-32 text-text-secondary">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
