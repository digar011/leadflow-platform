"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

// Hardcoded super admin emails - these ALWAYS get super_admin access
// even if the database role is wrong (safety fallback)
const SUPER_ADMIN_EMAILS = [
  "diego.j.garnica@gmail.com",
];

export type UserRole = "super_admin" | "org_admin" | "admin" | "user";
type ViewMode = "super_admin" | "admin" | "user";

interface ViewModeContextType {
  /** The user's actual role from the database */
  actualRole: UserRole | null;
  /** The user's email */
  userEmail: string | null;
  /** The currently active view mode */
  viewMode: ViewMode;
  /** Whether the user is a super admin (Goldyon/Codexium team) */
  isSuperAdmin: boolean;
  /** Whether the user is an org admin (Business/Enterprise customer admin) */
  isOrgAdmin: boolean;
  /** Whether the user is any kind of admin */
  isAnyAdmin: boolean;
  /** Whether we're currently showing super admin view */
  isSuperAdminView: boolean;
  /** Whether we're currently showing org admin view */
  isOrgAdminView: boolean;
  /** Whether we're showing any admin view */
  isAdminView: boolean;
  /** Toggle between admin and user view */
  toggleViewMode: () => void;
  /** Loading state while fetching role */
  loading: boolean;
}

const ViewModeContext = createContext<ViewModeContextType>({
  actualRole: null,
  userEmail: null,
  viewMode: "user",
  isSuperAdmin: false,
  isOrgAdmin: false,
  isAnyAdmin: false,
  isSuperAdminView: false,
  isOrgAdminView: false,
  isAdminView: false,
  toggleViewMode: () => {},
  loading: true,
});

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [actualRole, setActualRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRole() {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled || !user) {
          if (!cancelled) setLoading(false);
          return;
        }

        setUserEmail(user.email || null);

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (cancelled) return;

        let role = (profile?.role as UserRole) || "user";

        // SAFETY FALLBACK: If email is in super admin list, force super_admin
        // This ensures you can never be locked out
        if (user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
          role = "super_admin";
        }

        // Backward compatibility: treat legacy "admin" as "org_admin"
        if (role === "admin") {
          role = "org_admin";
        }

        setActualRole(role);

        // Restore saved view mode for admins
        if (role === "super_admin" || role === "org_admin") {
          const saved = localStorage.getItem("goldyon-view-mode");
          if (saved === "user") {
            setViewMode("user");
          } else if (role === "super_admin") {
            setViewMode("super_admin");
          } else {
            setViewMode("admin");
          }
        } else {
          setViewMode("user");
        }

        setLoading(false);
      } catch (err) {
        // Ignore AbortError from React Strict Mode double-mount cleanup
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!cancelled) setLoading(false);
      }
    }

    fetchRole();

    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setActualRole(null);
        setUserEmail(null);
        setViewMode("user");
        localStorage.removeItem("goldyon-view-mode");
      } else if (event === "SIGNED_IN") {
        fetchRole();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const isSuperAdmin = actualRole === "super_admin";
  const isOrgAdmin = actualRole === "org_admin" || actualRole === "admin";
  const isAnyAdmin = isSuperAdmin || isOrgAdmin;

  const isSuperAdminView = isSuperAdmin && (viewMode === "super_admin" || viewMode === "admin");
  const isOrgAdminView = (isOrgAdmin && viewMode === "admin") || isSuperAdminView;
  const isAdminView = isSuperAdminView || isOrgAdminView;

  const toggleViewMode = () => {
    if (!isAnyAdmin) return;

    let next: ViewMode;
    if (isSuperAdmin) {
      // Super admin cycles: super_admin -> admin -> user -> super_admin
      if (viewMode === "super_admin") next = "admin";
      else if (viewMode === "admin") next = "user";
      else next = "super_admin";
    } else {
      // Org admin toggles: admin <-> user
      next = viewMode === "admin" ? "user" : "admin";
    }

    setViewMode(next);
    localStorage.setItem("goldyon-view-mode", next);
  };

  return (
    <ViewModeContext.Provider
      value={{
        actualRole,
        userEmail,
        viewMode,
        isSuperAdmin,
        isOrgAdmin,
        isAnyAdmin,
        isSuperAdminView,
        isOrgAdminView,
        isAdminView,
        toggleViewMode,
        loading,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}