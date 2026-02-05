"use client";

import { useState } from "react";
import {
  Bell,
  Mail,
  Smartphone,
  Monitor,
  Save,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

const defaultSettings: NotificationSetting[] = [
  {
    id: "new_lead",
    label: "New Lead",
    description: "When a new lead is created or imported",
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: "lead_assigned",
    label: "Lead Assigned",
    description: "When a lead is assigned to you",
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: "lead_converted",
    label: "Lead Converted",
    description: "When a lead is converted to a customer",
    email: true,
    push: false,
    inApp: true,
  },
  {
    id: "activity_reminder",
    label: "Activity Reminders",
    description: "Reminders for scheduled activities",
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: "campaign_completed",
    label: "Campaign Completed",
    description: "When a campaign finishes running",
    email: true,
    push: false,
    inApp: true,
  },
  {
    id: "automation_triggered",
    label: "Automation Triggered",
    description: "When an automation rule is triggered",
    email: false,
    push: false,
    inApp: true,
  },
  {
    id: "weekly_summary",
    label: "Weekly Summary",
    description: "Weekly performance summary email",
    email: true,
    push: false,
    inApp: false,
  },
  {
    id: "team_updates",
    label: "Team Updates",
    description: "Updates about team members and activities",
    email: false,
    push: false,
    inApp: true,
  },
];

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSetting = (
    id: string,
    channel: "email" | "push" | "inApp"
  ) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id
          ? { ...setting, [channel]: !setting[channel] }
          : setting
      )
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In production, this would save to the database
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            Notification Preferences
          </h2>
          <p className="text-text-secondary mt-1">
            Choose how you want to be notified about activity
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          leftIcon={
            saved ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Save className="h-4 w-4" />
            )
          }
        >
          {saved ? "Saved" : isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Channel Legend */}
      <Card variant="glass">
        <CardContent className="pt-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Mail className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-text-secondary">Email</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-text-secondary">Push</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Monitor className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-text-secondary">In-App</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gold" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5"
              >
                <div>
                  <p className="font-medium text-text-primary">
                    {setting.label}
                  </p>
                  <p className="text-sm text-text-muted">
                    {setting.description}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Email Toggle */}
                  <button
                    onClick={() => toggleSetting(setting.id, "email")}
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                      setting.email
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-white/5 text-text-muted hover:bg-white/10"
                    )}
                    title="Email notifications"
                  >
                    <Mail className="h-5 w-5" />
                  </button>

                  {/* Push Toggle */}
                  <button
                    onClick={() => toggleSetting(setting.id, "push")}
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                      setting.push
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-white/5 text-text-muted hover:bg-white/10"
                    )}
                    title="Push notifications"
                  >
                    <Smartphone className="h-5 w-5" />
                  </button>

                  {/* In-App Toggle */}
                  <button
                    onClick={() => toggleSetting(setting.id, "inApp")}
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                      setting.inApp
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/5 text-text-muted hover:bg-white/10"
                    )}
                    title="In-app notifications"
                  >
                    <Monitor className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Digest Settings */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-gold" />
            Email Digest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <p className="font-medium text-text-primary">
                  Daily Activity Summary
                </p>
                <p className="text-sm text-text-muted">
                  Receive a daily email with your activity summary
                </p>
              </div>
              <ToggleSwitch />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <p className="font-medium text-text-primary">
                  Weekly Performance Report
                </p>
                <p className="text-sm text-text-muted">
                  Receive a weekly email with performance metrics
                </p>
              </div>
              <ToggleSwitch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <p className="font-medium text-text-primary">
                  Marketing Communications
                </p>
                <p className="text-sm text-text-muted">
                  Product updates, tips, and best practices
                </p>
              </div>
              <ToggleSwitch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  return (
    <button
      onClick={() => setIsChecked(!isChecked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        isChecked ? "bg-gold" : "bg-white/20"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          isChecked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
