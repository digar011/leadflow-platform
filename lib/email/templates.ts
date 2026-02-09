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
