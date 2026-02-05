"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { useCreateCampaign } from "@/lib/hooks/useCampaigns";

export default function NewCampaignPage() {
  const router = useRouter();
  const createCampaign = useCreateCampaign();

  const handleSubmit = async (data: Parameters<typeof createCampaign.mutateAsync>[0]) => {
    try {
      const campaign = await createCampaign.mutateAsync(data);
      router.push(`/campaigns/${campaign.id}`);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">New Campaign</h1>
          <p className="text-text-secondary">
            Create a new marketing campaign
          </p>
        </div>
      </div>

      {/* Form */}
      <CampaignForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={createCampaign.isPending}
      />
    </div>
  );
}
