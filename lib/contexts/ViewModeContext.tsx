"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

type ViewMode = "admin" | "user";

interface ViewModeContextType {
  /** The user's actual role from the database */
  actualRole: ViewMode | null;
  /** The currently active view mode (can be toggled by admins) */
  viewMode: ViewMode;
  /** Whether the user is a real admin */
  isRealAdmin: boolean;
  /** Whether we're currently showing admin view */
  isAdminView: boolean;
  /** Toggle between admin and user view (only works for real admins) */
  toggleViewMode: () => void;
  /** Loading state while fetching role */
  loading: boolean;
}

const ViewModeContext = createContext<ViewModeContextType>({
  actualRole: null,
  viewMode: "user",
  isRealAdmin: false,
  isAdminView: false,
  toggleViewMode: () => {},
  loading: true,
});

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [actualRole, setActualRole] = useState<ViewMode | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = (profile?.role as ViewMode) || "user";
      setActualRole(role);

      // Restore saved view mode for admins
      if (role === "admin") {
        const saved = localStorage.getItem("Goldyon-view-mode");
        setViewMode(saved === "user" ? "user" : "admin");
      } else {
        setViewMode("user");
      }

      setLoading(false);
    }

    fetchRole();

    // Listen for auth state changes
    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setActualRole(null);
        setViewMode("user");
        localStorage.removeItem("Goldyon-view-mode");
      } else if (event === "SIGNED_IN") {
        fetchRole();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isRealAdmin = actualRole === "admin";
  const isAdminView = isRealAdmin && viewMode === "admin";

  const toggleViewMode = () => {
    if (!isRealAdmin) return;
    const next = viewMode === "admin" ? "user" : "admin";
    setViewMode(next);
    localStorage.setItem("Goldyon-view-mode", next);
  };

  return (
    <ViewModeContext.Provider
      value={{
        actualRole,
        viewMode,
        isRealAdmin,
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
