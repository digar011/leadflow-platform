export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string
          business_id: string
          completed_at: string | null
          contact_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          metadata: Json | null
          outcome: string | null
          scheduled_at: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          business_id: string
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          metadata?: Json | null
          outcome?: string | null
          scheduled_at?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          business_id?: string
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          metadata?: Json | null
          outcome?: string | null
          scheduled_at?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      analytics_snapshots: {
        Row: {
          avg_deal_size: number | null
          avg_time_to_convert: number | null
          avg_touchpoints_to_convert: number | null
          calls_answered: number | null
          calls_made: number | null
          contacted_leads: number | null
          conversion_rate: number | null
          converted_leads: number | null
          created_at: string | null
          emails_clicked: number | null
          emails_opened: number | null
          emails_sent: number | null
          id: string
          leads_by_source: Json | null
          leads_by_status: Json | null
          leads_by_temperature: Json | null
          lost_leads: number | null
          meetings_booked: number | null
          meetings_completed: number | null
          new_leads: number | null
          qualified_leads: number | null
          revenue_closed: number | null
          revenue_pipeline: number | null
          snapshot_date: string
          team_metrics: Json | null
          total_leads: number | null
        }
        Insert: {
          avg_deal_size?: number | null
          avg_time_to_convert?: number | null
          avg_touchpoints_to_convert?: number | null
          calls_answered?: number | null
          calls_made?: number | null
          contacted_leads?: number | null
          conversion_rate?: number | null
          converted_leads?: number | null
          created_at?: string | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          leads_by_source?: Json | null
          leads_by_status?: Json | null
          leads_by_temperature?: Json | null
          lost_leads?: number | null
          meetings_booked?: number | null
          meetings_completed?: number | null
          new_leads?: number | null
          qualified_leads?: number | null
          revenue_closed?: number | null
          revenue_pipeline?: number | null
          snapshot_date: string
          team_metrics?: Json | null
          total_leads?: number | null
        }
        Update: {
          avg_deal_size?: number | null
          avg_time_to_convert?: number | null
          avg_touchpoints_to_convert?: number | null
          calls_answered?: number | null
          calls_made?: number | null
          contacted_leads?: number | null
          conversion_rate?: number | null
          converted_leads?: number | null
          created_at?: string | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          leads_by_source?: Json | null
          leads_by_status?: Json | null
          leads_by_temperature?: Json | null
          lost_leads?: number | null
          meetings_booked?: number | null
          meetings_completed?: number | null
          new_leads?: number | null
          qualified_leads?: number | null
          revenue_closed?: number | null
          revenue_pipeline?: number | null
          snapshot_date?: string
          team_metrics?: Json | null
          total_leads?: number | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          external_key: string | null
          id: string
          integration_type: string | null
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          scopes: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          external_key?: string | null
          id?: string
          integration_type?: string | null
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          scopes?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          external_key?: string | null
          id?: string
          integration_type?: string | null
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          scopes?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          email: string
          experience: string | null
          id: string
          linkedin: string | null
          name: string
          portfolio: string | null
          resume_url: string | null
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          email: string
          experience?: string | null
          id?: string
          linkedin?: string | null
          name: string
          portfolio?: string | null
          resume_url?: string | null
          role: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          email?: string
          experience?: string | null
          id?: string
          linkedin?: string | null
          name?: string
          portfolio?: string | null
          resume_url?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          action_result: Json | null
          business_id: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          rule_id: string
          started_at: string | null
          status: string
          trigger_data: Json | null
        }
        Insert: {
          action_result?: Json | null
          business_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          rule_id: string
          started_at?: string | null
          status: string
          trigger_data?: Json | null
        }
        Update: {
          action_result?: Json | null
          business_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          rule_id?: string
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json | null
          action_type: string
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          priority: number | null
          success_count: number | null
          trigger_config: Json | null
          trigger_count: number | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          priority?: number | null
          success_count?: number | null
          trigger_config?: Json | null
          trigger_count?: number | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          priority?: number | null
          success_count?: number | null
          trigger_config?: Json | null
          trigger_count?: number | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          assigned_to: string | null
          business_name: string
          business_type: string | null
          city: string | null
          country: string | null
          created_at: string | null
          custom_fields: Json | null
          deal_value: number | null
          email: string | null
          expected_close_date: string | null
          facebook_url: string | null
          google_maps_url: string | null
          google_place_id: string | null
          google_rating: number | null
          google_review_count: number | null
          has_ssl: boolean | null
          has_website: boolean | null
          id: string
          industry_category: string | null
          instagram_url: string | null
          last_website_check: string | null
          latitude: number | null
          lead_score: number | null
          lead_temperature: string | null
          linkedin_url: string | null
          longitude: number | null
          mobile_friendly: boolean | null
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          scraped_at: string | null
          seo_score: number | null
          source: string | null
          speed_score: number | null
          state: string | null
          status: string | null
          street_address: string | null
          tags: string[] | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string | null
          website_score: number | null
          website_url: string | null
          youtube_url: string | null
          zip_code: string | null
        }
        Insert: {
          assigned_to?: string | null
          business_name: string
          business_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deal_value?: number | null
          email?: string | null
          expected_close_date?: string | null
          facebook_url?: string | null
          google_maps_url?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          has_ssl?: boolean | null
          has_website?: boolean | null
          id?: string
          industry_category?: string | null
          instagram_url?: string | null
          last_website_check?: string | null
          latitude?: number | null
          lead_score?: number | null
          lead_temperature?: string | null
          linkedin_url?: string | null
          longitude?: number | null
          mobile_friendly?: boolean | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          scraped_at?: string | null
          seo_score?: number | null
          source?: string | null
          speed_score?: number | null
          state?: string | null
          status?: string | null
          street_address?: string | null
          tags?: string[] | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website_score?: number | null
          website_url?: string | null
          youtube_url?: string | null
          zip_code?: string | null
        }
        Update: {
          assigned_to?: string | null
          business_name?: string
          business_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deal_value?: number | null
          email?: string | null
          expected_close_date?: string | null
          facebook_url?: string | null
          google_maps_url?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          has_ssl?: boolean | null
          has_website?: boolean | null
          id?: string
          industry_category?: string | null
          instagram_url?: string | null
          last_website_check?: string | null
          latitude?: number | null
          lead_score?: number | null
          lead_temperature?: string | null
          linkedin_url?: string | null
          longitude?: number | null
          mobile_friendly?: boolean | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          scraped_at?: string | null
          seo_score?: number | null
          source?: string | null
          speed_score?: number | null
          state?: string | null
          status?: string | null
          street_address?: string | null
          tags?: string[] | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website_score?: number | null
          website_url?: string | null
          youtube_url?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_members: {
        Row: {
          business_id: string
          campaign_id: string
          clicked_at: string | null
          converted_at: string | null
          created_at: string | null
          id: string
          opened_at: string | null
          responded_at: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          business_id: string
          campaign_id: string
          clicked_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          opened_at?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          business_id?: string
          campaign_id?: string
          clicked_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          opened_at?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_members_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: number | null
          campaign_type: string | null
          click_rate: number | null
          conversions: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          ended_at: string | null
          goal_type: string | null
          goal_value: number | null
          id: string
          leads_generated: number | null
          name: string
          open_rate: number | null
          response_rate: number | null
          revenue_generated: number | null
          spent: number | null
          started_at: string | null
          status: string | null
          target_count: number | null
          target_criteria: Json | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          campaign_type?: string | null
          click_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          goal_type?: string | null
          goal_value?: number | null
          id?: string
          leads_generated?: number | null
          name: string
          open_rate?: number | null
          response_rate?: number | null
          revenue_generated?: number | null
          spent?: number | null
          started_at?: string | null
          status?: string | null
          target_count?: number | null
          target_criteria?: Json | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          campaign_type?: string | null
          click_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          goal_type?: string | null
          goal_value?: number | null
          id?: string
          leads_generated?: number | null
          name?: string
          open_rate?: number | null
          response_rate?: number | null
          revenue_generated?: number | null
          spent?: number | null
          started_at?: string | null
          status?: string | null
          target_count?: number | null
          target_criteria?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      captured_emails: {
        Row: {
          activity_id: string | null
          body_snippet: string | null
          business_id: string | null
          cc_addresses: string[] | null
          created_at: string
          direction: string
          from_address: string
          id: string
          matched: boolean
          message_id: string | null
          received_at: string
          subject: string | null
          to_addresses: string[]
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          body_snippet?: string | null
          business_id?: string | null
          cc_addresses?: string[] | null
          created_at?: string
          direction: string
          from_address: string
          id?: string
          matched?: boolean
          message_id?: string | null
          received_at?: string
          subject?: string | null
          to_addresses?: string[]
          user_id: string
        }
        Update: {
          activity_id?: string | null
          body_snippet?: string | null
          business_id?: string | null
          cc_addresses?: string[] | null
          created_at?: string
          direction?: string
          from_address?: string
          id?: string
          matched?: boolean
          message_id?: string | null
          received_at?: string
          subject?: string | null
          to_addresses?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "captured_emails_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "captured_emails_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          business_id: string
          created_at: string | null
          department: string | null
          email: string | null
          first_name: string | null
          id: string
          is_primary: boolean | null
          last_name: string | null
          linkedin_url: string | null
          mobile_phone: string | null
          notes: string | null
          phone: string | null
          relationship_type: string | null
          title: string | null
          twitter_url: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_primary?: boolean | null
          last_name?: string | null
          linkedin_url?: string | null
          mobile_phone?: string | null
          notes?: string | null
          phone?: string | null
          relationship_type?: string | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_primary?: boolean | null
          last_name?: string | null
          linkedin_url?: string | null
          mobile_phone?: string | null
          notes?: string | null
          phone?: string | null
          relationship_type?: string | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts_website_legacy: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_outreach: {
        Row: {
          business_name: string
          created_at: string | null
          date_sent: string | null
          email: string | null
          email_subject: string | null
          follow_up_1_due: string | null
          follow_up_1_sent: string | null
          follow_up_1_sent_date: string | null
          follow_up_2_due: string | null
          follow_up_2_sent: string | null
          follow_up_2_sent_date: string | null
          id: number
          landing_page_url: string | null
          notes: string | null
          place_id: string | null
          response_date: string | null
          response_status: string | null
          status: string | null
          theme: string | null
          time_sent: string | null
          updated_at: string | null
        }
        Insert: {
          business_name: string
          created_at?: string | null
          date_sent?: string | null
          email?: string | null
          email_subject?: string | null
          follow_up_1_due?: string | null
          follow_up_1_sent?: string | null
          follow_up_1_sent_date?: string | null
          follow_up_2_due?: string | null
          follow_up_2_sent?: string | null
          follow_up_2_sent_date?: string | null
          id?: number
          landing_page_url?: string | null
          notes?: string | null
          place_id?: string | null
          response_date?: string | null
          response_status?: string | null
          status?: string | null
          theme?: string | null
          time_sent?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string
          created_at?: string | null
          date_sent?: string | null
          email?: string | null
          email_subject?: string | null
          follow_up_1_due?: string | null
          follow_up_1_sent?: string | null
          follow_up_1_sent_date?: string | null
          follow_up_2_due?: string | null
          follow_up_2_sent?: string | null
          follow_up_2_sent_date?: string | null
          id?: number
          landing_page_url?: string | null
          notes?: string | null
          place_id?: string | null
          response_date?: string | null
          response_status?: string | null
          status?: string | null
          theme?: string | null
          time_sent?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          avg_time_on_page: number | null
          bounce_rate: number | null
          business_id: string | null
          campaign_id: string | null
          content: Json | null
          conversion_count: number | null
          conversion_rate: number | null
          created_at: string | null
          generated_at: string | null
          id: string
          page_name: string | null
          slug: string
          status: string | null
          template_used: string | null
          unique_visitors: number | null
          updated_at: string | null
          url: string | null
          visit_count: number | null
        }
        Insert: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          business_id?: string | null
          campaign_id?: string | null
          content?: Json | null
          conversion_count?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          page_name?: string | null
          slug: string
          status?: string | null
          template_used?: string | null
          unique_visitors?: number | null
          updated_at?: string | null
          url?: string | null
          visit_count?: number | null
        }
        Update: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          business_id?: string | null
          campaign_id?: string | null
          content?: Json | null
          conversion_count?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          page_name?: string | null
          slug?: string
          status?: string | null
          template_used?: string | null
          unique_visitors?: number | null
          updated_at?: string | null
          url?: string | null
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_pages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages_website_legacy: {
        Row: {
          address: string | null
          business_name: string
          created_at: string | null
          date_generated: string | null
          id: number
          landing_page_url: string | null
          phone: string | null
          slug: string | null
          theme: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          created_at?: string | null
          date_generated?: string | null
          id?: number
          landing_page_url?: string | null
          phone?: string | null
          slug?: string | null
          theme?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          created_at?: string | null
          date_generated?: string | null
          id?: number
          landing_page_url?: string | null
          phone?: string | null
          slug?: string | null
          theme?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_period_end: string | null
          email: string
          email_forwarding_address: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_sign_in_at: string | null
          permissions: Json | null
          role: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_billing_cycle: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_period_end?: string | null
          email: string
          email_forwarding_address?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_sign_in_at?: string | null
          permissions?: Json | null
          role?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_billing_cycle?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_period_end?: string | null
          email?: string
          email_forwarding_address?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_sign_in_at?: string | null
          permissions?: Json | null
          role?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_billing_cycle?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      qualified_leads: {
        Row: {
          address: string | null
          business_name: string
          business_types: string | null
          created_at: string | null
          date_qualified: string | null
          email_sent_date: string | null
          id: number
          landing_page_generated: string | null
          landing_page_url: string | null
          outreach_status: string | null
          phone: string | null
          place_id: string | null
          qualified_reason: string | null
          rating: string | null
          total_reviews: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          business_types?: string | null
          created_at?: string | null
          date_qualified?: string | null
          email_sent_date?: string | null
          id?: number
          landing_page_generated?: string | null
          landing_page_url?: string | null
          outreach_status?: string | null
          phone?: string | null
          place_id?: string | null
          qualified_reason?: string | null
          rating?: string | null
          total_reviews?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          business_types?: string | null
          created_at?: string | null
          date_qualified?: string | null
          email_sent_date?: string | null
          id?: number
          landing_page_generated?: string | null
          landing_page_url?: string | null
          outreach_status?: string | null
          phone?: string | null
          place_id?: string | null
          qualified_reason?: string | null
          rating?: string | null
          total_reviews?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      raw_leads: {
        Row: {
          address: string | null
          business_name: string
          business_types: string | null
          created_at: string | null
          date_found: string | null
          emails_found: string | null
          id: number
          phone: string | null
          place_id: string | null
          rating: string | null
          status: string | null
          total_reviews: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          business_types?: string | null
          created_at?: string | null
          date_found?: string | null
          emails_found?: string | null
          id?: number
          phone?: string | null
          place_id?: string | null
          rating?: string | null
          status?: string | null
          total_reviews?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          business_types?: string | null
          created_at?: string | null
          date_found?: string | null
          emails_found?: string | null
          id?: number
          phone?: string | null
          place_id?: string | null
          rating?: string | null
          status?: string | null
          total_reviews?: string | null
          website?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          chart_type: string | null
          columns: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          filters: Json | null
          grouping: Json | null
          id: string
          is_public: boolean | null
          last_generated_at: string | null
          name: string
          next_scheduled_at: string | null
          recipients: string[] | null
          report_type: string
          schedule: string | null
          schedule_day: number | null
          schedule_time: string | null
          share_expires_at: string | null
          share_token: string | null
          sorting: Json | null
          updated_at: string | null
        }
        Insert: {
          chart_type?: string | null
          columns?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          grouping?: Json | null
          id?: string
          is_public?: boolean | null
          last_generated_at?: string | null
          name: string
          next_scheduled_at?: string | null
          recipients?: string[] | null
          report_type: string
          schedule?: string | null
          schedule_day?: number | null
          schedule_time?: string | null
          share_expires_at?: string | null
          share_token?: string | null
          sorting?: Json | null
          updated_at?: string | null
        }
        Update: {
          chart_type?: string | null
          columns?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          grouping?: Json | null
          id?: string
          is_public?: boolean | null
          last_generated_at?: string | null
          name?: string
          next_scheduled_at?: string | null
          recipients?: string[] | null
          report_type?: string
          schedule?: string | null
          schedule_day?: number | null
          schedule_time?: string | null
          share_expires_at?: string | null
          share_token?: string | null
          sorting?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_tasks: {
        Row: {
          attempts: number | null
          business_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_attempts: number | null
          rule_id: string | null
          scheduled_for: string
          status: string | null
          task_config: Json | null
          task_type: string
        }
        Insert: {
          attempts?: number | null
          business_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          rule_id?: string | null
          scheduled_for: string
          status?: string | null
          task_config?: Json | null
          task_type: string
        }
        Update: {
          attempts?: number | null
          business_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          rule_id?: string | null
          scheduled_for?: string
          status?: string | null
          task_config?: Json | null
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_tasks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_tasks_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          created_at: string | null
          id: string
          is_admin_reply: boolean | null
          message: string
          sender_id: string | null
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_admin_reply?: boolean | null
          message: string
          sender_id?: string | null
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin_reply?: boolean | null
          message?: string
          sender_id?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      touchpoints: {
        Row: {
          business_id: string
          campaign_id: string | null
          contact_id: string | null
          created_at: string | null
          device_type: string | null
          engagement_score: number | null
          id: string
          ip_address: string | null
          landing_page_id: string | null
          metadata: Json | null
          occurred_at: string | null
          page_url: string | null
          referrer_url: string | null
          source: string | null
          time_on_page: number | null
          type: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          business_id: string
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          device_type?: string | null
          engagement_score?: number | null
          id?: string
          ip_address?: string | null
          landing_page_id?: string | null
          metadata?: Json | null
          occurred_at?: string | null
          page_url?: string | null
          referrer_url?: string | null
          source?: string | null
          time_on_page?: number | null
          type: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          business_id?: string
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          device_type?: string | null
          engagement_score?: number | null
          id?: string
          ip_address?: string | null
          landing_page_id?: string | null
          metadata?: Json | null
          occurred_at?: string | null
          page_url?: string | null
          referrer_url?: string | null
          source?: string | null
          time_on_page?: number | null
          type?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "touchpoints_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "touchpoints_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configs: {
        Row: {
          created_at: string | null
          description: string | null
          events: string[] | null
          headers: Json | null
          id: string
          ip_allowlist: string[] | null
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          retry_count: number | null
          retry_delay: number | null
          secret: string | null
          type: string
          updated_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          events?: string[] | null
          headers?: Json | null
          id?: string
          ip_allowlist?: string[] | null
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          retry_count?: number | null
          retry_delay?: number | null
          secret?: string | null
          type: string
          updated_at?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          events?: string[] | null
          headers?: Json | null
          id?: string
          ip_allowlist?: string[] | null
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          retry_count?: number | null
          retry_delay?: number | null
          secret?: string | null
          type?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempt_number: number | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string | null
          webhook_id: string
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          status?: string | null
          webhook_id: string
        }
        Update: {
          attempt_number?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhook_configs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_audit_log: {
        Args: {
          p_action: string
          p_ip_address?: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
          p_resource_id?: string
          p_resource_type: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      generate_share_token: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ============================================================
// Custom type aliases used throughout the codebase
// ============================================================

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

export type PermissionKey =
  | "leads.view"
  | "leads.create"
  | "leads.edit"
  | "leads.delete"
  | "contacts.view"
  | "contacts.create"
  | "contacts.edit"
  | "contacts.delete"
  | "activities.view"
  | "activities.create"
  | "campaigns.view"
  | "campaigns.create"
  | "campaigns.edit"
  | "campaigns.delete"
  | "reports.view"
  | "reports.create"
  | "automation.view"
  | "automation.create"
  | "automation.edit"
  | "automation.delete"
  | "settings.view"
  | "settings.edit";

export type UserPermissions = Partial<Record<PermissionKey, boolean>>;

export type SubscriptionTier = "free" | "starter" | "growth" | "business" | "enterprise";
export type BillingCycle = "monthly" | "annual";

// Backward-compatible aliases (codebase uses InsertTables/UpdateTables)
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
export type CapturedEmail = Tables<"captured_emails">;
export type SupportTicket = Tables<"support_tickets">;
