import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// Define the base URL for API calls
// Always use port 4001 for Email Bison API
const API_BASE_URL = 'http://localhost:4001/api';

console.log('API client connecting to:', API_BASE_URL);

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
  // CORS requires this to be false when connecting across ports (3000 to 4001)
  withCredentials: false,
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
        console.log('Fetching workspaces from Email Bison API...');
        const response = await apiClient.get('/workspaces');
        
        console.log('Raw workspaces response:', response);
        
        if (response && response.data && Array.isArray(response.data)) {
          // Transform the Email Bison data to match our Workspace interface
          return response.data.map((workspace: any) => ({
            id: workspace.id,
            name: workspace.name || 'Unnamed Workspace',
            is_connected: workspace.status === 'active',
            bison_workspace_id: workspace.id,
            bison_workspace_name: workspace.name
          }));
        } else {
          console.warn('Unexpected workspaces response format:', response);
          return [];
        }
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        toast.error('Failed to fetch workspaces');
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
        console.log('Fetching inboxes from Email Bison API...');
        const response = await apiClient.get('/inboxes');
        
        console.log('Raw inbox response:', response);
        
        if (response && response.data && Array.isArray(response.data)) {
          // Transform the Email Bison data to match our Inbox interface
          return response.data.map((inbox: any) => ({
            id: inbox.id,
            name: inbox.name || inbox.email,
            email: inbox.email,
            workspace_id: inbox.workspace_id || '',
            active: inbox.status === 'active',
            email_count: inbox.total_count || 0,
            unread_count: inbox.unread_count || 0,
            ai_reply_count: 0, // This data might not be available from Email Bison
            response_rate: 0 // This data might not be available from Email Bison
          }));
        } else {
          console.warn('Unexpected inboxes response format:', response);
          return [];
        }
      } catch (error) {
        console.error('Error fetching inboxes:', error);
        toast.error('Failed to fetch inboxes');
        return [];
      }
    },
    
    getById: async (id: string): Promise<Inbox> => {
      try {
        console.log(`Fetching inbox ${id}...`);
        const response = await apiClient.get(`/inboxes/${id}`);
        
        console.log(`Raw inbox ${id} response:`, response);
        
        if (response && response.data) {
          const inbox = response.data;
          return {
            id: inbox.id,
            name: inbox.name || inbox.email,
            email: inbox.email,
            workspace_id: inbox.workspace_id || '',
            active: inbox.status === 'active',
            email_count: inbox.total_count || 0,
            unread_count: inbox.unread_count || 0,
            ai_reply_count: 0,
            response_rate: 0
          };
        } else {
          throw new Error(`Inbox ${id} not found or unexpected response format`);
        }
      } catch (error) {
        console.error(`Error fetching inbox ${id}:`, error);
        toast.error(`Failed to fetch inbox ${id}`);
        throw error;
      }
    }
  },
  
  emails: {
    getThreads: async (inboxId?: string, page = 1, limit = 20): Promise<EmailThread[]> => {
      try {
        // Parameters to include in the request
        const params = new URLSearchParams();
        if (inboxId) params.append('inboxId', inboxId);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        console.log(`Fetching email threads for inbox ${inboxId || 'all'}...`);
        const response = await apiClient.get(`/emails/threads?${params.toString()}`);
        
        console.log('Raw threads response:', response);
        
        // Extract and transform data to match frontend expectations
        if (response && response.data && Array.isArray(response.data)) {
          const threads = response.data.map((thread: any) => ({
            id: thread.id,
            subject: thread.subject || 'No Subject',
            latest_email: {
              id: thread.messages?.[thread.messages?.length - 1]?.id || '',
              senderName: thread.messages?.[thread.messages?.length - 1]?.from?.name || 'Unknown',
              senderEmail: thread.messages?.[thread.messages?.length - 1]?.from?.email || '',
              body: thread.messages?.[thread.messages?.length - 1]?.snippet || '',
              received_at: thread.messages?.[thread.messages?.length - 1]?.date || new Date().toISOString()
            },
            email_count: thread.messageCount || thread.messages?.length || 0,
            has_unread: (thread.unreadCount || 0) > 0
          }));
          
          return threads;
        } else {
          console.warn('Unexpected email threads response format:', response);
          return [];
        }
      } catch (error) {
        console.error('Error fetching email threads:', error);
        toast.error('Failed to fetch email threads');
        return [];
      }
    },
    
    getThread: async (threadId: string): Promise<Email[]> => {
      try {
        console.log(`Fetching email thread ${threadId}...`);
        const response = await apiClient.get(`/emails/threads/${threadId}`);
        
        console.log('Raw thread response:', response);
        
        // Extract thread and transform messages to match frontend expectations
        if (response && response.data && response.data.messages) {
          const thread = response.data;
          const emails = thread.messages.map((message: any) => ({
            id: message.id || `temp-${Date.now()}`,
            thread_id: threadId,
            subject: message.subject || thread.subject || 'No Subject',
            body: message.body || message.snippet || '',
            sender: message.from?.name && message.from?.email 
              ? `${message.from.name} <${message.from.email}>` 
              : message.from?.email || 'unknown@example.com',
            received_at: message.date || new Date().toISOString(),
            is_inbound: message.from?.email !== thread.messages[0]?.to?.[0]?.email,
            is_ai_reply: message.labels?.includes('ai-generated') || false
          }));
          
          return emails;
        } else {
          console.warn('Unexpected email thread response format:', response);
          return [];
        }
      } catch (error) {
        console.error(`Error fetching email thread ${threadId}:`, error);
        toast.error(`Failed to fetch email thread ${threadId}`);
        return [];
      }
    },
    
    triggerAiReply: async (emailId: string, threadId?: string, inboxId?: string): Promise<{ success: boolean }> => {
      try {
        // Verify we have the necessary information
        if (!threadId && !emailId) {
          throw new Error('Either emailId or threadId must be provided');
        }
        
        console.log(`Triggering AI reply for email ${emailId} in thread ${threadId || 'unknown'}...`);
        
        // Call the Email Bison API endpoint
        const response = await apiClient.post('/ai-replies', { 
          email_id: emailId, 
          thread_id: threadId,
          inbox_id: inboxId,
          model: 'gpt-4' 
        });
        
        console.log('AI reply response:', response);
        
        // Check if the response was successful - response is already unwrapped by our interceptor
        if (response && typeof response === 'object') {
          const isSuccess = response.success === true || response.data?.success === true;
          if (isSuccess) {
            toast.success('AI reply generated successfully');
            return { success: true };
          }
        }
          
        // If we reach here, there was an error or unexpected response format
        toast.error('Failed to generate AI reply');
        return { success: false };
      } catch (error) {
        console.error(`Error triggering AI reply for email ${emailId}:`, error);
        toast.error('Failed to generate AI reply');
        return { success: false };
      }
    }
  }
};

export default api;
