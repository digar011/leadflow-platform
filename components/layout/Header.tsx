"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  User,
  Shield,
  Monitor,
  Settings,
  LogOut,
  CreditCard,
  UserCircle,
  CheckCircle2,
  Users,
  Zap,
  Megaphone,
  Clock,
  Menu,
  Building2,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useViewMode } from "@/lib/contexts/ViewModeContext";
import { getSupabaseClient } from "@/lib/supabase/client";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

// Static notification items (in production these would come from DB)
const NOTIFICATIONS = [
  {
    id: "1",
    icon: Users,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/20",
    title: "New lead assigned to you",
    description: "Acme Corp was assigned by admin",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    icon: CheckCircle2,
    iconColor: "text-green-400",
    iconBg: "bg-green-500/20",
    title: "Deal won!",
    description: "TechStart Inc - $12,500",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    icon: Zap,
    iconColor: "text-gold",
    iconBg: "bg-gold/20",
    title: "Automation triggered",
    description: "Follow-up email sent to 3 leads",
    time: "3 hours ago",
    unread: false,
  },
  {
    id: "4",
    icon: Megaphone,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/20",
    title: "Campaign completed",
    description: "Q1 Outreach finished with 24% open rate",
    time: "Yesterday",
    unread: false,
  },
];

interface SearchResult {
  id: string;
  type: "lead" | "contact" | "activity";
  title: string;
  subtitle?: string;
  href: string;
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isRealAdmin, isAdminView, toggleViewMode, loading } = useViewMode();
  const router = useRouter();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const supabase = getSupabaseClient();
      const results: SearchResult[] = [];

      // Search businesses/leads
      const { data: leads } = await supabase
        .from("businesses")
        .select("id, business_name, status")
        .ilike("business_name", `%${query}%`)
        .limit(5);

      leads?.forEach((lead) => {
        results.push({
          id: lead.id,
          type: "lead",
          title: lead.business_name,
          subtitle: lead.status ?? undefined,
          href: `/leads/${lead.id}`,
        });
      });

      // Search contacts
      const { data: contacts } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, email, business_id")
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);

      contacts?.forEach((contact) => {
        results.push({
          id: contact.id,
          type: "contact",
          title: `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || contact.email || "Unknown",
          subtitle: contact.email || undefined,
          href: `/leads/${contact.business_id}`,
        });
      });

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => performSearch(value), 300);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-background/80 px-4 md:px-6 backdrop-blur-xl">
      {/* Left side - Hamburger + Title or Search */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {title ? (
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
            {subtitle && (
              <p className="text-sm text-text-muted">{subtitle}</p>
            )}
          </div>
        ) : (
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search leads, contacts..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              className="h-10 w-full sm:w-64 md:w-80 rounded-lg bg-background-secondary border border-white/10 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
            />
            {showSearchResults && (
              <div className="absolute left-0 top-full mt-2 w-full sm:w-80 rounded-xl border border-white/10 bg-[#161636] shadow-2xl shadow-black/50 overflow-hidden z-50">
                {isSearching ? (
                  <div className="px-4 py-3 text-sm text-text-muted">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-text-muted">No results found</div>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    {searchResults.map((result) => (
                      <Link
                        key={`${result.type}-${result.id}`}
                        href={result.href}
                        onClick={() => { setShowSearchResults(false); setSearchQuery(""); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                      >
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          result.type === "lead" ? "bg-gold/20" : result.type === "contact" ? "bg-blue-500/20" : "bg-purple-500/20"
                        )}>
                          {result.type === "lead" ? <Building2 className="h-4 w-4 text-gold" /> :
                           result.type === "contact" ? <Users className="h-4 w-4 text-blue-400" /> :
                           <Activity className="h-4 w-4 text-purple-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary truncate">{result.title}</p>
                          {result.subtitle && <p className="text-xs text-text-muted truncate">{result.subtitle}</p>}
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-text-muted">{result.type}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
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
        <Link href="/leads/new">
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Add Lead
          </Button>
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-[#161636] shadow-2xl shadow-black/50 backdrop-blur-none overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-gold">{unreadCount} new</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {NOTIFICATIONS.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer",
                      notif.unread && "bg-gold/5"
                    )}
                  >
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", notif.iconBg)}>
                      <notif.icon className={cn("h-4 w-4", notif.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", notif.unread ? "text-text-primary font-medium" : "text-text-secondary")}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-text-muted truncate">{notif.description}</p>
                      <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {notif.time}
                      </p>
                    </div>
                    {notif.unread && (
                      <div className="h-2 w-2 rounded-full bg-gold shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
              </div>
              <Link
                href="/settings/notifications"
                onClick={() => setShowNotifications(false)}
                className="block px-4 py-3 text-center text-sm text-gold hover:bg-white/5 border-t border-white/10 transition-colors"
              >
                Notification Settings
              </Link>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1.5 text-text-muted hover:bg-white/5 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-gold">
              <User className="h-4 w-4" />
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#161636] shadow-2xl shadow-black/50 backdrop-blur-none overflow-hidden z-50">
              <div className="py-1">
                <Link
                  href="/settings/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                >
                  <UserCircle className="h-4 w-4" />
                  My Profile
                </Link>
                <Link
                  href="/settings/billing"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  Billing & Plan
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>
              <div className="border-t border-white/10 py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-status-error hover:bg-white/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
