import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Goldyon",
  description:
    "Read the Goldyon Privacy Policy. Learn how we collect, use, share, and protect your personal data, including your rights under GDPR and CCPA.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
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
              src="/images/logo-dark.png"
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
            Privacy Policy
          </h1>
          <p className="mb-8 text-sm text-text-muted">
            Last updated: March 1, 2026
          </p>

          {/* Introduction */}
          <section className="mb-8">
            <p className="text-text-secondary leading-relaxed">
              At Goldyon (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or
              &quot;our&quot;), we take your privacy seriously. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              personal information when you use the Goldyon platform
              (&quot;Service&quot;). Please read this policy carefully. By using
              the Service, you consent to the practices described herein.
            </p>
          </section>

          {/* 1. Data Collection */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              1. Data We Collect
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              We collect information that you provide directly and information
              that is collected automatically when you use the Service.
            </p>

            <h3 className="mb-2 text-lg font-medium text-text-primary">
              Information You Provide
            </h3>
            <ul className="mb-4 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>
                <strong className="text-text-primary">Account data:</strong>{" "}
                Name, email address, and password when you create an account.
              </li>
              <li>
                <strong className="text-text-primary">Profile data:</strong>{" "}
                Organization name, job title, phone number, and other details
                you add to your profile.
              </li>
              <li>
                <strong className="text-text-primary">Business data:</strong>{" "}
                Leads, contacts, campaigns, activities, deals, and other CRM
                data you enter into the platform.
              </li>
              <li>
                <strong className="text-text-primary">Payment data:</strong>{" "}
                Billing information provided during subscription checkout.
                Payment card details are processed directly by Stripe and are
                never stored on our servers.
              </li>
              <li>
                <strong className="text-text-primary">Communications:</strong>{" "}
                Messages you send to us via email or support channels.
              </li>
            </ul>

            <h3 className="mb-2 text-lg font-medium text-text-primary">
              Information Collected Automatically
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>
                <strong className="text-text-primary">Usage data:</strong>{" "}
                Pages visited, features used, actions taken, timestamps, and
                session duration.
              </li>
              <li>
                <strong className="text-text-primary">Device data:</strong>{" "}
                Browser type, operating system, device type, screen resolution,
                and IP address.
              </li>
              <li>
                <strong className="text-text-primary">Error data:</strong>{" "}
                Application errors, performance metrics, and diagnostic
                information collected through our error monitoring service.
              </li>
            </ul>
          </section>

          {/* 2. How We Use Data */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              2. How We Use Your Data
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>
                <strong className="text-text-primary">
                  Provide the Service:
                </strong>{" "}
                Operate, maintain, and deliver the features and functionality of
                the platform.
              </li>
              <li>
                <strong className="text-text-primary">
                  Authentication and security:
                </strong>{" "}
                Verify your identity, protect your account, and prevent fraud or
                abuse.
              </li>
              <li>
                <strong className="text-text-primary">
                  Billing and payments:
                </strong>{" "}
                Process subscriptions, invoices, and payment transactions.
              </li>
              <li>
                <strong className="text-text-primary">Communication:</strong>{" "}
                Send transactional emails (account verification, password
                resets, billing receipts) and, with your consent, product
                updates and announcements.
              </li>
              <li>
                <strong className="text-text-primary">
                  Analytics and improvement:
                </strong>{" "}
                Analyze usage patterns to improve performance, fix bugs, and
                develop new features.
              </li>
              <li>
                <strong className="text-text-primary">
                  Legal compliance:
                </strong>{" "}
                Comply with applicable laws, regulations, and legal processes.
              </li>
            </ul>
          </section>

          {/* 3. Data Sharing and Third Parties */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              3. Data Sharing and Third Parties
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              We do not sell your personal data. We share your information only
              with trusted third-party service providers who assist us in
              operating the Service:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>
                <strong className="text-text-primary">Supabase:</strong>{" "}
                Database hosting, authentication, and real-time data services.
                Your account data, CRM data, and authentication records are
                stored securely on Supabase infrastructure.
              </li>
              <li>
                <strong className="text-text-primary">Stripe:</strong> Payment
                processing for subscriptions and billing. Stripe processes your
                payment information in accordance with their own privacy policy
                and PCI DSS standards.
              </li>
              <li>
                <strong className="text-text-primary">Resend:</strong>{" "}
                Transactional email delivery. Your email address and name are
                shared with Resend to deliver account-related emails such as
                welcome messages, password resets, and billing notifications.
              </li>
              <li>
                <strong className="text-text-primary">Sentry:</strong> Error
                monitoring and performance tracking. Sentry receives anonymized
                error reports and performance data to help us identify and fix
                issues.
              </li>
              <li>
                <strong className="text-text-primary">Vercel:</strong> Hosting
                and content delivery. Vercel processes web requests and may
                collect server logs including IP addresses.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed">
              We may also disclose your information if required by law, court
              order, or governmental regulation, or if we believe disclosure is
              necessary to protect our rights, your safety, or the safety of
              others.
            </p>
          </section>

          {/* 4. Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              4. Cookies and Tracking
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              We use cookies and similar technologies to operate and improve the
              Service:
            </p>
            <ul className="mb-3 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>
                <strong className="text-text-primary">
                  Essential cookies:
                </strong>{" "}
                Required for authentication, session management, and security.
                These cannot be disabled.
              </li>
              <li>
                <strong className="text-text-primary">
                  Analytics cookies:
                </strong>{" "}
                Help us understand how the Service is used so we can improve it.
                These are anonymized where possible.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed">
              We do not use third-party advertising cookies or tracking pixels.
              You can control cookie settings through your browser preferences,
              though disabling essential cookies may impair the functionality of
              the Service.
            </p>
          </section>

          {/* 5. Data Retention */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              5. Data Retention
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              We retain your personal data for as long as your account is active
              or as needed to provide the Service. Specifically:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>
                <strong className="text-text-primary">Account data:</strong>{" "}
                Retained while your account is active and for up to 30 days
                after account deletion to allow for recovery.
              </li>
              <li>
                <strong className="text-text-primary">CRM data:</strong>{" "}
                Retained while your account is active. Deleted upon account
                termination, subject to any legal retention requirements.
              </li>
              <li>
                <strong className="text-text-primary">Billing records:</strong>{" "}
                Retained for up to 7 years to comply with tax and accounting
                regulations.
              </li>
              <li>
                <strong className="text-text-primary">
                  Server logs and error data:
                </strong>{" "}
                Retained for up to 90 days for debugging and security purposes.
              </li>
            </ul>
          </section>

          {/* 6. Your Rights */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              6. Your Rights
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              Depending on your location, you may have the following rights
              regarding your personal data under regulations such as the GDPR
              (EU), CCPA (California), and other applicable privacy laws:
            </p>
            <ul className="mb-4 list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>
                <strong className="text-text-primary">Right of access:</strong>{" "}
                Request a copy of the personal data we hold about you.
              </li>
              <li>
                <strong className="text-text-primary">
                  Right to rectification:
                </strong>{" "}
                Request correction of inaccurate or incomplete data.
              </li>
              <li>
                <strong className="text-text-primary">
                  Right to deletion:
                </strong>{" "}
                Request that we delete your personal data, subject to legal
                retention obligations.
              </li>
              <li>
                <strong className="text-text-primary">
                  Right to data portability:
                </strong>{" "}
                Request your data in a structured, machine-readable format. You
                can export your leads, contacts, and other CRM data from the
                platform at any time.
              </li>
              <li>
                <strong className="text-text-primary">
                  Right to restrict processing:
                </strong>{" "}
                Request that we limit how we use your data in certain
                circumstances.
              </li>
              <li>
                <strong className="text-text-primary">Right to object:</strong>{" "}
                Object to processing of your data for specific purposes,
                including direct marketing.
              </li>
              <li>
                <strong className="text-text-primary">
                  Right to withdraw consent:
                </strong>{" "}
                Where processing is based on consent, you may withdraw it at any
                time without affecting the lawfulness of prior processing.
              </li>
            </ul>
            <p className="text-text-secondary leading-relaxed">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:privacy@goldyon.com"
                className="text-gold hover:text-gold-light transition-colors"
              >
                privacy@goldyon.com
              </a>
              . We will respond to your request within 30 days.
            </p>
          </section>

          {/* 7. Security Measures */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              7. Security Measures
            </h2>
            <p className="mb-3 text-text-secondary leading-relaxed">
              We implement industry-standard security measures to protect your
              data, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
              <li>
                Encryption of data in transit (TLS/HTTPS) and at rest.
              </li>
              <li>
                Row-Level Security (RLS) policies ensuring users can only access
                their own data.
              </li>
              <li>
                Secure password hashing using modern cryptographic algorithms.
              </li>
              <li>
                Regular security audits and dependency vulnerability scanning.
              </li>
              <li>
                CSRF protection, input validation, and Content Security Policy
                headers.
              </li>
              <li>
                Role-based access control (RBAC) to restrict administrative
                functionality.
              </li>
            </ul>
            <p className="mt-3 text-text-secondary leading-relaxed">
              While we strive to protect your data, no method of electronic
              storage or transmission is 100% secure. We cannot guarantee
              absolute security but commit to promptly notifying affected users
              in the event of a data breach.
            </p>
          </section>

          {/* 8. Children's Privacy */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-text-secondary leading-relaxed">
              The Service is not intended for use by children under the age of
              18. We do not knowingly collect personal information from children.
              If we become aware that we have collected data from a child under
              18, we will take steps to delete that information promptly. If you
              believe a child has provided us with personal data, please contact
              us.
            </p>
          </section>

          {/* 9. International Data Transfers */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              9. International Data Transfers
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Your data may be transferred to and processed in countries other
              than your country of residence. Our service providers (Supabase,
              Stripe, Resend, Sentry, Vercel) operate infrastructure globally.
              Where data is transferred outside of the European Economic Area
              (EEA), we ensure appropriate safeguards are in place, such as
              Standard Contractual Clauses or equivalent mechanisms.
            </p>
          </section>

          {/* 10. Changes to This Policy */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              10. Changes to This Policy
            </h2>
            <p className="text-text-secondary leading-relaxed">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or legal requirements. We will notify you
              of material changes by posting the updated policy on this page and
              updating the &quot;Last updated&quot; date. We encourage you to
              review this policy periodically.
            </p>
          </section>

          {/* 11. Contact Information */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gold">
              11. Contact Information
            </h2>
            <p className="text-text-secondary leading-relaxed">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us at{" "}
              <a
                href="mailto:privacy@goldyon.com"
                className="text-gold hover:text-gold-light transition-colors"
              >
                privacy@goldyon.com
              </a>
              .
            </p>
          </section>

          {/* Footer links */}
          <footer className="mt-12 flex flex-col items-center gap-4 border-t border-white/10 pt-8">
            <p className="text-sm text-text-muted">
              See also our{" "}
              <Link
                href="/terms"
                className="text-gold hover:text-gold-light transition-colors font-medium"
              >
                Terms of Service
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
