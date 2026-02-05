# LeadFlow Intelligence Platform

Full-stack lead intelligence and CRM platform built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)

## Features

### Core CRM
- **Lead Management**: Full CRUD with 40+ data fields per lead
- **360-Degree Customer View**: Complete customer journey timeline
- **Contact Management**: Track people at each business
- **Activity Logging**: Calls, emails, meetings, notes, and more
- **Kanban Board**: Visual pipeline management

### Analytics & Reporting
- **Dashboard**: KPIs, pipeline funnel, activity feed
- **Advanced Analytics**: Conversion rates, revenue trends, source analysis
- **Report Builder**: Create custom reports with export options
- **Scheduled Reports**: Automated email delivery

### Automation
- **Workflow Rules**: Trigger-based automation
- **Task Scheduling**: Automated follow-ups
- **n8n Integration**: Webhook support for external automation

### Security
- **Role-Based Access**: Admin and User roles
- **Row Level Security**: Database-level access control
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Zod schemas for all inputs

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Charts | Recharts |
| Testing | Playwright |
| Validation | Zod |

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd leadflow-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations (requires Supabase CLI)
npx supabase db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Documentation

- [Setup Guide](docs/SETUP.md) - Detailed installation instructions
- [Security Guide](docs/SECURITY.md) - Security implementation details

## Project Structure

```
leadflow-platform/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Dashboard pages
│   ├── admin/             # Admin pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   └── ...               # Feature-specific components
├── lib/                   # Utilities and configuration
│   ├── supabase/         # Supabase clients
│   ├── utils/            # Helpers and validators
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # Database migrations
├── tests/
│   └── e2e/              # Playwright E2E tests
└── docs/                  # Documentation
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run test:e2e   # Run Playwright tests
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `N8N_WEBHOOK_SECRET` | Webhook signature secret | No |

## Database Schema

The application uses the following main tables:
- `profiles` - User profiles and roles
- `businesses` - Lead/company records
- `contacts` - People at businesses
- `activities` - Interaction history
- `touchpoints` - Customer journey events
- `campaigns` - Marketing campaigns
- `automation_rules` - Workflow automation
- `reports` - Saved report configurations
- `analytics_snapshots` - Daily metrics rollups

## License

This project is proprietary software. All rights reserved.
