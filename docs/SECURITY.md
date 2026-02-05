# LeadFlow Security Guide

## Security Features

### Authentication
- Supabase Auth with JWT tokens
- Secure password hashing (bcrypt)
- Session management with auto-refresh

### Authorization
- Role-Based Access Control (Admin/User)
- Row Level Security on all tables
- Database-level access control

### Input Validation
- Zod schemas for all inputs
- Server-side validation
- Client-side validation

### XSS Prevention
- DOMPurify for HTML sanitization
- Content Security Policy headers

### CSRF Protection
- Origin header validation
- Same-site cookie policy

### Rate Limiting
- API: 100 requests/minute
- Auth: 10 requests/minute
- Webhooks: 100 requests/minute
- Exports: 5 requests/minute

### Webhook Security
- HMAC-SHA256 signature verification
- Optional IP allowlisting
- Request rate limiting

## Security Headers

All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Best Practices

1. Never commit `.env.local`
2. Use strong, unique passwords
3. Rotate webhook secrets regularly
4. Monitor audit logs
5. Keep dependencies updated
