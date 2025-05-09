export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceUser {
  workspace_id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Inbox {
  id: string;
  workspace_id: string;
  bison_inbox_id: string;
  email_address: string;
  name: string;
  active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  inbox_id: string;
  message_id: string;
  thread_id: string;
  subject: string;
  body: string;
  body_html: string | null;
  sender: string;
  recipient: string;
  cc: string[];
  bcc: string[];
  status: EmailStatus;
  intent: string | null;
  lead_score: number | null;
  is_draft: boolean;
  is_sent: boolean;
  is_inbound: boolean;
  received_at: string | null;
  created_at: string;
  updated_at: string;
  // Frontend-specific properties
  senderName?: string;
  senderEmail?: string;
  isUnread?: boolean;
  hasAttachments?: boolean;
  labels?: string[];
}

export type EmailStatus = 'received' | 'read' | 'replied' | 'archived' | 'deleted';

export interface Thread {
  id: string;
  inbox_id: string;
  subject: string;
  participant_count: number;
  message_count: number;
  is_complete: boolean;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  emails?: Email[];
}

export interface AiReplyJob {
  id: string;
  email_id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  last_error: string | null;
  campaign_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiResponse {
  id: string;
  job_id: string;
  email_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface SenderProfile {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  email: string;
  email_signature: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  tone?: string;
  signature?: string;
  calendly_url?: string;
  custom_instructions?: string;
  auto_reply?: boolean;
  slack_url?: string;
}
