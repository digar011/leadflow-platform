// ── New user welcome email ──────────────────────────────────

export interface NewUserWelcomeData {
  fullName: string;
  loginUrl?: string;
}

export function getNewUserWelcomeSubject(): string {
  return "Welcome to LeadFlow – Your CRM is ready!";
}

export function getNewUserWelcomeHtml(data: NewUserWelcomeData): string {
  const loginUrl = data.loginUrl || "https://app.leadflow.com/login";
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #0a0a0f;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: #13131a; border-radius: 12px; padding: 32px; border: 1px solid rgba(255,255,255,0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 28px; font-weight: 700; color: #c8a55a;">LeadFlow</span>
        </div>
        <h1 style="color: #f0f0f5; font-size: 22px; margin: 0 0 16px; text-align: center;">
          Welcome aboard, ${data.fullName}!
        </h1>
        <p style="color: #9ca3af; font-size: 15px; line-height: 1.7; text-align: center;">
          Your LeadFlow CRM account is all set. Here's what you can do right away:
        </p>
        <ul style="color: #9ca3af; font-size: 14px; line-height: 2; padding-left: 20px;">
          <li>Add your first leads and track their progress</li>
          <li>Set up automation rules to save time</li>
          <li>Manage contacts and log activities</li>
          <li>Generate reports and monitor your pipeline</li>
        </ul>
        <div style="text-align: center; margin: 28px 0 16px;">
          <a href="${loginUrl}" style="display: inline-block; background: #c8a55a; color: #0a0a0f; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 24px;">
          Questions? Just reply to this email or use the in-app support ticket system.
        </p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.05); margin: 24px 0;" />
        <p style="color: #4b5563; font-size: 12px; text-align: center;">
          &copy; ${new Date().getFullYear()} LeadFlow. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>`;
}

// ── Lead/contact outreach email ────────────────────────────

export interface WelcomeEmailData {
  businessName: string;
  contactName?: string;
  senderName?: string;
  companyName?: string;
}

export function getWelcomeEmailSubject(data: WelcomeEmailData): string {
  return `Welcome to ${data.companyName || "LeadFlow"}, ${data.contactName || data.businessName}!`;
}

export function getWelcomeEmailHtml(data: WelcomeEmailData): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h1 style="color: #111827; font-size: 24px; margin: 0 0 16px;">
          Welcome, ${data.contactName || data.businessName}!
        </h1>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Thank you for connecting with ${data.companyName || "us"}. We're excited to explore how we can help ${data.businessName} grow.
        </p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          A member of our team will be in touch soon to discuss your needs and how we can best serve you.
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
          Best regards,<br />
          ${data.senderName || "The Team"}
        </p>
      </div>
    </div>
  </body>
</html>`;
}
