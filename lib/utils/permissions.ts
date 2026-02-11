import type { PermissionKey, UserPermissions, UserRole } from "@/lib/types/database";

export interface PermissionItem {
  key: PermissionKey;
  label: string;
}

export interface PermissionCategory {
  name: string;
  icon: string;
  permissions: PermissionItem[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    name: "Leads",
    icon: "Building2",
    permissions: [
      { key: "leads.view", label: "View leads" },
      { key: "leads.create", label: "Create leads" },
      { key: "leads.edit", label: "Edit leads" },
      { key: "leads.delete", label: "Delete leads" },
    ],
  },
  {
    name: "Contacts",
    icon: "Users",
    permissions: [
      { key: "contacts.view", label: "View contacts" },
      { key: "contacts.create", label: "Create contacts" },
      { key: "contacts.edit", label: "Edit contacts" },
      { key: "contacts.delete", label: "Delete contacts" },
    ],
  },
  {
    name: "Activities",
    icon: "Activity",
    permissions: [
      { key: "activities.view", label: "View activities" },
      { key: "activities.create", label: "Create activities" },
    ],
  },
  {
    name: "Campaigns",
    icon: "Megaphone",
    permissions: [
      { key: "campaigns.view", label: "View campaigns" },
      { key: "campaigns.create", label: "Create campaigns" },
      { key: "campaigns.edit", label: "Edit campaigns" },
      { key: "campaigns.delete", label: "Delete campaigns" },
    ],
  },
  {
    name: "Reports",
    icon: "FileText",
    permissions: [
      { key: "reports.view", label: "View reports" },
      { key: "reports.create", label: "Create reports" },
    ],
  },
  {
    name: "Automation",
    icon: "Zap",
    permissions: [
      { key: "automation.view", label: "View automation rules" },
      { key: "automation.create", label: "Create automation rules" },
      { key: "automation.edit", label: "Edit automation rules" },
      { key: "automation.delete", label: "Delete automation rules" },
    ],
  },
  {
    name: "Settings",
    icon: "Settings",
    permissions: [
      { key: "settings.view", label: "View settings" },
      { key: "settings.edit", label: "Edit settings" },
    ],
  },
];

const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSION_CATEGORIES.flatMap(
  (cat) => cat.permissions.map((p) => p.key)
);

function makePermissionMap(enabled: PermissionKey[]): Record<PermissionKey, boolean> {
  const map = {} as Record<PermissionKey, boolean>;
  for (const key of ALL_PERMISSION_KEYS) {
    map[key] = enabled.includes(key);
  }
  return map;
}

export const DEFAULT_PERMISSIONS: Record<UserRole, Record<PermissionKey, boolean>> = {
  super_admin: makePermissionMap(ALL_PERMISSION_KEYS),
  org_admin: makePermissionMap(ALL_PERMISSION_KEYS),
  admin: makePermissionMap(ALL_PERMISSION_KEYS),
  manager: makePermissionMap([
    "leads.view", "leads.create", "leads.edit",
    "contacts.view", "contacts.create", "contacts.edit",
    "activities.view", "activities.create",
    "campaigns.view", "campaigns.create", "campaigns.edit",
    "reports.view", "reports.create",
    "automation.view", "automation.create", "automation.edit",
    "settings.view",
  ]),
  user: makePermissionMap([
    "leads.view", "leads.create",
    "contacts.view", "contacts.create",
    "activities.view", "activities.create",
    "campaigns.view",
    "reports.view",
    "automation.view",
    "settings.view",
  ]),
};

export function getEffectivePermissions(
  role: UserRole,
  overrides: UserPermissions = {}
): Record<PermissionKey, boolean> {
  const defaults = DEFAULT_PERMISSIONS[role];
  const result = { ...defaults };
  for (const [key, value] of Object.entries(overrides)) {
    if (key in result && typeof value === "boolean") {
      result[key as PermissionKey] = value;
    }
  }
  return result;
}

export function hasPermission(
  role: UserRole,
  overrides: UserPermissions = {},
  key: PermissionKey
): boolean {
  if (role === "super_admin" || role === "org_admin" || role === "admin") return true;
  const effective = getEffectivePermissions(role, overrides);
  return effective[key] ?? false;
}

export function hasCustomPermissions(
  role: UserRole,
  overrides: UserPermissions = {}
): boolean {
  if (!overrides || Object.keys(overrides).length === 0) return false;
  const defaults = DEFAULT_PERMISSIONS[role];
  for (const [key, value] of Object.entries(overrides)) {
    if (key in defaults && defaults[key as PermissionKey] !== value) {
      return true;
    }
  }
  return false;
}
