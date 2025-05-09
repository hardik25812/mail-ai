/**
 * Supabase client wrapper for database operations
 * Uses @supabase/supabase-js instead of Prisma as per project requirements
 */

import { createClient } from '@supabase/supabase-js';
import { createLogger } from './logger';

const logger = createLogger('supabase');

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

export class SupabaseClient {
  public client;
  
  constructor(config: Partial<SupabaseConfig> = {}) {
    const url = config.url || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = config.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!url || !serviceRoleKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }
    
    this.client = createClient(url, serviceRoleKey);
    logger.info('Supabase client initialized');
  }
  
  /**
   * Get a pending AI reply job
   * Uses a custom RPC function to simulate FOR UPDATE SKIP LOCKED behavior
   */
  async getPendingJob() {
    try {
      logger.info('Fetching pending AI reply job');
      
      // Using a direct query with limit 1 instead of a stored procedure
      // This approach is simpler but doesn't fully replicate the SKIP LOCKED behavior
      const { data, error } = await this.client
        .from('ai_reply_jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1);
      
      if (error) {
        logger.error('Error fetching pending job', { error });
        throw new Error(`Failed to fetch pending job: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        logger.info('No pending jobs found');
        return null;
      }
      
      // Mark this job as in-progress to prevent other workers from picking it up
      const jobId = data[0].id;
      const { error: updateError } = await this.client
        .from('ai_reply_jobs')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', jobId)
        .eq('status', 'pending'); // Only update if still in pending state
      
      if (updateError) {
        logger.error(`Error updating job ${jobId} status to processing`, { error: updateError });
        return null; // Another worker might have taken it
      }
      
      logger.info(`Fetched and locked pending job ${jobId}`);
      return data[0];
    } catch (error) {
      logger.error('Error in getPendingJob', { error });
      throw error;
    }
  }
  
  /**
   * Get an email by ID
   */
  async getEmail(emailId: string) {
    try {
      logger.info(`Fetching email ${emailId}`);
      
      const { data, error } = await this.client
        .from('emails')
        .select('*')
        .eq('id', emailId)
        .single();
      
      if (error) {
        logger.error(`Error fetching email ${emailId}`, { error });
        throw new Error(`Failed to fetch email: ${error.message}`);
      }
      
      if (!data) {
        logger.error(`Email ${emailId} not found`);
        throw new Error(`Email ${emailId} not found`);
      }
      
      logger.info(`Fetched email ${emailId}`);
      return data;
    } catch (error) {
      logger.error(`Error in getEmail for ${emailId}`, { error });
      throw error;
    }
  }
  
  /**
   * Get user settings
   */
  async getUserSettings(userId: string) {
    try {
      logger.info(`Fetching settings for user ${userId}`);
      
      const { data, error } = await this.client
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        logger.error(`Error fetching settings for user ${userId}`, { error });
        throw new Error(`Failed to fetch user settings: ${error.message}`);
      }
      
      if (!data) {
        logger.warn(`No settings found for user ${userId}, using defaults`);
        return {
          user_id: userId,
          tone: 'professional',
          auto_reply: false,
          signature: '',
        };
      }
      
      logger.info(`Fetched settings for user ${userId}`);
      return data;
    } catch (error) {
      logger.error(`Error in getUserSettings for ${userId}`, { error });
      throw error;
    }
  }
  
  /**
   * Save an AI response
   */
  async saveAIResponse(data: {
    email_id: string;
    user_id: string;
    content: string;
    summary?: string;
  }) {
    try {
      logger.info(`Saving AI response for email ${data.email_id}`);
      
      const { data: response, error } = await this.client
        .from('ai_responses')
        .insert([
          {
            email_id: data.email_id,
            user_id: data.user_id,
            content: data.content,
            summary: data.summary || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      
      if (error) {
        logger.error(`Error saving AI response for email ${data.email_id}`, { error });
        throw new Error(`Failed to save AI response: ${error.message}`);
      }
      
      logger.info(`Saved AI response for email ${data.email_id}`);
      return response;
    } catch (error) {
      logger.error(`Error in saveAIResponse for email ${data.email_id}`, { error });
      throw error;
    }
  }
  
  /**
   * Update AI reply job status
   */
  async updateJobStatus(
    jobId: string,
    status: 'completed' | 'failed' | 'processing',
    error?: string
  ) {
    try {
      logger.info(`Updating job ${jobId} status to ${status}`);
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };
      
      if (error) {
        updateData.last_error = error;
      }
      
      const { error: updateError } = await this.client
        .from('ai_reply_jobs')
        .update(updateData)
        .eq('id', jobId);
      
      if (updateError) {
        logger.error(`Error updating job ${jobId} status`, { error: updateError });
        throw new Error(`Failed to update job status: ${updateError.message}`);
      }
      
      logger.info(`Updated job ${jobId} status to ${status}`);
    } catch (error) {
      logger.error(`Error in updateJobStatus for ${jobId}`, { error });
      throw error;
    }
  }
  
  /**
   * Increment job attempt count
   */
  async incrementJobAttempt(jobId: string, error: string) {
    try {
      logger.info(`Incrementing attempt count for job ${jobId}`);
      
      // First get current attempt count
      const { data: job, error: fetchError } = await this.client
        .from('ai_reply_jobs')
        .select('attempts')
        .eq('id', jobId)
        .single();
      
      if (fetchError) {
        logger.error(`Error fetching job ${jobId}`, { error: fetchError });
        throw new Error(`Failed to fetch job: ${fetchError.message}`);
      }
      
      const attempts = (job?.attempts || 0) + 1;
      
      // Update the job
      const { error: updateError } = await this.client
        .from('ai_reply_jobs')
        .update({
          status: 'pending', // Reset to pending for retry
          attempts,
          last_error: error,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
      
      if (updateError) {
        logger.error(`Error incrementing attempt count for job ${jobId}`, { error: updateError });
        throw new Error(`Failed to increment job attempt: ${updateError.message}`);
      }
      
      logger.info(`Incremented attempt count for job ${jobId} to ${attempts}`);
      return attempts;
    } catch (error) {
      logger.error(`Error in incrementJobAttempt for ${jobId}`, { error });
      throw error;
    }
  }
  
  /**
   * Get an inbox by ID
   */
  async getInbox(inboxId: string) {
    try {
      logger.info(`Fetching inbox ${inboxId}`);
      
      const { data, error } = await this.client
        .from('inboxes')
        .select('*')
        .eq('id', inboxId)
        .single();
      
      if (error) {
        logger.error(`Error fetching inbox ${inboxId}`, { error });
        throw new Error(`Failed to fetch inbox: ${error.message}`);
      }
      
      if (!data) {
        logger.error(`Inbox ${inboxId} not found`);
        throw new Error(`Inbox ${inboxId} not found`);
      }
      
      logger.info(`Fetched inbox ${inboxId}`);
      return data;
    } catch (error) {
      logger.error(`Error in getInbox for ${inboxId}`, { error });
      throw error;
    }
  }
  
  /**
   * Update email status
   */
  async updateEmailStatus(emailId: string, status: string) {
    try {
      logger.info(`Updating email ${emailId} status to ${status}`);
      
      const { error } = await this.client
        .from('emails')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', emailId);
      
      if (error) {
        logger.error(`Error updating email ${emailId} status`, { error });
        throw new Error(`Failed to update email status: ${error.message}`);
      }
      
      logger.info(`Updated email ${emailId} status to ${status}`);
    } catch (error) {
      logger.error(`Error in updateEmailStatus for ${emailId}`, { error });
      throw error;
    }
  }
  
  /**
   * Get all connected inboxes
   * Optionally filter by workspace ID and include workspace API key
   * @param workspaceId Optional workspace ID to filter by
   * @param includeApiKey Whether to include the Bison API key in the result
   */
  async getConnectedInboxes(workspaceId?: string, includeApiKey: boolean = false) {
    try {
      logger.info('Fetching connected inboxes', { workspaceId });
      
      // First get the inboxes
      let query = this.client.from('inboxes').select('*');
      
      // Filter by connected status if the column exists
      const { data: inboxes, error: inboxError } = await query;
      
      if (inboxError) {
        logger.error('Error fetching inboxes', { error: inboxError });
        throw new Error(`Failed to fetch inboxes: ${inboxError.message}`);
      }
      
      // Filter connected inboxes
      const connectedInboxes = inboxes.filter(inbox => {
        return inbox.connected === undefined || inbox.connected === true;
      });
      
      // If we need workspace info, fetch it separately
      if (workspaceId || includeApiKey) {
        // Get the workspaces info
        const { data: workspaces, error: workspaceError } = await this.client
          .from('workspaces')
          .select('id, bison_api_key, bison_workspace_id')
          .in('id', connectedInboxes.map(inbox => inbox.workspace_id));
        
        if (workspaceError) {
          logger.error('Error fetching workspaces', { error: workspaceError });
          throw new Error(`Failed to fetch workspaces: ${workspaceError.message}`);
        }
        
        // Create a map for quick lookup
        const workspaceMap: Record<string, any> = {};
        workspaces.forEach(ws => {
          workspaceMap[ws.id] = ws;
        });
        
        // Enhance inbox objects with workspace data
        const enhancedInboxes = connectedInboxes.map(inbox => {
          const workspace = workspaceMap[inbox.workspace_id];
          
          if (workspace) {
            const result = {
              ...inbox,
              bison_workspace_id: workspace.bison_workspace_id
            };
            
            // Include API key if requested
            if (includeApiKey && workspace.bison_api_key) {
              result.bison_api_key = workspace.bison_api_key;
            }
            
            return result;
          }
          
          return inbox;
        });
        
        // Filter by workspace if needed
        const filteredInboxes = workspaceId 
          ? enhancedInboxes.filter(inbox => inbox.workspace_id === workspaceId)
          : enhancedInboxes;
        
        logger.info(`Fetched ${filteredInboxes.length} inboxes`);
        return filteredInboxes;
      }
      
      logger.info(`Fetched ${connectedInboxes.length} inboxes`);
      return connectedInboxes;
    } catch (error) {
      logger.error('Error in getConnectedInboxes', { error });
      throw error;
    }
  }
  
  /**
   * Save an email to the database
   */
  async saveEmail(email: {
    inbox_id: string;
    message_id: string;
    thread_id: string;
    subject: string;
    body: string;
    sender: string;
    recipient: string;
    status: string;
    is_inbound: boolean;
    received_at: string;
    created_at: string;
    updated_at: string;
  }) {
    try {
      logger.info(`Saving email ${email.message_id} to database`);
      
      const { data, error } = await this.client
        .from('emails')
        .insert([email])
        .select()
        .single();
      
      if (error) {
        logger.error(`Error saving email ${email.message_id}`, { error });
        throw new Error(`Failed to save email: ${error.message}`);
      }
      
      logger.info(`Saved email ${email.message_id} with ID ${data.id}`);
      return data;
    } catch (error) {
      logger.error(`Error in saveEmail for ${email.message_id}`, { error });
      throw error;
    }
  }
  
  /**
   * Create a job for an email
   */
  async createJob(job: {
    email_id: string;
    user_id: string;
    status: string;
    attempts: number;
    created_at: string;
    updated_at: string;
  }) {
    try {
      logger.info(`Creating job for email ${job.email_id}`);
      
      const { data, error } = await this.client
        .from('ai_reply_jobs')
        .insert([job])
        .select()
        .single();
      
      if (error) {
        logger.error(`Error creating job for email ${job.email_id}`, { error });
        throw new Error(`Failed to create job: ${error.message}`);
      }
      
      logger.info(`Created job ${data.id} for email ${job.email_id}`);
      return data;
    } catch (error) {
      logger.error(`Error in createJob for email ${job.email_id}`, { error });
      throw error;
    }
  }
}
