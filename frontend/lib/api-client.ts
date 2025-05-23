import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getCachedData, setCachedData } from './cache-utils';
import { toast } from 'sonner';

// Import shared API types
import { PaginatedResponse, ApiResponse, ApiError } from './types/api-types';

// API base URL - targeting our local backend when in development
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:4001/api' 
  : '/api';

// Request timeout (ms)
const REQUEST_TIMEOUT = 15000;

// Create an optimized API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout to prevent hanging requests
  timeout: REQUEST_TIMEOUT,
  // Enable credentials for CORS (cookies, authorization headers)
  withCredentials: true,
});

// Add request logger for debugging
const logRequest = (config: any) => {
  if (process.env.NODE_ENV === 'development') {
    const method = config.method?.toUpperCase() || 'UNKNOWN';
    const url = config.url || 'UNKNOWN';
    console.debug(`API REQUEST [${method}] ${url}`);
  }
  return config;
};

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  logRequest(config);
  
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
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      const method = response.config.method?.toUpperCase() || 'UNKNOWN';
      const url = response.config.url || 'UNKNOWN';
      console.debug(`API RESPONSE [${method}] ${url} - ${response.status}`);
    }
    
    // Cache successful GET responses
    if (response.config.method?.toLowerCase() === 'get') {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      setCachedData(cacheKey, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Extract error details
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'UNKNOWN';
    let errorMessage = 'An unexpected error occurred';
    
    // Handle network errors
    if (!error.response) {
      errorMessage = 'Network Error: Could not connect to the server';
      console.error(errorMessage);
      
      // Try to return cached data if available for GET requests
      if (error.config?.method?.toLowerCase() === 'get') {
        const cacheKey = `${error.config.url}${JSON.stringify(error.config?.params || {})}`;
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
          console.info('Returning cached data due to network error');
          return Promise.resolve({ 
            data: cachedData, 
            status: 200, 
            statusText: 'OK (Cached)', 
            headers: {}, 
            config: error.config 
          } as AxiosResponse);
        }
      }
      
      // Show toast for network errors
      toast.error(errorMessage);
      
      // For development purposes, show a console message
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('Make sure your backend server is running at:', API_BASE_URL);
      }
    } else {
      // Handle HTTP error status codes
      switch (status) {
        case 400:
          errorMessage = (error.response.data as any)?.message || 'Bad request: The server could not understand the request';
          break;
        case 401:
          errorMessage = 'Authentication required: Please log in again';
          break;
        case 403:
          errorMessage = 'Access denied: You don\'t have permission for this operation';
          break;
        case 404:
          errorMessage = 'Resource not found: The requested item doesn\'t exist';
          break;
        case 422:
          errorMessage = 'Validation error: Please check your input';
          break;
        case 429:
          errorMessage = 'Too many requests: Please try again later';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'Server error: We\'re experiencing technical difficulties';
          break;
        default:
          errorMessage = `Error ${status}: ${error.response.statusText}`;
      }
      
      // Log error details
      console.error(`API ERROR [${method}] ${url} - ${status}: ${errorMessage}`, error.response.data);
      
      // Show toast for critical errors, unless the error was explicitly silenced
      const shouldShowToast = !error.config?.headers?.['x-silent-error'];
      if (shouldShowToast && (status && status >= 500 || [401, 403, 429].includes(status || 0))) {
        toast.error(errorMessage);
      }
    }
    
    // Return a standardized error object for easier handling
    const enhancedError = {
      ...error,
      isApiError: true,
      apiError: {
        status: status || 0,
        message: errorMessage,
        details: error.response?.data
      } as ApiError
    };
    
    return Promise.reject(enhancedError);
  }
);

// Helper functions for pagination and caching
const getPaginatedRequestParams = (page: number, limit: number, filters?: Record<string, any>) => {
  return {
    page,
    limit,
    ...filters
  };
};

// Enhanced API client with caching, pagination, and all HTTP methods
const enhancedApiClient = {
  ...apiClient,
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const cacheKey = `${url}${JSON.stringify(config?.params || {})}`;
    const cachedData = getCachedData<T>(cacheKey);
    
    // Return cached data if available and cache is not explicitly disabled
    if (cachedData && config?.headers?.['x-disable-cache'] !== 'true') {
      return Promise.resolve({ 
        data: cachedData, 
        status: 200, 
        statusText: 'OK (Cached)', 
        headers: {}, 
        config: config || {},
      } as AxiosResponse<T>);
    }
    
    // Otherwise make the API call
    return apiClient.get<T>(url, config);
  },
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, data, config);
  },
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(url, data, config);
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config);
  },
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.patch<T>(url, data, config);
  },
  // Pagination helper methods
  getPaginated: async <T>(url: string, page: number = 1, limit: number = 20, filters?: Record<string, any>): Promise<PaginatedResponse<T>> => {
    const params = getPaginatedRequestParams(page, limit, filters);
    const { data } = await apiClient.get<PaginatedResponse<T>>(url, { params });
    return data;
  },
  // Silent error methods (won't show toasts)
  silentGet: async <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const silentConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'x-silent-error': 'true'
      }
    };
    return apiClient.get<T>(url, silentConfig);
  },
  // Retry API call with exponential backoff
  retryGet: async <T>(url: string, config?: AxiosRequestConfig, maxRetries: number = 3): Promise<AxiosResponse<T>> => {
    let retries = 0;
    
    const executeWithRetry = async (): Promise<AxiosResponse<T>> => {
      try {
        return await apiClient.get<T>(url, config);
      } catch (error) {
        if (retries < maxRetries && (!axios.isAxiosError(error) || !error.response)) {
          retries++;
          const delay = Math.pow(2, retries) * 1000; // Exponential backoff
          console.log(`Retrying request (${retries}/${maxRetries}) after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeWithRetry();
        }
        throw error;
      }
    };
    
    return executeWithRetry();
  }
};

export default enhancedApiClient;
