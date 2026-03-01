"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Phone,
  Mail,
  Building2,
  Star,
  User,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useContacts } from "@/lib/hooks/useContacts";
import { formatPhoneNumber } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: contacts, isLoading, error } = useContacts();

  const filteredContacts = contacts?.filter((contact) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (contact.first_name ?? "").toLowerCase().includes(query) ||
      (contact.last_name ?? "").toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.title?.toLowerCase().includes(query)
    );
  });

  // Group contacts by first letter
  const groupedContacts = filteredContacts?.reduce((acc, contact) => {
    const letter = (contact.first_name ?? "?")[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(contact);
    return acc;
  }, {} as Record<string, typeof contacts>);

  const sortedLetters = Object.keys(groupedContacts || {}).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Contacts</h1>
          <p className="text-text-secondary">
            All contacts across your leads ({contacts?.length || 0} total)
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Error State */}
      {error && (
        <Card variant="outlined" padding="md">
          <CardContent className="text-center text-status-error">
            Failed to load contacts. Please try again.
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-white/5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredContacts?.length === 0 && (
        <div className="text-center py-12">
          <User className="h-16 w-16 mx-auto text-text-muted mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            {searchQuery ? "No contacts found" : "No contacts yet"}
          </h2>
          <p className="text-text-secondary">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Add contacts to your leads to see them here"}
          </p>
        </div>
      )}

      {/* Contacts List */}
      {!isLoading && sortedLetters.length > 0 && (
        <div className="space-y-6">
          {sortedLetters.map((letter) => (
            <div key={letter}>
              <h3 className="text-lg font-semibold text-text-primary mb-3 px-1">
                {letter}
              </h3>
              <div className="space-y-2">
                {groupedContacts?.[letter]?.map((contact) => (
                  <Card
                    key={contact.id}
                    variant="glass"
                    padding="sm"
                    className="hover:bg-white/10 transition-colors"
                  >
                    <CardContent className="pt-3">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                            contact.is_primary
                              ? "bg-gold/20 text-gold"
                              : "bg-white/10 text-text-secondary"
                          )}
                        >
                          {(contact.first_name ?? "?")[0]}
                          {(contact.last_name ?? "")[0]}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-text-primary">
                              {contact.first_name} {contact.last_name}
                            </p>
                            {contact.is_primary && (
                              <Badge variant="gold" size="sm">
                                <Star className="h-3 w-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                          </div>
                          {contact.title && (
                            <p className="text-sm text-text-secondary">
                              {contact.title}
                              {contact.department && ` - ${contact.department}`}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-1 hover:text-gold"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </a>
                            )}
                            {contact.phone && (
                              <a
                                href={`tel:${contact.phone}`}
                                className="flex items-center gap-1 hover:text-gold"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone className="h-3 w-3" />
                                {formatPhoneNumber(contact.phone)}
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Business Link */}
                        <Link
                          href={`/leads/${contact.business_id}`}
                          className="flex items-center gap-1 text-sm text-text-muted hover:text-gold"
                        >
                          <Building2 className="h-4 w-4" />
                          <span className="hidden sm:inline">View Lead</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
