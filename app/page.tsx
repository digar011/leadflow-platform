import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  BarChart3,
  Zap,
  LineChart,
  UsersRound,
  Puzzle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Goldyon - Lead Intelligence Platform | CRM for Local Businesses",
  description:
    "Goldyon is a full-stack lead intelligence and CRM platform built for local business lead generation. Manage leads, track pipelines, automate campaigns, and grow revenue.",
  keywords: [
    "CRM",
    "Lead Management",
    "Sales Pipeline",
    "Lead Generation",
    "Campaign Automation",
    "Business Intelligence",
    "Local Business CRM",
    "Customer Relationship Management",
    "Analytics",
    "Workflow Automation",
  ],
  openGraph: {
    title: "Goldyon - Lead Intelligence Platform",
    description:
      "Full-stack lead intelligence and CRM platform for local business lead generation. Manage leads, automate campaigns, and grow revenue.",
    type: "website",
    locale: "en_US",
    siteName: "Goldyon",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Goldyon - Lead Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Goldyon - Lead Intelligence Platform",
    description:
      "Full-stack lead intelligence and CRM for local businesses. Manage leads, automate campaigns, and grow revenue.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

const FEATURES = [
  {
    icon: Users,
    title: "Lead Management",
    description:
      "Capture, organize, and nurture leads with a visual Kanban board and powerful list views. Never let a prospect slip through the cracks.",
  },
  {
    icon: BarChart3,
    title: "Pipeline Tracking",
    description:
      "Track every deal from first contact to close. Customizable pipeline stages give you full visibility into your sales funnel.",
  },
  {
    icon: Zap,
    title: "Campaign Automation",
    description:
      "Set up automated workflows that trigger emails, tasks, and follow-ups based on lead behavior and pipeline changes.",
  },
  {
    icon: LineChart,
    title: "Analytics & Reports",
    description:
      "Real-time dashboards and exportable reports show conversion rates, revenue forecasts, and campaign performance at a glance.",
  },
  {
    icon: UsersRound,
    title: "Team Collaboration",
    description:
      "Role-based access control, activity feeds, and team assignments keep everyone aligned and accountable.",
  },
  {
    icon: Puzzle,
    title: "Integrations",
    description:
      "Connect with Stripe, Slack, n8n, and webhooks to build the workflows your business needs. API access on Growth plans and above.",
  },
] as const;

const STATS = [
  { value: "10,000+", label: "Leads Managed" },
  { value: "95%", label: "Customer Satisfaction" },
  { value: "3x", label: "Faster Follow-ups" },
  { value: "50%", label: "More Conversions" },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
      </div>

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
              <Image
                src="/images/logo-dark.webp"
                alt="Goldyon"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-text-primary">
              Goldyon
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="hidden text-sm font-medium text-text-secondary transition-colors hover:text-gold sm:inline-block"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-lg bg-gold px-4 text-sm font-medium text-background transition-all hover:bg-gold-light hover:shadow-glow-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 pb-20 pt-16 sm:pb-28 sm:pt-24 lg:pb-32 lg:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold">
              <Zap className="h-3.5 w-3.5" />
              <span>Lead Intelligence Platform</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Turn Leads into Revenue{" "}
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Faster
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl">
              Goldyon is the all-in-one CRM built for local businesses. Capture
              leads, automate follow-ups, track your pipeline, and close more
              deals — all from one powerful platform.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gold px-8 text-base font-semibold text-background shadow-sm transition-all hover:bg-gold-light hover:shadow-glow sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-gold/50 px-8 text-base font-semibold text-gold transition-all hover:border-gold hover:bg-gold/10 sm:w-auto"
              >
                View Pricing
              </Link>
            </div>

            <p className="mt-4 text-sm text-text-muted">
              Free plan available. No credit card required.
            </p>
          </div>
        </section>

        {/* Stats / Social Proof */}
        <section className="border-y border-white/5 bg-surface/50 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-gold sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
                Everything You Need to Grow
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
                From lead capture to closed deals, Goldyon gives your team the
                tools to manage every stage of the customer journey.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:shadow-lg"
                  >
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gold/15">
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits / Trust Section */}
        <section className="border-t border-white/5 bg-surface/30 px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
                Built for Teams That Close Deals
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
                Goldyon was designed from the ground up for local businesses and
                agencies that need a fast, reliable, and easy-to-use CRM.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Visual Kanban pipeline with drag-and-drop",
                "Role-based access control for your whole team",
                "Automated follow-up sequences and reminders",
                "Real-time analytics dashboard with KPIs",
                "CSV import/export for easy data migration",
                "Stripe-integrated billing and subscription management",
                "Webhook and API access for custom integrations",
                "Dark-themed UI designed for long work sessions",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 rounded-lg p-3"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <span className="text-text-secondary">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Ready to Supercharge Your Sales?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
              Join hundreds of businesses using Goldyon to capture more leads,
              close more deals, and grow revenue. Start free today.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gold px-8 text-base font-semibold text-background shadow-sm transition-all hover:bg-gold-light hover:shadow-glow sm:w-auto"
              >
                Start for Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-gold/50 px-8 text-base font-semibold text-gold transition-all hover:border-gold hover:bg-gold/10 sm:w-auto"
              >
                Compare Plans
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-surface/50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
                  <Image
                    src="/images/logo-dark.webp"
                    alt="Goldyon"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-text-primary">
                  Goldyon
                </span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                Lead Intelligence Platform for local businesses. Manage leads,
                automate workflows, and grow your revenue.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-text-primary">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-text-muted transition-colors hover:text-gold"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-sm text-text-muted transition-colors hover:text-gold"
                  >
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-text-muted transition-colors hover:text-gold"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-text-primary">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-text-muted transition-colors hover:text-gold"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-text-muted transition-colors hover:text-gold"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-text-primary">
                Contact
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:support@goldyon.com"
                    className="text-sm text-text-muted transition-colors hover:text-gold"
                  >
                    support@goldyon.com
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:sales@goldyon.com"
                    className="text-sm text-text-muted transition-colors hover:text-gold"
                  >
                    sales@goldyon.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/5 pt-6 text-center text-sm text-text-muted">
            <p>
              &copy; {new Date().getFullYear()} Goldyon. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
