"use client";

import { useState } from "react";
import { Search, Bell, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
