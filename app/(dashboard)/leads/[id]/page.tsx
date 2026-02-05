"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  MoreVertical,
  ExternalLink,
  Clock,
  TrendingUp,
  Users,
  Activity,
  FileText,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, getStatusBadgeVariant, getTemperatureBadgeVariant } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { JourneyTimeline } from "@/components/leads/JourneyTimeline";
import { EngagementScore } from "@/components/leads/EngagementScore";
import { ContactsList } from "@/components/leads/ContactsList";
import { QuickActions } from "@/components/leads/QuickActions";
import { useLead, useDeleteLead, useUpdateLead } from "@/lib/hooks/useLeads";
import { useCustomerJourney, useCreateActivity } from "@/lib/hooks/useActivities";
import { useContacts, useSetPrimaryContact, useDeleteContact } from "@/lib/hooks/useContacts";
import { formatCurrency, formatPhoneNumber, formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [activeTab, setActiveTab] = useState<"timeline" | "contacts" | "documents" | "notes">("timeline");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: lead, isLoading, error } = useLead(leadId);
  const { data: journeyEvents, isLoading: journeyLoading } = useCustomerJourney(leadId);
  const { data: contacts, isLoading: contactsLoading } = useContacts(leadId);
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();
  const createActivity = useCreateActivity();
  const setPrimaryContact = useSetPrimaryContact();
  const deleteContact = useDeleteContact();

  const handleDelete = async () => {
    try {
      await deleteLead.mutateAsync(leadId);
      router.push("/leads");
    } catch (error) {
      console.error("Failed to delete lead:", error);
    }
  };

  const handleLogActivity = async (activity: {
    type: string;
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }) => {
    await createActivity.mutateAsync({
      business_id: leadId,
      activity_type: activity.type,
      title: activity.title,
      description: activity.description || null,
      metadata: activity.metadata || null,
    });
  };

  const handleSetPrimaryContact = async (contactId: string) => {
    await setPrimaryContact.mutateAsync({
      contactId,
      businessId: leadId,
    });
  };

  const handleDeleteContact = async (contactId: string) => {
    await deleteContact.mutateAsync(contactId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-96 bg-white/10 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-64 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 mx-auto text-text-muted mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Lead Not Found</h2>
        <p className="text-text-secondary mb-4">
          The lead you're looking for doesn't exist or has been deleted.
        </p>
        <Link href="/leads">
          <Button>Back to Leads</Button>
        </Link>
      </div>
    );
  }

  // Calculate engagement score factors
  const engagementFactors = [
    ...(lead.last_contact_date
      ? [
          {
            name: "Recent contact",
            impact: "positive" as const,
            description: formatDate(lead.last_contact_date),
          },
        ]
      : [
          {
            name: "No recent contact",
            impact: "negative" as const,
          },
        ]),
    ...(lead.deal_value
      ? [
          {
            name: "Deal value set",
            impact: "positive" as const,
            description: formatCurrency(lead.deal_value),
          },
        ]
      : []),
    ...(journeyEvents && journeyEvents.length > 5
      ? [
          {
            name: "Active engagement",
            impact: "positive" as const,
            description: `${journeyEvents.length} interactions`,
          },
        ]
      : []),
    ...(contacts && contacts.length > 1
      ? [
          {
            name: "Multiple contacts",
            impact: "positive" as const,
            description: `${contacts.length} contacts`,
          },
        ]
      : []),
  ];

  const tabs = [
    { id: "timeline", label: "Timeline", icon: Activity },
    { id: "contacts", label: "Contacts", icon: Users, count: contacts?.length },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "notes", label: "Notes", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">
                {lead.business_name}
              </h1>
              <Badge variant={getStatusBadgeVariant(lead.status)}>
                {lead.status.replace(/_/g, " ")}
              </Badge>
              {lead.lead_temperature && (
                <Badge variant={getTemperatureBadgeVariant(lead.lead_temperature)}>
                  {lead.lead_temperature}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
              {lead.industry && <span>{lead.industry}</span>}
              {lead.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {lead.city}, {lead.state}
                </span>
              )}
              {lead.source && <span>Source: {lead.source}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/leads/${leadId}/edit`}>
            <Button variant="secondary" leftIcon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteModal(true)}
            className="text-status-error hover:text-status-error"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card variant="glass" padding="sm">
        <CardContent className="pt-4">
          <QuickActions
            businessId={leadId}
            businessName={lead.business_name}
            onLogActivity={handleLogActivity}
          />
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Details Card */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gold" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-text-muted" />
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-text-secondary hover:text-gold transition-colors"
                  >
                    {formatPhoneNumber(lead.phone)}
                  </a>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-text-muted" />
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-text-secondary hover:text-gold transition-colors truncate"
                  >
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-text-muted" />
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-gold transition-colors flex items-center gap-1"
                  >
                    {lead.website.replace(/^https?:\/\//, "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {lead.address && (
                <div className="flex items-start gap-2 col-span-2">
                  <MapPin className="h-4 w-4 text-text-muted mt-0.5" />
                  <span className="text-text-secondary">
                    {lead.address}
                    {lead.city && `, ${lead.city}`}
                    {lead.state && `, ${lead.state}`}
                    {lead.zip_code && ` ${lead.zip_code}`}
                  </span>
                </div>
              )}
              {lead.deal_value && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gold" />
                  <span className="text-gold font-medium">
                    {formatCurrency(lead.deal_value)}
                  </span>
                </div>
              )}
              {lead.expected_close_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-text-muted" />
                  <span className="text-text-secondary">
                    Expected close: {format(new Date(lead.expected_close_date), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              {lead.tags && lead.tags.length > 0 && (
                <div className="flex items-start gap-2 col-span-2">
                  <Tag className="h-4 w-4 text-text-muted mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.map((tag) => (
                      <Badge key={tag} variant="default" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="border-b border-white/10">
            <nav className="flex gap-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                      activeTab === tab.id
                        ? "border-gold text-gold"
                        : "border-transparent text-text-muted hover:text-text-secondary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/10">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <Card variant="glass">
            <CardContent className="pt-6">
              {activeTab === "timeline" && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Customer Journey
                  </h3>
                  <JourneyTimeline
                    events={journeyEvents || []}
                    isLoading={journeyLoading}
                  />
                </div>
              )}

              {activeTab === "contacts" && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Contacts
                  </h3>
                  <ContactsList
                    contacts={
                      contacts?.map((c) => ({
                        id: c.id,
                        first_name: c.first_name,
                        last_name: c.last_name,
                        email: c.email || undefined,
                        phone: c.phone || undefined,
                        job_title: c.job_title || undefined,
                        is_primary: c.is_primary,
                        department: c.department || undefined,
                        notes: c.notes || undefined,
                      })) || []
                    }
                    onAddContact={() => router.push(`/leads/${leadId}/contacts/new`)}
                    onEditContact={(contact) =>
                      router.push(`/leads/${leadId}/contacts/${contact.id}/edit`)
                    }
                    onSetPrimary={handleSetPrimaryContact}
                    onDeleteContact={handleDeleteContact}
                    isLoading={contactsLoading}
                  />
                </div>
              )}

              {activeTab === "documents" && (
                <div className="text-center py-8 text-text-muted">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No documents yet</p>
                  <p className="text-sm mt-1">
                    Upload proposals, contracts, and other files
                  </p>
                  <Button variant="outline" className="mt-4">
                    Upload Document
                  </Button>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="text-center py-8 text-text-muted">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No notes yet</p>
                  <p className="text-sm mt-1">
                    Add notes to keep track of important details
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      handleLogActivity({
                        type: "note",
                        title: "New Note",
                        description: "",
                      })
                    }
                  >
                    Add Note
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Engagement Score */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gold" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EngagementScore
                score={lead.engagement_score || 50}
                previousScore={45}
                lastActivityDate={lead.last_contact_date || undefined}
                factors={engagementFactors}
              />
            </CardContent>
          </Card>

          {/* Assigned To */}
          {lead.profiles && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-sm">Assigned To</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <span className="text-gold font-medium">
                      {lead.profiles.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {lead.profiles.full_name}
                    </p>
                    <p className="text-sm text-text-muted">{lead.profiles.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Dates */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gold" />
                Key Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Created</span>
                <span className="text-text-secondary">
                  {formatDate(lead.created_at)}
                </span>
              </div>
              {lead.last_contact_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Last Contact</span>
                  <span className="text-text-secondary">
                    {formatDate(lead.last_contact_date)}
                  </span>
                </div>
              )}
              {lead.next_follow_up && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Next Follow-up</span>
                  <span className="text-gold font-medium">
                    {formatDate(lead.next_follow_up)}
                  </span>
                </div>
              )}
              {lead.expected_close_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Expected Close</span>
                  <span className="text-text-secondary">
                    {formatDate(lead.expected_close_date)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-gold">
                  {journeyEvents?.length || 0}
                </p>
                <p className="text-xs text-text-muted">Interactions</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-gold">
                  {contacts?.length || 0}
                </p>
                <p className="text-xs text-text-muted">Contacts</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-gold">
                  {lead.total_interactions || 0}
                </p>
                <p className="text-xs text-text-muted">Total Calls</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-gold">
                  {lead.total_emails || 0}
                </p>
                <p className="text-xs text-text-muted">Emails Sent</p>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {lead.description && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {lead.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Lead"
        description={`Are you sure you want to delete "${lead.business_name}"? This action cannot be undone and will remove all associated contacts, activities, and touchpoints.`}
        confirmText="Delete Lead"
        variant="danger"
        isLoading={deleteLead.isPending}
      />
    </div>
  );
}
