"use client";

import Link from "next/link";
import {
  Plus,
  Phone,
  Mail,
  Calendar,
  FileText,
  Upload,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
  color: string;
}

interface QuickActionsPanelProps {
  onLogCall?: () => void;
  onSendEmail?: () => void;
  onScheduleMeeting?: () => void;
  onAddNote?: () => void;
}

export function QuickActionsPanel({
  onLogCall,
  onSendEmail,
  onScheduleMeeting,
  onAddNote,
}: QuickActionsPanelProps) {
  const actions: QuickAction[] = [
    {
      label: "Add Lead",
      icon: Plus,
      href: "/leads/new",
      color: "bg-gold/20 text-gold hover:bg-gold/30",
    },
    {
      label: "Log Call",
      icon: Phone,
      onClick: onLogCall,
      color: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
    },
    {
      label: "Send Email",
      icon: Mail,
      onClick: onSendEmail,
      color: "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
    },
    {
      label: "Meeting",
      icon: Calendar,
      onClick: onScheduleMeeting,
      color: "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30",
    },
    {
      label: "Add Note",
      icon: FileText,
      onClick: onAddNote,
      color: "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30",
    },
    {
      label: "Import",
      icon: Upload,
      href: "/settings/import",
      color: "bg-green-500/20 text-green-400 hover:bg-green-500/30",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-gold" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            const content = (
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-colors cursor-pointer",
                  action.color
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            );

            if (action.href) {
              return (
                <Link key={action.label} href={action.href}>
                  {content}
                </Link>
              );
            }

            return (
              <div key={action.label} onClick={action.onClick}>
                {content}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
