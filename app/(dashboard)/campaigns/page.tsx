"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Megaphone,
  Play,
  Pause,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { useCampaigns, useCampaignStats } from "@/lib/hooks/useCampaigns";
import { formatCurrency } from "@/lib/utils/formatters";
import { CAMPAIGN_TYPES, CAMPAIGN_STATUSES } from "@/lib/utils/constants";

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: campaigns, isLoading, error } = useCampaigns({
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });
  const { data: stats } = useCampaignStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Campaigns</h1>
          <p className="text-text-secondary">
            Manage your marketing campaigns and outreach
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Campaign</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
                <Megaphone className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                <p className="text-xs text-text-muted">Total Campaigns</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <Play className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.active}</p>
                <p className="text-xs text-text-muted">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.completed}</p>
                <p className="text-xs text-text-muted">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" padding="sm">
            <CardContent className="pt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gold">{formatCurrency(stats.totalSpent)}</p>
                <p className="text-xs text-text-muted">Total Spent</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
            options={[{ value: "", label: "All Statuses" }, ...CAMPAIGN_STATUSES]}
          />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-48"
            options={[{ value: "", label: "All Types" }, ...CAMPAIGN_TYPES]}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card variant="outlined" padding="md">
          <CardContent className="text-center text-status-error">
            Failed to load campaigns. Please try again.
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} variant="glass" className="h-48 animate-pulse">
              <CardContent className="pt-4">
                <div className="h-full bg-white/5 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && campaigns?.length === 0 && (
        <div className="text-center py-12">
          <Megaphone className="h-16 w-16 mx-auto text-text-muted mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            {searchQuery || statusFilter || typeFilter
              ? "No campaigns found"
              : "No campaigns yet"}
          </h2>
          <p className="text-text-secondary mb-4">
            {searchQuery || statusFilter || typeFilter
              ? "Try adjusting your filters"
              : "Create your first campaign to start reaching out to leads"}
          </p>
          {!searchQuery && !statusFilter && !typeFilter && (
            <Link href="/campaigns/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Create Campaign
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Campaigns Grid */}
      {!isLoading && campaigns && campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
