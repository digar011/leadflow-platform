import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing - LeadFlow",
  description:
    "Choose the right plan for your business. From free to enterprise.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold">
            <span className="text-lg font-bold text-background">LF</span>
          </div>
          <span className="text-xl font-bold text-text-primary">LeadFlow</span>
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-text-secondary hover:text-gold transition-colors"
        >
          Sign In
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">{children}</main>

      <footer className="py-8 text-center text-sm text-text-muted border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} LeadFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
