"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Shield,
  Mail,
  Database,
  Phone,
  Globe,
  Webhook,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import {
  useApiKeys,
  useCreateApiKey,
  useDeleteApiKey,
  useToggleApiKey,
  API_SCOPES,
  INTEGRATION_TYPES,
} from "@/lib/hooks/useApiKeys";
import { cn } from "@/lib/utils";

const INTEGRATION_ICONS: Record<string, typeof Database> = {
  supabase: Database,
  email: Mail,
  phone: Phone,
  webhook: Webhook,
  crm: Globe,
  custom: Key,
};

const INTEGRATION_COLORS: Record<string, string> = {
  supabase: "text-emerald-400 bg-emerald-500/20",
  email: "text-blue-400 bg-blue-500/20",
  phone: "text-purple-400 bg-purple-500/20",
  webhook: "text-orange-400 bg-orange-500/20",
  crm: "text-pink-400 bg-pink-500/20",
  custom: "text-gold bg-gold/20",
};

export default function ApiKeysSettingsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [newKeyData, setNewKeyData] = useState({
    name: "",
    integrationType: "",
    externalKey: "",
    scopes: [] as string[],
    expiresIn: "",
  });
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showExternalKeys, setShowExternalKeys] = useState<Record<string, boolean>>({});
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: apiKeys, isLoading } = useApiKeys();
  const createApiKey = useCreateApiKey();
  const deleteApiKey = useDeleteApiKey();
  const toggleApiKey = useToggleApiKey();

  const handleCreate = async () => {
    setCreateError(null);
    try {
      let expiresAt: string | undefined;
      if (newKeyData.expiresIn) {
        const days = parseInt(newKeyData.expiresIn);
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiresAt = date.toISOString();
      }

      const result = await createApiKey.mutateAsync({
        name: newKeyData.name,
        scopes: newKeyData.scopes,
        integration_type: newKeyData.integrationType || undefined,
        external_key: newKeyData.externalKey || undefined,
        expires_at: expiresAt,
      });

      setCreatedKey(result.fullKey);
    } catch (error) {
      console.error("Failed to create API key:", error);
      setCreateError(
        error instanceof Error ? error.message : "Failed to create API key. Please try again."
      );
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreatedKey(null);
    setCreateError(null);
    setNewKeyData({ name: "", integrationType: "", externalKey: "", scopes: [], expiresIn: "" });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApiKey.mutateAsync(id);
      setShowDeleteModal(null);
    } catch (error) {
      console.error("Failed to delete API key:", error);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleApiKey.mutateAsync({ id, isActive: !currentStatus });
    } catch (error) {
      console.error("Failed to toggle API key:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const toggleScope = (scope: string) => {
    setNewKeyData((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter((s) => s !== scope)
        : [...prev.scopes, scope],
    }));
  };

  const toggleExternalKeyVisibility = (id: string) => {
    setShowExternalKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedIntegration = INTEGRATION_TYPES.find(
    (t) => t.value === newKeyData.integrationType
  );

  // Button is enabled when name and integration type are provided
  const canCreate = newKeyData.name.trim() !== "" && newKeyData.integrationType !== "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">API Keys</h2>
          <p className="text-text-secondary mt-1">
            Create and manage API keys for integrations and programmatic access
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          New API Key
        </Button>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-400">Keep your API keys secure</p>
          <p className="text-sm text-text-muted mt-1">
            API keys grant access to your account. Never share them publicly or commit them to version control.
          </p>
        </div>
      </div>

      {/* API Keys List */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : !apiKeys?.length ? (
            <div className="text-center py-12">
              <Key className="h-12 w-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-secondary">No API keys created</p>
              <p className="text-sm text-text-muted mt-1">
                Create an API key to connect integrations or access the LeadFlow API
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((apiKey) => {
                const IntegrationIcon =
                  INTEGRATION_ICONS[apiKey.integration_type || "custom"] || Key;
                const integrationColor =
                  INTEGRATION_COLORS[apiKey.integration_type || "custom"] || "text-gold bg-gold/20";

                return (
                  <div
                    key={apiKey.id}
                    className="p-4 rounded-lg border border-white/10 bg-white/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            integrationColor
                          )}
                        >
                          <IntegrationIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-text-primary">
                              {apiKey.name}
                            </p>
                            {apiKey.integration_type && (
                              <Badge variant="secondary" size="sm">
                                {INTEGRATION_TYPES.find(
                                  (t) => t.value === apiKey.integration_type
                                )?.label || apiKey.integration_type}
                              </Badge>
                            )}
                            <Badge
                              variant={apiKey.is_active ? "default" : "secondary"}
                              className={
                                apiKey.is_active
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-white/10 text-text-muted"
                              }
                            >
                              {apiKey.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <code className="text-sm text-text-muted font-mono">
                              {apiKey.key_prefix}...
                            </code>
                            <span className="text-xs text-text-muted">
                              Created {format(new Date(apiKey.created_at), "MMM d, yyyy")}
                            </span>
                            {apiKey.last_used_at && (
                              <span className="text-xs text-text-muted">
                                Last used {format(new Date(apiKey.last_used_at), "MMM d, yyyy")}
                              </span>
                            )}
                            {apiKey.expires_at && (
                              <span className="text-xs text-yellow-400">
                                Expires {format(new Date(apiKey.expires_at), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {apiKey.external_key && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExternalKeyVisibility(apiKey.id)}
                            title={showExternalKeys[apiKey.id] ? "Hide key" : "Show key"}
                          >
                            {showExternalKeys[apiKey.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(apiKey.id, apiKey.is_active)}
                        >
                          {apiKey.is_active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-status-error hover:text-status-error"
                          onClick={() => setShowDeleteModal(apiKey.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* External Key Preview */}
                    {apiKey.external_key && showExternalKeys[apiKey.id] && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-text-muted mb-1">External Key</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-text-secondary font-mono bg-white/5 px-2 py-1 rounded break-all flex-1">
                            {apiKey.external_key}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.external_key!)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Scopes */}
                    {apiKey.scopes?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-text-muted mb-2">Scopes</p>
                        <div className="flex flex-wrap gap-1">
                          {apiKey.scopes.map((scope) => (
                            <Badge key={scope} variant="secondary" size="sm">
                              <Shield className="h-3 w-3 mr-1" />
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        title={createdKey ? "API Key Created" : "Create API Key"}
        size="lg"
      >
        {createdKey ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-400">
                    API key created successfully
                  </p>
                  <p className="text-sm text-text-muted mt-1">
                    Copy this key now. You won&apos;t be able to see it again.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between gap-4">
                <code className="text-sm font-mono text-text-primary break-all">
                  {createdKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdKey)}
                >
                  {copiedKey ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCloseCreateModal}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Integration Type */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Integration Type
              </label>
              <p className="text-xs text-text-muted mb-3">
                Select what this API key will be used for
              </p>
              <div className="grid grid-cols-2 gap-2">
                {INTEGRATION_TYPES.map((type) => {
                  const Icon = INTEGRATION_ICONS[type.value] || Key;
                  const color = INTEGRATION_COLORS[type.value] || "text-gold bg-gold/20";
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setNewKeyData((prev) => ({
                          ...prev,
                          integrationType: type.value,
                          name: prev.name || `${type.label} Key`,
                        }))
                      }
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                        newKeyData.integrationType === type.value
                          ? "border-gold bg-gold/10 ring-1 ring-gold/30"
                          : "border-white/10 hover:border-white/20"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          color
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p
                          className={cn(
                            "text-sm font-medium",
                            newKeyData.integrationType === type.value
                              ? "text-gold"
                              : "text-text-secondary"
                          )}
                        >
                          {type.label}
                        </p>
                        <p className="text-xs text-text-muted">{type.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Key Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Key Name
              </label>
              <Input
                value={newKeyData.name}
                onChange={(e) =>
                  setNewKeyData({ ...newKeyData, name: e.target.value })
                }
                placeholder="e.g., Production Supabase Key"
              />
            </div>

            {/* External Key Input - shown when integration type is selected */}
            {selectedIntegration && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  API Key / Secret
                </label>
                <p className="text-xs text-text-muted mb-2">
                  Paste your {selectedIntegration.label} API key to store it securely
                </p>
                <Input
                  type="password"
                  value={newKeyData.externalKey}
                  onChange={(e) =>
                    setNewKeyData({ ...newKeyData, externalKey: e.target.value })
                  }
                  placeholder={selectedIntegration.placeholder}
                />
              </div>
            )}

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Expiration (optional)
              </label>
              <select
                value={newKeyData.expiresIn}
                onChange={(e) =>
                  setNewKeyData({ ...newKeyData, expiresIn: e.target.value })
                }
                className="w-full bg-surface-elevated border border-white/10 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                <option value="">Never expires</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>

            {/* Scopes */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Scopes (optional)
              </label>
              <p className="text-xs text-text-muted mb-2">
                Restrict what this key can access. Leave empty for full access.
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {API_SCOPES.map((scope) => (
                  <button
                    key={scope.value}
                    type="button"
                    onClick={() => toggleScope(scope.value)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-colors",
                      newKeyData.scopes.includes(scope.value)
                        ? "border-gold bg-gold/10"
                        : "border-white/10 hover:border-white/20"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-medium",
                        newKeyData.scopes.includes(scope.value)
                          ? "text-gold"
                          : "text-text-secondary"
                      )}
                    >
                      {scope.label}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {scope.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Error message */}
            {createError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{createError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseCreateModal}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!canCreate}
                loading={createApiKey.isPending}
              >
                Create Key
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={() => showDeleteModal && handleDelete(showDeleteModal)}
        title="Delete API Key"
        message="Are you sure you want to delete this API key? Any applications using this key will lose access."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
