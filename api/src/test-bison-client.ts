import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables with absolute path
const envPath = path.resolve(process.cwd(), '.env');
console.log('.env file exists:', fs.existsSync(envPath) ? 'YES' : 'NO');
console.log('.env file path:', envPath);

dotenv.config({ path: envPath });

const BISON_API_KEY = process.env.BISON_API_KEY;

// Check if we have the API key loaded
console.log("BISON_API_KEY available:", !!BISON_API_KEY);
console.log("BISON_API_KEY first 5 chars:", BISON_API_KEY?.substring(0, 5));
console.log("BISON_API_KEY length:", BISON_API_KEY?.length);

const client = axios.create({
  baseURL: 'https://sender.recruitron.io/api',
  headers: {
    Authorization: `Bearer ${BISON_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'MailAI/1.0'
  },
});

export async function fetchInboxes() {
  try {
    console.log("Attempting to fetch inboxes from Email Bison API...");
    // Try the correct endpoint based on API documentation
    const res = await client.get('/sender-emails');
    console.log("Success! Response data:", JSON.stringify(res.data, null, 2));
    return res.data;
  } catch (err: any) {
    console.error("Bison API error:", err.response?.status, err.response?.statusText);
    console.error("Error details:", err.response?.data || err.message);
    
    // Try alternative endpoint
    try {
      console.log("Trying alternative endpoint /inboxes...");
      const altRes = await client.get('/inboxes');
      console.log("Alternative endpoint success! Response data:", JSON.stringify(altRes.data, null, 2));
      return altRes.data;
    } catch (altErr: any) {
      console.error("Alternative endpoint error:", altErr.response?.status, altErr.response?.statusText);
      console.error("Alternative error details:", altErr.response?.data || altErr.message);
      throw err;
    }
  }
}

export async function fetchWorkspaces() {
  try {
    console.log("Attempting to fetch workspaces from Email Bison API...");
    const res = await client.get('/workspaces');
    console.log("Success! Response data:", JSON.stringify(res.data, null, 2));
    return res.data;
  } catch (err: any) {
    console.error("Bison API error:", err.response?.status, err.response?.statusText);
    console.error("Error details:", err.response?.data || err.message);
    throw err;
  }
}

// Try to fetch account details to verify API key
export async function verifyApiKey() {
  try {
    console.log("Verifying API key with /users endpoint...");
    const res = await client.get('/users');
    console.log("API key valid! User details:", JSON.stringify(res.data, null, 2));
    return true;
  } catch (err: any) {
    console.error("API Key verification failed:", err.response?.status, err.response?.statusText);
    console.error("Error details:", err.response?.data || err.message);
    return false;
  }
}
