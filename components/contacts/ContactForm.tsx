"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Briefcase, Building2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { contactSchema } from "@/lib/utils/validation";
import type { InsertTables, UpdateTables } from "@/lib/types/database";

interface ContactFormProps {
  businessId: string;
  initialData?: Partial<{
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    job_title: string | null;
    department: string | null;
    is_primary: boolean;
    notes: string | null;
  }>;
  onSubmit: (data: InsertTables<"contacts"> | UpdateTables<"contacts">) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function ContactForm({
  businessId,
  initialData,
  onSubmit,
  isLoading,
  mode,
}: ContactFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    job_title: initialData?.job_title || "",
    department: initialData?.department || "",
    is_primary: initialData?.is_primary || false,
    notes: initialData?.notes || "",
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const submitData = {
      business_id: businessId,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || null,
      phone: formData.phone || null,
      job_title: formData.job_title || null,
      department: formData.department || null,
      is_primary: formData.is_primary,
      notes: formData.notes || null,
    };

    const result = contactSchema.safeParse(submitData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      const zodErrors = result.error?.issues ?? [];
      zodErrors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-gold" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            placeholder="John"
            value={formData.first_name}
            onChange={(e) => updateField("first_name", e.target.value)}
            error={errors.first_name}
            leftIcon={<User className="h-4 w-4" />}
          />
          <Input
            label="Last Name *"
            placeholder="Doe"
            value={formData.last_name}
            onChange={(e) => updateField("last_name", e.target.value)}
            error={errors.last_name}
            leftIcon={<User className="h-4 w-4" />}
          />
          <Input
            label="Email"
            type="email"
            placeholder="john.doe@example.com"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="h-4 w-4" />}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            error={errors.phone}
            leftIcon={<Phone className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* Job Information */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gold" />
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Job Title"
            placeholder="Marketing Manager"
            value={formData.job_title}
            onChange={(e) => updateField("job_title", e.target.value)}
            error={errors.job_title}
            leftIcon={<Briefcase className="h-4 w-4" />}
          />
          <Input
            label="Department"
            placeholder="Marketing"
            value={formData.department}
            onChange={(e) => updateField("department", e.target.value)}
            error={errors.department}
            leftIcon={<Building2 className="h-4 w-4" />}
          />
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_primary}
                onChange={(e) => updateField("is_primary", e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/50"
              />
              <span className="text-sm text-text-secondary">
                Set as primary contact for this business
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 resize-none"
            rows={4}
            placeholder="Add notes about this contact..."
            value={formData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          leftIcon={<Save className="h-4 w-4" />}
        >
          {mode === "create" ? "Add Contact" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
