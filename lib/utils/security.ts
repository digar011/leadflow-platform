import DOMPurify from "isomorphic-dompurify";
import { LRUCache } from "lru-cache";
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

const rateLimitCache = new LRUCache<string, number[]>({
  max: 10000,
  ttl: 60000, // 1 minute default
});

export function rateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const requests = rateLimitCache.get(identifier) || [];
  const recentRequests = requests.filter((time) => time > windowStart);

  if (recentRequests.length >= limit) {
    const oldestRequest = Math.min(...recentRequests);
    const resetTime = oldestRequest + windowMs;
    return {
      success: false,
      remaining: 0,
      reset: resetTime,
    };
  }

  recentRequests.push(now);
  rateLimitCache.set(identifier, recentRequests);

  return {
    success: true,
    remaining: limit - recentRequests.length,
    reset: now + windowMs,
  };
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
  return hash === verifyHash;
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
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
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
