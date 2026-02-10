"use client";

import { useState } from "react";
import {
  MessageSquare,
  Check,
  Send,
  Trash2,
  ChevronDown,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";
import { useSlackIntegration, SLACK_EVENTS } from "@/lib/hooks/useSlackIntegration";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { UpgradeModal } from "@/components/subscription";
import { cn } from "@/lib/utils";

export function SlackIntegration() {
  const {
    config,
    isLoading,
    saveConfig,
    isSaving,
    deleteConfig,
    isDeleting,
    testConnection,
    isTesting,
  } = useSlackIntegration();

  const { can } = useSubscription();

  const [webhookUrl, setWebhookUrl] = useState("");
  const [channelName, setChannelName] = useState("");
  const [enabledEvents, setEnabledEvents] = useState<string[]>(["lead_created", "deal_won"]);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync form state when config loads
  const isConnected = !!config && config.isActive;

  const handleConnect = async () => {
    if (!can("slackIntegration")) {
      setShowUpgrade(true);
      return;
    }

    if (!webhookUrl.startsWith("https://hooks.slack.com/")) {
      setSaveError("URL must start with https://hooks.slack.com/");
      return;
    }

    setSaveError(null);
    try {
      await saveConfig({
        webhookUrl,
        channelName: channelName || "#general",
        enabledEvents,
        isActive: true,
      });
      setWebhookUrl("");
      setChannelName("");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleUpdateEvents = async (eventValue: string) => {
    if (!config) return;

    const updated = config.enabledEvents.includes(eventValue)
      ? config.enabledEvents.filter((e) => e !== eventValue)
      : [...config.enabledEvents, eventValue];

    await saveConfig({
      ...config,
      enabledEvents: updated,
    });
  };

  const handleTest = async () => {
    setTestResult(null);
    try {
      const result = await testConnection();
      setTestResult(result);
    } catch (err) {
      setTestResult({ ok: false, error: err instanceof Error ? err.message : "Test failed" });
    }
  };

  const handleDisconnect = async () => {
    await deleteConfig();
    setShowDisconnect(false);
    setTestResult(null);
  };

  if (isLoading) {
    return (
      <Card variant="glass">
        <CardContent className="pt-6">
          <div className="h-24 bg-white/5 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A154B]/30">
                <MessageSquare className="h-5 w-5 text-[#E01E5A]" />
              </div>
              <div>
                <span className="block">Slack Integration</span>
                <span className="text-sm font-normal text-text-muted">
                  Send CRM notifications to your Slack workspace
                </span>
              </div>
            </div>
            {isConnected && (
              <Badge className="bg-green-500/20 text-green-400">
                Connected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            /* ── Connected State ── */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Check className="h-4 w-4 text-green-400" />
                Sending to <span className="font-medium text-text-primary">{config.channelName}</span>
              </div>

              {/* Event Toggles */}
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">
                  Notification events
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SLACK_EVENTS.map((event) => (
                    <button
                      key={event.value}
                      onClick={() => handleUpdateEvents(event.value)}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg border text-sm text-left transition-colors",
                        config.enabledEvents.includes(event.value)
                          ? "border-gold/50 bg-gold/10 text-gold"
                          : "border-white/10 text-text-muted hover:border-white/20"
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded border flex items-center justify-center flex-shrink-0",
                          config.enabledEvents.includes(event.value)
                            ? "border-gold bg-gold"
                            : "border-white/30"
                        )}
                      >
                        {config.enabledEvents.includes(event.value) && (
                          <Check className="h-3 w-3 text-background" />
                        )}
                      </div>
                      {event.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTest}
                  disabled={isTesting}
                  leftIcon={
                    isTesting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )
                  }
                >
                  {isTesting ? "Sending..." : "Send Test"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDisconnect(true)}
                  className="text-status-error hover:text-status-error"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Disconnect
                </Button>

                {testResult && (
                  <span
                    className={cn(
                      "text-sm",
                      testResult.ok ? "text-green-400" : "text-status-error"
                    )}
                  >
                    {testResult.ok ? "Message sent!" : testResult.error}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* ── Disconnected State ── */
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Slack Webhook URL
                  </label>
                  <Input
                    value={webhookUrl}
                    onChange={(e) => {
                      setWebhookUrl(e.target.value);
                      setSaveError(null);
                    }}
                    placeholder="https://hooks.slack.com/services/T.../B.../..."
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Channel Name (for display)
                  </label>
                  <Input
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="#sales-leads"
                  />
                </div>

                {/* Event selection */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Events to notify
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SLACK_EVENTS.map((event) => (
                      <button
                        key={event.value}
                        onClick={() =>
                          setEnabledEvents((prev) =>
                            prev.includes(event.value)
                              ? prev.filter((e) => e !== event.value)
                              : [...prev, event.value]
                          )
                        }
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border text-sm text-left transition-colors",
                          enabledEvents.includes(event.value)
                            ? "border-gold/50 bg-gold/10 text-gold"
                            : "border-white/10 text-text-muted hover:border-white/20"
                        )}
                      >
                        <div
                          className={cn(
                            "h-3.5 w-3.5 rounded border flex items-center justify-center flex-shrink-0",
                            enabledEvents.includes(event.value)
                              ? "border-gold bg-gold"
                              : "border-white/30"
                          )}
                        >
                          {enabledEvents.includes(event.value) && (
                            <Check className="h-2.5 w-2.5 text-background" />
                          )}
                        </div>
                        {event.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {saveError && (
                <p className="text-sm text-status-error flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {saveError}
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleConnect}
                  disabled={!webhookUrl || isSaving}
                  leftIcon={
                    isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )
                  }
                >
                  {isSaving ? "Connecting..." : "Connect Slack"}
                </Button>
              </div>

              {/* Setup Instructions */}
              <div>
                <button
                  onClick={() => setShowSetup(!showSetup)}
                  className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors"
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      showSetup && "rotate-180"
                    )}
                  />
                  How to get a webhook URL
                </button>
                {showSetup && (
                  <div className="mt-2 p-3 rounded-lg bg-white/5 text-sm text-text-secondary space-y-2">
                    <p>
                      1. Go to{" "}
                      <a
                        href="https://api.slack.com/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:underline inline-flex items-center gap-1"
                      >
                        api.slack.com/apps <ExternalLink className="h-3 w-3" />
                      </a>{" "}
                      and click <strong>Create New App</strong>
                    </p>
                    <p>2. Choose <strong>From scratch</strong>, name it (e.g. "Goldyon CRM"), and select your workspace</p>
                    <p>3. Go to <strong>Incoming Webhooks</strong> and toggle it <strong>On</strong></p>
                    <p>4. Click <strong>Add New Webhook to Workspace</strong> and pick a channel</p>
                    <p>5. Copy the <strong>Webhook URL</strong> and paste it above</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={showDisconnect}
        onClose={() => setShowDisconnect(false)}
        onConfirm={handleDisconnect}
        title="Disconnect Slack"
        message="Are you sure you want to disconnect Slack? You will stop receiving CRM notifications in your Slack channel."
        confirmText="Disconnect"
        variant="danger"
      />

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="slackIntegration"
        featureLabel="Slack Integration"
      />
    </>
  );
}
