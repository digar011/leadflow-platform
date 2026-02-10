import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generate a deterministic forwarding address from user ID.
 * Uses first 12 chars of the UUID (unique enough, readable).
 */
export function generateForwardingAddress(userId: string): string {
  const hash = userId.replace(/-/g, "").slice(0, 12);
  return `crm-${hash}@inbound.Goldyon.app`;
}

/**
 * Classify email direction based on whether the user sent or received it.
 * If the user's email is in the "from" field, they sent it (outbound).
 */
export function classifyDirection(
  fromAddress: string,
  userEmail: string
): "inbound" | "outbound" {
  const normalizedFrom = fromAddress.toLowerCase().trim();
  const normalizedUser = userEmail.toLowerCase().trim();
  return normalizedFrom === normalizedUser ? "outbound" : "inbound";
}

/**
 * Extract email address from a string like "John Doe <john@example.com>"
 */
export function extractEmail(addressString: string): string {
  const match = addressString.match(/<([^>]+)>/);
  return (match ? match[1] : addressString).toLowerCase().trim();
}

/**
 * Parse all email addresses from from/to/cc fields, excluding the forwarding address.
 */
export function parseEmailAddresses(
  from: string,
  to: string | string[],
  cc: string | string[] | undefined,
  forwardingAddress: string
): string[] {
  const addresses: string[] = [];
  const fwdNorm = forwardingAddress.toLowerCase();

  // Parse "from"
  const fromEmail = extractEmail(from);
  if (fromEmail && fromEmail !== fwdNorm) {
    addresses.push(fromEmail);
  }

  // Parse "to"
  const toList = Array.isArray(to) ? to : [to];
  for (const addr of toList) {
    const email = extractEmail(addr);
    if (email && email !== fwdNorm && !addresses.includes(email)) {
      addresses.push(email);
    }
  }

  // Parse "cc"
  if (cc) {
    const ccList = Array.isArray(cc) ? cc : [cc];
    for (const addr of ccList) {
      const email = extractEmail(addr);
      if (email && email !== fwdNorm && !addresses.includes(email)) {
        addresses.push(email);
      }
    }
  }

  return addresses;
}

interface MatchResult {
  businessId: string;
  contactId?: string;
}

/**
 * Match email addresses against businesses and contacts to find the associated lead.
 * Checks businesses.email first, then contacts.email.
 */
export async function matchEmailToLead(
  supabase: SupabaseClient,
  userId: string,
  emailAddresses: string[]
): Promise<MatchResult | null> {
  if (emailAddresses.length === 0) return null;

  // 1. Check businesses.email
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, email")
    .in("email", emailAddresses)
    .limit(1)
    .maybeSingle();

  if (businesses) {
    return { businessId: businesses.id };
  }

  // 2. Check contacts.email
  const { data: contact } = await supabase
    .from("contacts")
    .select("id, business_id, email")
    .in("email", emailAddresses)
    .not("business_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (contact?.business_id) {
    return { businessId: contact.business_id, contactId: contact.id };
  }

  return null;
}

/**
 * Get a body snippet from email text (first 500 chars, cleaned).
 */
export function getBodySnippet(text: string | undefined): string | null {
  if (!text) return null;
  // Remove excessive whitespace and trim
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > 500 ? cleaned.slice(0, 500) + "..." : cleaned;
}
