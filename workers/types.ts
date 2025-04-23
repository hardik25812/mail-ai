/**
 * Type definitions for Supabase tables
 * This is a simplified version for the worker
 */

// Job Status type
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// AI Reply Job
export interface AIReplyJob {
  id: string;
  email_id: string;
  user_id: string;
  status: JobStatus;
  attempts: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
}
