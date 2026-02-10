# Leads Management Guide

This guide covers all aspects of managing leads in Goldyon Platform.

## Table of Contents
- [Leads List](#leads-list)
- [360-Degree Customer View](#360-degree-customer-view)
- [Adding Leads](#adding-leads)
- [Editing Leads](#editing-leads)
- [Kanban Board](#kanban-board)
- [Managing Contacts](#managing-contacts)
- [Logging Activities](#logging-activities)
- [Filtering and Search](#filtering-and-search)

---

## Leads List

The leads list page (`/leads`) provides a comprehensive view of all your leads with powerful filtering and sorting capabilities.

### Features
- **Stats Cards**: Quick overview of total leads, new this week, pipeline value, and won deals
- **Search**: Full-text search across business name, email, and city
- **Filters**: Filter by status, temperature, and source
- **Sorting**: Click column headers to sort by any field
- **Pagination**: Navigate through large datasets with page controls

### Actions
- **Add Lead**: Click "Add Lead" button to create a new lead
- **Export**: Export leads to CSV format
- **View Lead**: Click on any lead row to open the detail view
- **Delete Lead**: Use the actions dropdown to delete a lead

---

## 360-Degree Customer View

The lead detail page (`/leads/[id]`) provides a complete view of the customer journey.

### Sections

#### Header
- Business name with status and temperature badges
- Industry and location information
- Edit and delete actions

#### Quick Actions
- Log Call - Record phone call interactions
- Log Email - Track email communications
- Schedule Meeting - Book meetings with contacts
- Add Note - Add internal notes
- Log SMS - Track text messages

#### Business Details Card
- Contact information (phone, email, website)
- Full address with map link
- Deal value and expected close date
- Tags for organization

#### Tabs
1. **Timeline**: Complete customer journey with all touchpoints and activities
2. **Contacts**: All contacts associated with this business
3. **Documents**: Uploaded files, proposals, and contracts
4. **Notes**: Internal team notes

#### Sidebar
- **Engagement Score**: Visual health indicator with trend analysis
- **Assigned To**: Team member responsible for this lead
- **Key Dates**: Created date, last contact, next follow-up, expected close
- **Quick Stats**: Total interactions, contacts, calls, emails

---

## Adding Leads

Navigate to `/leads/new` or click "Add Lead" from the leads list.

### Required Fields
- **Business Name**: The company or business name

### Optional Fields
- **Basic Information**: Email, phone, website, industry
- **Address**: Street, city, state, ZIP code, country
- **Lead Details**: Status, temperature, source
- **Deal Information**: Deal value, expected close date, next follow-up
- **Tags**: Add custom tags for organization
- **Description**: Additional notes about the lead

### Validation
- Business name is required
- Email must be valid format if provided
- Phone number is automatically formatted
- Website must be valid URL if provided

---

## Editing Leads

Navigate to `/leads/[id]/edit` or click "Edit" from the lead detail page.

### Editable Fields
All fields from the add lead form can be modified. Changes are saved when you click "Save Changes".

### Status Changes
Status changes are tracked in the activity timeline. Consider the following workflow:
1. **New** → Initial lead entry
2. **Contacted** → First outreach made
3. **Qualified** → Meets qualification criteria
4. **Proposal** → Proposal/quote sent
5. **Negotiation** → Active negotiations
6. **Won** → Deal closed successfully
7. **Lost** → Deal not won

---

## Kanban Board

The kanban board (`/leads/kanban`) provides a visual pipeline view.

### Features
- **Drag and Drop**: Move leads between status columns
- **Pipeline Stats**: Total leads and value in each stage
- **Quick Stats**: Total pipeline value and conversion counts
- **Lead Cards**: Show business name, value, temperature, and key info

### Columns
- New
- Contacted
- Qualified
- Proposal
- Negotiation
- Won

### Tips
- Use drag and drop to quickly update lead status
- Cards show deal value for quick pipeline valuation
- Color-coded by temperature (hot, warm, cold)
- Click any card to open the full detail view

---

## Managing Contacts

Each lead can have multiple contacts associated with it.

### Adding Contacts
1. Open the lead detail page
2. Click the "Contacts" tab
3. Click "Add Contact"
4. Fill in the contact form

### Contact Fields
- **Personal**: First name (required), last name (required), email, phone
- **Job**: Job title, department
- **Primary Contact**: Mark as the main point of contact
- **Notes**: Additional information

### Primary Contact
- Only one contact per business can be primary
- Primary contact is shown prominently in lead views
- Setting a new primary automatically unsets the previous one

### Editing Contacts
Click on a contact card to expand details, then use the "Edit" button.

### Deleting Contacts
Use the "Delete" button in the expanded contact view.

---

## Logging Activities

Track all interactions with your leads using the quick actions.

### Activity Types

#### Log Call
- Subject: Brief description
- Duration: Call length
- Outcome: Answered, Voicemail, No Answer, Busy
- Notes: Detailed call notes

#### Log Email
- Subject: Email subject line
- Notes: Key points or follow-up items

#### Schedule Meeting
- Subject: Meeting topic
- Duration: Expected meeting length
- Notes: Agenda or preparation notes

#### Add Note
- Internal notes visible to your team

#### Log SMS
- Subject: Brief description
- Notes: Message content or summary

### Activity Timeline
All activities appear in the customer journey timeline:
- Chronologically ordered (newest first)
- Color-coded by activity type
- Shows user who logged the activity
- Timestamps with relative time

---

## Filtering and Search

### Search
The search box filters leads by:
- Business name
- Email address
- City

### Status Filter
Filter leads by pipeline stage:
- New, Contacted, Qualified, Proposal, Negotiation, Won, Lost, Do Not Contact

### Temperature Filter
Filter by lead temperature:
- Hot - High priority leads
- Warm - Engaged leads
- Cold - Initial contact stage

### Source Filter
Filter by lead source:
- Google Maps, Yelp, LinkedIn, Website, Referral, Cold Outreach, Trade Show, Social Media, Manual Entry, Data Import, Webhook/API, Other

### Active Filters
- Active filters are shown as tags below the filter bar
- Click the X on any filter tag to remove it
- "Clear all" removes all active filters

---

## Best Practices

1. **Keep Leads Updated**: Regularly update status and add activities
2. **Use Tags**: Organize leads with custom tags for easier filtering
3. **Log All Activities**: Track every interaction for accurate engagement scoring
4. **Add Multiple Contacts**: Identify all decision makers and influencers
5. **Set Follow-ups**: Use the next follow-up date to never miss an opportunity
6. **Monitor Engagement**: Check the engagement score to prioritize outreach
7. **Use Kanban View**: Get a visual overview of your pipeline health

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search | `Ctrl/Cmd + K` |
| Add Lead | `N` (when on leads list) |
| View Kanban | `K` (when on leads list) |

---

## API Reference

For programmatic access to leads, see the [API Documentation](/docs/API.md).

### Endpoints
- `GET /api/leads` - List leads with filtering
- `GET /api/leads/:id` - Get lead details
- `POST /api/leads` - Create new lead
- `PATCH /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
