import DOMPurify from "isomorphic-dompurify";
import { LRUCache } from "lru-cache";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// XSS Prevention
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

// Rate Limiting
interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

// In-memory fallback (used when Supabase is unavailable)
const rateLimitCache = new LRUCache<string, number[]>({
  max: 10000,
  ttl: 60000,
});

function rateLimitInMemory(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const requests = rateLimitCache.get(identifier) || [];
  const recentRequests = requests.filter((time) => time > windowStart);

  if (recentRequests.length >= limit) {
    return { success: false, remaining: 0, reset: now + windowMs };
  }

  recentRequests.push(now);
  rateLimitCache.set(identifier, recentRequests);

  return {
    success: true,
    remaining: limit - recentRequests.length,
    reset: now + windowMs,
  };
}

// Supabase client for persistent rate limiting (service role)
let _rateLimitClient: ReturnType<typeof createClient> | null = null;
function getRateLimitClient() {
  if (_rateLimitClient) return _rateLimitClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _rateLimitClient = createClient(url, key);
  return _rateLimitClient;
}

/**
 * Rate limit check — uses Supabase persistent storage (works across
 * serverless instances), with in-memory LRU fallback.
 */
export async function rateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const supabase = getRateLimitClient();

  if (supabase) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- rate limit client uses generic Supabase rpc
      const { data, error } = await (supabase.rpc as any)(
        "check_rate_limit",
        {
          p_identifier: identifier,
          p_limit: limit,
          p_window_seconds: Math.ceil(windowMs / 1000),
        }
      ) as { data: { allowed: boolean; remaining: number }[] | null; error: unknown };

      if (!error && data && data.length > 0) {
        return {
          success: data[0].allowed,
          remaining: data[0].remaining,
          reset: Date.now() + windowMs,
        };
      }
    } catch {
      // Fall through to in-memory
    }
  }

  return rateLimitInMemory(identifier, limit, windowMs);
}

// Webhook Signature Verification
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// CSRF Token Generation
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
}

// IP Address Validation
export function isValidIP(ip: string): boolean {
  // IPv4
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

export function isIPAllowed(ip: string, allowedIPs: string[]): boolean {
  if (allowedIPs.length === 0) return true;
  return allowedIPs.includes(ip);
}

// Password Hashing (for additional security layers if needed)
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(":");
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"));
}

// API Key Generation
export function generateAPIKey(): string {
  return `lf_${crypto.randomBytes(32).toString("hex")}`;
}

// Secure Random String
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

// Input Sanitization for SQL-like queries (extra layer beyond parameterized queries)
export function sanitizeSearchInput(input: string): string {
  // Remove potential SQL injection characters
  return input.replace(/['"`;\\]/g, "").trim();
}

// Content Security Policy Header Generator
export function generateCSPHeader(): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.ingest.sentry.io",
    "frame-src https://js.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

// Security Headers for API responses
export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": generateCSPHeader(),
  };
}
