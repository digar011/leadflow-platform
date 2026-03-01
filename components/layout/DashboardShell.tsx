"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="md:pl-64 transition-all duration-300 overflow-x-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 md:p-6">
          <ErrorBoundary level="page">{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
