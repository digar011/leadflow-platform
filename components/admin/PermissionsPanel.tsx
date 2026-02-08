"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  Activity,
  Megaphone,
  FileText,
  Zap,
  Settings,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { PermissionKey, UserPermissions, UserRole } from "@/lib/types/database";
import {
  PERMISSION_CATEGORIES,
  DEFAULT_PERMISSIONS,
  getEffectivePermissions,
  hasCustomPermissions,
} from "@/lib/utils/permissions";

const ICON_MAP: Record<string, typeof Building2> = {
  Building2,
  Users,
  Activity,
  Megaphone,
  FileText,
  Zap,
  Settings,
};

interface PermissionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (permissions: UserPermissions) => Promise<void>;
  userName: string;
  userRole: UserRole;
  currentPermissions: UserPermissions;
  isSaving?: boolean;
}

export function PermissionsPanel({
  isOpen,
  onClose,
  onSave,
  userName,
  userRole,
  currentPermissions,
  isSaving = false,
}: PermissionsPanelProps) {
  const [localPermissions, setLocalPermissions] = useState<Record<PermissionKey, boolean>>(
    () => getEffectivePermissions(userRole, currentPermissions)
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(PERMISSION_CATEGORIES.map((c) => c.name))
  );

  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (isOpen) {
      setLocalPermissions(getEffectivePermissions(userRole, currentPermissions));
      setExpandedCategories(new Set(PERMISSION_CATEGORIES.map((c) => c.name)));
    }
  }, [isOpen, userRole, currentPermissions]);

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const togglePermission = (key: PermissionKey) => {
    if (isAdmin) return;
    setLocalPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = () => {
    setLocalPermissions(getEffectivePermissions(userRole, {}));
  };

  const handleSave = async () => {
    const defaults = DEFAULT_PERMISSIONS[userRole];
    const overrides: UserPermissions = {};

    for (const [key, value] of Object.entries(localPermissions)) {
      if (defaults[key as PermissionKey] !== value) {
        overrides[key as PermissionKey] = value;
      }
    }

    await onSave(overrides);
  };

  const isCustom = hasCustomPermissions(userRole, currentPermissions);
  const hasLocalChanges = (() => {
    const effective = getEffectivePermissions(userRole, currentPermissions);
    return Object.entries(localPermissions).some(
      ([key, val]) => effective[key as PermissionKey] !== val
    );
  })();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Permissions"
      description={`Configure granular access for ${userName}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Role & Status */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            className={cn(
              userRole === "admin"
                ? "bg-gold/20 text-gold"
                : userRole === "manager"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-white/10 text-text-muted"
            )}
          >
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
          {isCustom && (
            <Badge className="bg-amber-500/20 text-amber-400">Custom Overrides</Badge>
          )}
          {isAdmin && (
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Lock className="h-3 w-3" /> All permissions locked for admins
            </span>
          )}
        </div>

        {/* Reset Button */}
        {!isAdmin && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-text-muted hover:text-text-primary"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset to Role Defaults
            </Button>
          </div>
        )}

        {/* Permission Categories */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {PERMISSION_CATEGORIES.map((category) => {
            const Icon = ICON_MAP[category.icon] || Shield;
            const isExpanded = expandedCategories.has(category.name);
            const enabledCount = category.permissions.filter(
              (p) => localPermissions[p.key]
            ).length;

            return (
              <div
                key={category.name}
                className="rounded-lg border border-white/10 overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="flex w-full items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-text-muted" />
                    <span className="text-sm font-medium text-text-primary">
                      {category.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      {enabledCount}/{category.permissions.length}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-text-muted" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-text-muted" />
                  )}
                </button>

                {/* Permission Toggles */}
                {isExpanded && (
                  <div className="border-t border-white/5 px-4 py-2 space-y-1">
                    {category.permissions.map((perm) => {
                      const isEnabled = localPermissions[perm.key];
                      const isDefault =
                        DEFAULT_PERMISSIONS[userRole][perm.key] === isEnabled;

                      return (
                        <label
                          key={perm.key}
                          className={cn(
                            "flex items-center justify-between py-2 px-2 rounded-md cursor-pointer hover:bg-white/5 transition-colors",
                            isAdmin && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-text-secondary">
                              {perm.label}
                            </span>
                            {!isDefault && !isAdmin && (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isAdmin && <Lock className="h-3 w-3 text-text-muted" />}
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isEnabled}
                              disabled={isAdmin}
                              onClick={(e) => {
                                e.preventDefault();
                                togglePermission(perm.key);
                              }}
                              className={cn(
                                "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
                                isEnabled ? "bg-gold" : "bg-white/20",
                                isAdmin && "opacity-50"
                              )}
                            >
                              <span
                                className={cn(
                                  "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                                  isEnabled ? "translate-x-4" : "translate-x-0"
                                )}
                              />
                            </button>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isAdmin || isSaving || !hasLocalChanges}
          >
            {isSaving ? "Saving..." : "Save Permissions"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
