import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables with absolute path
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Ensure we're using the latest env variables by reading the file directly
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
let manualApiKey = '';

// Extract API key directly from the file
for (const line of envLines) {
  if (line.startsWith('BISON_API_KEY=')) {
    manualApiKey = line.replace('BISON_API_KEY=', '');
    break;
  }
}

// Email Bison API URL
const BISON_API_URL = process.env.BISON_API_URL || 'https://sender.recruitron.io';

// Use the directly extracted key to ensure we have the latest version
const BISON_API_KEY = manualApiKey || process.env.BISON_API_KEY;

if (!BISON_API_KEY) {
  console.error('BISON_API_KEY is not defined in environment variables');
}

// Log key details to help with diagnostics (masking most of the key for security)
const maskedKey = BISON_API_KEY ? 
  `${BISON_API_KEY.substring(0, 5)}...${BISON_API_KEY.substring(BISON_API_KEY.length - 5)}` : 'undefined';

console.log('Email Bison API URL:', BISON_API_URL);
console.log('Email Bison API Key (masked):', maskedKey);

// Create an API client for Email Bison API
const bisonApiClient: AxiosInstance = axios.create({
  baseURL: BISON_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Using standard Authorization Bearer token format based on API documentation
    'Authorization': `Bearer ${BISON_API_KEY}`
  },
  timeout: 10000, // 10 seconds timeout
});

// Response interceptor for error handling
bisonApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as any;
    
    // Create a standardized error object
    const enhancedError = {
      status: status || 500,
      message: data?.message || error.message || 'An unknown error occurred',
      details: data,
      originalError: error
    };
    
    console.error(`Bison API Error (${status}):`, enhancedError.message);
    
    return Promise.reject(enhancedError);
  }
);

export default bisonApiClient;
