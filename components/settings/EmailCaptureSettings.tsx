"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Copy, Check, ChevronDown, Inbox, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { generateForwardingAddress } from "@/lib/utils/emailCapture";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { CapturedEmail } from "@/lib/types/database";

export function EmailCaptureSettings() {
  const [forwardingAddress, setForwardingAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showGmail, setShowGmail] = useState(false);
  const [showOutlook, setShowOutlook] = useState(false);
  const supabase = getSupabaseClient();

  // Fetch or generate forwarding address
  useEffect(() => {
    async function initForwardingAddress() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if column exists by trying to read it
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("email_forwarding_address")
        .eq("id", user.id)
        .single();

      if (error) {
        // Column may not exist yet (migration not applied) — generate client-side only
        setForwardingAddress(generateForwardingAddress(user.id));
        return;
      }

      if (profile?.email_forwarding_address) {
        setForwardingAddress(profile.email_forwarding_address);
      } else {
        // Generate and try to save
        const address = generateForwardingAddress(user.id);
        await supabase
          .from("profiles")
          .update({ email_forwarding_address: address } as Record<string, string>)
          .eq("id", user.id);
        setForwardingAddress(address);
      }
    }
    initForwardingAddress();
  }, [supabase]);

  // Fetch recent captured emails (gracefully handles missing table)
  const { data: capturedEmails } = useQuery({
    queryKey: ["capturedEmails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("captured_emails")
        .select("*, businesses(business_name)")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) return []; // Table may not exist yet
      return data as (CapturedEmail & { businesses: { business_name: string } | null })[];
    },
  });

  const handleCopy = () => {
    if (forwardingAddress) {
      navigator.clipboard.writeText(forwardingAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-gold" />
          Email Capture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Forwarding Address */}
        <div>
          <p className="text-sm text-text-secondary mb-2">
            Your unique forwarding address:
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-gold select-all">
              {forwardingAddress || "Loading..."}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              disabled={!forwardingAddress}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* How it works */}
        <div>
          <p className="text-sm font-medium text-text-secondary mb-3">How it works</p>
          <div className="space-y-3">
            {[
              { step: "1", text: "Add this address as BCC in your email client" },
              { step: "2", text: "Emails are automatically matched to leads by email address" },
              { step: "3", text: "Matched emails appear in the lead's activity timeline" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <p className="text-sm text-text-secondary">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Setup Guides */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">Quick setup</p>

          {/* Gmail */}
          <button
            onClick={() => setShowGmail(!showGmail)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
          >
            <span className="text-sm text-text-primary">Gmail Setup</span>
            <ChevronDown className={cn("h-4 w-4 text-text-muted transition-transform", showGmail && "rotate-180")} />
          </button>
          {showGmail && (
            <div className="ml-4 p-3 rounded-lg bg-white/5 text-sm text-text-secondary space-y-1">
              <p>1. Open Gmail, click the gear icon, then "See all settings"</p>
              <p>2. Under "General", scroll to "Send mail as"</p>
              <p>3. For automatic BCC: use a browser extension like "Auto BCC for Gmail"</p>
              <p>4. Or simply forward important emails to your CRM address manually</p>
            </div>
          )}

          {/* Outlook */}
          <button
            onClick={() => setShowOutlook(!showOutlook)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
          >
            <span className="text-sm text-text-primary">Outlook Setup</span>
            <ChevronDown className={cn("h-4 w-4 text-text-muted transition-transform", showOutlook && "rotate-180")} />
          </button>
          {showOutlook && (
            <div className="ml-4 p-3 rounded-lg bg-white/5 text-sm text-text-secondary space-y-1">
              <p>1. In Outlook, go to Settings &gt; Mail &gt; Rules</p>
              <p>2. Create a new rule: "Apply to all messages I send"</p>
              <p>3. Action: "Forward a copy to" your CRM forwarding address</p>
              <p>4. Or manually forward important emails to your CRM address</p>
            </div>
          )}

          <p className="text-xs text-text-muted mt-2">
            Tip: You can also just manually forward any important email to your CRM address.
          </p>
        </div>

        {/* Recent Captured Emails */}
        {capturedEmails && capturedEmails.length > 0 && (
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">
              Recent captured emails
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {capturedEmails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Inbox className="h-3 w-3 text-text-muted flex-shrink-0" />
                      <p className="text-text-primary truncate">
                        {email.subject || "(no subject)"}
                      </p>
                    </div>
                    <p className="text-xs text-text-muted truncate ml-5">
                      {email.direction === "inbound" ? "From" : "To"}: {email.from_address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {email.matched && email.business_id ? (
                      <Link
                        href={`/leads/${email.business_id}`}
                        className="flex items-center gap-1 text-xs text-gold hover:underline"
                      >
                        {email.businesses?.business_name || "Matched"}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <Badge variant="secondary" size="sm">
                        Unmatched
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
