"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  Star,
  MoreVertical,
  User,
  Briefcase,
  MapPin,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  is_primary: boolean;
  department?: string;
  notes?: string;
}

interface ContactsListProps {
  contacts: Contact[];
  onAddContact?: () => void;
  onEditContact?: (contact: Contact) => void;
  onSetPrimary?: (contactId: string) => void;
  onDeleteContact?: (contactId: string) => void;
  isLoading?: boolean;
}

export function ContactsList({
  contacts,
  onAddContact,
  onEditContact,
  onSetPrimary,
  onDeleteContact,
  isLoading,
}: ContactsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 rounded-lg bg-white/5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-white/10 rounded" />
                <div className="h-3 w-1/2 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const sortedContacts = [...contacts].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return 0;
  });

  return (
    <div className="space-y-3">
      {/* Add Contact Button */}
      {onAddContact && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAddContact}
          className="w-full"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Contact
        </Button>
      )}

      {contacts.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No contacts yet</p>
          <p className="text-sm mt-1">Add contacts to track key people</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedContacts.map((contact) => (
            <div
              key={contact.id}
              className={cn(
                "p-3 rounded-lg border transition-colors cursor-pointer",
                contact.is_primary
                  ? "bg-gold/5 border-gold/30"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              )}
              onClick={() =>
                setExpandedId(expandedId === contact.id ? null : contact.id)
              }
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                    contact.is_primary
                      ? "bg-gold/20 text-gold"
                      : "bg-white/10 text-text-secondary"
                  )}
                >
                  {contact.first_name[0]}
                  {contact.last_name[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary truncate">
                      {contact.first_name} {contact.last_name}
                    </p>
                    {contact.is_primary && (
                      <Badge variant="gold" size="sm">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  {contact.job_title && (
                    <p className="text-sm text-text-secondary truncate">
                      {contact.job_title}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-md hover:bg-white/10 transition-colors"
                    >
                      <Phone className="h-4 w-4 text-text-muted" />
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-md hover:bg-white/10 transition-colors"
                    >
                      <Mail className="h-4 w-4 text-text-muted" />
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Open actions menu
                    }}
                    className="p-2 rounded-md hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical className="h-4 w-4 text-text-muted" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === contact.id && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-text-muted" />
                      <span className="text-text-secondary">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-text-muted" />
                      <span className="text-text-secondary">{contact.phone}</span>
                    </div>
                  )}
                  {contact.department && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-text-muted" />
                      <span className="text-text-secondary">
                        {contact.department}
                      </span>
                    </div>
                  )}
                  {contact.notes && (
                    <p className="text-sm text-text-muted mt-2 p-2 rounded bg-white/5">
                      {contact.notes}
                    </p>
                  )}

                  {/* Contact Actions */}
                  <div className="flex gap-2 mt-3">
                    {onEditContact && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditContact(contact);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    {!contact.is_primary && onSetPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetPrimary(contact.id);
                        }}
                      >
                        Set as Primary
                      </Button>
                    )}
                    {onDeleteContact && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-status-error hover:text-status-error"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteContact(contact.id);
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
