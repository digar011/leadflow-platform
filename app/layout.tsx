import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { validateEnv } from "@/lib/utils/env";

validateEnv();

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Goldyon - Lead Intelligence Platform",
    template: "%s | Goldyon",
  },
  description:
    "Full-stack lead intelligence and CRM platform for local business lead generation. Manage leads, track customer journeys, automate workflows, and grow your business.",
  keywords: [
    "CRM",
    "Lead Management",
    "Sales Pipeline",
    "Customer Journey",
    "Lead Generation",
    "Business Intelligence",
    "Workflow Automation",
  ],
  authors: [{ name: "Goldyon Team" }],
  openGraph: {
    title: "Goldyon - Lead Intelligence Platform",
    description:
      "Full-stack lead intelligence and CRM platform for local business lead generation.",
    type: "website",
    locale: "en_US",
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
      "Full-stack lead intelligence and CRM platform for local business lead generation.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-text-primary`}
      >
        <Providers>{children}</Providers>
        <CookieConsent />
      </body>
    </html>
  );
}
