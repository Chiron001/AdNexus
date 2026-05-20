export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          plan: 'free' | 'growth' | 'agency'
          plan_expires_at: string | null
          razorpay_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          plan?: 'free' | 'growth' | 'agency'
          plan_expires_at?: string | null
          razorpay_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          plan?: 'free' | 'growth' | 'agency'
          plan_expires_at?: string | null
          razorpay_customer_id?: string | null
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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Helper type to get a table row type
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
