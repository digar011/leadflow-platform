import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Goldyon",
  description:
    "Read the Goldyon Terms of Service. Learn about account responsibilities, acceptable use, payment terms, intellectual property, and more.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-center py-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden">
            <Image
              src="/images/logo-dark.webp"
              alt="Goldyon"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-bold text-text-primary">Goldyon</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-16">
        <article className="mx-auto max-w-3xl">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">
            Terms of Service
          </h1>
          <p className="mb-8 text-sm text-text-muted">
            Last updated: March 1, 2026
          </p>

          {/* 1. Acceptance of Terms */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              1. Acceptance of Terms
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              By accessing or using the Goldyon platform (&quot;Service&quot;),
              you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you do not agree to all of these Terms, you
              may not access or use the Service. These Terms constitute a legally
              binding agreement between you and Goldyon (&quot;Company&quot;,
              &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            </p>
            <p className="text-text-secondary leading-relaxed">
              We reserve the right to modify these Terms at any time. We will
              notify you of material changes by posting the updated Terms on
              this page and updating the &quot;Last updated&quot; date. Your
              continued use of the Service after such changes constitutes your
              acceptance of the new Terms.
            </p>
          </section>

          {/* 2. Account Responsibilities */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              2. Account Responsibilities
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              To use the Service, you must create an account with a valid email
              address and a secure password. You are responsible for:
            </p>
            <ul className="mb-3 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>
                Maintaining the confidentiality of your account credentials.
              </li>
              <li>
                All activities that occur under your account, whether or not you
                authorized them.
              </li>
              <li>
                Providing accurate, current, and complete information during
                registration and keeping your profile up to date.
              </li>
              <li>
                Notifying us immediately of any unauthorized access to or use of
                your account.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed">
              You must be at least 18 years old or the age of legal majority in
              your jurisdiction to create an account. We reserve the right to
              suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          {/* 3. Acceptable Use */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              3. Acceptable Use
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              You agree to use the Service only for lawful purposes and in
              accordance with these Terms. You must not:
            </p>
            <ul className="mb-3 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>
                Use the Service for any illegal, fraudulent, or harmful
                activity.
              </li>
              <li>
                Upload, transmit, or distribute any malicious code, viruses, or
                harmful content.
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Service,
                other accounts, or connected systems.
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of the
                Service.
              </li>
              <li>
                Use the Service to send unsolicited bulk communications (spam)
                or engage in abusive marketing practices.
              </li>
              <li>
                Scrape, crawl, or use automated means to access the Service
                without our written permission.
              </li>
              <li>
                Reverse-engineer, decompile, or attempt to extract the source
                code of the Service.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed">
              We reserve the right to investigate and take appropriate action
              against anyone who violates this section, including removing
              content, suspending accounts, and reporting to law enforcement.
            </p>
          </section>

          {/* 4. Intellectual Property */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              4. Intellectual Property
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              The Service and all of its content, features, and functionality
              (including but not limited to text, graphics, logos, icons,
              images, software, and design) are owned by the Company and are
              protected by copyright, trademark, and other intellectual property
              laws.
            </p>
            <p className="mb-3 text-text-secondary leading-relaxed">
              You retain ownership of any data you input into the Service
              (&quot;Your Data&quot;). By using the Service, you grant us a
              limited, non-exclusive license to use, process, and store Your
              Data solely for the purpose of providing and improving the
              Service.
            </p>
            <p className="text-text-secondary leading-relaxed">
              You may not copy, modify, distribute, sell, or lease any part of
              the Service without our prior written consent.
            </p>
          </section>

          {/* 5. Payment Terms */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              5. Payment Terms
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              Goldyon offers both free and paid subscription plans. Paid plans
              are billed on a monthly or annual basis through our payment
              processor, Stripe. By subscribing to a paid plan, you agree to
              the following:
            </p>
            <ul className="mb-3 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>
                <strong className="text-text-primary">Billing cycle:</strong>{" "}
                Subscriptions are billed in advance on a recurring basis
                (monthly or annually) depending on the plan you select.
              </li>
              <li>
                <strong className="text-text-primary">Payment method:</strong>{" "}
                You must provide a valid payment method. All payments are
                processed securely through Stripe.
              </li>
              <li>
                <strong className="text-text-primary">Price changes:</strong>{" "}
                We may change subscription prices with at least 30 days&apos;
                notice. Price changes take effect at the start of your next
                billing period.
              </li>
              <li>
                <strong className="text-text-primary">Refunds:</strong> Payments
                are non-refundable except where required by law. You may cancel
                your subscription at any time, and it will remain active until
                the end of the current billing period.
              </li>
              <li>
                <strong className="text-text-primary">Failed payments:</strong>{" "}
                If a payment fails, we may suspend access to paid features until
                the payment is resolved.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed">
              You can manage your subscription and billing details through the
              Settings page or the Stripe customer portal.
            </p>
          </section>

          {/* 6. Service Availability */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              6. Service Availability
            </h2>
            <p className="text-text-secondary leading-relaxed">
              We strive to maintain high availability of the Service but do not
              guarantee uninterrupted access. The Service may be temporarily
              unavailable due to maintenance, updates, or circumstances beyond
              our control. We will make reasonable efforts to notify you of
              planned downtime in advance.
            </p>
          </section>

          {/* 7. Limitation of Liability */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              7. Limitation of Liability
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              To the maximum extent permitted by applicable law, the Company
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including but not limited to
              loss of profits, data, business opportunities, or goodwill,
              resulting from:
            </p>
            <ul className="mb-3 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>Your use of or inability to use the Service.</li>
              <li>
                Any unauthorized access to or alteration of your data or
                transmissions.
              </li>
              <li>
                Any third-party conduct or content on the Service.
              </li>
              <li>
                Any interruption, suspension, or termination of the Service.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed">
              The Service is provided on an &quot;as is&quot; and &quot;as
              available&quot; basis, without warranties of any kind, either
              express or implied. Our total liability for any claim arising from
              or related to these Terms shall not exceed the amount you paid us
              in the twelve (12) months preceding the claim.
            </p>
          </section>

          {/* 8. Termination */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              8. Termination
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              You may terminate your account at any time by contacting us or
              through the account settings. We may suspend or terminate your
              access to the Service at any time, with or without cause, and with
              or without notice, including for:
            </p>
            <ul className="mb-3 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>Violation of these Terms or any applicable law.</li>
              <li>Fraudulent or illegal activity.</li>
              <li>Non-payment of fees owed.</li>
              <li>Extended periods of inactivity.</li>
            </ul>
            <p className="text-text-secondary leading-relaxed">
              Upon termination, your right to use the Service ceases
              immediately. We may retain Your Data for a reasonable period to
              comply with legal obligations, resolve disputes, and enforce our
              agreements. You may request data export before terminating your
              account.
            </p>
          </section>

          {/* 9. Governing Law */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              9. Governing Law
            </h2>
            <p className="text-text-secondary leading-relaxed">
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which the Company is established,
              without regard to its conflict of law provisions. Any disputes
              arising under these Terms shall be resolved through binding
              arbitration or in the courts of competent jurisdiction.
            </p>
          </section>

          {/* 10. Contact Information */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              10. Contact Information
            </h2>
            <p className="text-text-secondary leading-relaxed">
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@goldyon.com"
                className="text-gold hover:text-gold-light transition-colors"
              >
                legal@goldyon.com
              </a>
              .
            </p>
          </section>

          {/* Footer links */}
          <footer className="mt-12 flex flex-col items-center gap-4 border-t border-white/10 pt-8">
            <p className="text-sm text-text-muted">
              See also our{" "}
              <Link
                href="/privacy"
                className="text-gold hover:text-gold-light transition-colors font-medium"
              >
                Privacy Policy
              </Link>
            </p>
            <Link
              href="/register"
              className="text-sm text-gold hover:text-gold-light transition-colors font-medium"
            >
              &larr; Back to Register
            </Link>
          </footer>
        </article>
      </main>

      {/* Page footer */}
      <footer className="py-6 text-center text-sm text-text-muted">
        <p>&copy; {new Date().getFullYear()} Goldyon. All rights reserved.</p>
      </footer>
    </div>
  );
}
