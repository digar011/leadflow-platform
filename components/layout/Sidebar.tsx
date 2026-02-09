"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Activity,
  Megaphone,
  BarChart3,
  FileText,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  UserCog,
  ScrollText,
  Cog,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useViewMode } from "@/lib/contexts/ViewModeContext";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useSubscription } from "@/lib/hooks/useSubscription";
import type { PermissionKey } from "@/lib/types/database";
import type { FeatureKey } from "@/lib/utils/subscription";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionKey;
  requiredFeature?: FeatureKey;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Building2 },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Activities", href: "/activities", icon: Activity },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone, requiredFeature: "campaigns" },
  { name: "Automation", href: "/automation", icon: Zap, requiredFeature: "automationRules" },
  { name: "Reports", href: "/reports", icon: FileText, requiredFeature: "savedReports" },
];

const adminNavigation: NavItem[] = [
  { name: "User Management", href: "/admin/users", icon: UserCog },
  { name: "Support Tickets", href: "/admin/support", icon: MessageSquare },
  { name: "System Settings", href: "/admin/settings", icon: Cog },
  { name: "Audit Logs", href: "/admin/audit", icon: ScrollText, requiredFeature: "auditLogs" },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin: isAdminProp }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { isAdminView } = useViewMode();
  const { can } = usePermissions();
  const { can: canFeature } = useSubscription();

  // Use context-based admin view, fall back to prop
  const isAdmin = isAdminProp !== undefined ? isAdminProp : isAdminView;

  // Filter navigation items by permission and subscription feature
  const visibleNavigation = navigation.filter(
    (item) =>
      (!item.permission || can(item.permission)) &&
      (!item.requiredFeature || canFeature(item.requiredFeature))
  );

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold">
            <span className="text-lg font-bold text-background">LF</span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-text-primary">LeadFlow</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {visibleNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-active text-gold"
                      : "text-text-secondary hover:bg-sidebar-hover hover:text-text-primary"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-gold")} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-white/5">
            {!collapsed && (
              <div className="px-4 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gold" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                  Admin
                </span>
              </div>
            )}
            <ul className="space-y-1 px-2">
              {adminNavigation.filter((item) => !item.requiredFeature || canFeature(item.requiredFeature)).map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-sidebar-active text-gold"
                          : "text-text-secondary hover:bg-sidebar-hover hover:text-text-primary"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-gold")} />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-white/5 py-4">
        <ul className="space-y-1 px-2">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-active text-gold"
                      : "text-text-secondary hover:bg-sidebar-hover hover:text-text-primary"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-gold")} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-sidebar-hover hover:text-status-error"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
