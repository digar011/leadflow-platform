"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LeadForm } from "@/components/leads/LeadForm";
import { useLead, useUpdateLead } from "@/lib/hooks/useLeads";

export default function EditLeadPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const { data: lead, isLoading, error } = useLead(leadId);
  const updateLead = useUpdateLead();

  const handleSubmit = async (data: Parameters<typeof updateLead.mutateAsync>[0]["updates"]) => {
    try {
      await updateLead.mutateAsync({ id: leadId, updates: data });
      router.push(`/leads/${leadId}`);
    } catch (error) {
      console.error("Failed to update lead:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
        <div className="h-96 bg-white/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 mx-auto text-text-muted mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Lead Not Found</h2>
        <p className="text-text-secondary mb-4">
          The lead you're trying to edit doesn't exist or has been deleted.
        </p>
        <Link href="/leads">
          <Button>Back to Leads</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/leads/${leadId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Edit Lead</h1>
          <p className="text-text-secondary">{lead.business_name}</p>
        </div>
      </div>

      {/* Form */}
      <LeadForm
        mode="edit"
        initialData={lead}
        onSubmit={handleSubmit}
        isLoading={updateLead.isPending}
      />
    </div>
  );
}
