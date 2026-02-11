"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { useCampaign, useUpdateCampaign } from "@/lib/hooks/useCampaigns";

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const { data: campaign, isLoading, error } = useCampaign(campaignId);
  const updateCampaign = useUpdateCampaign();

  const handleSubmit = async (data: Parameters<typeof updateCampaign.mutateAsync>[0]["updates"]) => {
    try {
      await updateCampaign.mutateAsync({ id: campaignId, updates: data });
      router.push(`/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Failed to update campaign:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
        <div className="h-96 bg-white/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-12">
        <Megaphone className="h-16 w-16 mx-auto text-text-muted mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Campaign Not Found</h2>
        <p className="text-text-secondary mb-4">
          The campaign you're trying to edit doesn't exist or has been deleted.
        </p>
        <Link href="/campaigns">
          <Button>Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/campaigns/${campaignId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Edit Campaign</h1>
          <p className="text-text-secondary">{campaign.name}</p>
        </div>
      </div>

      {/* Form */}
      <CampaignForm
        mode="edit"
        initialData={{
          name: campaign.name ?? "",
          campaign_type: campaign.campaign_type ?? "email",
          status: campaign.status ?? "draft",
          description: campaign.description,
          started_at: campaign.started_at,
          ended_at: campaign.ended_at,
          budget: campaign.budget,
          target_count: campaign.target_count,
        }}
        onSubmit={handleSubmit}
        isLoading={updateCampaign.isPending}
      />
    </div>
  );
}
