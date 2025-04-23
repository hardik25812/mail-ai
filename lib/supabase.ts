import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client with anonymous key for client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Client with service role key for admin operations (server-side only)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Helper function to get authenticated client for a user
export const getAuthenticatedClient = (accessToken: string) => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};
