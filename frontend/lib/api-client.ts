import axios from 'axios';
import { getCachedData, setCachedData } from './cache-utils';

// API base URL - using relative paths for Next.js API routes
const API_BASE_URL = '/api';

// Create an optimized API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout to prevent hanging requests
  timeout: 8000,
});

// Add auth interceptor
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

// Add response interceptor for error handling and caching
apiClient.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method?.toLowerCase() === 'get') {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      setCachedData(cacheKey, response.data);
    }
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error: Could not connect to the backend API');
      
      // Try to return cached data if available for GET requests
      if (error.config.method?.toLowerCase() === 'get') {
        const cacheKey = `${error.config.url}${JSON.stringify(error.config.params || {})}`;
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
          console.info('Returning cached data due to network error');
          return Promise.resolve({ data: cachedData, status: 200, statusText: 'OK (Cached)', headers: {}, config: error.config });
        }
      }
      
      // For development purposes, show a console message
      if (typeof window !== 'undefined') {
        console.warn('Make sure your backend server is running at:', API_BASE_URL);
      }
    }
    
    // Log specific error details for debugging
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
    }
    
    return Promise.reject(error);
  }
);

// Enhanced API client with caching and all HTTP methods
const enhancedApiClient = {
  ...apiClient,
  get: async <T>(url: string, config?: any) => {
    const cacheKey = `${url}${JSON.stringify(config?.params || {})}`;
    const cachedData = getCachedData<T>(cacheKey);
    
    // Return cached data if available
    if (cachedData) {
      return Promise.resolve({ data: cachedData, status: 200, statusText: 'OK (Cached)', headers: {}, config });
    }
    
    // Otherwise make the API call
    return apiClient.get<T>(url, config);
  },
  post: async <T>(url: string, data?: any, config?: any) => {
    return apiClient.post<T>(url, data, config);
  },
  put: async <T>(url: string, data?: any, config?: any) => {
    return apiClient.put<T>(url, data, config);
  },
  delete: async <T>(url: string, config?: any) => {
    return apiClient.delete<T>(url, config);
  },
  patch: async <T>(url: string, data?: any, config?: any) => {
    return apiClient.patch<T>(url, data, config);
  }
};

export default enhancedApiClient;
