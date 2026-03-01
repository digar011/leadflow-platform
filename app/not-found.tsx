import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
      <p className="text-7xl font-bold text-accent-gold mb-2">404</p>
      <h1 className="text-2xl font-semibold text-text-primary mb-2">
        Page not found
      </h1>
      <p className="text-sm text-text-muted max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-accent-gold text-background font-medium hover:bg-accent-gold/90 transition-colors"
        >
          Go home
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg bg-white/10 text-text-primary hover:bg-white/20 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
