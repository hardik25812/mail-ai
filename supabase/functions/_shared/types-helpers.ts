// Type helper functions and interfaces for Supabase Edge Functions

// Supabase User type definition
export interface UserIdentity {
  id: string;
  email?: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  aud: string;
  created_at: string;
  updated_at?: string;
  role?: string;
}

// Complete Supabase Auth response structure
export interface SupabaseAuthResponse {
  data: {
    user: UserIdentity | null;
  } | null;
  error: Error | null;
}

// Interface to represent the user data from auth.getUser()
export interface User {
  id: string;
  email?: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
}

// Helper type for array filters
export interface Workspace {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceUser {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface SenderProfile {
  id: string;
  name: string;
  email: string;
  signature: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignStep {
  id: string;
  campaign_id: string;
  subject: string;
  body: string;
  delay_hours: number;
  sequence_number: number;
  step_number?: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignStats {
  id: string;
  campaign_id: string;
  step_number: number;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  emails_replied: number;
  emails_bounced: number;
  created_at: string;
  updated_at: string;
  status?: string;
  count?: number;
}

export interface RecordWithStatus {
  [key: string]: any;
  status?: string;
}

// Helper type for error handling
export type SafeError = Error & { 
  code?: string;
  details?: string;
  hint?: string;
};

// Helper to safely cast unknown error to SafeError
export function handleError(error: unknown): SafeError {
  if (error instanceof Error) {
    return error as SafeError;
  }
  return new Error(String(error)) as SafeError;
}

// Helper to create empty objects with string index signatures
export function createStringIndexedObject<T>(): { [key: string]: T } {
  return {} as { [key: string]: T };
}

// Helper types for database queries
export interface QueryOptions {
  count?: 'exact' | 'planned' | 'estimated';
  head?: boolean;
}

export interface OrderOptions {
  ascending?: boolean;
  nullsFirst?: boolean;
  foreignTable?: string;
}

// Helper for safe type casting
export function safeIndexAccess<T extends Record<string, any>, K extends string>(
  obj: T, 
  key: K, 
  defaultValue?: any
): any {
  if (key in obj) {
    return obj[key];
  }
  return defaultValue;
}

// Type helper for campaign status
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft' | 'scheduled';

// Type helper for recipient status 
export type RecipientStatus = 'active' | 'completed' | 'unsubscribed' | 'pending';
