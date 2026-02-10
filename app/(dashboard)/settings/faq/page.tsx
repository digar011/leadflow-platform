"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: "Getting Started",
    items: [
      {
        question: "What is Goldyon?",
        answer:
          "Goldyon is a customer relationship management (CRM) platform designed to help you manage leads, track deals, organize contacts, run campaigns, and monitor your sales pipeline — all in one place.",
      },
      {
        question: "How do I add my first lead?",
        answer:
          'Navigate to the Leads page from the sidebar and click the "Add Lead" button. Fill in the business name, contact details, and any other relevant information. The lead will be automatically added to your pipeline.',
      },
      {
        question: "What do the different lead statuses mean?",
        answer:
          'Leads progress through stages: "New" for freshly added leads, "Contacted" once you\'ve reached out, "Qualified" when they meet your criteria, "Proposal" when a deal is on the table, "Negotiation" during discussions, and finally "Won" or "Lost" for closed deals.',
      },
      {
        question: "What is lead temperature?",
        answer:
          "Lead temperature indicates how likely a lead is to convert. Hot leads are highly engaged and ready to buy, Warm leads show interest but need nurturing, and Cold leads require more outreach before they convert.",
      },
    ],
  },
  {
    title: "Leads & Pipeline",
    items: [
      {
        question: "How do I filter and sort my leads?",
        answer:
          "Use the filter bar at the top of the Leads page. You can filter by status, temperature, source, assigned team member, date range, and tags. Click column headers to sort by that field.",
      },
      {
        question: "Can I bulk-update multiple leads at once?",
        answer:
          "Yes. Select multiple leads using the checkboxes on the Leads page, then use the bulk action toolbar that appears to update their status, temperature, or assignment in one action.",
      },
      {
        question: "How does the deal value work?",
        answer:
          "Each lead can have a deal value representing the potential revenue. This value feeds into your pipeline metrics and analytics dashboards, giving you a clear picture of your total pipeline worth.",
      },
      {
        question: "What are tags and how should I use them?",
        answer:
          "Tags are custom labels you can attach to leads for flexible categorization. Use them for things like industry, referral source, or priority level. You can filter leads by tags on the Leads page.",
      },
    ],
  },
  {
    title: "Contacts",
    items: [
      {
        question: "What is the difference between a lead and a contact?",
        answer:
          "A lead represents a business opportunity, while contacts are the individual people associated with that business. Each lead can have multiple contacts, with one designated as the primary contact.",
      },
      {
        question: "How do I set a primary contact?",
        answer:
          'Open a lead\'s detail page and go to the Contacts section. Click the star icon or use the "Set as Primary" option next to the contact you want to designate. The primary contact is shown prominently on the lead card.',
      },
      {
        question: "Can a contact belong to multiple leads?",
        answer:
          "Each contact is linked to one business (lead). If the same person is involved with multiple businesses, create a separate contact entry for each one to keep your records organized.",
      },
    ],
  },
  {
    title: "Activities & Follow-ups",
    items: [
      {
        question: "What types of activities can I log?",
        answer:
          "You can log calls, emails, meetings, notes, and tasks. Each activity is tied to a specific lead and includes a description, date, and any relevant details to maintain a complete interaction history.",
      },
      {
        question: "How do follow-up reminders work?",
        answer:
          "When creating or editing an activity, you can set a follow-up date. Overdue follow-ups appear highlighted in your dashboard and activity lists so you never miss an important touchpoint.",
      },
      {
        question: "Can I see all my activities across leads?",
        answer:
          "Yes. The Activities page shows all activities across all your leads. Use the filters to narrow by type, date range, or specific lead. Your dashboard also shows recent activity summaries.",
      },
    ],
  },
  {
    title: "Campaigns",
    items: [
      {
        question: "What are campaigns used for?",
        answer:
          "Campaigns let you group leads for targeted marketing or sales efforts. You can track budget, spend, and performance metrics for each campaign, and add or remove leads as members.",
      },
      {
        question: "How do I add leads to a campaign?",
        answer:
          'Open a campaign and click "Add Members." You\'ll see a list of your leads — select the ones you want to include and confirm. Campaign members can be tracked individually with their own status.',
      },
      {
        question: "Are campaigns available on all plans?",
        answer:
          "Campaigns are available on the Starter plan and above. Free-tier users will need to upgrade to access campaign features. Visit Settings > Billing & Plan to see available upgrades.",
      },
    ],
  },
  {
    title: "Analytics & Reports",
    items: [
      {
        question: "What metrics does the dashboard show?",
        answer:
          "The dashboard displays key metrics including total leads, pipeline value, conversion rates, new leads this week, lead temperature breakdown, activity heatmaps, revenue trends, and top-performing team members.",
      },
      {
        question: "How often is analytics data updated?",
        answer:
          "Analytics data refreshes in real time as you interact with your leads and activities. Dashboard stats reflect the current state of your pipeline, and charts update within seconds of any changes.",
      },
      {
        question: "Can I export my data?",
        answer:
          "Data export capabilities depend on your subscription plan. Enterprise users have full export access. Check your plan details under Settings > Billing & Plan for specifics.",
      },
    ],
  },
  {
    title: "Plans & Billing",
    items: [
      {
        question: "What plans are available?",
        answer:
          "Goldyon offers four plans: Free (up to 25 leads, basic features), Starter (100 leads, campaigns, automations), Professional (500 leads, advanced analytics, API access), and Enterprise (unlimited everything with priority support).",
      },
      {
        question: "How do I upgrade my plan?",
        answer:
          'Go to Settings > Billing & Plan and click on the plan you\'d like to switch to. Follow the prompts to enter payment details. Your new plan takes effect immediately, and you\'ll be charged on a prorated basis.',
      },
      {
        question: "What happens if I hit my lead limit?",
        answer:
          "When you reach your plan's lead limit, you won't be able to create new leads until you either upgrade your plan or archive/delete existing leads. A warning banner will appear as you approach the limit.",
      },
      {
        question: "Can I cancel my subscription?",
        answer:
          "Yes. You can downgrade to the Free plan at any time from Settings > Billing & Plan. Your data is preserved, but access to premium features will be restricted based on the Free plan limits.",
      },
    ],
  },
  {
    title: "Team & Permissions",
    items: [
      {
        question: "What are the different user roles?",
        answer:
          "There are three roles: Admin (full access to everything including settings and team management), Manager (can see all leads and manage team workflows), and User (can see and manage their own assigned leads).",
      },
      {
        question: "How do I invite team members?",
        answer:
          "Go to Settings > Team and click \"Invite Member.\" Enter their email address and select a role. They'll receive an invitation email to join your Goldyon workspace.",
      },
      {
        question: "Can I reassign leads between team members?",
        answer:
          'Yes. Open a lead and change the "Assigned To" field, or use bulk actions to reassign multiple leads at once. Only admins and managers can reassign leads between team members.',
      },
    ],
  },
  {
    title: "Integrations & API",
    items: [
      {
        question: "How do webhooks work?",
        answer:
          "Webhooks send real-time notifications to your external services when events happen in Goldyon (e.g., new lead created, status changed). Configure them under Settings > Webhooks with your endpoint URL and selected events.",
      },
      {
        question: "How do I get an API key?",
        answer:
          "Navigate to Settings > API Keys and click \"Generate New Key.\" Copy the key immediately — it won't be shown again. Use this key to authenticate API requests to the Goldyon API.",
      },
      {
        question: "What can I do with the API?",
        answer:
          "The Goldyon API allows you to programmatically create, read, update, and delete leads, contacts, activities, and campaigns. It's available on the Professional plan and above.",
      },
    ],
  },
  {
    title: "Account & Security",
    items: [
      {
        question: "How do I change my password?",
        answer:
          "Go to Settings > Profile and use the password change section. You'll need to enter your current password and then your new password twice to confirm the change.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Yes. Goldyon uses Supabase with row-level security (RLS) policies, ensuring users can only access their own data. All connections are encrypted via HTTPS, and we enforce strict Content Security Policy headers.",
      },
      {
        question: "How do I update my profile information?",
        answer:
          "Go to Settings > Profile to update your name, email, avatar, and other personal information. Changes are saved immediately.",
      },
    ],
  },
];

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-gold"
      >
        <span className="font-medium text-text-primary">{item.question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 text-text-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-4 pr-8">
          <p className="text-sm leading-relaxed text-text-secondary">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = faqSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          !searchQuery ||
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-text-secondary">
          Find answers to common questions about Goldyon
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <HelpCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none"
        />
      </div>

      {/* FAQ Sections */}
      {filteredSections.length === 0 ? (
        <Card variant="glass">
          <CardContent className="py-12 text-center">
            <HelpCircle className="mx-auto mb-4 h-12 w-12 text-text-muted" />
            <p className="text-text-secondary">
              No results found for &quot;{searchQuery}&quot;
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Try a different search term or browse all sections
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredSections.map((section) => (
          <Card key={section.title} variant="glass">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold text-gold">
                {section.title}
              </h3>
              <div>
                {section.items.map((item) => (
                  <FAQAccordionItem key={item.question} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
