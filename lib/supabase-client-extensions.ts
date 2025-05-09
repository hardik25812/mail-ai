/**
 * Supabase client extensions for RAG Dynamic Memory
 * Adds methods for managing past replies and memory-based prompting
 */

import { SupabaseClient } from './supabase-client';
import { createLogger } from './logger';

const logger = createLogger('supabase-memory');

/**
 * Interface for past replies
 */
export interface PastReply {
  id?: string;
  inbox_id: string;
  email_id: string;
  content: string;
  is_ai: boolean;
  created_at?: string;
}

/**
 * Extends the SupabaseClient with methods for RAG Dynamic Memory
 */
export class MemoryExtensions {
  private client: SupabaseClient;
  
  constructor(client: SupabaseClient) {
    this.client = client;
  }
  
  /**
   * Save a reply to the past_replies table
   */
  async savePastReply(reply: PastReply): Promise<PastReply> {
    try {
      logger.info(`Saving past reply for email ${reply.email_id} to database`);
      
      // Ensure created_at is set
      const replyWithTimestamp = {
        ...reply,
        created_at: reply.created_at || new Date().toISOString()
      };
      
      const { data, error } = await this.client.client
        .from('past_replies')
        .insert([replyWithTimestamp])
        .select()
        .single();
      
      if (error) {
        logger.error(`Error saving past reply for email ${reply.email_id}`, { error });
        throw new Error(`Failed to save past reply: ${error.message}`);
      }
      
      logger.info(`Saved past reply with ID ${data.id}`);
      return data;
    } catch (error) {
      logger.error(`Error in savePastReply for email ${reply.email_id}`, { error });
      throw error;
    }
  }
  
  /**
   * Get the latest past replies for an inbox
   * @param inboxId The inbox ID
   * @param limit Maximum number of replies to fetch (default: 5)
   */
  async getLatestPastReplies(inboxId: string, limit: number = 5): Promise<PastReply[]> {
    try {
      logger.info(`Fetching latest ${limit} past replies for inbox ${inboxId}`);
      
      const { data, error } = await this.client.client
        .from('past_replies')
        .select('*')
        .eq('inbox_id', inboxId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        logger.error(`Error fetching past replies for inbox ${inboxId}`, { error });
        throw new Error(`Failed to fetch past replies: ${error.message}`);
      }
      
      logger.info(`Fetched ${data.length} past replies for inbox ${inboxId}`);
      return data;
    } catch (error) {
      logger.error(`Error in getLatestPastReplies for inbox ${inboxId}`, { error });
      throw error;
    }
  }
  
  /**
   * Check if the past_replies table exists
   * This is useful for initialization checks
   */
  async checkPastRepliesTableExists(): Promise<boolean> {
    try {
      const { data, error } = await this.client.client
        .from('past_replies')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // PostgreSQL code for undefined_table
        logger.warn('past_replies table does not exist');
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error checking if past_replies table exists', { error });
      return false;
    }
  }
}

// Add the extension methods to the SupabaseClient prototype
export function extendSupabaseClient(client: SupabaseClient): SupabaseClient & { memory: MemoryExtensions } {
  const extendedClient = client as SupabaseClient & { memory: MemoryExtensions };
  extendedClient.memory = new MemoryExtensions(client);
  return extendedClient;
}
