"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Crown,
  User as UserIcon,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useUsers, useUpdateUserRole, useToggleUserActive, useUpdateUserPermissions, useUpdateUserTier, useAdminStats } from "@/lib/hooks/useAdmin";
import type { User } from "@/lib/hooks/useAdmin";
import type { UserPermissions, SubscriptionTier } from "@/lib/types/database";
import { hasCustomPermissions } from "@/lib/utils/permissions";
import { PermissionsPanel } from "@/components/admin/PermissionsPanel";
import { cn } from "@/lib/utils";

const roleOptions = [
  { value: "super_admin", label: "Super Admin", icon: Crown, color: "text-purple-400" },
  { value: "org_admin", label: "Org Admin", icon: Crown, color: "text-gold" },
  { value: "admin", label: "Admin", icon: Crown, color: "text-gold" },
  { value: "manager", label: "Manager", icon: Briefcase, color: "text-blue-400" },
  { value: "user", label: "User", icon: UserIcon, color: "text-text-muted" },
];

const tierOptions = [
  { value: "free", label: "Free", color: "text-text-muted" },
  { value: "starter", label: "Starter", color: "text-blue-400" },
  { value: "growth", label: "Growth", color: "text-gold" },
  { value: "business", label: "Business", color: "text-purple-400" },
  { value: "enterprise", label: "Enterprise", color: "text-emerald-400" },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);

  const { data: users, isLoading } = useUsers();
  const { data: stats } = useAdminStats();
  const updateRole = useUpdateUserRole();
  const toggleActive = useToggleUserActive();
  const updatePermissions = useUpdateUserPermissions();
  const updateTier = useUpdateUserTier();

  const filteredUsers = users?.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query)
    );
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      await toggleActive.mutateAsync({ userId, isActive: !currentActive });
    } catch (error) {
      console.error("Failed to toggle user:", error);
    }
  };

  const handleTierChange = async (userId: string, newTier: string) => {
    try {
      await updateTier.mutateAsync({ userId, tier: newTier as SubscriptionTier });
    } catch (error) {
      console.error("Failed to update tier:", error);
    }
  };

  const handleSavePermissions = async (permissions: UserPermissions) => {
    if (!permissionsUser) return;
    try {
      await updatePermissions.mutateAsync({
        userId: permissionsUser.id,
        permissions,
      });
      setPermissionsUser(null);
    } catch (error) {
      console.error("Failed to update permissions:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
        <p className="text-text-secondary mt-1">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
                <Users className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-sm text-text-muted">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <UserCheck className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.activeUsers || 0}
                </p>
                <p className="text-sm text-text-muted">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.adminUsers || 0}
                </p>
                <p className="text-sm text-text-muted">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.recentSignups || 0}
                </p>
                <p className="text-sm text-text-muted">New This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card variant="glass">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Users ({filteredUsers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : !filteredUsers?.length ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-secondary">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Plan
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Joined
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                      Last Sign In
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const roleColor = roleOptions.find((r) => r.value === user.role)?.color || "text-text-muted";

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.full_name || "User avatar"}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-gold font-medium">
                                  {user.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">
                                {user.full_name || "No name"}
                              </p>
                              <p className="text-sm text-text-muted">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className={cn(
                              "bg-transparent border border-white/10 rounded-lg px-3 py-1.5",
                              "text-sm focus:outline-none focus:ring-2 focus:ring-gold/50",
                              roleColor
                            )}
                          >
                            {roleOptions.map((role) => (
                              <option
                                key={role.value}
                                value={role.value}
                                className="bg-surface text-text-primary"
                              >
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={user.is_active ? "default" : "secondary"}
                            className={
                              user.is_active
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={user.subscription_tier || "free"}
                            onChange={(e) => handleTierChange(user.id, e.target.value)}
                            className={cn(
                              "bg-transparent border border-white/10 rounded-lg px-3 py-1.5",
                              "text-sm focus:outline-none focus:ring-2 focus:ring-gold/50",
                              tierOptions.find((t) => t.value === (user.subscription_tier || "free"))?.color || "text-text-muted"
                            )}
                          >
                            {tierOptions.map((t) => (
                              <option
                                key={t.value}
                                value={t.value}
                                className="bg-surface text-text-primary"
                              >
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-4 text-sm text-text-secondary">
                          {format(new Date(user.created_at), "MMM d, yyyy")}
                        </td>
                        <td className="py-4 px-4 text-sm text-text-secondary">
                          {user.last_sign_in_at
                            ? format(new Date(user.last_sign_in_at), "MMM d, yyyy")
                            : "Never"}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPermissionsUser(user)}
                              className="text-text-muted hover:text-gold relative"
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Permissions
                              {hasCustomPermissions(user.role, (user.permissions || {}) as UserPermissions) && (
                                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(user.id, user.is_active)}
                              className={
                                user.is_active
                                  ? "text-red-400 hover:text-red-300"
                                  : "text-green-400 hover:text-green-300"
                              }
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="h-4 w-4 mr-1" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Modal */}
      {permissionsUser && (
        <PermissionsPanel
          isOpen={!!permissionsUser}
          onClose={() => setPermissionsUser(null)}
          onSave={handleSavePermissions}
          userName={permissionsUser.full_name || permissionsUser.email}
          userRole={permissionsUser.role}
          currentPermissions={(permissionsUser.permissions || {}) as UserPermissions}
          isSaving={updatePermissions.isPending}
        />
      )}
    </div>
  );
}
