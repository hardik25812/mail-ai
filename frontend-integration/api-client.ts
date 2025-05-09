import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor to include token in all requests
apiClient.interceptors.request.use((config) => {
  // Browser-only code
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('supabase.auth.token');
    if (session) {
      try {
        const { access_token } = JSON.parse(session);
        config.headers.Authorization = `Bearer ${access_token}`;
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    }
  }
  return config;
});

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
