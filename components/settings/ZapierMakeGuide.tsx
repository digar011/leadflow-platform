"use client";

import { useState } from "react";
import {
  Zap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Webhook,
  ArrowRight,
  Copy,
  Check,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const ZAPIER_MAKE_EVENTS = [
  {
    value: "lead.created",
    label: "Lead Created",
    description: "Fires when a new lead is added to the CRM",
  },
  {
    value: "lead.updated",
    label: "Lead Updated",
    description: "Fires when any lead field is modified",
  },
  {
    value: "lead.deleted",
    label: "Lead Deleted",
    description: "Fires when a lead is removed from the CRM",
  },
  {
    value: "contact.created",
    label: "Contact Created",
    description: "Fires when a new contact is created under a lead",
  },
  {
    value: "activity.logged",
    label: "Activity Logged",
    description: "Fires when an activity (call, email, note, etc.) is recorded",
  },
  {
    value: "lead.status_changed",
    label: "Status Changed",
    description: "Fires when a lead moves to a different pipeline stage",
  },
];

interface StepContent {
  platform: "zapier" | "make";
  steps: { title: string; detail: string }[];
}

const SETUP_INSTRUCTIONS: StepContent[] = [
  {
    platform: "zapier",
    steps: [
      {
        title: "Create a new Zap in your Zapier account",
        detail:
          'Click "+ Create" and select "Zaps" to start building a new automation.',
      },
      {
        title: 'Choose "Webhooks by Zapier" as your trigger app',
        detail:
          'Search for "Webhooks by Zapier" and select "Catch Hook" as the trigger event. This gives you a webhook URL.',
      },
      {
        title: "Copy the Zapier webhook URL",
        detail:
          "Zapier will generate a unique URL. Copy it -- you will paste it into LeadFlow in the next step.",
      },
      {
        title: "Create an Outbound Webhook in LeadFlow",
        detail:
          'Click the "Create Webhook for Zapier" button below. Paste the Zapier URL and select the events you want to send.',
      },
      {
        title: "Test the connection",
        detail:
          'Go back to Zapier and click "Test trigger" to verify that LeadFlow can send data. Then configure your Zap actions (e.g., send to Google Sheets, Slack, email).',
      },
    ],
  },
  {
    platform: "make",
    steps: [
      {
        title: "Create a new Scenario in Make",
        detail:
          "Open Make (formerly Integromat) and create a new scenario.",
      },
      {
        title: 'Add a "Webhooks" module as the trigger',
        detail:
          'Search for "Webhooks" and select "Custom webhook". Click "Add" to create a new webhook and copy the generated URL.',
      },
      {
        title: "Copy the Make webhook URL",
        detail:
          "Make will display a unique URL for your webhook. Copy it for use in LeadFlow.",
      },
      {
        title: "Create an Outbound Webhook in LeadFlow",
        detail:
          'Click the "Create Webhook for Make" button below. Paste the Make URL and select the events you want to forward.',
      },
      {
        title: "Test and configure the scenario",
        detail:
          'Click "Run once" in Make, then trigger a test event in LeadFlow. Make will detect the data structure automatically. Add your action modules (e.g., Google Sheets, CRM, email).',
      },
    ],
  },
];

interface ZapierMakeGuideProps {
  onCreateWebhook: (defaults: {
    name: string;
    type: "outbound";
    events: string[];
  }) => void;
}

export default function ZapierMakeGuide({
  onCreateWebhook,
}: ZapierMakeGuideProps) {
  const [expandedPlatform, setExpandedPlatform] = useState<
    "zapier" | "make" | null
  >(null);
  const [copiedEvent, setCopiedEvent] = useState<string | null>(null);

  const togglePlatform = (platform: "zapier" | "make") => {
    setExpandedPlatform(expandedPlatform === platform ? null : platform);
  };

  const handleCreateForPlatform = (platform: "zapier" | "make") => {
    const allEventValues = ZAPIER_MAKE_EVENTS.map((e) => e.value);
    const displayName = platform === "zapier" ? "Zapier" : "Make";
    onCreateWebhook({
      name: `${displayName} Integration`,
      type: "outbound",
      events: allEventValues,
    });
  };

  const copyEventName = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedEvent(value);
    setTimeout(() => setCopiedEvent(null), 2000);
  };

  const webhookEndpoint =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/n8n`
      : "/api/webhooks/n8n";

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
              <Zap className="h-5 w-5 text-gold" />
            </div>
            <div>
              <CardTitle>Zapier &amp; Make Integration</CardTitle>
              <p className="text-sm text-text-muted mt-1">
                Connect LeadFlow to 5,000+ apps using Zapier or Make
              </p>
            </div>
          </div>
          <Badge variant="gold" size="md">
            No-Code
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* How it works */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-gold mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-text-primary mb-1">
                  How it works
                </p>
                <p className="text-sm text-text-secondary">
                  LeadFlow uses outbound webhooks to push real-time event data to
                  Zapier and Make. When something happens in your CRM (e.g., a
                  new lead is created), LeadFlow sends a JSON payload to the
                  webhook URL you configure. Zapier or Make receives the payload
                  and triggers your automation workflow.
                </p>
              </div>
            </div>
          </div>

          {/* Supported events */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">
              Supported Events
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ZAPIER_MAKE_EVENTS.map((event) => (
                <button
                  key={event.value}
                  onClick={() => copyEventName(event.value)}
                  className="group flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/5 transition-colors text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" size="sm">
                        {event.value}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted mt-1 truncate">
                      {event.description}
                    </p>
                  </div>
                  <span className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedEvent === event.value ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-text-muted" />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Inbound endpoint info */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-text-primary mb-1">
              Inbound Webhook Endpoint
            </p>
            <p className="text-xs text-text-muted mb-2">
              To send data <em>into</em> LeadFlow from Zapier or Make, use this
              endpoint with an inbound webhook:
            </p>
            <code className="block text-xs bg-black/30 text-gold px-3 py-2 rounded-md font-mono break-all">
              {webhookEndpoint}
            </code>
          </div>

          {/* Platform-specific instructions */}
          <div className="space-y-3">
            {SETUP_INSTRUCTIONS.map((instruction) => {
              const isExpanded = expandedPlatform === instruction.platform;
              const isZapier = instruction.platform === "zapier";
              const platformLabel = isZapier ? "Zapier" : "Make";

              return (
                <div
                  key={instruction.platform}
                  className="rounded-lg border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => togglePlatform(instruction.platform)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg",
                          isZapier
                            ? "bg-orange-500/20"
                            : "bg-purple-500/20"
                        )}
                      >
                        {isZapier ? (
                          <Zap
                            className="h-4.5 w-4.5 text-orange-400"
                          />
                        ) : (
                          <Webhook
                            className="h-4.5 w-4.5 text-purple-400"
                          />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-text-primary">
                          Connect with {platformLabel}
                        </p>
                        <p className="text-xs text-text-muted">
                          {isZapier
                            ? "Step-by-step guide for Zapier webhooks"
                            : "Step-by-step guide for Make (Integromat) webhooks"}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-text-muted" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-text-muted" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/10">
                      <ol className="mt-4 space-y-4">
                        {instruction.steps.map((step, index) => (
                          <li key={index} className="flex gap-3">
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5",
                                isZapier
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-purple-500/20 text-purple-400"
                              )}
                            >
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-text-primary text-sm">
                                {step.title}
                              </p>
                              <p className="text-xs text-text-muted mt-0.5">
                                {step.detail}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button
                          onClick={() =>
                            handleCreateForPlatform(instruction.platform)
                          }
                          leftIcon={<Webhook className="h-4 w-4" />}
                        >
                          Create Webhook for {platformLabel}
                        </Button>
                        <Button
                          variant="outline"
                          rightIcon={
                            <ExternalLink className="h-3.5 w-3.5" />
                          }
                          onClick={() =>
                            window.open(
                              isZapier
                                ? "https://zapier.com/apps/webhooks/integrations"
                                : "https://www.make.com/en/help/tools/webhooks",
                              "_blank"
                            )
                          }
                        >
                          {platformLabel} Docs
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick-start action */}
          <div className="flex items-center justify-between rounded-lg border border-gold/20 bg-gold/5 p-4">
            <div className="flex items-center gap-3">
              <ArrowRight className="h-5 w-5 text-gold" />
              <div>
                <p className="font-medium text-text-primary text-sm">
                  Quick start
                </p>
                <p className="text-xs text-text-muted">
                  Create an outbound webhook pre-configured with all supported
                  events for Zapier or Make.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() =>
                handleCreateForPlatform(
                  expandedPlatform === "make" ? "make" : "zapier"
                )
              }
            >
              Create Webhook
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
