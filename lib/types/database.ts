export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "manager" | "user";
export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost"
  | "do_not_contact";
export type LeadTemperature = "cold" | "warm" | "hot";
export type ActivityType =
  | "email_sent"
  | "email_received"
  | "email_opened"
  | "email_clicked"
  | "call_outbound"
  | "call_inbound"
  | "call_voicemail"
  | "sms_sent"
  | "sms_received"
  | "meeting_scheduled"
  | "meeting_completed"
  | "mailer_sent"
  | "social_dm"
  | "social_comment"
  | "landing_page_visit"
  | "landing_page_conversion"
  | "note"
  | "status_change"
  | "task_completed";
export type CampaignType =
  | "email"
  | "cold_call"
  | "mailer"
  | "social"
  | "multi_channel";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type LandingPageStatus = "draft" | "active" | "archived";
export type TouchpointType =
  | "website_visit"
  | "email_open"
  | "email_click"
  | "form_submit"
  | "call"
  | "meeting"
  | "social_interaction"
  | "ad_click";
export type AutomationTrigger =
  | "lead_created"
  | "lead_updated"
  | "status_changed"
  | "score_threshold"
  | "inactivity"
  | "date_based"
  | "form_submission";
export type AutomationAction =
  | "send_email"
  | "create_task"
  | "assign_user"
  | "update_status"
  | "update_score"
  | "add_to_campaign"
  | "send_webhook"
  | "add_tag";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          avatar_url: string | null;
          is_active: boolean;
          last_sign_in_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          is_active?: boolean;
          last_sign_in_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          is_active?: boolean;
          last_sign_in_at?: string | null;
          updated_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          business_name: string;
          business_type: string | null;
          industry_category: string | null;
          phone: string | null;
          email: string | null;
          website_url: string | null;
          has_website: boolean;
          street_address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          country: string;
          latitude: number | null;
          longitude: number | null;
          linkedin_url: string | null;
          facebook_url: string | null;
          instagram_url: string | null;
          twitter_url: string | null;
          youtube_url: string | null;
          tiktok_url: string | null;
          google_place_id: string | null;
          google_rating: number | null;
          google_review_count: number | null;
          google_maps_url: string | null;
          website_score: number | null;
          seo_score: number | null;
          speed_score: number | null;
          mobile_friendly: boolean | null;
          has_ssl: boolean | null;
          last_website_check: string | null;
          lead_score: number;
          lead_temperature: LeadTemperature;
          status: LeadStatus;
          assigned_to: string | null;
          source: string | null;
          scraped_at: string | null;
          tags: string[] | null;
          notes: string | null;
          custom_fields: Json;
          deal_value: number | null;
          expected_close_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          business_type?: string | null;
          industry_category?: string | null;
          phone?: string | null;
          email?: string | null;
          website_url?: string | null;
          has_website?: boolean;
          street_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          linkedin_url?: string | null;
          facebook_url?: string | null;
          instagram_url?: string | null;
          twitter_url?: string | null;
          youtube_url?: string | null;
          tiktok_url?: string | null;
          google_place_id?: string | null;
          google_rating?: number | null;
          google_review_count?: number | null;
          google_maps_url?: string | null;
          website_score?: number | null;
          seo_score?: number | null;
          speed_score?: number | null;
          mobile_friendly?: boolean | null;
          has_ssl?: boolean | null;
          last_website_check?: string | null;
          lead_score?: number;
          lead_temperature?: LeadTemperature;
          status?: LeadStatus;
          assigned_to?: string | null;
          source?: string | null;
          scraped_at?: string | null;
          tags?: string[] | null;
          notes?: string | null;
          custom_fields?: Json;
          deal_value?: number | null;
          expected_close_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          business_name?: string;
          business_type?: string | null;
          industry_category?: string | null;
          phone?: string | null;
          email?: string | null;
          website_url?: string | null;
          has_website?: boolean;
          street_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          linkedin_url?: string | null;
          facebook_url?: string | null;
          instagram_url?: string | null;
          twitter_url?: string | null;
          youtube_url?: string | null;
          tiktok_url?: string | null;
          google_place_id?: string | null;
          google_rating?: number | null;
          google_review_count?: number | null;
          google_maps_url?: string | null;
          website_score?: number | null;
          seo_score?: number | null;
          speed_score?: number | null;
          mobile_friendly?: boolean | null;
          has_ssl?: boolean | null;
          last_website_check?: string | null;
          lead_score?: number;
          lead_temperature?: LeadTemperature;
          status?: LeadStatus;
          assigned_to?: string | null;
          source?: string | null;
          scraped_at?: string | null;
          tags?: string[] | null;
          notes?: string | null;
          custom_fields?: Json;
          deal_value?: number | null;
          expected_close_date?: string | null;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          business_id: string;
          first_name: string | null;
          last_name: string | null;
          title: string | null;
          email: string | null;
          phone: string | null;
          linkedin_url: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          first_name?: string | null;
          last_name?: string | null;
          title?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          title?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          is_primary?: boolean;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          business_id: string;
          contact_id: string | null;
          user_id: string | null;
          activity_type: ActivityType;
          subject: string | null;
          description: string | null;
          outcome: string | null;
          scheduled_at: string | null;
          completed_at: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          contact_id?: string | null;
          user_id?: string | null;
          activity_type: ActivityType;
          subject?: string | null;
          description?: string | null;
          outcome?: string | null;
          scheduled_at?: string | null;
          completed_at?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          business_id?: string;
          contact_id?: string | null;
          user_id?: string | null;
          activity_type?: ActivityType;
          subject?: string | null;
          description?: string | null;
          outcome?: string | null;
          scheduled_at?: string | null;
          completed_at?: string | null;
          metadata?: Json;
        };
      };
      touchpoints: {
        Row: {
          id: string;
          business_id: string;
          contact_id: string | null;
          type: TouchpointType;
          source: string | null;
          campaign_id: string | null;
          landing_page_id: string | null;
          metadata: Json;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          contact_id?: string | null;
          type: TouchpointType;
          source?: string | null;
          campaign_id?: string | null;
          landing_page_id?: string | null;
          metadata?: Json;
          occurred_at?: string;
          created_at?: string;
        };
        Update: {
          business_id?: string;
          contact_id?: string | null;
          type?: TouchpointType;
          source?: string | null;
          campaign_id?: string | null;
          landing_page_id?: string | null;
          metadata?: Json;
          occurred_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          campaign_type: CampaignType | null;
          status: CampaignStatus;
          target_criteria: Json | null;
          budget: number | null;
          started_at: string | null;
          ended_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          campaign_type?: CampaignType | null;
          status?: CampaignStatus;
          target_criteria?: Json | null;
          budget?: number | null;
          started_at?: string | null;
          ended_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          campaign_type?: CampaignType | null;
          status?: CampaignStatus;
          target_criteria?: Json | null;
          budget?: number | null;
          started_at?: string | null;
          ended_at?: string | null;
          updated_at?: string;
        };
      };
      landing_pages: {
        Row: {
          id: string;
          business_id: string | null;
          campaign_id: string | null;
          page_name: string | null;
          slug: string;
          template_used: string | null;
          url: string | null;
          status: LandingPageStatus;
          visit_count: number;
          conversion_count: number;
          generated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          campaign_id?: string | null;
          page_name?: string | null;
          slug: string;
          template_used?: string | null;
          url?: string | null;
          status?: LandingPageStatus;
          visit_count?: number;
          conversion_count?: number;
          generated_at?: string;
          created_at?: string;
        };
        Update: {
          business_id?: string | null;
          campaign_id?: string | null;
          page_name?: string | null;
          slug?: string;
          template_used?: string | null;
          url?: string | null;
          status?: LandingPageStatus;
          visit_count?: number;
          conversion_count?: number;
        };
      };
      analytics_snapshots: {
        Row: {
          id: string;
          snapshot_date: string;
          total_leads: number | null;
          new_leads: number | null;
          contacted_leads: number | null;
          converted_leads: number | null;
          emails_sent: number | null;
          emails_opened: number | null;
          calls_made: number | null;
          meetings_booked: number | null;
          revenue_pipeline: number | null;
          revenue_closed: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          snapshot_date: string;
          total_leads?: number | null;
          new_leads?: number | null;
          contacted_leads?: number | null;
          converted_leads?: number | null;
          emails_sent?: number | null;
          emails_opened?: number | null;
          calls_made?: number | null;
          meetings_booked?: number | null;
          revenue_pipeline?: number | null;
          revenue_closed?: number | null;
          created_at?: string;
        };
        Update: {
          snapshot_date?: string;
          total_leads?: number | null;
          new_leads?: number | null;
          contacted_leads?: number | null;
          converted_leads?: number | null;
          emails_sent?: number | null;
          emails_opened?: number | null;
          calls_made?: number | null;
          meetings_booked?: number | null;
          revenue_pipeline?: number | null;
          revenue_closed?: number | null;
        };
      };
      automation_rules: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          trigger_type: AutomationTrigger;
          trigger_config: Json;
          action_type: AutomationAction;
          action_config: Json;
          is_active: boolean;
          priority: number;
          last_triggered_at: string | null;
          trigger_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          trigger_type: AutomationTrigger;
          trigger_config?: Json;
          action_type: AutomationAction;
          action_config?: Json;
          is_active?: boolean;
          priority?: number;
          last_triggered_at?: string | null;
          trigger_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          trigger_type?: AutomationTrigger;
          trigger_config?: Json;
          action_type?: AutomationAction;
          action_config?: Json;
          is_active?: boolean;
          priority?: number;
          last_triggered_at?: string | null;
          trigger_count?: number;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          report_type: string;
          filters: Json;
          columns: Json;
          grouping: Json | null;
          schedule: string | null;
          recipients: string[] | null;
          last_generated_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          report_type: string;
          filters?: Json;
          columns?: Json;
          grouping?: Json | null;
          schedule?: string | null;
          recipients?: string[] | null;
          last_generated_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          report_type?: string;
          filters?: Json;
          columns?: Json;
          grouping?: Json | null;
          schedule?: string | null;
          recipients?: string[] | null;
          last_generated_at?: string | null;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
      webhook_configs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          type: "inbound" | "outbound";
          url: string | null;
          secret: string | null;
          events: string[];
          headers: Json;
          is_active: boolean;
          retry_count: number;
          retry_delay: number;
          ip_allowlist: string[] | null;
          last_triggered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          type: "inbound" | "outbound";
          url?: string | null;
          secret?: string | null;
          events?: string[];
          headers?: Json;
          is_active?: boolean;
          retry_count?: number;
          retry_delay?: number;
          ip_allowlist?: string[] | null;
          last_triggered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          type?: "inbound" | "outbound";
          url?: string | null;
          secret?: string | null;
          events?: string[];
          headers?: Json;
          is_active?: boolean;
          retry_count?: number;
          retry_delay?: number;
          ip_allowlist?: string[] | null;
          last_triggered_at?: string | null;
          updated_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          scopes: string[];
          last_used_at: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          scopes?: string[];
          last_used_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          key_hash?: string;
          key_prefix?: string;
          scopes?: string[];
          last_used_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
        };
      };
      system_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          category: string;
          is_public: boolean;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          category?: string;
          is_public?: boolean;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          category?: string;
          is_public?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      lead_status: LeadStatus;
      lead_temperature: LeadTemperature;
      activity_type: ActivityType;
      campaign_type: CampaignType;
      campaign_status: CampaignStatus;
      landing_page_status: LandingPageStatus;
      touchpoint_type: TouchpointType;
      automation_trigger: AutomationTrigger;
      automation_action: AutomationAction;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience types
export type Profile = Tables<"profiles">;
export type Business = Tables<"businesses">;
export type Contact = Tables<"contacts">;
export type Activity = Tables<"activities">;
export type Touchpoint = Tables<"touchpoints">;
export type Campaign = Tables<"campaigns">;
export type LandingPage = Tables<"landing_pages">;
export type AnalyticsSnapshot = Tables<"analytics_snapshots">;
export type AutomationRule = Tables<"automation_rules">;
export type Report = Tables<"reports">;
