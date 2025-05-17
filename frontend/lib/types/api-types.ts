/**
 * Type definitions for the Mail AI application
 * These types match the backend API data structures
 */

// Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

// Email types
export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface EmailAddress {
  email: string;
  name: string;
}

export interface Email {
  id: string;
  inboxId: string;
  threadId: string;
  subject: string;
  snippet: string;
  body: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  date: string; // ISO date string
  isRead: boolean;
  hasAttachments: boolean;
  labels: string[];
  attachments: EmailAttachment[];
}

export interface EmailThread {
  id: string;
  inboxId: string;
  subject: string;
  snippet: string;
  lastMessageDate: string; // ISO date string
  participants: EmailAddress[];
  messageCount: number;
  unreadCount: number;
  messages: Email[];
  labels: string[];
  isStarred: boolean;
}

// Inbox and Workspace types
export interface Inbox {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  provider: string; // 'gmail', 'outlook', etc.
  unreadCount: number;
  totalCount: number;
  lastSyncTime: string; // ISO date string
  isActive: boolean;
  labels: string[];
}

export interface WorkspaceMember {
  userId: string;
  role: string; // 'owner', 'admin', 'member'
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  settings: {
    aiReplyEnabled: boolean;
    defaultReplyPrompt: string;
  };
}

// AI Reply types
export interface AIReply {
  id: string;
  emailId: string;
  threadId: string;
  inboxId: string;
  content: string;
  generatedAt: string; // ISO date string
  sentAt: string | null; // ISO date string
  status: 'draft' | 'sent' | 'failed';
  model: string;
  prompt: string;
  editedVersion: string | null;
  editedAt: string | null; // ISO date string
}

// Reply Job types
export interface ReplyJob {
  id: string;
  emailId: string;
  threadId: string;
  inboxId: string;
  createdAt: string; // ISO date string
  completedAt: string | null; // ISO date string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error: string | null;
  aiReplyId: string | null;
  priority: number;
  retries: number;
}

// Webhook types
export interface Webhook {
  id: string;
  workspaceId: string;
  event: string; // 'email.received', 'reply.sent', etc.
  url: string;
  secret: string;
  isActive: boolean;
  createdAt: string; // ISO date string
  lastTriggeredAt: string | null; // ISO date string
  lastResponseStatus: number | null;
}

// Supabase types
export interface SupabaseUser {
  id: string;
  email: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  name?: string;
  avatarUrl?: string;
}

export interface SupabaseSession {
  user: SupabaseUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Request types
export interface CreateReplyRequest {
  emailId: string;
  threadId: string;
  inboxId: string;
  prompt?: string;
  model?: string;
}

export interface UpdateReplyRequest {
  content?: string;
  status?: 'draft' | 'sent' | 'failed';
}

export interface CreateWebhookRequest {
  workspaceId: string;
  event: string;
  url: string;
  secret?: string;
}

export interface UpdateWebhookRequest {
  url?: string;
  event?: string;
  isActive?: boolean;
  secret?: string;
}
