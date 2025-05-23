import axios from 'axios';
import { 
  EmailBisonInbox, 
  EmailBisonWorkspace, 
  ApiResponse, 
  PaginatedResponse 
} from '../types/email-bison';
import { toast } from 'sonner';

// Create API client with proper base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:4001/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // CORS requires this to be false for cross-origin requests (port 3000 to 4001)
  withCredentials: false
});

// Add debugging interceptor to log requests in development
apiClient.interceptors.request.use((config) => {
  console.log(`[DEBUG] Requesting: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Add response interceptor for error handling and debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[DEBUG] Response from ${response.config.url}:`, response.data);
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', error.response?.status, message);
    console.error('Full error details:', error.response?.data);
    
    // Display a toast notification for API errors
    toast.error('API Error', {
      description: message,
    });
    
    return Promise.reject(message);
  }
);

// Export API functions
export const emailBisonApi = {
  // Inbox endpoints
  inboxes: {
    getAll: async (): Promise<PaginatedResponse<EmailBisonInbox>> => {
      try {
        return await apiClient.get('/inboxes');
      } catch (error) {
        console.error('Error fetching inboxes:', error);
        throw error;
      }
    },
    
    getById: async (id: string): Promise<ApiResponse<EmailBisonInbox>> => {
      try {
        return await apiClient.get(`/inboxes/${id}`);
      } catch (error) {
        console.error(`Error fetching inbox ${id}:`, error);
        throw error;
      }
    }
  },
  
  // Workspace endpoints
  workspaces: {
    getAll: async (): Promise<PaginatedResponse<EmailBisonWorkspace>> => {
      try {
        return await apiClient.get('/workspaces');
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        throw error;
      }
    },
    
    getById: async (id: string): Promise<ApiResponse<EmailBisonWorkspace>> => {
      try {
        return await apiClient.get(`/workspaces/${id}`);
      } catch (error) {
        console.error(`Error fetching workspace ${id}:`, error);
        throw error;
      }
    }
  }
};

export default emailBisonApi;
