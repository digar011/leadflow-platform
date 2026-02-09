"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Building, Save, Camera, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  avatar_url: string | null;
  role: string;
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [seedMessage, setSeedMessage] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    company: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile({ ...data, email: user.email || "" });
          setFormData({
            full_name: data.full_name || "",
            phone: data.phone || "",
            company: data.company || "",
          });
        }
      }
      setIsLoading(false);
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...formData });
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Profile Settings</h2>
        <p className="text-text-secondary mt-1">
          Update your personal information
        </p>
      </div>

      {/* Avatar Section */}
      <Card variant="glass">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gold/20 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-gold">
                    {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "?"}
                  </span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-gold text-background hover:bg-gold/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-primary">
                {profile?.full_name || "No name set"}
              </h3>
              <p className="text-text-muted">{profile?.email}</p>
              <p className="text-sm text-text-muted capitalize mt-1">
                {profile?.role} account
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seed Test Data */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gold" />
            Seed Test Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary mb-4">
            Populate the database with 10 sample entries per table (businesses, contacts, activities, campaigns, etc.) and set your account to admin + enterprise tier.
          </p>
          <div className="flex items-center gap-4">
            <Button
              onClick={async () => {
                setSeedStatus("loading");
                setSeedMessage("");
                try {
                  const res = await fetch("/api/admin/seed", { method: "POST" });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Failed to seed");
                  setSeedStatus("success");
                  setSeedMessage(data.message || "Test data created! Refresh the page.");
                  // Reload after short delay so new data shows
                  setTimeout(() => window.location.reload(), 1500);
                } catch (err) {
                  setSeedStatus("error");
                  setSeedMessage(err instanceof Error ? err.message : "Failed to seed data");
                }
              }}
              disabled={seedStatus === "loading"}
              leftIcon={<Database className="h-4 w-4" />}
            >
              {seedStatus === "loading" ? "Seeding..." : "Seed Test Data"}
            </Button>
            {seedMessage && (
              <span className={`text-sm ${seedStatus === "success" ? "text-green-400" : "text-red-400"}`}>
                {seedMessage}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-gold" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="Enter your full name"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={profile?.email || ""}
                disabled
                className="pl-10 opacity-50"
              />
            </div>
            <p className="text-xs text-text-muted mt-1">
              Email cannot be changed here
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter your phone number"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Company
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="Enter your company name"
                className="pl-10"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
