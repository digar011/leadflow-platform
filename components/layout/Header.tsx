"use client";

import { useState } from "react";
import { Search, Bell, Plus, User, Shield, Monitor } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useViewMode } from "@/lib/contexts/ViewModeContext";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { isRealAdmin, isAdminView, toggleViewMode, loading } = useViewMode();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-background/80 px-6 backdrop-blur-xl">
      {/* Left side - Title or Search */}
      <div className="flex items-center gap-4">
        {title ? (
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
            {subtitle && (
              <p className="text-sm text-text-muted">{subtitle}</p>
            )}
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search leads, contacts, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-80 rounded-lg bg-background-secondary border border-white/10 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
            />
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        {/* Admin/User View Toggle - only shown for real admins */}
        {isRealAdmin && !loading && (
          <button
            onClick={toggleViewMode}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 border",
              isAdminView
                ? "border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
                : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary"
            )}
          >
            {isAdminView ? (
              <>
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </>
            ) : (
              <>
                <Monitor className="h-4 w-4" />
                <span>User</span>
              </>
            )}
            <div
              className={cn(
                "relative ml-1 h-5 w-9 rounded-full transition-colors duration-200",
                isAdminView ? "bg-gold" : "bg-white/20"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                  isAdminView ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </div>
          </button>
        )}

        {/* Quick Add */}
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
          Add Lead
        </Button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold"></span>
          </span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 rounded-lg p-1.5 text-text-muted hover:bg-white/5 transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-gold">
            <User className="h-4 w-4" />
          </div>
        </button>
      </div>
    </header>
  );
}
