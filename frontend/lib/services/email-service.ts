import apiClient from '../api-client';
import { toast } from 'sonner';
import { Email, EmailThread, Inbox, ApiResponse, PaginatedResponse } from '../types/api-types';

// Using imported types from api-types.ts

// Using imported types from api-types.ts

// Using imported types from api-types.ts

export interface EmailFilter {
  isRead?: boolean;
  label?: string;
  dateFrom?: string;
  dateTo?: string;
  sender?: string;
  hasAttachments?: boolean;
  search?: string;
}

export interface EmailSyncStatus {
  inbox_id: string;
  last_synced_at: string;
  status: 'success' | 'in_progress' | 'failed';
  message?: string;
}

// Mock implementation for real-time updates since we're not using WebSockets in dev mode
const setupRealTimeUpdates = (workspaceId: string, inboxId?: string, callback?: () => void) => {
  console.log(`[MOCK] Setting up real-time updates for workspace ${workspaceId}`);
  if (inboxId) {
    console.log(`[MOCK] Subscribing to inbox ${inboxId}`);
  }
  
  // Set up a polling interval to simulate real-time updates (only in dev)
  const intervalId = setInterval(() => {
    console.log('[MOCK] Polling for updates...');
    if (callback) callback();
  }, 30000); // Poll every 30 seconds
  
  // Return cleanup function
  return () => {
    console.log('[MOCK] Cleaning up real-time updates');
    clearInterval(intervalId);
  };
};

export const EmailService = {
  // Set up real-time updates
  setupRealTimeUpdates,
  
  // Get all inboxes with optional filtering by workspace
  getInboxes: async (workspaceId?: string) => {
    try {
      const params: any = {};
      if (workspaceId) params.workspaceId = workspaceId;
      
      const { data } = await apiClient.get<ApiResponse<Inbox[]>>('/emails/inboxes', { params });
      return data.data;
    } catch (error) {
      console.error('Error fetching inboxes:', error);
      toast.error('Failed to load inboxes');
      throw error;
    }
  },

  // Get emails for a specific inbox with pagination
  getEmails: async (inboxId: string, page: number = 1, limit: number = 25, filters?: EmailFilter) => {
    try {
      const params = {
        inboxId,
        page,
        limit,
        ...filters
      };
      
      const data = await apiClient.getPaginated<Email>('/emails/threads', page, limit, params);
      return data;
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to load emails');
      throw error;
    }
  },

  // Get a specific email by ID
  getEmail: async (emailId: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Email>>(`/emails/${emailId}`);
      return data.data;
    } catch (error) {
      console.error(`Error fetching email ${emailId}:`, error);
      toast.error('Failed to load email');
      throw error;
    }
  },

  // Get a thread with all its emails
  getThread: async (threadId: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<EmailThread>>(`/emails/threads/${threadId}`);
      return data.data;
    } catch (error) {
      console.error(`Error fetching thread ${threadId}:`, error);
      toast.error('Failed to load email thread');
      throw error;
    }
  },
  
  // Get threads for a specific inbox with pagination
  getThreads: async (inboxId: string, page: number = 1, limit: number = 25, filters?: EmailFilter) => {
    try {
      const params = {
        inboxId,
        page, 
        limit,
        ...filters
      };
      
      const data = await apiClient.getPaginated<EmailThread>('/emails/threads', page, limit, params);
      return data;
    } catch (error) {
      console.error('Error fetching threads:', error);
      toast.error('Failed to load email threads');
      throw error;
    }
  },

  // Trigger AI reply for an email
  triggerAiReply: async (emailId: string, threadId: string, inboxId: string, prompt?: string) => {
    try {
      toast.loading('Generating AI reply...');
      const { data } = await apiClient.post('/ai-replies', { 
        emailId, 
        threadId, 
        inboxId,
        prompt,
        model: 'gpt-4' 
      });
      toast.success('AI reply generation started');
      return data.data;
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
      const { data } = await apiClient.patch(`/emails/${emailId}`, { isRead });
      return data.data;
    } catch (error) {
      console.error(`Error marking email ${emailId} as ${isRead ? 'read' : 'unread'}:`, error);
      toast.error(`Failed to mark email as ${isRead ? 'read' : 'unread'}`);
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
