import type { Metadata } from "next";
import Link from "next/link"
import Image from "next/image";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose the right Goldyon plan for your business. From free to enterprise, with lead management, automation, and analytics.",
  openGraph: {
    title: "Pricing - Goldyon",
    description:
      "Choose the right plan for your business. Lead management, automation, and analytics from free to enterprise.",
    type: "website",
  },
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden">
            <Image src="/images/logo-dark.png" alt="Goldyon" width={36} height={36} className="object-contain" />
          </div>
          <span className="text-xl font-bold text-text-primary">Goldyon</span>
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
        <p>&copy; {new Date().getFullYear()} Goldyon. All rights reserved.</p>
      </footer>
    </div>
  );
}
