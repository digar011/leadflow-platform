-- Migration: 20260301000003_add_search_indexes
-- Description: Add database indexes for frequently searched/filtered columns on businesses table
-- Purpose: Optimize ILIKE search queries, status filtering, and user-scoped dashboard queries
-- Created: 2026-03-01

-- Enable pg_trgm extension for trigram-based indexes (required for gin_trgm_ops)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexes for ILIKE search queries on businesses table
-- These support the search bar in leads list, export, and duplicate checking
CREATE INDEX IF NOT EXISTS idx_businesses_business_name ON businesses USING gin (business_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_businesses_email ON businesses USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses USING gin (city gin_trgm_ops);

-- Index for status filtering (exact match, very common in dashboard stats and kanban)
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses (status);

-- Index for assigned_to filtering (user-scoped queries via RLS)
CREATE INDEX IF NOT EXISTS idx_businesses_assigned_to ON businesses (assigned_to);

-- Composite index for common dashboard queries (user + status filtering)
CREATE INDEX IF NOT EXISTS idx_businesses_user_status ON businesses (assigned_to, status);

-- Index for created_at range queries (new leads this week, date filtering)
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses (created_at);

-- Contacts table: business_id already indexed in 0003_contacts.sql (idx_contacts_business)
-- Contacts search is done client-side, so no additional ILIKE indexes needed
