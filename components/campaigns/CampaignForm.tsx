"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Mail,
  Phone,
  Globe,
  Layers,
  Calendar,
  DollarSign,
  Target,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { campaignSchema } from "@/lib/utils/validation";
import { CAMPAIGN_TYPES, CAMPAIGN_STATUSES } from "@/lib/utils/constants";
import type { InsertTables, UpdateTables } from "@/lib/types/database";

interface CampaignFormProps {
  initialData?: Partial<{
    name: string;
    campaign_type: string;
    status: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    budget: number | null;
    target_count: number | null;
    target_criteria: Record<string, unknown> | null;
  }>;
  onSubmit: (data: InsertTables<"campaigns"> | UpdateTables<"campaigns">) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function CampaignForm({
  initialData,
  onSubmit,
  isLoading,
  mode,
}: CampaignFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    campaign_type: initialData?.campaign_type || "email",
    status: initialData?.status || "draft",
    description: initialData?.description || "",
    start_date: initialData?.start_date?.split("T")[0] || "",
    end_date: initialData?.end_date?.split("T")[0] || "",
    budget: initialData?.budget?.toString() || "",
    target_count: initialData?.target_count?.toString() || "",
  });

  const updateField = (field: string, value: string) => {
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
      name: formData.name,
      campaign_type: formData.campaign_type,
      status: formData.status,
      description: formData.description || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      target_count: formData.target_count ? parseInt(formData.target_count) : null,
    };

    const result = campaignSchema.safeParse(submitData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
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

  const typeIcons: Record<string, React.ReactNode> = {
    email: <Mail className="h-5 w-5" />,
    cold_call: <Phone className="h-5 w-5" />,
    mailer: <Megaphone className="h-5 w-5" />,
    social: <Globe className="h-5 w-5" />,
    multi_channel: <Layers className="h-5 w-5" />,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-gold" />
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Campaign Name *"
            placeholder="Summer Outreach 2024"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            error={errors.name}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Campaign Type *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CAMPAIGN_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField("campaign_type", type.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                      formData.campaign_type === type.value
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-white/10 bg-white/5 text-text-secondary hover:border-white/20"
                    }`}
                  >
                    {typeIcons[type.value]}
                    <span className="text-xs">{type.label.replace(" Campaign", "")}</span>
                  </button>
                ))}
              </div>
              {errors.campaign_type && (
                <p className="mt-1 text-sm text-status-error">{errors.campaign_type}</p>
              )}
            </div>

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => updateField("status", e.target.value)}
              error={errors.status}
            >
              {CAMPAIGN_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 resize-none"
              rows={3}
              placeholder="Describe the campaign goals and strategy..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Budget */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gold" />
            Schedule & Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(e) => updateField("start_date", e.target.value)}
            error={errors.start_date}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
          <Input
            label="End Date"
            type="date"
            value={formData.end_date}
            onChange={(e) => updateField("end_date", e.target.value)}
            error={errors.end_date}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
          <Input
            label="Budget"
            type="number"
            placeholder="5000"
            value={formData.budget}
            onChange={(e) => updateField("budget", e.target.value)}
            error={errors.budget}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />
          <Input
            label="Target Count"
            type="number"
            placeholder="500"
            value={formData.target_count}
            onChange={(e) => updateField("target_count", e.target.value)}
            error={errors.target_count}
            leftIcon={<Target className="h-4 w-4" />}
            hint="Number of leads to target"
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
          {mode === "create" ? "Create Campaign" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
