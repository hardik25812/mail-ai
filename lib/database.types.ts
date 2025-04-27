export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      workspaces: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      workspace_users: {
        Row: {
          workspace_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          workspace_id: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          workspace_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_users_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_users_workspace_id_fkey"
            columns: ["workspace_id"]
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          }
        ]
      }
      inboxes: {
        Row: {
          id: string
          workspace_id: string
          bison_inbox_id: string
          email_address: string
          name: string
          active: boolean
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          bison_inbox_id: string
          email_address: string
          name: string
          active?: boolean
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          bison_inbox_id?: string
          email_address?: string
          name?: string
          active?: boolean
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inboxes_workspace_id_fkey"
            columns: ["workspace_id"]
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          }
        ]
      }
      emails: {
        Row: {
          id: string
          inbox_id: string
          message_id: string
          thread_id: string
          subject: string
          body: string
          body_html: string | null
          sender: string
          recipient: string
          cc: string[]
          bcc: string[]
          status: string
          intent: string | null
          lead_score: number | null
          is_draft: boolean
          is_sent: boolean
          is_inbound: boolean
          received_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          inbox_id: string
          message_id: string
          thread_id: string
          subject: string
          body: string
          body_html?: string | null
          sender: string
          recipient: string
          cc?: string[]
          bcc?: string[]
          status: string
          intent?: string | null
          lead_score?: number | null
          is_draft?: boolean
          is_sent?: boolean
          is_inbound?: boolean
          received_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inbox_id?: string
          message_id?: string
          thread_id?: string
          subject?: string
          body?: string
          body_html?: string | null
          sender?: string
          recipient?: string
          cc?: string[]
          bcc?: string[]
          status?: string
          intent?: string | null
          lead_score?: number | null
          is_draft?: boolean
          is_sent?: boolean
          is_inbound?: boolean
          received_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_inbox_id_fkey"
            columns: ["inbox_id"]
            referencedRelation: "inboxes"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_responses: {
        Row: {
          id: string
          email_id: string
          content: string
          approved_by_user: boolean | null
          sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email_id: string
          content: string
          approved_by_user?: boolean | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email_id?: string
          content?: string
          approved_by_user?: boolean | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_responses_email_id_fkey"
            columns: ["email_id"]
            referencedRelation: "emails"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          user_id: string
          tone: string | null
          signature: string | null
          auto_reply: boolean
          slack_url: string | null
          calendly_url: string | null
          timezone: string | null
          example_replies: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          tone?: string | null
          signature?: string | null
          auto_reply?: boolean
          slack_url?: string | null
          calendly_url?: string | null
          timezone?: string | null
          example_replies?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          tone?: string | null
          signature?: string | null
          auto_reply?: boolean
          slack_url?: string | null
          calendly_url?: string | null
          timezone?: string | null
          example_replies?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      campaigns: {
        Row: {
          id: string
          workspace_id: string
          name: string
          description: string | null
          status: string
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          description?: string | null
          status: string
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          description?: string | null
          status?: string
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          }
        ]
      }
      campaign_steps: {
        Row: {
          id: string
          campaign_id: string
          step_number: number
          subject: string
          body: string
          delay_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          step_number: number
          subject: string
          body: string
          delay_hours?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          step_number?: number
          subject?: string
          body?: string
          delay_hours?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_steps_campaign_id_fkey"
            columns: ["campaign_id"]
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      campaign_recipients: {
        Row: {
          id: string
          campaign_id: string
          email: string
          name: string | null
          current_step: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          email: string
          name?: string | null
          current_step?: number | null
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          email?: string
          name?: string | null
          current_step?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      campaign_stats: {
        Row: {
          id: string
          campaign_id: string
          step_number: number | null
          emails_sent: number | null
          emails_delivered: number | null
          emails_opened: number | null
          emails_clicked: number | null
          emails_replied: number | null
          emails_bounced: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          step_number?: number | null
          emails_sent?: number | null
          emails_delivered?: number | null
          emails_opened?: number | null
          emails_clicked?: number | null
          emails_replied?: number | null
          emails_bounced?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          step_number?: number | null
          emails_sent?: number | null
          emails_delivered?: number | null
          emails_opened?: number | null
          emails_clicked?: number | null
          emails_replied?: number | null
          emails_bounced?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_stats_campaign_id_fkey"
            columns: ["campaign_id"]
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      sender_profiles: {
        Row: {
          id: string
          user_id: string
          workspace_id: string
          name: string
          email: string
          email_signature: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workspace_id: string
          name: string
          email: string
          email_signature?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workspace_id?: string
          name?: string
          email?: string
          email_signature?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sender_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sender_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_reply_jobs: {
        Row: {
          id: string
          email_id: string
          user_id: string
          status: string
          attempts: number
          last_error: string | null
          campaign_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email_id: string
          user_id: string
          status?: string
          attempts?: number
          last_error?: string | null
          campaign_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email_id?: string
          user_id?: string
          status?: string
          attempts?: number
          last_error?: string | null
          campaign_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_reply_jobs_email_id_fkey"
            columns: ["email_id"]
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_reply_jobs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_reply_jobs_campaign_id_fkey"
            columns: ["campaign_id"]
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
