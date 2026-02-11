# Goldyon -- How-To Guide

A practical, step-by-step guide for common tasks in the Goldyon platform.

---

## Table of Contents

- [How to Add a New Lead](#how-to-add-a-new-lead)
- [How to View and Manage a Lead](#how-to-view-and-manage-a-lead)
- [How to Use the Kanban Board](#how-to-use-the-kanban-board)
- [How to Manage Contacts](#how-to-manage-contacts)
- [How to Log Activities](#how-to-log-activities)
- [How to Create a Campaign](#how-to-create-a-campaign)
- [How to Set Up Automation Rules](#how-to-set-up-automation-rules)
- [How to View Reports](#how-to-view-reports)
- [How to Use the Admin Panel](#how-to-use-the-admin-panel)
- [How to Use Dashboard Quick Actions](#how-to-use-dashboard-quick-actions)
- [How to View Pricing and Manage Your Subscription](#how-to-view-pricing-and-manage-your-subscription)
- [How to Configure Settings](#how-to-configure-settings)
- [Common Troubleshooting](#common-troubleshooting)

---

## How to Add a New Lead

1. Navigate to the **Leads** page from the sidebar.
2. Click the **Add Lead** button in the top-right corner. This takes you to `/leads/new`.
3. Fill in the lead form, which is organized into sections:

   **Basic Information** (required fields marked with *):
   - Business Name * -- the name of the business or company.
   - Email -- the business contact email.
   - Phone -- the business phone number.
   - Website -- the business website URL.
   - Industry -- select from the dropdown (Healthcare, Technology, Finance, Real Estate, Retail, etc.).

   **Address**:
   - Street Address, City, State, ZIP Code.

   **Lead Details**:
   - Status * -- the pipeline stage. Options: New, Contacted, Qualified, Proposal, Negotiation, Won, Lost, Do Not Contact.
   - Temperature -- Cold, Warm, or Hot.
   - Source -- where this lead came from (Google Maps, Yelp, LinkedIn, Referral, Cold Outreach, etc.).

   **Deal Information**:
   - Deal Value -- expected monetary value of the deal.
   - Expected Close Date -- target date for closing the deal.
   - Next Follow-up -- date for the next follow-up action.

   **Tags**:
   - Type a tag name and press Enter or click the + button to add it. Tags help you categorize and filter leads.

   **Description**:
   - Free-text notes about the lead.

4. Click **Create Lead** to save. You will be redirected to the leads list.

**Tips**:
- Only "Business Name" is required. Fill in as much information as you have.
- The form validates inputs using Zod. Invalid emails or URLs will show an error.
- Tags are lowercase and deduplicated automatically.

---

## How to View and Manage a Lead

### Viewing the Lead Detail Page

1. Navigate to **Leads** from the sidebar.
2. Click on any lead name in the list to open its detail page (`/leads/[id]`).
3. The detail page shows:
   - **Header**: Business name, pipeline status badge, temperature badge, industry, city, and source.
   - **Quick Actions Bar**: One-click buttons to log a call, send an email, schedule a meeting, or add a note.
   - **Business Details Card**: Phone, email, website, full address, deal value, expected close date, and tags.
   - **Tabbed Content**:
     - **Timeline** -- the complete customer journey showing all activities and touchpoints in chronological order.
     - **Contacts** -- people associated with this business.
     - **Documents** -- uploaded files (proposals, contracts).
     - **Notes** -- quick notes about the lead.
   - **Right Sidebar**:
     - Engagement Score with a visual indicator (0-100) and contributing factors.
     - Assigned team member.
     - Key dates (created, last activity, last updated, expected close).
     - Quick stats (interactions count, contacts count, lead score, activities count).

### Editing a Lead

1. On the lead detail page, click the **Edit** button in the top-right corner.
2. Modify any fields in the form.
3. Click **Save Changes**.

### Deleting a Lead

1. On the lead detail page, click the trash icon in the top-right corner.
2. A confirmation modal will appear warning that all associated contacts, activities, and touchpoints will also be deleted.
3. Click **Delete Lead** to confirm.

**Note**: Only admins can delete leads. This is enforced by Row Level Security at the database level.

---

## How to Use the Kanban Board

1. Navigate to **Leads** from the sidebar.
2. Click the grid icon (Kanban view toggle) in the view toggle area, or go directly to `/leads/kanban`.
3. The Kanban board displays leads as cards organized into columns by pipeline status:
   - New | Contacted | Qualified | Proposal | Negotiation | Won | Lost
4. Each card shows the business name, deal value, temperature, and key contact info.
5. Use the board to get a visual overview of your pipeline.

---

## How to Manage Contacts

### Viewing All Contacts

1. Click **Contacts** in the sidebar to open the global contacts directory (`/contacts`).
2. Contacts are grouped alphabetically by first name.
3. Each contact card shows:
   - Initials avatar (gold for primary contacts).
   - Full name and "Primary" badge if applicable.
   - Job title and department.
   - Email (clickable mailto link) and phone (clickable tel link).
   - A link to the associated lead.
4. Use the search bar to filter contacts by name, email, or job title.

### Adding a Contact to a Lead

1. Open the lead detail page for the business.
2. Click the **Contacts** tab.
3. Click **Add Contact**.
4. Fill in the contact form:
   - First Name, Last Name.
   - Title/Job Title.
   - Email, Phone.
   - LinkedIn URL.
   - Primary Contact toggle (marks this person as the main point of contact).
5. Click **Save** to add the contact.

### Editing a Contact

1. On the lead detail page, go to the **Contacts** tab.
2. Click the edit action on the contact you want to modify.
3. Update the fields and save.

### Setting a Primary Contact

1. On the lead detail page, go to the **Contacts** tab.
2. Click the "Set Primary" action on the desired contact.
3. The previous primary contact (if any) will be automatically unset.

### Deleting a Contact

1. On the lead detail page, go to the **Contacts** tab.
2. Click the delete action on the contact.
3. Confirm the deletion.

---

## How to Log Activities

### From the Lead Detail Page (Quick Actions)

1. Open any lead detail page.
2. Use the **Quick Actions** bar at the top:
   - **Log Call** -- records an outbound call activity.
   - **Send Email** -- records an email sent activity.
   - **Schedule Meeting** -- records a meeting scheduled activity.
   - **Add Note** -- records a note activity.
3. Fill in the activity details (subject, description).
4. The activity is immediately added to the lead's timeline.

### Viewing the Activity Feed

1. Click **Activities** in the sidebar to view the global activity feed (`/activities`).
2. Activities are grouped by date with a visual timeline.
3. Each activity shows:
   - Type badge (Email Sent, Outbound Call, Meeting Scheduled, etc.).
   - Time elapsed since the activity.
   - Subject line and description.
   - The user who performed the activity.
   - A link to the associated lead.
4. Use the **Activity Type** dropdown to filter by type (e.g., show only calls, only emails).
5. Click the refresh button to reload the feed.

### Activity Types Available

- Email: Sent, Received, Opened, Clicked
- Call: Outbound, Inbound, Voicemail
- SMS: Sent, Received
- Meeting: Scheduled, Completed
- Mailer Sent
- Social: DM, Comment
- Landing Page: Visit, Conversion
- Note
- Status Change
- Task Completed

---

## How to Create a Campaign

1. Navigate to **Campaigns** from the sidebar.
2. Click **New Campaign** in the top-right corner.
3. Fill in the campaign form:

   **Campaign Details**:
   - Campaign Name * -- a descriptive name (e.g., "Q1 Email Outreach").
   - Campaign Type * -- select one:
     - Email Campaign
     - Cold Call Campaign
     - Direct Mail Campaign
     - Social Media Campaign
     - Multi-Channel Campaign
   - Status -- Draft (default), Active, Paused, or Completed.
   - Description -- goals and strategy notes.

   **Schedule and Budget**:
   - Start Date and End Date.
   - Budget -- the allocated budget for this campaign.
   - Target Count -- the number of leads you plan to reach.

4. Click **Create Campaign** to save.

### Managing Campaigns

- **Campaign List**: The campaigns page shows all campaigns in a card grid. Each card displays the campaign name, type, status, and key metrics.
- **Stats Bar**: At the top, view total campaigns, active count, completed count, and total spending.
- **Search and Filter**: Use the search bar and dropdowns to filter by status (Draft, Active, Paused, Completed) and type (Email, Cold Call, etc.).
- **Edit**: Click a campaign card to view details, then navigate to the edit page.

---

## How to Set Up Automation Rules

1. Navigate to **Automation** from the sidebar.
2. Click **New Rule** in the top-right corner.
3. Configure the automation rule:

   **Trigger** (When should this rule fire?):
   - Lead Created -- fires when a new lead is added.
   - Lead Updated -- fires when a lead record is modified.
   - Status Changed -- fires when a lead moves to a different pipeline stage.
   - Score Threshold Reached -- fires when a lead's score crosses a defined value.
   - Inactivity Period -- fires when a lead has no activity for a specified duration.
   - Date-Based Trigger -- fires on a specific date or schedule.
   - Form Submission -- fires when a form is submitted (landing page conversion).

   **Action** (What should happen?):
   - Send Email Notification -- sends an alert email.
   - Create Task -- creates a follow-up task.
   - Assign to User -- automatically assigns the lead to a team member.
   - Update Status -- moves the lead to a different pipeline stage.
   - Update Lead Score -- adjusts the lead's score up or down.
   - Add to Campaign -- enrolls the lead in a campaign.
   - Send Webhook -- triggers an external webhook (for n8n, Zapier, etc.).
   - Add Tag -- adds a tag to the lead record.

4. Set the rule priority (lower number = higher priority).
5. Optionally add a description.
6. Click **Save** to create the rule. New rules are active by default.

### Managing Automation Rules

- **Toggle Active/Inactive**: Click the play/pause icon on any rule to enable or disable it without deleting.
- **View Execution Stats**: The stats bar shows total rules, active rules, total executions, and success rate.
- **Recent Activity Panel**: The right sidebar shows the 10 most recent automation executions with success/failure indicators.
- **Edit**: Click the settings icon on a rule to modify its configuration.
- **Delete**: Click the trash icon and confirm to permanently remove a rule.

---

## How to View Reports

### Quick Reports

1. Navigate to **Reports** from the sidebar.
2. At the top, you will see **Quick Report** cards:
   - Leads Report
   - Activity Report
   - Campaign Report
   - Pipeline Report
3. Click any card to generate that report instantly.

### Saved Reports

1. Below the quick reports section, view your **Saved Reports**.
2. Each saved report shows its name, type badge, schedule (if any), and the last time it was generated.
3. Available actions per report:
   - **Run** (play icon) -- regenerate the report with current data.
   - **Download** (download icon) -- export the report as CSV.
   - **Delete** (trash icon) -- remove the saved report.

### Creating a New Report

1. Click **New Report** in the top-right corner.
2. Configure:
   - Report Name.
   - Report Type (Leads, Activities, Campaigns, Pipeline, Team Performance, Custom).
   - Filters -- define what data to include.
   - Columns -- choose which fields to display.
   - Schedule -- None (manual), Daily, Weekly, or Monthly.
   - Recipients -- email addresses to receive scheduled reports.
3. Save the report for future use.

---

## How to Use Dashboard Quick Actions

The dashboard includes a **Quick Actions** panel for logging activities without navigating away from the main view.

### Available Quick Actions

1. **Add Lead** -- navigates to `/leads/new` to create a new lead.
2. **Log Call** -- opens a modal to record a phone call:
   - **Subject**: Brief description of the call.
   - **Duration**: How long the call lasted (e.g., "30 minutes").
   - **Outcome**: Select one of Answered, Voicemail, No Answer, or Busy.
   - **Notes**: Additional details about the call.
3. **Send Email** -- opens a modal to log an email activity:
   - **Subject**: The email subject.
   - **Notes**: Key points or follow-up items.
4. **Meeting** -- opens a modal to schedule or log a meeting:
   - **Subject**: Meeting topic.
   - **Duration**: Expected meeting length.
   - **Date & Time**: When the meeting is scheduled.
   - **Notes**: Agenda or preparation notes.
5. **Add Note** -- opens a modal to save a quick note:
   - **Subject**: A brief title for the note.
   - **Note**: The full note text.
6. **Import** -- navigates to `/leads/new` for manual lead entry.

### How It Works

- Each action opens a **modal form** directly on the dashboard.
- Submitted activities are saved via the `useCreateActivity` hook and appear in the global activity feed.
- Activities created from Quick Actions are tagged with `source: "quick_action"` in their metadata.

---

## How to View Pricing and Manage Your Subscription

### Viewing Pricing Plans

1. Navigate to `/pricing` (this is a public page -- no login required).
2. The page displays five pricing tiers: **Free**, **Starter**, **Growth**, **Business**, and **Enterprise**.
3. Use the **Monthly / Annual** toggle to switch between billing cycles. Annual billing saves approximately 20%.
4. Each tier card shows:
   - Plan name and tagline.
   - Monthly or annual price.
   - Feature list with check/cross indicators.
   - A call-to-action button (Get Started, Start Free Trial, or Contact Sales).
5. The **Growth** tier is highlighted as "Most Popular" with a gold badge.
6. Below the cards, a **Feature Comparison** table shows a detailed side-by-side breakdown of all features across tiers.

### Managing Your Subscription (Billing Settings)

1. Log in and navigate to **Settings > Billing & Plan** from the sidebar, or go directly to `/settings/billing`.
2. The billing page shows:
   - **Current Plan** card -- your active tier, billing cycle, and price.
   - **Usage Summary** -- `UsageLimitBar` components showing current usage vs. plan limits for:
     - Leads
     - Campaigns
     - Automation Rules
     - Saved Reports
   - **Change Plan** button linking to the pricing page.

### Understanding Usage Limits

- Each resource page (Leads, Campaigns, Automation) displays a usage bar at the top.
- The bar turns **amber** when you reach 80% of your plan limit.
- The bar turns **red** when you hit 100% -- an **Upgrade** button appears.
- Creating a resource beyond your plan limit triggers an **Upgrade Modal** explaining which plan you need.

### Upgrading Your Plan

1. When you encounter a limit, click the **Upgrade** button on the usage bar or the upgrade modal.
2. You will be taken to the pricing page or billing settings to choose a new plan.
3. Alternatively, contact your admin -- admins can change subscription tiers from the Admin Panel.

---

## How to Use the Admin Panel

The admin panel is only accessible to users with the `admin` role. Non-admin users are redirected to the dashboard.

### Accessing the Admin Panel

1. If you are an admin, you will see an **Admin** section in the sidebar with three links:
   - User Management
   - System Settings
   - Audit Logs
2. Click any of these links to access the corresponding admin page.

### User Management (`/admin/users`)

1. **Stats Overview**: View total users, active users, admin count, and new signups this week.
2. **Search**: Use the search bar to find users by name or email.
3. **User Table**: Displays each user with:
   - Name and email.
   - Role dropdown (Admin, Manager, User) -- change a user's role by selecting from the dropdown.
   - **Plan dropdown** (Free, Starter, Growth, Business, Enterprise) -- change a user's subscription tier.
   - Status badge (Active/Inactive).
   - Join date and last sign-in date.
   - Activate/Deactivate button.
4. **Changing Roles**: Select a new role from the dropdown. The change is saved immediately.
5. **Changing Subscription Tier**: Select a new plan from the Plan dropdown. The change is saved immediately and the user's feature access updates accordingly.
6. **Deactivating Users**: Click the "Deactivate" button to disable a user's account. They will not be able to sign in. Click "Activate" to re-enable.

### System Settings (`/admin/settings`)

1. Settings are organized into categories:
   - **Branding** -- company name and display settings.
   - **General** -- timezone, date format, currency.
   - **Features** -- enable/disable specific platform features.
   - **Limits** -- system resource limits.
   - **Security** -- session and authentication settings.
2. **Editing a Setting**:
   - For boolean settings: click the toggle switch to change the value.
   - For text/JSON settings: edit the value in the text input.
   - Click the **Save** button that appears next to the changed setting.
   - A "Saved" confirmation appears briefly after successful save.

### Audit Logs (`/admin/audit`)

1. **Stats**: View total logs, today's activity count, and unique action types.
2. **Filters**:
   - Search by keyword (action, resource type, user name, or email).
   - Filter by action type (Create, Update, Delete, Login, Logout).
   - Filter by resource type (Leads, Contacts, Activities, Campaigns, Users, Automation).
3. **Log Entries**: Each entry shows:
   - Action badge (color-coded: green for create, blue for update, red for delete, purple for login).
   - Resource type and ID.
   - User who performed the action.
   - Timestamp.
   - IP address (when available).
4. **Expand Details**: Click any log entry to expand it and view:
   - Previous Values (for updates).
   - New Values (for creates and updates).
   - Metadata.
5. **Pagination**: Navigate between pages of 25 logs each.

---

## How to Configure Settings

### Accessing User Settings

1. Click **Settings** in the sidebar (bottom section).
2. You will see a settings page with a sidebar navigation listing:
   - Profile
   - Team
   - Billing & Plan
   - Webhooks
   - API Keys
   - Notifications

### Profile Settings (`/settings/profile`)

- Update your full name, email, and avatar.
- Change your password.

### Team Settings (`/settings/team`)

- View and manage team members.
- Invite new team members.

### Billing & Plan (`/settings/billing`)

- View your current subscription tier, billing cycle, and price.
- See usage summary bars for leads, campaigns, automation rules, and saved reports.
- Click **Change Plan** to navigate to the pricing page.
- For more details, see [How to View Pricing and Manage Your Subscription](#how-to-view-pricing-and-manage-your-subscription).

### Webhook Configuration (`/settings/webhooks`)

- Create inbound or outbound webhooks.
- Configure:
  - Name and description.
  - Type (inbound or outbound).
  - URL endpoint.
  - Secret key for signature verification.
  - Events to subscribe to.
  - Custom headers.
  - Retry count and delay.
  - IP allowlist for security.
- Enable or disable webhooks.

### API Key Management (`/settings/api-keys`)

- Generate new API keys by first selecting an **integration type**:
  - **Supabase** -- for database and auth integrations.
  - **Email Service** -- for SendGrid, Mailgun, and similar providers.
  - **Phone / SMS** -- for Twilio, Vonage, and similar providers.
  - **Webhook** -- for n8n, Zapier, Make, and similar automation platforms.
  - **CRM Sync** -- for Salesforce, HubSpot, and similar CRM integrations.
  - **Custom** -- for any other integration.
- After selecting the type, configure:
  - A descriptive key name (auto-filled from the integration type).
  - Scoped permissions (select one or more scopes).
  - Optional expiration date (30 days, 60 days, 90 days, 1 year, or never).
- View existing keys (prefix shown, full key displayed only at creation time).
- Enable/disable keys without deleting them.
- Revoke keys when no longer needed.

### Notification Preferences (`/settings/notifications`)

- Configure which events trigger notifications.
- Set email notification preferences.

---

## Common Troubleshooting

### "Failed to load leads / contacts / campaigns" error

**Cause**: The browser client cannot connect to Supabase, or the database tables do not exist.

**Fix**:
1. Verify that your `.env.local` file contains the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Confirm that the database migrations have been applied. Run `npx supabase db push` if using local Supabase, or manually execute the SQL migrations in the Supabase Dashboard SQL Editor.
3. Check the browser console for specific error messages.

### Redirected to /login repeatedly

**Cause**: The Supabase session is not being maintained, or cookies are blocked.

**Fix**:
1. Ensure that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly and the application has been restarted after changing environment variables.
2. Make sure cookies are not being blocked by your browser.
3. Try clearing cookies and signing in again.
4. If running locally, verify that local Supabase is running with `npx supabase status`.

### "Admin panel not accessible" or redirected to /dashboard

**Cause**: Your user account does not have the `admin` role.

**Fix**:
1. Open the Supabase Dashboard (or Supabase Studio at `http://127.0.0.1:54323` for local dev).
2. Navigate to the `profiles` table.
3. Find your user row and change the `role` column value to `admin`.
4. Refresh the application page.

Alternatively, run this SQL in the Supabase SQL Editor (replace the email with your own):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### Lead form validation errors

**Cause**: Zod validation is rejecting the submitted data.

**Fix**:
- **Business Name** is the only required field. Ensure it is not empty.
- If providing an **email**, it must be a valid email format.
- If providing a **website URL**, it must be a valid URL (include `https://`).
- **Deal Value** must be a positive number.
- Check the red error messages below each field for specific validation failures.

### Charts or dashboard showing no data

**Cause**: No leads or activities exist in the database, or the date range does not cover any data.

**Fix**:
1. Add some leads and log activities to populate the database.
2. Adjust the date range selector on the dashboard to cover the period when data exists.
3. If you just ran migrations, you may need to use `supabase/create_test_user.sql` and add sample data.

### Supabase local development not starting

**Cause**: Docker is not running, or ports are already in use.

**Fix**:
1. Ensure Docker Desktop is running.
2. Run `npx supabase stop` to clean up any stale containers, then `npx supabase start` again.
3. If port conflicts occur, check `supabase/config.toml` for the configured ports (API: 54321, DB: 54322, Studio: 54323) and ensure nothing else is using them.

### Build errors or TypeScript errors

**Cause**: The project is configured to ignore TypeScript and ESLint errors during builds (see `next.config.mjs`), so build failures are likely from other causes.

**Fix**:
1. Run `npm run lint` to check for linting issues.
2. Ensure all dependencies are installed with `npm install`.
3. Delete the `.next` directory and rebuild: remove the `.next` folder, then run `npm run build`.

### Automation rules not executing

**Cause**: The automation rule may be inactive, or the trigger conditions are not being met.

**Fix**:
1. Navigate to **Automation** and verify the rule shows an "Active" badge.
2. If the rule is inactive, click the play icon to activate it.
3. Check the trigger conditions match the events happening in your workflow.
4. Review the **Recent Activity** panel on the automation page for execution logs and error indicators.

### Billing page shows "Free" even after upgrading

**Cause**: The subscription tier migration has not been applied to the database, or the `subscription_tier` column is missing from the `profiles` table.

**Fix**:
1. Run the subscription migration: `supabase/migrations/20260209000000_add_subscription_tier.sql` in the Supabase SQL Editor.
2. If using local Supabase, run `npx supabase db push`.
3. The system gracefully defaults to the "Free" tier when the column is missing, so the app will not crash -- but it will show Free for all users until the migration is applied.

### "Upgrade Required" modal appears unexpectedly

**Cause**: The user's subscription tier does not include the feature or resource they are trying to access.

**Fix**:
1. An admin can change the user's tier from **Admin > User Management** using the Plan dropdown.
2. Alternatively, update the tier directly in the `profiles` table via Supabase SQL Editor:
   ```sql
   UPDATE public.profiles
   SET subscription_tier = 'growth'
   WHERE email = 'user@example.com';
   ```
3. The user should refresh the page after the change.

### Webhook not receiving events

**Cause**: The webhook URL is unreachable, the webhook is disabled, or the secret does not match.

**Fix**:
1. Go to **Settings > Webhooks** and verify the webhook is enabled (active).
2. Confirm the URL is correct and accessible from the server.
3. Check that the correct events are selected.
4. If using signature verification, ensure the secret matches on both sides.
5. Check the retry configuration -- failed deliveries are retried according to the configured retry count and delay.
