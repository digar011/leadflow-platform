# Webhooks Guide

This guide explains how to set up and use webhooks in LeadFlow Platform.

## Overview

LeadFlow supports two types of webhooks:
- **Outbound**: Send data TO external services when events occur
- **Inbound**: Receive data FROM external services (like n8n)

## Outbound Webhooks

### Creating an Outbound Webhook

1. Go to **Settings > Webhooks**
2. Click **New Webhook**
3. Select **Outbound** type
4. Enter a name for your webhook
5. Enter the endpoint URL of your receiving service
6. Select which events to trigger the webhook
7. Click **Create Webhook**

### Available Events

| Event | Description |
|-------|-------------|
| `lead.created` | Fired when a new lead is created |
| `lead.updated` | Fired when a lead is modified |
| `lead.deleted` | Fired when a lead is deleted |
| `lead.status_changed` | Fired when lead status changes |
| `lead.converted` | Fired when a lead is converted |
| `contact.created` | Fired when a contact is created |
| `contact.updated` | Fired when a contact is modified |
| `activity.logged` | Fired when an activity is logged |
| `campaign.started` | Fired when a campaign starts |
| `campaign.completed` | Fired when a campaign finishes |
| `automation.triggered` | Fired when automation runs |

### Webhook Payload Format

```json
{
  "event": "lead.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "uuid",
    "business_name": "Acme Corp",
    "email": "contact@acme.com",
    "status": "new"
  }
}
```

### Verifying Webhook Signatures

All outbound webhooks include a signature header:

```
X-Webhook-Signature: sha256=<hex_signature>
X-Webhook-Event: lead.created
X-Webhook-Timestamp: 2024-01-15T10:30:00Z
```

To verify in your receiving service:
```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature === `sha256=${expected}`;
}
```

### Retry Policy

Failed webhook deliveries are retried:
- Default: 3 attempts
- Backoff: Exponential (1s, 2s, 4s)
- Retry on: 5xx errors and timeouts
- No retry on: 4xx errors (client errors)

## Inbound Webhooks (n8n Integration)

### Creating an Inbound Webhook

1. Go to **Settings > Webhooks**
2. Click **New Webhook**
3. Select **Inbound** type
4. Enter a name for your webhook
5. Select which events to accept
6. Optionally add IP allowlist
7. Click **Create Webhook**

### Using the Webhook URL

Your webhook URL will be:
```
https://your-domain.com/api/webhooks/n8n
```

Include headers in your requests:
- `x-webhook-id`: Your webhook ID
- `x-webhook-signature`: HMAC signature (recommended)

### Request Format

```json
{
  "event": "lead.create",
  "data": {
    "business_name": "New Company",
    "email": "contact@newcompany.com",
    "phone": "+1234567890",
    "status": "new"
  }
}
```

### Supported Inbound Events

| Event | Action |
|-------|--------|
| `lead.create` | Creates a new lead |
| `lead.update` | Updates an existing lead (requires `id` in data) |
| `contact.create` | Creates a new contact |
| `activity.log` | Logs an activity |

### n8n Configuration

1. In n8n, add an HTTP Request node
2. Set method to POST
3. URL: `https://your-domain.com/api/webhooks/n8n`
4. Add headers:
   - `x-webhook-id`: Your webhook ID
   - `x-webhook-signature`: Generated signature
   - `Content-Type`: `application/json`
5. Body: Your event data

## Webhook Management

### Viewing Deliveries

1. Go to **Settings > Webhooks**
2. Click on a webhook to expand
3. View recent deliveries and their status

### Regenerating Secrets

1. Find your webhook in the list
2. Click the refresh icon
3. Save the new secret securely

### Disabling/Enabling

Toggle the play/pause button next to any webhook to enable or disable it.

## Troubleshooting

### Webhook Not Firing
1. Check webhook is active (not paused)
2. Verify event is selected for the webhook
3. Check delivery logs for errors

### Signature Verification Fails
1. Ensure you're using the correct secret
2. Verify payload is not modified
3. Check signature header format

### Deliveries Failing
1. Check target URL is accessible
2. Verify target accepts POST requests
3. Check for firewall/CORS issues
4. Review response status in delivery logs

## Best Practices

1. **Always verify signatures** on your receiving endpoints
2. **Use HTTPS** for webhook endpoints
3. **Respond quickly** (< 30s) to prevent timeouts
4. **Return 2xx** to acknowledge receipt
5. **Process async** for long operations
6. **Log all webhooks** for debugging
7. **Rotate secrets** periodically
