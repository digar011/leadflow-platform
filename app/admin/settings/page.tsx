"use client";

import { useState } from "react";
import {
  Save,
  Building,
  Globe,
  Shield,
  Zap,
  Gauge,
  Check,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSystemSettings, useUpdateSystemSetting } from "@/lib/hooks/useAdmin";
import { cn } from "@/lib/utils";

const categoryConfig: Record<string, { icon: React.ElementType; label: string; description: string }> = {
  branding: {
    icon: Building,
    label: "Branding",
    description: "Company name and branding settings",
  },
  general: {
    icon: Globe,
    label: "General",
    description: "Default timezone, date format, and currency",
  },
  features: {
    icon: Zap,
    label: "Features",
    description: "Enable or disable platform features",
  },
  limits: {
    icon: Gauge,
    label: "Limits",
    description: "System resource limits",
  },
  security: {
    icon: Shield,
    label: "Security",
    description: "Security and session settings",
  },
};

export default function AdminSettingsPage() {
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [seedMessage, setSeedMessage] = useState("");

  const handleSeedData = async () => {
    setSeedStatus("loading");
    setSeedMessage("");
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seed");
      setSeedStatus("success");
      setSeedMessage(data.message || "Test data created! Refresh the page to see it.");
    } catch (err) {
      setSeedStatus("error");
      setSeedMessage(err instanceof Error ? err.message : "Failed to seed data");
    }
  };

  const { data: settings, isLoading } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();

  // Group settings by category
  const groupedSettings = settings?.reduce((acc, setting) => {
    const category = setting.category || "general";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, typeof settings>);

  const handleValueChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
    setSavedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  };

  const handleSave = async (key: string) => {
    const value = editedValues[key];
    if (value === undefined) return;

    try {
      // Parse the value appropriately
      let parsedValue: unknown;
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }

      await updateSetting.mutateAsync({ key, value: parsedValue });

      setSavedKeys((prev) => new Set(prev).add(key));
      setEditedValues((prev) => {
        const newValues = { ...prev };
        delete newValues[key];
        return newValues;
      });

      // Remove saved indicator after 2 seconds
      setTimeout(() => {
        setSavedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error("Failed to save setting:", error);
    }
  };

  const getDisplayValue = (setting: { key: string; value: unknown }) => {
    if (editedValues[setting.key] !== undefined) {
      return editedValues[setting.key];
    }
    if (typeof setting.value === "string") {
      return setting.value;
    }
    return JSON.stringify(setting.value);
  };

  const hasChanges = (key: string) => editedValues[key] !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">System Settings</h1>
        <p className="text-text-secondary mt-1">
          Configure global platform settings and preferences
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Seed Test Data */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
                  <Database className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <span className="block">Seed Test Data</span>
                  <span className="text-sm font-normal text-text-muted">
                    Populate the database with 10 sample entries per table for testing
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleSeedData}
                  disabled={seedStatus === "loading"}
                  leftIcon={<Database className="h-4 w-4" />}
                >
                  {seedStatus === "loading" ? "Seeding..." : "Seed Test Data"}
                </Button>
                {seedMessage && (
                  <span className={cn(
                    "text-sm",
                    seedStatus === "success" ? "text-status-success" : "text-status-error"
                  )}>
                    {seedMessage}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-3">
                Creates 10 businesses, contacts, activities, campaigns, automation rules, and reports. Also sets your account to admin + enterprise tier.
              </p>
            </CardContent>
          </Card>

          {Object.entries(categoryConfig).map(([category, config]) => {
            const categorySettings = groupedSettings?.[category];
            if (!categorySettings?.length) return null;

            const Icon = config.icon;

            return (
              <Card key={category} variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <span className="block">{config.label}</span>
                      <span className="text-sm font-normal text-text-muted">
                        {config.description}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categorySettings.map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center gap-4 p-4 rounded-lg bg-white/5"
                      >
                        <div className="flex-1 min-w-0">
                          <label className="block text-sm font-medium text-text-primary mb-1">
                            {formatSettingLabel(setting.key)}
                          </label>
                          {setting.description && (
                            <p className="text-xs text-text-muted mb-2">
                              {setting.description}
                            </p>
                          )}
                          {typeof setting.value === "boolean" ? (
                            <button
                              onClick={() => {
                                const currentValue = editedValues[setting.key] !== undefined
                                  ? editedValues[setting.key] === "true"
                                  : setting.value;
                                handleValueChange(setting.key, (!currentValue).toString());
                              }}
                              className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                (editedValues[setting.key] !== undefined
                                  ? editedValues[setting.key] === "true"
                                  : setting.value)
                                  ? "bg-gold"
                                  : "bg-white/20"
                              )}
                            >
                              <span
                                className={cn(
                                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                  (editedValues[setting.key] !== undefined
                                    ? editedValues[setting.key] === "true"
                                    : setting.value)
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                )}
                              />
                            </button>
                          ) : (
                            <Input
                              value={getDisplayValue(setting)}
                              onChange={(e) =>
                                handleValueChange(setting.key, e.target.value)
                              }
                              className="max-w-md"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {savedKeys.has(setting.key) && (
                            <span className="flex items-center gap-1 text-sm text-green-400">
                              <Check className="h-4 w-4" />
                              Saved
                            </span>
                          )}
                          {hasChanges(setting.key) && (
                            <Button
                              size="sm"
                              onClick={() => handleSave(setting.key)}
                              disabled={updateSetting.isPending}
                              leftIcon={<Save className="h-4 w-4" />}
                            >
                              Save
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatSettingLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
