import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { mockInboxes, mockWorkspaces, mockEmailThreads, mockEmails, usesMockData } from './mock-data';
import { getCachedData, setCachedData } from './cache-utils';

// Define the base URL for API calls
const API_BASE_URL = 'http://localhost:4001/api';

// Log the API URL to verify it's being used
console.log('API BASE URL:', API_BASE_URL);

// Define types for API responses - matching Supabase schema
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
  // Add a timeout to prevent hanging requests
  timeout: 10000,
});

// Add auth interceptor for Supabase authentication
apiClient.interceptors.request.use((config) => {
  // Get auth token from Supabase Auth
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('supabase.auth.token');
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        config.headers.Authorization = `Bearer ${parsedToken.access_token}`;
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    }
  }
  return config;
});

// Handle response data
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Cache successful GET responses
    if (response.config.method?.toLowerCase() === 'get') {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      setCachedData(cacheKey, response.data);
    }
    // Extract data from response
    return response.data;
  },
  (error: AxiosError) => {
    // Check for network errors first
    if (!error.response) {
      console.error('Network Error: Could not connect to the backend API');
      
      // Try to return cached data if available for GET requests
      if (error.config?.method?.toLowerCase() === 'get') {
        const cacheKey = `${error.config.url}${JSON.stringify(error.config.params || {})}`;
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
          console.info('Returning cached data due to network error');
          return Promise.resolve(cachedData);
        }
      }
      
      // Use mock data in development if available
      if (process.env.NODE_ENV === 'development') {
        const url = error.config?.url;
        
        if (url) {
          // Extract resource type and ID from URL
          if (url.includes('/workspaces')) {
            return Promise.resolve(mockWorkspaces);
          } else if (url.includes('/inboxes')) {
            return Promise.resolve(mockInboxes);
          }
        }
      }
      
      toast.error('Network error. Please check your connection.');
    }
    
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

