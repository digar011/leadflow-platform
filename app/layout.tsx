import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
    default: "LeadFlow - Lead Intelligence Platform",
    template: "%s | LeadFlow",
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
  authors: [{ name: "LeadFlow Team" }],
  openGraph: {
    title: "LeadFlow - Lead Intelligence Platform",
    description:
      "Full-stack lead intelligence and CRM platform for local business lead generation.",
    type: "website",
    locale: "en_US",
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
        {children}
      </body>
    </html>
  );
}
