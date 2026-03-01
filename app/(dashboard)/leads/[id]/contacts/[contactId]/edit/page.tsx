"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useContact, useUpdateContact } from "@/lib/hooks/useContacts";
import { useLead } from "@/lib/hooks/useLeads";

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;
  const contactId = params.contactId as string;

  const { data: lead } = useLead(businessId);
  const { data: contact, isLoading, error } = useContact(contactId);
  const updateContact = useUpdateContact();

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      await updateContact.mutateAsync({ id: contactId, updates: data as Parameters<typeof updateContact.mutateAsync>[0]["updates"] });
      router.push(`/leads/${businessId}`);
    } catch (error) {
      console.error("Failed to update contact:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
        <div className="h-64 bg-white/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 mx-auto text-text-muted mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Contact Not Found</h2>
        <p className="text-text-secondary mb-4">
          The contact you&apos;re trying to edit doesn&apos;t exist or has been deleted.
        </p>
        <Link href={`/leads/${businessId}`}>
          <Button>Back to Lead</Button>
        </Link>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-text-primary">Edit Contact</h1>
          <p className="text-text-secondary">
            {contact.first_name} {contact.last_name}
            {lead && ` at ${lead.business_name}`}
          </p>
        </div>
      </div>

      {/* Form */}
      <ContactForm
        businessId={businessId}
        mode="edit"
        initialData={{
          first_name: contact.first_name ?? "",
          last_name: contact.last_name ?? "",
          email: contact.email,
          phone: contact.phone,
          job_title: contact.title,
          department: contact.department,
          is_primary: contact.is_primary ?? false,
          notes: contact.notes,
        }}
        onSubmit={handleSubmit}
        isLoading={updateContact.isPending}
      />
    </div>
  );
}