// Enhanced API methods with type safety and mock data
const api = {
  // === WORKSPACES API ===
  workspaces: {
    getAll: async (): Promise<Workspace[]> => {
      // Use mock data in development mode
      if (usesMockData()) {
        console.log('Using mock workspace data');
        return Promise.resolve(mockWorkspaces);
      }
      
      try {
        return await apiClient.get('/api/workspaces');
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        throw error;
      }
    },
    
    getById: async (id: string): Promise<Workspace> => {
      // Validate input
      if (!id) throw new Error('Workspace ID is required');
      
      // Use mock data in development mode
      if (usesMockData()) {
        console.log(`Using mock workspace data for ${id}`);
        const workspace = mockWorkspaces.find(w => w.id === id);
        if (workspace) {
          return Promise.resolve(workspace);
        }
        throw new Error(`Workspace with ID ${id} not found`);
      }
      
      try {
        return await apiClient.get(`/api/workspaces/${id}`);
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
      // Validate input
      if (!workspaceId) throw new Error('Workspace ID is required');
      
      try {
        return await apiClient.get(`/api/workspaces/${workspaceId}/status`);
      } catch (error) {
        console.error(`Error fetching workspace status for ${workspaceId}:`, error);
        throw error;
      }
    },
    
    connectBison: async (workspaceId: string, apiKey: string): Promise<{
      success: boolean;
      message?: string;
    }> => {
      // Validate inputs
      if (!workspaceId) throw new Error('Workspace ID is required');
      if (!apiKey) throw new Error('API key is required');
      
      try {
        return await apiClient.post(`/api/workspaces/connect-bison`, { workspaceId, apiKey });
      } catch (error) {
        console.error(`Error connecting Bison to workspace ${workspaceId}:`, error);
        throw error;
      }
    }
  },
  
  // === INBOXES API ===
  inboxes: {
    getAll: async (): Promise<Inbox[]> => {
      // Use mock data in development mode
      if (usesMockData()) {
        console.log('Using mock inbox data');
        return Promise.resolve(mockInboxes);
      }
      
      try {
        return await apiClient.get('/api/inboxes');
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
      // Validate input
      if (!id) throw new Error('Inbox ID is required');
      
      // Use mock data in development mode
      if (usesMockData()) {
        console.log(`Using mock inbox data for ${id}`);
        const inbox = mockInboxes.find(inbox => inbox.id === id);
        if (inbox) {
          return Promise.resolve(inbox);
        }
        return Promise.reject({
          status: 404,
          message: `Inbox with id ${id} not found in mock data`
        });
      }
      
      try {
        return await apiClient.get(`/api/inboxes/${id}`);
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
  
  // === EMAILS API ===
  emails: {
    getThreads: async (inboxId?: string, page = 1, limit = 20): Promise<EmailThread[]> => {
      // Use mock data in development mode
      if (usesMockData()) {
        console.log(`Using mock email threads data for inbox ${inboxId}`);
        if (inboxId && mockEmailThreads[inboxId]) {
          return Promise.resolve(mockEmailThreads[inboxId]);
        }
        return Promise.resolve([]);
      }
      
      try {
        const params = new URLSearchParams();
        if (inboxId) params.append('inbox', inboxId);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        return await apiClient.get(`/api/threads?${params.toString()}`);
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
      // Validate input
      if (!threadId) throw new Error('Thread ID is required');
      
      // Use mock data in development mode
      if (usesMockData()) {
        console.log(`Using mock emails data for thread ${threadId}`);
        if (mockEmails[threadId]) {
          return Promise.resolve(mockEmails[threadId]);
        }
        return Promise.reject({
          status: 404,
          message: `Thread with id ${threadId} not found in mock data`
        });
      }
      
      try {
        return await apiClient.get(`/api/threads/${threadId}`);
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
    
    triggerAIReply: async (emailId: string): Promise<{ success: boolean }> => {
      // Validate input
      if (!emailId) throw new Error('Email ID is required');
      
      try {
        return await apiClient.post('/api/emails/trigger-ai-reply', { emailId });
      } catch (error) {
        console.error(`Error triggering AI reply for email ${emailId}:`, error);
        throw error;
      }
    },

    // Mark email as read
    markAsRead: async (emailId: string): Promise<{ success: boolean }> => {
      // Validate input
      if (!emailId) throw new Error('Email ID is required');
      
      try {
        return await apiClient.put(`/api/emails/${emailId}/read`, { status: 'read' });
      } catch (error) {
        console.error(`Error marking email ${emailId} as read:`, error);
        throw error;
      }
    }
  },
  
  // === ANALYTICS API ===
  analytics: {
    getEmailVolume: async (workspaceId: string, interval: 'day' | 'week' | 'month' = 'week'): Promise<any> => {
      // Validate input
      if (!workspaceId) throw new Error('Workspace ID is required');
      
      try {
        return await apiClient.get(`/analytics/email-volume`, { params: { workspace_id: workspaceId, interval } });
      } catch (error) {
        console.error(`Error fetching email volume analytics:`, error);
        throw error;
      }
    },
    
    getEmailTypes: async (workspaceId: string): Promise<any> => {
      // Validate input
      if (!workspaceId) throw new Error('Workspace ID is required');
      
      try {
        return await apiClient.get(`/analytics/email-types`, { params: { workspace_id: workspaceId } });
      } catch (error) {
        console.error(`Error fetching email types analytics:`, error);
        throw error;
      }
    },
    
    getResponseTime: async (workspaceId: string): Promise<any> => {
      // Validate input
      if (!workspaceId) throw new Error('Workspace ID is required');
      
      try {
        return await apiClient.get(`/analytics/response-time`, { params: { workspace_id: workspaceId } });
      } catch (error) {
        console.error(`Error fetching response time analytics:`, error);
        throw error;
      }
    }
  }
};

export default api;
