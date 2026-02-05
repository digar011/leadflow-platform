"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useCreateContact } from "@/lib/hooks/useContacts";
import { useLead } from "@/lib/hooks/useLeads";

export default function NewContactPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const { data: lead } = useLead(businessId);
  const createContact = useCreateContact();

  const handleSubmit = async (data: Parameters<typeof createContact.mutateAsync>[0]) => {
    try {
      await createContact.mutateAsync(data);
      router.push(`/leads/${businessId}`);
    } catch (error) {
      console.error("Failed to create contact:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/leads/${businessId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Add Contact</h1>
          {lead && (
            <p className="text-text-secondary">
              Adding contact to {lead.business_name}
            </p>
          )}
        </div>
      </div>

      {/* Form */}
      <ContactForm
        businessId={businessId}
        mode="create"
        onSubmit={handleSubmit}
        isLoading={createContact.isPending}
      />
    </div>
  );
}
