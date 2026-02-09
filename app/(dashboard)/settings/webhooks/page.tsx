"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Webhook,
  Plus,
  Trash2,
  Play,
  Pause,
  Copy,
  RefreshCw,
  ExternalLink,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import {
  useWebhooks,
  useCreateWebhook,
  useDeleteWebhook,
  useToggleWebhook,
  useRegenerateWebhookSecret,
  useWebhookDeliveries,
  useWebhookStats,
  WEBHOOK_EVENTS,
} from "@/lib/hooks/useWebhooks";
import ZapierMakeGuide from "@/components/settings/ZapierMakeGuide";
import { cn } from "@/lib/utils";

export default function WebhooksSettingsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);
  const [newWebhookType, setNewWebhookType] = useState<"inbound" | "outbound">("outbound");
  const [newWebhookData, setNewWebhookData] = useState({
    name: "",
    url: "",
    events: [] as string[],
  });

  const { data: webhooks, isLoading } = useWebhooks();
  const { data: stats } = useWebhookStats();
  const { data: deliveries } = useWebhookDeliveries(selectedWebhook || undefined, 10);
  const createWebhook = useCreateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const toggleWebhook = useToggleWebhook();
  const regenerateSecret = useRegenerateWebhookSecret();

  const handleCreate = async () => {
    try {
      const result = await createWebhook.mutateAsync({
        name: newWebhookData.name,
        type: newWebhookType,
        url: newWebhookType === "outbound" ? newWebhookData.url : undefined,
        events: newWebhookData.events,
      });

      // Show the generated secret
      alert(`Webhook created! Secret: ${result.generatedSecret}\n\nSave this secret - it won't be shown again.`);

      setShowCreateModal(false);
      setNewWebhookData({ name: "", url: "", events: [] });
    } catch (error) {
      console.error("Failed to create webhook:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWebhook.mutateAsync(id);
      setShowDeleteModal(null);
    } catch (error) {
      console.error("Failed to delete webhook:", error);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleWebhook.mutateAsync({ id, isActive: !currentStatus });
    } catch (error) {
      console.error("Failed to toggle webhook:", error);
    }
  };

  const handleRegenerateSecret = async (id: string) => {
    try {
      const result = await regenerateSecret.mutateAsync(id);
      alert(`New secret: ${result.newSecret}\n\nSave this secret - it won't be shown again.`);
    } catch (error) {
      console.error("Failed to regenerate secret:", error);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSecret(id);
    setTimeout(() => setCopiedSecret(null), 2000);
  };

  const toggleEvent = (event: string) => {
    setNewWebhookData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const handleCreateFromGuide = (defaults: {
    name: string;
    type: "outbound";
    events: string[];
  }) => {
    setNewWebhookType(defaults.type);
    setNewWebhookData({
      name: defaults.name,
      url: "",
      events: defaults.events,
    });
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Webhooks</h2>
          <p className="text-text-secondary mt-1">
            Configure inbound and outbound webhook integrations
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          New Webhook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
                <Webhook className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.totalWebhooks || 0}
                </p>
                <p className="text-sm text-text-muted">Total Webhooks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <Play className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.activeWebhooks || 0}
                </p>
                <p className="text-sm text-text-muted">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <ExternalLink className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.totalDeliveries || 0}
                </p>
                <p className="text-sm text-text-muted">Deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <Check className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.successRate || 0}%
                </p>
                <p className="text-sm text-text-muted">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zapier & Make Integration Guide */}
      <ZapierMakeGuide onCreateWebhook={handleCreateFromGuide} />

      {/* Webhooks List */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Configured Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : !webhooks?.length ? (
            <div className="text-center py-12">
              <Webhook className="h-12 w-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-secondary">No webhooks configured</p>
              <p className="text-sm text-text-muted mt-1">
                Create a webhook to integrate with external services
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors cursor-pointer",
                    selectedWebhook === webhook.id
                      ? "border-gold bg-gold/10"
                      : "border-white/10 hover:border-white/20 bg-white/5"
                  )}
                  onClick={() => setSelectedWebhook(selectedWebhook === webhook.id ? null : webhook.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          webhook.type === "inbound"
                            ? "bg-blue-500/20"
                            : "bg-purple-500/20"
                        )}
                      >
                        <Webhook
                          className={cn(
                            "h-5 w-5",
                            webhook.type === "inbound"
                              ? "text-blue-400"
                              : "text-purple-400"
                          )}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-text-primary">
                            {webhook.name}
                          </p>
                          <Badge
                            variant="default"
                            size="sm"
                            className={
                              webhook.type === "inbound"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-purple-500/20 text-purple-400"
                            }
                          >
                            {webhook.type}
                          </Badge>
                        </div>
                        {webhook.url && (
                          <p className="text-sm text-text-muted truncate max-w-md">
                            {webhook.url}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={webhook.is_active ? "default" : "secondary"}
                        className={
                          webhook.is_active
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/10 text-text-muted"
                        }
                      >
                        {webhook.is_active ? "Active" : "Inactive"}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(webhook.id, webhook.is_active);
                        }}
                      >
                        {webhook.is_active ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerateSecret(webhook.id);
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-status-error hover:text-status-error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteModal(webhook.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedWebhook === webhook.id && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-text-muted mb-1">Events</p>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events?.length ? (
                              webhook.events.map((event) => (
                                <Badge key={event} variant="secondary" size="sm">
                                  {event}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-text-muted text-sm">All events</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-text-muted mb-1">Last Triggered</p>
                          <p className="text-text-secondary">
                            {webhook.last_triggered_at
                              ? format(new Date(webhook.last_triggered_at), "MMM d, yyyy HH:mm")
                              : "Never"}
                          </p>
                        </div>
                      </div>

                      {/* Recent Deliveries */}
                      {deliveries && deliveries.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-text-muted mb-2">Recent Deliveries</p>
                          <div className="space-y-2">
                            {deliveries.slice(0, 5).map((delivery) => (
                              <div
                                key={delivery.id}
                                className="flex items-center justify-between text-sm p-2 rounded bg-white/5"
                              >
                                <div className="flex items-center gap-2">
                                  {delivery.status === "success" ? (
                                    <Check className="h-4 w-4 text-green-400" />
                                  ) : delivery.status === "failed" ? (
                                    <AlertCircle className="h-4 w-4 text-red-400" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-yellow-400" />
                                  )}
                                  <span className="text-text-secondary">
                                    {delivery.event_type}
                                  </span>
                                </div>
                                <span className="text-text-muted">
                                  {format(new Date(delivery.created_at), "HH:mm:ss")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Webhook"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setNewWebhookType("outbound")}
                className={cn(
                  "p-4 rounded-lg border text-center transition-colors",
                  newWebhookType === "outbound"
                    ? "border-gold bg-gold/10"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <ExternalLink
                  className={cn(
                    "h-5 w-5 mx-auto mb-2",
                    newWebhookType === "outbound" ? "text-gold" : "text-text-muted"
                  )}
                />
                <p
                  className={cn(
                    "font-medium",
                    newWebhookType === "outbound" ? "text-gold" : "text-text-secondary"
                  )}
                >
                  Outbound
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Send data to external services
                </p>
              </button>
              <button
                onClick={() => setNewWebhookType("inbound")}
                className={cn(
                  "p-4 rounded-lg border text-center transition-colors",
                  newWebhookType === "inbound"
                    ? "border-gold bg-gold/10"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <Webhook
                  className={cn(
                    "h-5 w-5 mx-auto mb-2",
                    newWebhookType === "inbound" ? "text-gold" : "text-text-muted"
                  )}
                />
                <p
                  className={cn(
                    "font-medium",
                    newWebhookType === "inbound" ? "text-gold" : "text-text-secondary"
                  )}
                >
                  Inbound
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Receive data from external services
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Name
            </label>
            <Input
              value={newWebhookData.name}
              onChange={(e) =>
                setNewWebhookData({ ...newWebhookData, name: e.target.value })
              }
              placeholder="My Webhook"
            />
          </div>

          {newWebhookType === "outbound" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Endpoint URL
              </label>
              <Input
                value={newWebhookData.url}
                onChange={(e) =>
                  setNewWebhookData({ ...newWebhookData, url: e.target.value })
                }
                placeholder="https://example.com/webhook"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Events
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {WEBHOOK_EVENTS.map((event) => (
                <button
                  key={event.value}
                  onClick={() => toggleEvent(event.value)}
                  className={cn(
                    "p-2 rounded-lg border text-left text-sm transition-colors",
                    newWebhookData.events.includes(event.value)
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-white/10 hover:border-white/20 text-text-secondary"
                  )}
                >
                  {event.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newWebhookData.name || (newWebhookType === "outbound" && !newWebhookData.url)}
            >
              Create Webhook
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={() => showDeleteModal && handleDelete(showDeleteModal)}
        title="Delete Webhook"
        description="Are you sure you want to delete this webhook? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
