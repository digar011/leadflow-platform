"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LeadForm } from "@/components/leads/LeadForm";
import { useCreateLead } from "@/lib/hooks/useLeads";

export default function NewLeadPage() {
  const router = useRouter();
  const createLead = useCreateLead();

  const handleSubmit = async (data: Parameters<typeof createLead.mutateAsync>[0]) => {
    try {
      const lead = await createLead.mutateAsync(data);
      router.push(`/leads/${lead.id}`);
    } catch (error) {
      console.error("Failed to create lead:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/leads">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Add New Lead</h1>
          <p className="text-text-secondary">
            Create a new lead to track in your pipeline
          </p>
        </div>
      </div>

      {/* Form */}
      <LeadForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={createLead.isPending}
      />
    </div>
  );
}
