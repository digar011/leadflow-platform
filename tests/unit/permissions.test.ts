import {
  DEFAULT_PERMISSIONS,
  getEffectivePermissions,
  hasPermission,
  hasCustomPermissions,
  PERMISSION_CATEGORIES,
} from "@/lib/utils/permissions";

describe("PERMISSION_CATEGORIES", () => {
  it("has 7 categories", () => {
    expect(PERMISSION_CATEGORIES).toHaveLength(7);
  });

  it("each category has a name, icon, and permissions array", () => {
    for (const cat of PERMISSION_CATEGORIES) {
      expect(cat.name).toBeDefined();
      expect(cat.icon).toBeDefined();
      expect(Array.isArray(cat.permissions)).toBe(true);
      expect(cat.permissions.length).toBeGreaterThan(0);
    }
  });
});

describe("DEFAULT_PERMISSIONS", () => {
  it("admin has all permissions enabled", () => {
    const adminPerms = DEFAULT_PERMISSIONS.admin;
    for (const value of Object.values(adminPerms)) {
      expect(value).toBe(true);
    }
  });

  it("user has limited permissions", () => {
    const userPerms = DEFAULT_PERMISSIONS.user;
    expect(userPerms["leads.view"]).toBe(true);
    expect(userPerms["leads.create"]).toBe(true);
    expect(userPerms["leads.delete"]).toBe(false);
    expect(userPerms["settings.edit"]).toBe(false);
  });

  it("manager has more permissions than user", () => {
    const managerPerms = DEFAULT_PERMISSIONS.manager;
    const userPerms = DEFAULT_PERMISSIONS.user;
    const managerTrueCount = Object.values(managerPerms).filter(Boolean).length;
    const userTrueCount = Object.values(userPerms).filter(Boolean).length;
    expect(managerTrueCount).toBeGreaterThan(userTrueCount);
  });
});

describe("getEffectivePermissions", () => {
  it("returns default permissions for a role with no overrides", () => {
    const perms = getEffectivePermissions("user");
    expect(perms).toEqual(DEFAULT_PERMISSIONS.user);
  });

  it("applies overrides on top of defaults", () => {
    const perms = getEffectivePermissions("user", { "leads.delete": true });
    expect(perms["leads.delete"]).toBe(true);
    // Other permissions remain as default
    expect(perms["leads.view"]).toBe(true);
  });

  it("can revoke permissions via override", () => {
    const perms = getEffectivePermissions("manager", { "leads.edit": false });
    expect(perms["leads.edit"]).toBe(false);
  });
});

describe("hasPermission", () => {
  it("admin always returns true regardless of key", () => {
    expect(hasPermission("admin", {}, "leads.delete")).toBe(true);
    expect(hasPermission("admin", {}, "settings.edit")).toBe(true);
  });

  it("user has view permissions but not delete", () => {
    expect(hasPermission("user", {}, "leads.view")).toBe(true);
    expect(hasPermission("user", {}, "leads.delete")).toBe(false);
  });

  it("respects overrides for non-admin roles", () => {
    expect(hasPermission("user", { "leads.delete": true }, "leads.delete")).toBe(true);
  });
});

describe("hasCustomPermissions", () => {
  it("returns false when no overrides", () => {
    expect(hasCustomPermissions("user")).toBe(false);
    expect(hasCustomPermissions("user", {})).toBe(false);
  });

  it("returns false when overrides match defaults", () => {
    expect(hasCustomPermissions("user", { "leads.view": true })).toBe(false);
  });

  it("returns true when overrides differ from defaults", () => {
    expect(hasCustomPermissions("user", { "leads.delete": true })).toBe(true);
  });
});
