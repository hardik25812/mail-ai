'use client';

import axios from 'axios';

// Create a special debug API client for direct testing
const debugApiClient = axios.create({
  baseURL: 'http://localhost:4001/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Don't use credentials for the debug client to avoid CORS issues
  withCredentials: false
});

// Simple direct API test function that can be called from any component
export async function testApiConnection() {
  try {
    console.log('Testing direct API connection to Email Bison API...');
    
    // Test inboxes endpoint
    const inboxesResponse = await debugApiClient.get('/inboxes');
    console.log('✅ Inboxes API test successful:', inboxesResponse.data);
    
    // Test workspaces endpoint
    const workspacesResponse = await debugApiClient.get('/workspaces');
    console.log('✅ Workspaces API test successful:', workspacesResponse.data);
    
    return {
      success: true,
      inboxes: inboxesResponse.data,
      workspaces: workspacesResponse.data
    };
  } catch (error: any) {
    console.error('❌ API test failed:', error.message);
    console.error('Error details:', error.response?.data || error);
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
}

// Helper to determine if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';

// Force disable mock data globally
if (isBrowser) {
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
  console.log('🔄 Mock data DISABLED via api-debug.ts');
}
