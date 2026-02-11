"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  Pause,
  Users,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Mail,
  Phone,
  Megaphone,
  Globe,
  Layers,
  Plus,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";
import { useCampaign, useUpdateCampaign, useDeleteCampaign } from "@/lib/hooks/useCampaigns";
import { formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: campaign, isLoading, error } = useCampaign(campaignId);
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();

  const handleDelete = async () => {
    try {
      await deleteCampaign.mutateAsync(campaignId);
      router.push("/campaigns");
    } catch (error) {
      console.error("Failed to delete campaign:", error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateCampaign.mutateAsync({
        id: campaignId,
        updates: { status: newStatus },
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-64 bg-white/10 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-12">
        <Megaphone className="h-16 w-16 mx-auto text-text-muted mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Campaign Not Found</h2>
        <p className="text-text-secondary mb-4">
          The campaign you're looking for doesn't exist or has been deleted.
        </p>
        <Link href="/campaigns">
          <Button>Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  const typeIcons: Record<string, React.ReactNode> = {
    email: <Mail className="h-5 w-5" />,
    cold_call: <Phone className="h-5 w-5" />,
    mailer: <Megaphone className="h-5 w-5" />,
    social: <Globe className="h-5 w-5" />,
    multi_channel: <Layers className="h-5 w-5" />,
  };

  const statusColors: Record<string, string> = {
    draft: "bg-white/10 text-text-muted",
    active: "bg-green-500/20 text-green-400",
    paused: "bg-yellow-500/20 text-yellow-400",
    completed: "bg-blue-500/20 text-blue-400",
  };

  const budgetProgress = campaign.budget && campaign.spent
    ? (campaign.spent / campaign.budget) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 text-gold">
                {typeIcons[campaign.campaign_type ?? "email"]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {campaign.name}
                </h1>
                <p className="text-sm text-text-secondary capitalize">
                  {(campaign.campaign_type ?? "email").replace(/_/g, " ")} Campaign
                </p>
              </div>
              <Badge
                variant="default"
                className={statusColors[campaign.status ?? "draft"]}
              >
                {campaign.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {campaign.status === "draft" && (
            <Button
              variant="secondary"
              leftIcon={<Play className="h-4 w-4" />}
              onClick={() => handleStatusChange("active")}
            >
              Start Campaign
            </Button>
          )}
          {campaign.status === "active" && (
            <Button
              variant="secondary"
              leftIcon={<Pause className="h-4 w-4" />}
              onClick={() => handleStatusChange("paused")}
            >
              Pause
            </Button>
          )}
          {campaign.status === "paused" && (
            <Button
              variant="secondary"
              leftIcon={<Play className="h-4 w-4" />}
              onClick={() => handleStatusChange("active")}
            >
              Resume
            </Button>
          )}
          <Link href={`/campaigns/${campaignId}/edit`}>
            <Button variant="secondary" leftIcon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteModal(true)}
            className="text-status-error hover:text-status-error"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Campaign Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {campaign.description && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary whitespace-pre-wrap">
                  {campaign.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Campaign Members */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" />
                Campaign Members ({campaign.campaign_members?.length || 0})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                Add Leads
              </Button>
            </CardHeader>
            <CardContent>
              {!campaign.campaign_members?.length ? (
                <div className="text-center py-8 text-text-muted">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No members added yet</p>
                  <p className="text-sm mt-1">
                    Add leads to start this campaign
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {campaign.campaign_members.slice(0, 10).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div>
                        <p className="font-medium text-text-primary">
                          {member.businesses?.business_name || "Unknown"}
                        </p>
                        <p className="text-sm text-text-muted">
                          {member.businesses?.email}
                        </p>
                      </div>
                      <Badge variant="default" size="sm">
                        {member.status}
                      </Badge>
                    </div>
                  ))}
                  {campaign.campaign_members.length > 10 && (
                    <p className="text-center text-sm text-text-muted pt-2">
                      And {campaign.campaign_members.length - 10} more...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Budget Progress */}
          {campaign.budget && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gold" />
                  Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-muted">Spent</span>
                  <span className="text-text-primary font-medium">
                    {formatCurrency(campaign.spent || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Budget</span>
                  <span className="text-text-primary font-medium">
                    {formatCurrency(campaign.budget)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        budgetProgress > 90
                          ? "bg-red-500"
                          : budgetProgress > 70
                          ? "bg-yellow-500"
                          : "bg-gold"
                      )}
                      style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-muted text-right">
                    {budgetProgress.toFixed(1)}% used
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schedule */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gold" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaign.started_at && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Start Date</span>
                  <span className="text-text-primary">
                    {format(new Date(campaign.started_at), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              {campaign.ended_at && (
                <div className="flex justify-between">
                  <span className="text-text-muted">End Date</span>
                  <span className="text-text-primary">
                    {format(new Date(campaign.ended_at), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              {campaign.target_count && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Target</span>
                  <span className="text-text-primary">
                    {campaign.target_count} leads
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gold" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-gold">
                  {campaign.campaign_members?.length || 0}
                </p>
                <p className="text-xs text-text-muted">Total Leads</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-gold">
                  {campaign.campaign_members?.filter((m) => m.status === "contacted").length || 0}
                </p>
                <p className="text-xs text-text-muted">Contacted</p>
              </div>
            </CardContent>
          </Card>

          {/* Owner */}
          {campaign.profiles && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-sm">Created By</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-primary">{campaign.profiles.full_name}</p>
                <p className="text-sm text-text-muted">
                  {format(new Date(campaign.created_at!), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`}
        confirmText="Delete Campaign"
        variant="danger"
        isLoading={deleteCampaign.isPending}
      />
    </div>
  );
}
