export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface NotificationPreferences {
  email_anomaly: boolean
  email_digest: boolean
  email_product_updates: boolean
  email_billing: boolean
  whatsapp_alerts: boolean
  whatsapp_digest: boolean
  whatsapp_product_updates: boolean
}

export type BillingEventType =
  | 'subscription.charged'
  | 'subscription.cancelled'
  | 'payment.failed'
  | 'plan.upgraded'
  | 'plan.downgraded'
  | 'plan.override'

export type InsightType = 'daily_summary' | 'weekly_review' | 'campaign_spotlight'
export type InsightSentiment = 'positive' | 'neutral' | 'warning' | 'critical'
export type NotificationType = 'issue_alert' | 'sync_complete' | 'payment' | 'feature_update' | 'ai_insight'
export type AdminRole = 'super_admin' | 'admin' | 'support'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          country: string | null
          plan: 'free' | 'basic' | 'growth' | 'professional' | 'agency' | 'custom'
          plan_expires_at: string | null
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          razorpay_ai_subscription_id: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          has_ai_addon: boolean
          phone_number: string | null
          whatsapp_opted_in: boolean
          notification_preferences: NotificationPreferences
          last_active_at: string | null
          onboarding_completed: boolean
          industry: string | null
          total_ad_spend_inr: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          country?: string | null
          plan?: 'free' | 'basic' | 'growth' | 'professional' | 'agency' | 'custom'
          plan_expires_at?: string | null
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          razorpay_ai_subscription_id?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          has_ai_addon?: boolean
          phone_number?: string | null
          whatsapp_opted_in?: boolean
          notification_preferences?: NotificationPreferences
          last_active_at?: string | null
          onboarding_completed?: boolean
          industry?: string | null
          total_ad_spend_inr?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          country?: string | null
          plan?: 'free' | 'basic' | 'growth' | 'professional' | 'agency' | 'custom'
          plan_expires_at?: string | null
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          razorpay_ai_subscription_id?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          has_ai_addon?: boolean
          phone_number?: string | null
          whatsapp_opted_in?: boolean
          notification_preferences?: NotificationPreferences
          last_active_at?: string | null
          onboarding_completed?: boolean
          industry?: string | null
          total_ad_spend_inr?: number
          updated_at?: string
        }
        Relationships: []
      }
      ad_accounts: {
        Row: {
          id: string
          user_id: string
          platform: 'meta' | 'google' | 'amazon'
          account_id: string
          account_name: string | null
          access_token: string
          refresh_token: string | null
          token_expires_at: string | null
          status: 'active' | 'expired' | 'disconnected'
          last_synced_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'meta' | 'google' | 'amazon'
          account_id: string
          account_name?: string | null
          access_token: string
          refresh_token?: string | null
          token_expires_at?: string | null
          status?: 'active' | 'expired' | 'disconnected'
          last_synced_at?: string | null
          created_at?: string
        }
        Update: {
          account_name?: string | null
          access_token?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          status?: 'active' | 'expired' | 'disconnected'
          last_synced_at?: string | null
        }
        Relationships: []
      }
      campaign_metrics: {
        Row: {
          id: string
          ad_account_id: string
          platform: string
          campaign_id: string
          campaign_name: string | null
          status: string | null
          date: string
          spend: number
          revenue: number
          impressions: number
          clicks: number
          conversions: number
          ctr: number
          cpc: number
          roas: number
          cpm: number
          meta_data: Json
          google_data: Json
          amazon_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          ad_account_id: string
          platform: string
          campaign_id: string
          campaign_name?: string | null
          status?: string | null
          date: string
          spend?: number
          revenue?: number
          impressions?: number
          clicks?: number
          conversions?: number
          ctr?: number
          cpc?: number
          roas?: number
          cpm?: number
          meta_data?: Json
          google_data?: Json
          amazon_data?: Json
          created_at?: string
        }
        Update: {
          campaign_name?: string | null
          status?: string | null
          spend?: number
          revenue?: number
          impressions?: number
          clicks?: number
          conversions?: number
          ctr?: number
          cpc?: number
          roas?: number
          cpm?: number
          meta_data?: Json
          google_data?: Json
          amazon_data?: Json
        }
        Relationships: []
      }
      diagnostic_issues: {
        Row: {
          id: string
          ad_account_id: string
          user_id: string
          platform: string
          issue_type: string
          severity: 'critical' | 'high' | 'medium' | 'low'
          title: string
          description: string | null
          affected_entity_type: string | null
          affected_entity_id: string | null
          affected_entity_name: string | null
          estimated_impact_inr: number | null
          status: 'open' | 'dismissed' | 'fixed'
          detected_at: string
          resolved_at: string | null
          raw_data: Json
        }
        Insert: {
          id?: string
          ad_account_id: string
          user_id: string
          platform: string
          issue_type: string
          severity: 'critical' | 'high' | 'medium' | 'low'
          title: string
          description?: string | null
          affected_entity_type?: string | null
          affected_entity_id?: string | null
          affected_entity_name?: string | null
          estimated_impact_inr?: number | null
          status?: 'open' | 'dismissed' | 'fixed'
          detected_at?: string
          resolved_at?: string | null
          raw_data?: Json
        }
        Update: {
          severity?: 'critical' | 'high' | 'medium' | 'low'
          title?: string
          description?: string | null
          estimated_impact_inr?: number | null
          status?: 'open' | 'dismissed' | 'fixed'
          resolved_at?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          id: string
          diagnostic_issue_id: string
          user_id: string
          title: string
          explanation: string
          action_steps: Json
          estimated_impact: string | null
          effort_level: 'quick_win' | 'medium' | 'complex' | null
          time_to_implement: string | null
          status: 'pending' | 'applied' | 'dismissed'
          created_at: string
        }
        Insert: {
          id?: string
          diagnostic_issue_id: string
          user_id: string
          title: string
          explanation: string
          action_steps: Json
          estimated_impact?: string | null
          effort_level?: 'quick_win' | 'medium' | 'complex' | null
          time_to_implement?: string | null
          status?: 'pending' | 'applied' | 'dismissed'
          created_at?: string
        }
        Update: {
          title?: string
          explanation?: string
          action_steps?: Json
          estimated_impact?: string | null
          effort_level?: 'quick_win' | 'medium' | 'complex' | null
          time_to_implement?: string | null
          status?: 'pending' | 'applied' | 'dismissed'
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          id: string
          ad_account_id: string
          sync_type: 'scheduled' | 'manual' | 'initial'
          status: 'running' | 'completed' | 'failed'
          campaigns_synced: number
          issues_found: number
          error_message: string | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          ad_account_id: string
          sync_type: 'scheduled' | 'manual' | 'initial'
          status: 'running' | 'completed' | 'failed'
          campaigns_synced?: number
          issues_found?: number
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          status?: 'running' | 'completed' | 'failed'
          campaigns_synced?: number
          issues_found?: number
          error_message?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      billing_events: {
        Row: {
          id: string
          user_id: string
          event_type: BillingEventType
          plan: string | null
          amount_inr: number | null
          razorpay_subscription_id: string | null
          razorpay_payment_id: string | null
          period_start: string | null
          period_end: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: BillingEventType
          plan?: string | null
          amount_inr?: number | null
          razorpay_subscription_id?: string | null
          razorpay_payment_id?: string | null
          period_start?: string | null
          period_end?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          event_type?: BillingEventType
          plan?: string | null
          amount_inr?: number | null
          metadata?: Json
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          role: AdminRole
          created_at: string
        }
        Insert: {
          id: string
          role?: AdminRole
          created_at?: string
        }
        Update: {
          role?: AdminRole
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          id: string
          user_id: string
          insight_type: InsightType
          content: string
          model: string
          tokens_used: number | null
          sentiment: InsightSentiment | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          insight_type?: InsightType
          content: string
          model?: string
          tokens_used?: number | null
          sentiment?: InsightSentiment | null
          date: string
          created_at?: string
        }
        Update: {
          content?: string
          model?: string
          tokens_used?: number | null
          sentiment?: InsightSentiment | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          body: string | null
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          body?: string | null
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          read?: boolean
          body?: string | null
          link?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          cover_image_url: string | null
          author_name: string
          author_avatar_url: string | null
          category: string | null
          tags: string[]
          status: 'draft' | 'published' | 'scheduled'
          published_at: string | null
          reading_time_minutes: number
          featured: boolean
          view_count: number
          seo_title: string | null
          seo_description: string | null
          focus_keyword: string | null
          seo_keywords: string | null
          og_title: string | null
          og_description: string | null
          og_image_url: string | null
          canonical_url: string | null
          robots_directive: string
          schema_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          cover_image_url?: string | null
          author_name?: string
          author_avatar_url?: string | null
          category?: string | null
          tags?: string[]
          status?: 'draft' | 'published' | 'scheduled'
          published_at?: string | null
          reading_time_minutes?: number
          featured?: boolean
          view_count?: number
          seo_title?: string | null
          seo_description?: string | null
          focus_keyword?: string | null
          seo_keywords?: string | null
          og_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          canonical_url?: string | null
          robots_directive?: string
          schema_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string | null
          cover_image_url?: string | null
          author_name?: string
          author_avatar_url?: string | null
          category?: string | null
          tags?: string[]
          status?: 'draft' | 'published' | 'scheduled'
          published_at?: string | null
          reading_time_minutes?: number
          featured?: boolean
          view_count?: number
          seo_title?: string | null
          seo_description?: string | null
          focus_keyword?: string | null
          seo_keywords?: string | null
          og_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          canonical_url?: string | null
          robots_directive?: string
          schema_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          id: string
          page_path: string
          page_name: string
          section: string | null
          meta_title: string | null
          meta_description: string | null
          focus_keyword: string | null
          og_title: string | null
          og_description: string | null
          og_image_url: string | null
          canonical_url: string | null
          robots_directive: string
          schema_json: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          page_path: string
          page_name: string
          section?: string | null
          meta_title?: string | null
          meta_description?: string | null
          focus_keyword?: string | null
          og_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          canonical_url?: string | null
          robots_directive?: string
          schema_json?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          page_path?: string
          page_name?: string
          section?: string | null
          meta_title?: string | null
          meta_description?: string | null
          focus_keyword?: string | null
          og_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          canonical_url?: string | null
          robots_directive?: string
          schema_json?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ── Convenience row types ────────────────────────────────────
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Profile          = Tables<'profiles'>
export type AdAccount        = Tables<'ad_accounts'>
export type CampaignMetric   = Tables<'campaign_metrics'>
export type DiagnosticIssue  = Tables<'diagnostic_issues'>
export type Recommendation   = Tables<'recommendations'>
export type SyncLog          = Tables<'sync_logs'>
export type BillingEvent     = Tables<'billing_events'>
export type AdminUser        = Tables<'admin_users'>
export type AiInsight        = Tables<'ai_insights'>
export type Notification     = Tables<'notifications'>

export type Plan = Profile['plan']
export type BlogPost  = Tables<'blog_posts'>
export type PageSeo   = Tables<'page_seo'>
