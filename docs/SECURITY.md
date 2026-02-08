# LeadFlow Security Guide

This document outlines the comprehensive security measures implemented in LeadFlow Platform.

## Authentication & Authorization

### Supabase Auth
- Uses Supabase Auth for secure authentication
- JWT-based session management with automatic token refresh
- Secure password hashing (bcrypt)
- Session tokens stored in httpOnly, secure, sameSite cookies

### Role-Based Access Control (RBAC)
Three roles are supported:
- **Admin**: Full system access, user management, system settings, audit logs
- **Manager**: Team oversight, all CRM features
- **User**: Standard CRM features

### Route Protection
- Middleware validates authentication on all protected routes
- Admin routes require admin role verification
- API routes validate session tokens before processing

## Data Security

### Row Level Security (RLS)
All tables have RLS policies enabled:
- Users can only access their own data
- Admins can access all data for management
- Service role bypasses RLS for system operations

### Input Validation
- Zod schemas for all form inputs
- Server-side validation on all API endpoints
- Type-safe database queries with TypeScript

### SQL Injection Prevention
- Parameterized queries through Supabase client
- No raw SQL execution from user input
- Prepared statements for all database operations

### XSS Prevention
- React's built-in XSS protection
- Content Security Policy headers
- DOMPurify for HTML sanitization

## API Security

### CSRF Protection
- Origin header validation in middleware
- SameSite cookie policy
- CSRF tokens for sensitive operations

### Rate Limiting
| Endpoint | Limit |
|----------|-------|
| API | 100 requests/minute |
| Auth | 10 requests/minute |
| Webhooks | 100 requests/minute |
| Exports | 5 requests/minute |

### API Key Security
- SHA-256 hashed key storage (full key never stored)
- Key prefix for identification
- Scope-based permissions (read/write per resource)
- Optional expiration dates (30, 60, 90 days, or 1 year)
- Integration type categorization (Supabase, Email, Phone/SMS, Webhook, CRM Sync, Custom)
- Enable/disable keys without deletion
- Revocation support

### Subscription-Based Feature Gating
- Resource limits enforced at the mutation level via `checkResourceLimit()` pre-flight checks
- `LimitReachedError` thrown when a user's resource count reaches their plan limit
- Sidebar navigation hides features not available on the user's tier
- `FeatureGate` component renders locked UI state for gated features
- Subscription tier stored in `profiles.subscription_tier` with database-level CHECK constraint
- System gracefully defaults to Free tier if the subscription column is missing

## Webhook Security

### Inbound Webhooks (receiving from n8n)
- HMAC-SHA256 signature verification
- IP allowlist support
- Rate limiting per IP
- Payload validation before processing

### Outbound Webhooks (sending to external services)
- Signature generation for all payloads
- Retry with exponential backoff
- Delivery logging for audit trail

### Signature Verification Example
```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature.replace('sha256=', ''))
  );
}
```

## Audit Logging

### Tracked Events
- User authentication (login/logout)
- Data CRUD operations (create, read, update, delete)
- Role and permission changes
- System settings modifications
- Webhook deliveries
- API key usage

### Log Data Captured
- User ID and action performed
- Resource type and ID
- Old and new values (for updates)
- IP address and user agent
- Timestamp

## Security Headers

All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Environment Security

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (server-side only)
```

### Secret Management
- Never commit `.env.local` to version control
- Use strong, unique secrets for each environment
- Rotate webhook secrets regularly
- Monitor for leaked credentials

## Security Checklist

### Before Deployment
- [ ] All environment variables configured
- [ ] RLS policies verified on all tables
- [ ] API rate limiting enabled
- [ ] Webhook signature verification enabled
- [ ] Admin routes protected
- [ ] Audit logging enabled
- [ ] Security headers configured
- [ ] HTTPS enabled

### Regular Maintenance
- [ ] Review audit logs weekly
- [ ] Rotate API keys quarterly
- [ ] Update dependencies monthly
- [ ] Review user permissions and subscription tiers quarterly
- [ ] Test backup restoration annually
- [ ] Verify subscription tier limits are enforced correctly

## Best Practices

1. **Never commit `.env.local`** - Keep secrets out of version control
2. **Use strong, unique passwords** - Enforce complexity requirements
3. **Rotate webhook secrets regularly** - Update every 90 days
4. **Monitor audit logs** - Review weekly for suspicious activity
5. **Keep dependencies updated** - Run `npm audit` regularly
6. **Use least privilege** - Grant minimum necessary permissions
7. **Enable 2FA** - When supported by Supabase
8. **Review API keys** - Revoke unused keys

## Reporting Security Issues

If you discover a security vulnerability:
1. Do NOT create a public GitHub issue
2. Email security concerns privately
3. Include detailed reproduction steps
4. Allow time for fix before disclosure
