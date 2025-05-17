import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { SupabaseUser, SupabaseSession } from './types/api-types';

// Mock user data for development
const MOCK_USER: SupabaseUser = {
  id: 'user-1',
  email: 'john.doe@example.com',
  createdAt: '2025-01-01T10:00:00Z',
  updatedAt: '2025-01-01T10:00:00Z',
  name: 'John Doe',
  avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
};

// Create a single supabase client for the entire app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-supabase-url.com';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Wrapper around Supabase client with mock implementation for dev
const supabaseClient = {
  auth: {
    getSession: async (): Promise<{ data: { session: SupabaseSession | null }, error: any }> => {
      if (process.env.NODE_ENV === 'development') {
        // Return mock session in development
        const mockSession: SupabaseSession = {
          user: MOCK_USER,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: Date.now() + 3600000 // Expires in 1 hour
        };
        
        return { data: { session: mockSession }, error: null };
      }
      
      // In production, use real Supabase
      return await supabase.auth.getSession();
    },
    
    getUser: async (): Promise<{ data: { user: SupabaseUser | null }, error: any }> => {
      if (process.env.NODE_ENV === 'development') {
        // Return mock user in development
        return { data: { user: MOCK_USER }, error: null };
      }
      
      // In production, use real Supabase
      return await supabase.auth.getUser();
    },
    
    signIn: async (params: { email: string, password: string }): Promise<{ data: { session: SupabaseSession | null, user: SupabaseUser | null }, error: any }> => {
      if (process.env.NODE_ENV === 'development') {
        // Return mock session and user in development
        if (params.email && params.password) {
          const mockSession: SupabaseSession = {
            user: MOCK_USER,
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresAt: Date.now() + 3600000 // Expires in 1 hour
          };
          
          return { data: { session: mockSession, user: MOCK_USER }, error: null };
        } else {
          return { 
            data: { session: null, user: null }, 
            error: { message: 'Invalid login credentials' } 
          };
        }
      }
      
      // In production, use real Supabase
      return await supabase.auth.signInWithPassword(params);
    },
    
    signOut: async (): Promise<{ error: any }> => {
      if (process.env.NODE_ENV === 'development') {
        // Mock successful sign out in development
        return { error: null };
      }
      
      // In production, use real Supabase
      return await supabase.auth.signOut();
    }
  },
  
  // Mock methods to query Supabase tables
  from: (tableName: string) => {
    return {
      select: (columns: string = '*') => {
        return {
          eq: (column: string, value: any) => {
            return {
              // Mock implementation that returns data based on the table name
              async then(callback: (data: any) => void) {
                if (process.env.NODE_ENV === 'development') {
                  // Mock responses for different tables
                  switch (tableName) {
                    case 'workspaces':
                      callback({
                        data: [
                          {
                            id: 'ws-1',
                            name: 'Personal Workspace',
                            owner_id: 'user-1',
                            created_at: '2025-04-01T10:00:00Z',
                            updated_at: '2025-05-15T14:30:00Z'
                          },
                          {
                            id: 'ws-2',
                            name: 'Work Workspace',
                            owner_id: 'user-1',
                            created_at: '2025-04-10T15:20:00Z',
                            updated_at: '2025-05-10T09:45:00Z'
                          }
                        ],
                        error: null
                      });
                      break;
                      
                    case 'past_replies':
                      callback({
                        data: [
                          {
                            id: 'reply-hist-1',
                            inbox_id: 'inbox-1',
                            content: "Thank you for your email. I'll review this and get back to you shortly.",
                            created_at: '2025-05-10T14:30:00Z'
                          },
                          {
                            id: 'reply-hist-2',
                            inbox_id: 'inbox-1',
                            content: "I appreciate your message. Let me look into this matter and I'll respond with more information soon.",
                            created_at: '2025-05-12T09:45:00Z'
                          }
                        ],
                        error: null
                      });
                      break;
                      
                    default:
                      callback({ data: [], error: null });
                  }
                } else {
                  // In production, use real Supabase
                  try {
                    const { data, error } = await supabase
                      .from(tableName)
                      .select(columns)
                      .eq(column, value);
                    
                    callback({ data, error });
                  } catch (err) {
                    console.error(`Error querying ${tableName}:`, err);
                    callback({ data: null, error: err });
                  }
                }
              }
            };
          }
        };
      },
      
      insert: (data: any) => {
        return {
          // Mock implementation for insert
          async then(callback: (data: any) => void) {
            if (process.env.NODE_ENV === 'development') {
              // Simulate successful insert with mock data
              const mockInsertedData = {
                ...data,
                id: `mock-${Math.random().toString(36).substring(2, 15)}`,
                created_at: new Date().toISOString()
              };
              
              callback({ data: mockInsertedData, error: null });
            } else {
              // In production, use real Supabase
              try {
                const { data: insertedData, error } = await supabase
                  .from(tableName)
                  .insert(data)
                  .select();
                
                callback({ data: insertedData, error });
              } catch (err) {
                console.error(`Error inserting into ${tableName}:`, err);
                callback({ data: null, error: err });
              }
            }
          }
        };
      }
    };
  }
};

export default supabaseClient;
