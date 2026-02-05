import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - LeadFlow",
  description: "Sign in or create an account to access LeadFlow",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-center py-8">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold">
            <span className="text-xl font-bold text-background">LF</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">LeadFlow</span>
        </a>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-text-muted">
        <p>&copy; {new Date().getFullYear()} LeadFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
