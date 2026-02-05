# Admin Guide

This guide covers administrative features in LeadFlow Platform.

## Accessing Admin Panel

1. Log in with an admin account
2. Navigate to `/admin` or click **Admin** in the navigation
3. Admin panel includes User Management, System Settings, and Audit Logs

> **Note**: Only users with the Admin role can access the admin panel.

## User Management

### Viewing Users

The Users page (`/admin/users`) shows all registered users with:
- Name and email
- Current role (Admin, Manager, User)
- Active/inactive status
- Join date
- Last sign-in date

### Filtering Users

Use the search box to filter by:
- Email address
- Full name

### Changing User Roles

1. Find the user in the list
2. Click the role dropdown
3. Select: Admin, Manager, or User
4. Changes apply immediately

#### Role Permissions

| Feature | User | Manager | Admin |
|---------|------|---------|-------|
| View own leads | ✅ | ✅ | ✅ |
| Create/edit leads | ✅ | ✅ | ✅ |
| View team leads | ❌ | ✅ | ✅ |
| Manage campaigns | ✅ | ✅ | ✅ |
| View reports | ✅ | ✅ | ✅ |
| User management | ❌ | ❌ | ✅ |
| System settings | ❌ | ❌ | ✅ |
| Audit logs | ❌ | ❌ | ✅ |

### Activating/Deactivating Users

1. Find the user in the list
2. Click **Deactivate** or **Activate**
3. Deactivated users cannot log in
4. Data is preserved when deactivated

## System Settings

Navigate to `/admin/settings` to configure global platform settings.

### Settings Categories

#### Branding
- **Company Name**: Displayed throughout the application

#### General
- **Timezone**: Default system timezone
- **Date Format**: How dates are displayed
- **Currency**: Default currency for deals

#### Features
- **Lead Scoring**: Enable/disable automatic lead scoring
- **Automation**: Enable/disable workflow automation

#### Limits
- **Max API Keys**: Per-user limit (default: 5)
- **Max Webhooks**: Per-user limit (default: 10)

#### Security
- **Session Timeout**: Idle timeout in minutes (default: 480)

### Editing Settings

1. Find the setting to change
2. Modify the value
3. Click **Save** next to the setting
4. Changes apply immediately

## Audit Logs

Navigate to `/admin/audit` to view system activity logs.

### Viewing Logs

The Audit Logs page shows:
- Total log entries
- Logs created today
- Unique action types

### Log Entry Details

Each entry includes:
- **Action**: create, update, delete, login, logout
- **Resource**: Type of resource affected
- **User**: Who performed the action
- **Timestamp**: When it occurred
- **IP Address**: Origin of the request

### Filtering Logs

Filter by:
- **Action type**: create, update, delete, etc.
- **Resource type**: leads, contacts, users, etc.
- **Search**: Free text search

### Expanding Log Details

Click on any log entry to expand and see:
- Previous values (for updates)
- New values (for creates/updates)
- Additional metadata

### Pagination

Use Previous/Next buttons to navigate through logs. Default shows 25 entries per page.

## Security Best Practices

### User Management
- Regularly review user access
- Deactivate unused accounts
- Limit admin accounts to necessary personnel
- Review role assignments quarterly

### Audit Log Review
- Check audit logs weekly for unusual activity
- Monitor failed login attempts
- Track admin actions
- Export logs for compliance

### System Settings
- Use appropriate session timeouts
- Enable feature toggles only as needed
- Review limits periodically

## Troubleshooting

### User Can't Log In
1. Check if account is active
2. Verify email address
3. Check if password needs reset
4. Review recent audit logs for the user

### Settings Not Saving
1. Verify admin role
2. Check browser console for errors
3. Try refreshing the page
4. Clear browser cache

### Audit Logs Not Appearing
1. Verify database connection
2. Check RLS policies
3. Ensure audit triggers are enabled
