"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  DollarSign,
  Calendar,
  Tag,
  User,
  Save,
  X,
  Plus,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { businessSchema } from "@/lib/utils/validation";
import { LEAD_STATUSES, LEAD_TEMPERATURES, LEAD_SOURCES, INDUSTRIES } from "@/lib/utils/constants";
import { useDuplicateCheck } from "@/lib/hooks/useDuplicateCheck";
import { DuplicateWarning } from "@/components/leads/DuplicateWarning";
import type { Business, InsertTables } from "@/lib/types/database";

interface LeadFormProps {
  initialData?: Partial<Business>;
  onSubmit: (data: Partial<InsertTables<"businesses">>) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function LeadForm({ initialData, onSubmit, isLoading, mode }: LeadFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState({
    business_name: initialData?.business_name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    website_url: initialData?.website_url || "",
    street_address: initialData?.street_address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zip_code: initialData?.zip_code || "",
    country: initialData?.country || "USA",
    industry_category: initialData?.industry_category || "",
    status: initialData?.status || "new",
    lead_temperature: initialData?.lead_temperature || "warm",
    source: initialData?.source || "",
    deal_value: initialData?.deal_value?.toString() || "",
    expected_close_date: initialData?.expected_close_date?.split("T")[0] || "",
    next_follow_up: initialData?.next_follow_up?.split("T")[0] || "",
    notes: initialData?.notes || "",
    tags: initialData?.tags || [],
  });

  // Duplicate detection (create mode only)
  const { data: dupData } = useDuplicateCheck(
    {
      business_name: formData.business_name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
    },
    mode === "create"
  );

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      updateField("tags", [...formData.tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const normalizeUrl = (value: string): string => {
    if (!value) return value;
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const normalizePhone = (value: string): string => {
    if (!value) return value;
    const digits = value.replace(/\D/g, "");
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits[0] === "1") {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Prepare data — normalize simple inputs before validation
    const submitData = {
      business_name: formData.business_name,
      email: formData.email || null,
      phone: formData.phone ? normalizePhone(formData.phone) : null,
      website_url: formData.website_url ? normalizeUrl(formData.website_url) : null,
      street_address: formData.street_address || null,
      city: formData.city || null,
      state: formData.state || null,
      zip_code: formData.zip_code || null,
      country: formData.country || null,
      industry_category: formData.industry_category || null,
      status: formData.status,
      lead_temperature: formData.lead_temperature || null,
      source: formData.source || null,
      deal_value: formData.deal_value ? parseFloat(formData.deal_value) : null,
      expected_close_date: formData.expected_close_date || null,
      next_follow_up: formData.next_follow_up || null,
      notes: formData.notes || null,
      tags: formData.tags.length > 0 ? formData.tags : null,
    };

    // Validate with Zod
    const result = businessSchema.safeParse(submitData);
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
      {/* Basic Information */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gold" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Business Name *"
            placeholder="Enter business name"
            value={formData.business_name}
            onChange={(e) => updateField("business_name", e.target.value)}
            error={errors.business_name}
            leftIcon={<Building2 className="h-4 w-4" />}
            className="md:col-span-2"
          />
          <Input
            label="Email"
            type="email"
            placeholder="contact@business.com"
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
          <Input
            label="Website"
            type="text"
            placeholder="example.com"
            value={formData.website_url}
            onChange={(e) => updateField("website_url", e.target.value)}
            error={errors.website_url}
            leftIcon={<Globe className="h-4 w-4" />}
          />
          <Select
            label="Industry"
            value={formData.industry_category}
            onChange={(e) => updateField("industry_category", e.target.value)}
            error={errors.industry_category}
            placeholder="Select industry..."
            options={[...INDUSTRIES]}
          />
        </CardContent>
      </Card>

      {/* Duplicate Warning */}
      {mode === "create" && dupData?.duplicates && dupData.duplicates.length > 0 && (
        <DuplicateWarning duplicates={dupData.duplicates} />
      )}

      {/* Address */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gold" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Street Address"
            placeholder="123 Main St"
            value={formData.street_address}
            onChange={(e) => updateField("street_address", e.target.value)}
            error={errors.street_address}
            className="md:col-span-2"
          />
          <Input
            label="City"
            placeholder="New York"
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
            error={errors.city}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="State"
              placeholder="NY"
              value={formData.state}
              onChange={(e) => updateField("state", e.target.value)}
              error={errors.state}
            />
            <Input
              label="ZIP Code"
              placeholder="10001"
              value={formData.zip_code}
              onChange={(e) => updateField("zip_code", e.target.value)}
              error={errors.zip_code}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lead Details */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gold" />
            Lead Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Status *"
            value={formData.status}
            onChange={(e) => updateField("status", e.target.value)}
            error={errors.status}
            options={[...LEAD_STATUSES]}
          />
          <Select
            label="Temperature"
            value={formData.lead_temperature}
            onChange={(e) => updateField("lead_temperature", e.target.value)}
            error={errors.lead_temperature}
            options={[...LEAD_TEMPERATURES]}
          />
          <Select
            label="Source"
            value={formData.source}
            onChange={(e) => updateField("source", e.target.value)}
            error={errors.source}
            placeholder="Select source..."
            options={[...LEAD_SOURCES]}
          />
        </CardContent>
      </Card>

      {/* Deal Information */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gold" />
            Deal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Deal Value"
            type="number"
            placeholder="10000"
            value={formData.deal_value}
            onChange={(e) => updateField("deal_value", e.target.value)}
            error={errors.deal_value}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />
          <Input
            label="Expected Close Date"
            type="date"
            value={formData.expected_close_date}
            onChange={(e) => updateField("expected_close_date", e.target.value)}
            error={errors.expected_close_date}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
          <Input
            label="Next Follow-up"
            type="date"
            value={formData.next_follow_up}
            onChange={(e) => updateField("next_follow_up", e.target.value)}
            error={errors.next_follow_up}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* Tags */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-gold" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="gold" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1"
            />
            <Button type="button" variant="secondary" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 resize-none"
            rows={4}
            placeholder="Add notes about this lead..."
            value={formData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-status-error">{errors.notes}</p>
          )}
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
          {mode === "create" ? "Create Lead" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
