import apiClient, { PaginatedResponse } from '../api-client';
import { toast } from 'sonner';
import websocketService from '../websocket-service';

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
  status: string;
  is_draft: boolean;
  is_sent: boolean;
  is_inbound: boolean;
  is_read: boolean;
  has_attachments: boolean;
  importance: 'low' | 'normal' | 'high';
  ai_processed: boolean;
  ai_generated_reply: string | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Thread {
  id: string;
  subject: string;
  emails: Email[];
  participants: string[];
  last_updated_at: string;
  is_important: boolean;
  unread_count: number;
  total_emails: number;
}

export interface Inbox {
  id: string;
  name: string;
  email_address: string;
  active: boolean;
  last_synced_at: string | null;
  unread_count: number;
  total_emails: number;
  workspace_id: string;
  type: 'personal' | 'shared' | 'support' | 'other';
}

export interface EmailFilter {
  is_read?: boolean;
  is_flagged?: boolean;
  has_attachments?: boolean;
  date_from?: string;
  date_to?: string;
  sender?: string;
  search_term?: string;
}

export interface EmailSyncStatus {
  inbox_id: string;
  last_synced_at: string;
  status: 'success' | 'in_progress' | 'failed';
  message?: string;
}

// Set up real-time email updates
const setupRealTimeUpdates = (workspaceId: string, inboxId?: string, callback?: () => void) => {
  // First disconnect any existing connection
  websocketService.disconnect();
  
  // Connect to WebSocket server with workspace ID
  websocketService.connect(workspaceId);
  
  // Subscribe to different event types
  const unsubscribeNewEmail = websocketService.subscribe('new_email', (email) => {
    toast.info(`New email received: ${email.subject}`);
    if (callback) callback();
  });
  
  const unsubscribeUpdatedEmail = websocketService.subscribe('email_updated', (email) => {
    if (callback) callback();
  });
  
  const unsubscribeInboxSync = websocketService.subscribe('inbox_sync_complete', (syncStatus) => {
    toast.success(`Inbox ${syncStatus.inbox_id} synchronized`);
    if (callback) callback();
  });
  
  // Subscribe to a specific inbox if provided
  if (inboxId) {
    websocketService.send('subscribe-inbox', { inbox_id: inboxId });
  }
  
  // Return cleanup function to unsubscribe from all events
  return () => {
    unsubscribeNewEmail();
    unsubscribeUpdatedEmail();
    unsubscribeInboxSync();
    websocketService.disconnect();
  };
};

export const EmailService = {
  // Set up real-time updates
  setupRealTimeUpdates,
  
  // Get all inboxes with optional pagination
  getInboxes: async (workspaceId?: string) => {
    try {
      const params: any = {};
      if (workspaceId) params.workspace_id = workspaceId;
      
      const { data } = await apiClient.get<Inbox[]>('/inboxes', { params });
      return data;
    } catch (error) {
      console.error('Error fetching inboxes:', error);
      throw error;
    }
  },

  // Get emails for a specific inbox with pagination
  getEmails: async (inboxId: string, page: number = 1, limit: number = 25, filters?: EmailFilter) => {
    try {
      const params = {
        inbox_id: inboxId,
        page,
        limit,
        ...filters
      };
      
      const data = await apiClient.getPaginated<Email>('/emails', page, limit, { inbox_id: inboxId, ...filters });
      return data;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  },

  // Get a specific email by ID
  getEmail: async (emailId: string) => {
    try {
      const { data } = await apiClient.get<Email>(`/emails/${emailId}`);
      return data;
    } catch (error) {
      console.error(`Error fetching email ${emailId}:`, error);
      throw error;
    }
  },

  // Get a thread with all its emails
  getThread: async (threadId: string) => {
    try {
      const { data } = await apiClient.get<Thread>(`/threads/${threadId}`);
      return data;
    } catch (error) {
      console.error(`Error fetching thread ${threadId}:`, error);
      throw error;
    }
  },
  
  // Get threads for a specific inbox with pagination
  getThreads: async (inboxId: string, page: number = 1, limit: number = 25, filters?: EmailFilter) => {
    try {
      const params = {
        inbox_id: inboxId,
        page,
        limit,
        ...filters
      };
      
      const data = await apiClient.getPaginated<Thread>('/threads', page, limit, { inbox_id: inboxId, ...filters });
      return data;
    } catch (error) {
      console.error('Error fetching threads:', error);
      throw error;
    }
  },

  // Trigger AI reply for an email
  triggerAiReply: async (emailId: string) => {
    try {
      toast.loading('Generating AI reply...');
      const { data } = await apiClient.post('/trigger-ai-reply', { email_id: emailId });
      toast.success('AI reply generated successfully');
      return data;
    } catch (error) {
      console.error(`Error triggering AI reply for email ${emailId}:`, error);
      toast.error('Failed to generate AI reply');
      throw error;
    }
  },

  // Send an email
  sendEmail: async (params: {
    inbox_id: string;
    thread_id?: string;
    recipient: string;
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
    attachments?: File[];
  }) => {
    try {
      toast.loading('Sending email...');
      
      // Handle attachments if present
      if (params.attachments && params.attachments.length > 0) {
        const formData = new FormData();
        
        // Add text fields
        Object.entries(params).forEach(([key, value]) => {
          if (key !== 'attachments') {
            if (Array.isArray(value)) {
              // Handle arrays like cc and bcc
              value.forEach((item, index) => {
                formData.append(`${key}[${index}]`, item);
              });
            } else {
              formData.append(key, value as string);
            }
          }
        });
        
        // Add attachments
        params.attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
        
        const { data } = await apiClient.post('/send-email', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        toast.success('Email sent successfully');
        return data;
      } else {
        // No attachments, send normal JSON
        const { data } = await apiClient.post('/send-email', params);
        toast.success('Email sent successfully');
        return data;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
      throw error;
    }
  },
  
  // Mark email as read/unread
  markEmailReadStatus: async (emailId: string, isRead: boolean) => {
    try {
      const { data } = await apiClient.patch(`/emails/${emailId}/read-status`, { is_read: isRead });
      return data;
    } catch (error) {
      console.error(`Error marking email ${emailId} as ${isRead ? 'read' : 'unread'}:`, error);
      throw error;
    }
  },
  
  // Flag/unflag an email
  toggleEmailFlag: async (emailId: string, isFlagged: boolean) => {
    try {
      const { data } = await apiClient.patch(`/emails/${emailId}/flag`, { is_flagged: isFlagged });
      return data;
    } catch (error) {
      console.error(`Error ${isFlagged ? 'flagging' : 'unflagging'} email ${emailId}:`, error);
      throw error;
    }
  },
  
  // Manually trigger inbox synchronization
  syncInbox: async (inboxId: string) => {
    try {
      toast.loading('Synchronizing inbox...');
      const { data } = await apiClient.post(`/inboxes/${inboxId}/sync`);
      toast.success('Inbox synchronized successfully');
      return data;
    } catch (error) {
      console.error(`Error synchronizing inbox ${inboxId}:`, error);
      toast.error('Failed to synchronize inbox');
      throw error;
    }
  },
  
  // Get inbox sync status
  getInboxSyncStatus: async (inboxId: string) => {
    try {
      const { data } = await apiClient.get<EmailSyncStatus>(`/inboxes/${inboxId}/sync-status`);
      return data;
    } catch (error) {
      console.error(`Error getting sync status for inbox ${inboxId}:`, error);
      throw error;
    }
  }
};

export default EmailService;
