"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Crown,
  Briefcase,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useUsers } from "@/lib/hooks/useAdmin";
import { cn } from "@/lib/utils";

const roleConfig = {
  admin: { label: "Admin", icon: Crown, color: "text-gold bg-gold/20" },
  manager: { label: "Manager", icon: Briefcase, color: "text-blue-400 bg-blue-500/20" },
  user: { label: "User", icon: UserIcon, color: "text-text-muted bg-white/10" },
};

export default function TeamSettingsPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [isInviting, setIsInviting] = useState(false);

  const { data: users, isLoading } = useUsers();

  const handleInvite = async () => {
    if (!inviteEmail) return;

    setIsInviting(true);
    try {
      // In production, this would send an invitation email
      console.log("Inviting:", inviteEmail, "as", inviteRole);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("user");
    } catch (error) {
      console.error("Failed to send invite:", error);
    }
    setIsInviting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Team Members</h2>
          <p className="text-text-secondary mt-1">
            Manage your team and their access levels
          </p>
        </div>
        <Button
          leftIcon={<UserPlus className="h-4 w-4" />}
          onClick={() => setShowInviteModal(true)}
        >
          Invite Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
                <Users className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {users?.length || 0}
                </p>
                <p className="text-sm text-text-muted">Total Members</p>
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
                  {users?.filter((u) => u.role === "admin").length || 0}
                </p>
                <p className="text-sm text-text-muted">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <UserIcon className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {users?.filter((u) => u.is_active).length || 0}
                </p>
                <p className="text-sm text-text-muted">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team List */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : !users?.length ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-secondary">No team members yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const role = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.user;
                const RoleIcon = role.icon;

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-gold">
                            {user.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {user.full_name || "No name"}
                        </p>
                        <p className="text-sm text-text-muted">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant="default" className={role.color}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {role.label}
                      </Badge>

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

                      <span className="text-sm text-text-muted">
                        Joined {format(new Date(user.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(roleConfig).map(([value, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={value}
                    onClick={() => setInviteRole(value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
                      inviteRole === value
                        ? "border-gold bg-gold/10"
                        : "border-white/10 hover:border-white/20"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        inviteRole === value ? "text-gold" : "text-text-muted"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        inviteRole === value ? "text-gold" : "text-text-secondary"
                      )}
                    >
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail || isInviting}
            >
              {isInviting ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
