"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Users,
  Webhook,
  Key,
  Bell,
  CreditCard,
  Settings,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsNavItems = [
  {
    href: "/settings/profile",
    icon: User,
    label: "Profile",
    description: "Your personal information",
  },
  {
    href: "/settings/billing",
    icon: CreditCard,
    label: "Billing & Plan",
    description: "Manage your subscription",
  },
  {
    href: "/settings/team",
    icon: Users,
    label: "Team",
    description: "Manage team members",
  },
  {
    href: "/settings/webhooks",
    icon: Webhook,
    label: "Webhooks",
    description: "Configure webhook integrations",
  },
  {
    href: "/settings/api-keys",
    icon: Key,
    label: "API Keys",
    description: "Manage API access",
  },
  {
    href: "/settings/notifications",
    icon: Bell,
    label: "Notifications",
    description: "Notification preferences",
  },
  {
    href: "/settings/support",
    icon: MessageSquare,
    label: "Support",
    description: "Submit issues & feedback",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
          <Settings className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <nav className="w-64 flex-shrink-0">
          <div className="space-y-1">
            {settingsNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-gold/20 text-gold"
                      : "text-text-muted hover:text-text-primary hover:bg-white/5"
                  )}
                >
                  <item.icon className="h-5 w-5 mt-0.5" />
                  <div>
                    <span className="block font-medium">{item.label}</span>
                    <span className="text-xs opacity-70">{item.description}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
