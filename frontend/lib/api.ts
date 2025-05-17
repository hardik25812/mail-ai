import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { mockInboxes, mockWorkspaces, mockEmailThreads, mockEmails, usesMockData } from './mock-data';

// Define the base URL for API calls
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3001/api' // Local development backend
  : (process.env.NEXT_PUBLIC_API_URL || '/api');

// Define types for API responses
export interface Workspace {
  id: string;
  name: string;
  is_connected: boolean;
  bison_workspace_id?: string;
  bison_workspace_name?: string;
}

export interface Inbox {
  id: string;
  name: string;
  email: string;
  workspace_id: string;
  active: boolean;
  email_count: number;
  unread_count: number;
  ai_reply_count: number;
  response_rate: number;
}

export interface Email {
  id: string;
  thread_id: string;
  subject: string;
  body: string;
  sender: string;
  received_at: string;
  is_inbound: boolean;
  is_ai_reply: boolean;
}

export interface EmailThread {
  id: string;
  subject: string;
  latest_email: {
    id: string;
    senderName: string;
    senderEmail: string;
    body: string;
    received_at: string;
  };
  email_count: number;
  has_unread: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Enable credentials for CORS (cookies, authorization headers)
  withCredentials: true,
});

// Handle response data
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Extract data from response
    return response.data;
  },
  (error: AxiosError) => {
    // Handle error responses
    const status = error.response?.status;
    const message = 
      (error.response?.data as any)?.message || 
      error.message || 
      'An unexpected error occurred';
    
    // Log error for debugging
    console.error('API Error:', { status, message, error });
    
    // Handle specific error codes
    if (status && status === 401) {
      toast.error('Session expired. Please log in again.');
    } else if (status && status === 403) {
      toast.error('You don\'t have permission to perform this action.');
    } else if (status && status === 404) {
      toast.error('The requested resource was not found.');
    } else if (status && status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    // Propagate the error for the caller to handle
    return Promise.reject({
      status,
      message,
      originalError: error
    });
  }
);

// API client
const api = {
  workspaces: {
    getAll: async (): Promise<Workspace[]> => {
      try {
        const response = await apiClient.get('/workspaces');
        return response.data;
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        throw error;
      }
    },
    
    getById: async (id: string): Promise<Workspace> => {
      try {
        const response = await apiClient.get(`/workspaces/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching workspace ${id}:`, error);
        throw error;
      }
    },
    
    getStatus: async (workspaceId: string): Promise<{
      is_connected: boolean;
      bison_workspace_id?: string;
      bison_workspace_name?: string;
    }> => {
      try {
        const response = await apiClient.get(`/workspaces/${workspaceId}/status`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching workspace ${workspaceId} status:`, error);
        throw error;
      }
    },
    
    connectBison: async (workspaceId: string, apiKey: string): Promise<{
      success: boolean;
      message?: string;
    }> => {
      try {
        const response = await apiClient.post(`/workspaces/${workspaceId}/connect-bison`, { apiKey });
        return response.data;
      } catch (error) {
        console.error(`Error connecting Bison to workspace ${workspaceId}:`, error);
        throw error;
      }
    }
  },
  
  inboxes: {
    getAll: async (): Promise<Inbox[]> => {
      try {
        // Use our new backend API endpoint
        const response = await apiClient.get('/emails/inboxes');
        return response.data.data; // Extract data from ApiResponse wrapper
      } catch (error) {
        console.error('Error fetching inboxes:', error);
        // Return mock data as fallback in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Falling back to mock inbox data');
          return mockInboxes;
        }
        throw error;
      }
    },
    
    getById: async (id: string): Promise<Inbox> => {
      try {
        // Use our new backend API endpoint
        const response = await apiClient.get(`/emails/inboxes/${id}`);
        return response.data.data; // Extract data from ApiResponse wrapper
      } catch (error) {
        console.error(`Error fetching inbox ${id}:`, error);
        // Try to find in mock data as fallback in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Falling back to mock data for inbox ${id}`);
          const inbox = mockInboxes.find(inbox => inbox.id === id);
          if (inbox) {
            return inbox;
          }
        }
        throw error;
      }
    }
  },
  
  emails: {
    getThreads: async (inboxId?: string, page = 1, limit = 20): Promise<EmailThread[]> => {
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (inboxId) params.append('inboxId', inboxId);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        // Use our new backend API endpoint
        const response = await apiClient.get(`/emails/threads?${params.toString()}`);
        
        // Extract and transform data to match frontend expectations
        const threads = response.data.data.map((thread: any) => ({
          id: thread.id,
          subject: thread.subject,
          latest_email: {
            id: thread.messages[thread.messages.length - 1]?.id,
            senderName: thread.messages[thread.messages.length - 1]?.from.name,
            senderEmail: thread.messages[thread.messages.length - 1]?.from.email,
            body: thread.messages[thread.messages.length - 1]?.snippet,
            received_at: thread.messages[thread.messages.length - 1]?.date
          },
          email_count: thread.messageCount,
          has_unread: thread.unreadCount > 0
        }));
        
        return threads;
      } catch (error) {
        console.error('Error fetching email threads:', error);
        // Return mock data as fallback in development
        if (process.env.NODE_ENV === 'development' && inboxId) {
          console.log(`Falling back to mock data for email threads in inbox ${inboxId}`);
          return mockEmailThreads[inboxId] || [];
        }
        throw error;
      }
    },
    
    getThread: async (threadId: string): Promise<Email[]> => {
      try {
        // Use our new backend API endpoint
        const response = await apiClient.get(`/emails/threads/${threadId}`);
        
        // Extract thread and transform messages to match frontend expectations
        const thread = response.data.data;
        const emails = thread.messages.map((message: any) => ({
          id: message.id,
          thread_id: threadId,
          subject: message.subject,
          body: message.body,
          sender: `${message.from.name} <${message.from.email}>`,
          received_at: message.date,
          is_inbound: message.from.email !== thread.messages[0].to[0].email,
          is_ai_reply: message.labels?.includes('ai-generated') || false
        }));
        
        return emails;
      } catch (error) {
        console.error(`Error fetching email thread ${threadId}:`, error);
        // Try to find in mock data as fallback in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Falling back to mock data for email thread ${threadId}`);
          if (mockEmails[threadId]) {
            return mockEmails[threadId];
          }
        }
        throw error;
      }
    },
    
    triggerAIReply: async (emailId: string, threadId?: string, inboxId?: string): Promise<{ success: boolean }> => {
      try {
        // Need to get thread and inbox information first if not provided
        if (!threadId || !inboxId) {
          // Find the email to get its threadId and inboxId
          const allThreads = Object.values(mockEmailThreads).flat();
          for (const thread of allThreads) {
            const email = mockEmails[thread.id]?.find(e => e.id === emailId);
            if (email) {
              threadId = thread.id;
              // Find inboxId from mockInboxes based on workspace association
              inboxId = mockInboxes[0].id; // Default to first inbox if can't find
              break;
            }
          }
          
          if (!threadId || !inboxId) {
            throw new Error('Could not find thread or inbox for the provided email');
          }
        }
        
        // Use our new backend API endpoint
        const response = await apiClient.post('/ai-replies', { 
          emailId, 
          threadId, 
          inboxId,
          model: 'gpt-4' 
        });
        
        return { success: true };
      } catch (error) {
        console.error(`Error triggering AI reply for email ${emailId}:`, error);
        throw error;
      }
    }
  }
};

export default api;
