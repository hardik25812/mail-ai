/**
 * Webhook Service
 * 
 * Handles Email Bison webhook events and provides methods for webhook management
 * Supports real-time notification via WebSocket for incoming webhook events
 */

import { SupabaseClient } from '../supabase-client';
import { createLogger } from '../logger';

// Service imports
import { WebSocketServer } from '../websocket-server';

const logger = createLogger('webhook-service');
const supabase = new SupabaseClient();
const wsServer = WebSocketServer.getInstance();

// Types for webhook payloads
export interface EmailBisonWebhookEvent {
  id: number;
  event_type: string;
  workspace_id: string;
  bison_workspace_id: number;
  campaign_id?: number;
  campaign_name?: string;
  lead_id?: number;
  lead_email?: string;
  lead_name?: string;
  email_subject?: string;
  email_status?: string;
  sender_email?: string;
  sender_name?: string;
  event_data: any;
  processed: boolean;
  processed_at: string;
  created_at: string;
}

export interface WebhookProcessorOptions {
  notifyRealtime?: boolean;
  storeRawEvent?: boolean;
}

const defaultOptions: WebhookProcessorOptions = {
  notifyRealtime: true,
  storeRawEvent: true
};

export const WebhookService = {
  /**
   * Get webhook events for a workspace with pagination
   */
  getWebhookEvents: async (
    workspaceId: string,
    page: number = 1,
    limit: number = 25,
    filters?: { event_type?: string; lead_email?: string; date_from?: string; date_to?: string }
  ): Promise<{ data: EmailBisonWebhookEvent[]; total: number }> => {
    try {
      // Calculate pagination range
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Start query builder
      let query = supabase.client
        .from('email_bison_events')
        .select('*', { count: 'exact' })
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .range(from, to);

      // Add filters if provided
      if (filters) {
        if (filters.event_type) {
          query = query.eq('event_type', filters.event_type);
        }
        if (filters.lead_email) {
          query = query.ilike('lead_email', `%${filters.lead_email}%`);
        }
        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from);
        }
        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to);
        }
      }

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        logger.error('Error fetching webhook events', { error });
        throw error;
      }

      return {
        data: data as EmailBisonWebhookEvent[],
        total: count || 0
      };
    } catch (error) {
      logger.error('Error in getWebhookEvents', { error });
      throw error;
    }
  },

  /**
   * Get webhook event statistics for a workspace
   */
  getWebhookStats: async (workspaceId: string, dateRange?: { from: string; to: string }) => {
    try {
      let query = supabase.client
        .from('email_bison_event_analytics')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (dateRange) {
        query = query.gte('event_date', dateRange.from).lte('event_date', dateRange.to);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching webhook stats', { error });
        throw error;
      }

      // Process the data into a usable format
      const stats = {
        totalEvents: 0,
        eventsByType: {} as Record<string, number>,
        eventsByDate: {} as Record<string, { date: string; count: number; types: Record<string, number> }>
      };

      data.forEach((row: any) => {
        const eventType = row.event_type;
        const eventDate = row.event_date.substring(0, 10); // YYYY-MM-DD format
        const eventCount = row.event_count;

        // Update total count
        stats.totalEvents += eventCount;

        // Update counts by type
        stats.eventsByType[eventType] = (stats.eventsByType[eventType] || 0) + eventCount;

        // Update counts by date
        if (!stats.eventsByDate[eventDate]) {
          stats.eventsByDate[eventDate] = {
            date: eventDate,
            count: 0,
            types: {}
          };
        }
        stats.eventsByDate[eventDate].count += eventCount;
        stats.eventsByDate[eventDate].types[eventType] = (stats.eventsByDate[eventDate].types[eventType] || 0) + eventCount;
      });

      return stats;
    } catch (error) {
      logger.error('Error in getWebhookStats', { error });
      throw error;
    }
  },

  /**
   * Process an incoming webhook payload
   */
  processWebhook: async (
    event: { type: string; name: string; workspace_id: number; workspace_name: string },
    data: any,
    options: WebhookProcessorOptions = defaultOptions
  ): Promise<boolean> => {
    try {
      logger.info(`Processing webhook: ${event.type}`, { workspaceId: event.workspace_id });

      // Find the internal workspace ID from the Email Bison workspace ID
      const { data: workspaceMapping, error: mappingError } = await supabase.client
        .from('email_bison_workspaces')
        .select('internal_workspace_id')
        .eq('bison_workspace_id', event.workspace_id)
        .single();

      if (mappingError) {
        logger.error('Error finding workspace mapping', {
          error: mappingError,
          bison_workspace_id: event.workspace_id
        });
        
        // Store the error
        await supabase.client.from('email_bison_webhook_errors').insert([{
          event_type: event.type,
          error_message: `Workspace mapping not found for Bison workspace ID: ${event.workspace_id}`,
          event_data: { event, data },
          created_at: new Date().toISOString()
        }]);
        
        return false;
      }

      const workspaceId = workspaceMapping?.internal_workspace_id;

      // Prepare the event record
      let eventRecord: any = {
        event_type: event.type,
        workspace_id: workspaceId,
        bison_workspace_id: event.workspace_id,
        event_data: { event, data },
        processed: true,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      // Extract specific fields based on event type
      if (event.type === 'EMAIL_SENT' && data.scheduled_email && data.campaign && data.lead && data.sender_email) {
        eventRecord = {
          ...eventRecord,
          campaign_id: data.campaign.id,
          campaign_name: data.campaign.name,
          lead_id: data.lead.id,
          lead_email: data.lead.email,
          lead_name: `${data.lead.first_name} ${data.lead.last_name}`,
          email_subject: data.scheduled_email.email_subject,
          email_body: data.scheduled_email.email_body,
          email_status: data.scheduled_email.status,
          sender_email: data.sender_email.email,
          sender_name: data.sender_email.name
        };
      } else if (event.type === 'EMAIL_OPENED' && data.scheduled_email && data.lead) {
        // Extract data for open events
        eventRecord = {
          ...eventRecord,
          lead_id: data.lead.id,
          lead_email: data.lead.email,
          lead_name: `${data.lead.first_name} ${data.lead.last_name}`,
          email_subject: data.scheduled_email.email_subject
        };
      } else if (event.type === 'EMAIL_REPLIED' && data.scheduled_email && data.lead) {
        // Extract data for reply events
        eventRecord = {
          ...eventRecord,
          lead_id: data.lead.id,
          lead_email: data.lead.email,
          lead_name: `${data.lead.first_name} ${data.lead.last_name}`,
          email_subject: data.scheduled_email.email_subject
        };
      }

      // Store the event in the database
      const { data: savedEvent, error: insertError } = await supabase.client
        .from('email_bison_events')
        .insert([eventRecord])
        .select()
        .single();

      if (insertError) {
        logger.error('Error saving webhook event', { error: insertError });
        return false;
      }

      // Update the last webhook received timestamp
      await supabase.client
        .from('email_bison_workspaces')
        .update({ last_webhook_received: new Date().toISOString() })
        .eq('bison_workspace_id', event.workspace_id);

      // Notify connected clients via WebSocket if requested
      if (options.notifyRealtime) {
        wsServer.broadcastToWorkspace(workspaceId, 'email_bison_event', {
          type: event.type.toLowerCase(),
          eventId: savedEvent.id,
          event: {
            ...eventRecord,
            id: savedEvent.id
          }
        });
      }

      logger.info(`Successfully processed ${event.type} webhook`, {
        eventId: savedEvent.id,
        workspaceId
      });

      return true;
    } catch (error) {
      logger.error('Error processing webhook', { error });

      // Store the error
      await supabase.client.from('email_bison_webhook_errors').insert([{
        event_type: event.type,
        error_message: error.message || 'Unknown error',
        event_data: { event, data },
        created_at: new Date().toISOString()
      }]);

      return false;
    }
  },

  /**
   * Configure webhook settings for a workspace
   */
  configureWebhook: async (
    workspaceId: string,
    bisonWorkspaceId: number,
    workspaceName: string,
    apiKey: string
  ): Promise<{ success: boolean; message: string; url?: string }> => {
    try {
      // Check if the workspace already exists
      const { data: existingWorkspace, error: queryError } = await supabase.client
        .from('email_bison_workspaces')
        .select('id')
        .eq('bison_workspace_id', bisonWorkspaceId)
        .eq('internal_workspace_id', workspaceId)
        .single();

      if (queryError && !queryError.message.includes('No rows found')) {
        logger.error('Error querying webhook configuration', { error: queryError });
        throw queryError;
      }

      if (existingWorkspace) {
        // Update existing configuration
        const { error: updateError } = await supabase.client
          .from('email_bison_workspaces')
          .update({
            workspace_name: workspaceName,
            api_key: apiKey, // In a production app, this should be encrypted
            active: true,
            updated_at: new Date().toISOString()
          })
          .eq('bison_workspace_id', bisonWorkspaceId)
          .eq('internal_workspace_id', workspaceId);

        if (updateError) {
          logger.error('Error updating webhook configuration', { error: updateError });
          throw updateError;
        }

        return {
          success: true,
          message: 'Webhook configuration updated successfully',
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook-bison`
        };
      } else {
        // Create new configuration
        const { error: insertError } = await supabase.client
          .from('email_bison_workspaces')
          .insert([
            {
              bison_workspace_id: bisonWorkspaceId,
              internal_workspace_id: workspaceId,
              workspace_name: workspaceName,
              api_key: apiKey, // In a production app, this should be encrypted
              active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (insertError) {
          logger.error('Error creating webhook configuration', { error: insertError });
          throw insertError;
        }

        return {
          success: true,
          message: 'Webhook configuration created successfully',
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook-bison`
        };
      }
    } catch (error) {
      logger.error('Error in configureWebhook', { error });
      return {
        success: false,
        message: `Failed to configure webhook: ${error.message}`
      };
    }
  },

  /**
   * Get webhook configuration for a workspace
   */
  getWebhookConfig: async (workspaceId: string): Promise<any> => {
    try {
      const { data, error } = await supabase.client
        .from('email_bison_workspaces')
        .select('*')
        .eq('internal_workspace_id', workspaceId);

      if (error) {
        logger.error('Error fetching webhook configuration', { error });
        throw error;
      }

      return {
        success: true,
        data: data.map(config => ({
          ...config,
          webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook-bison`
        }))
      };
    } catch (error) {
      logger.error('Error in getWebhookConfig', { error });
      return {
        success: false,
        message: `Failed to get webhook configuration: ${error.message}`
      };
    }
  },

  /**
   * Get webhook processing errors
   */
  getWebhookErrors: async (limit: number = 50): Promise<any> => {
    try {
      const { data, error } = await supabase.client
        .from('email_bison_webhook_errors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching webhook errors', { error });
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      logger.error('Error in getWebhookErrors', { error });
      return {
        success: false,
        message: `Failed to get webhook errors: ${error.message}`
      };
    }
  }
};

export default WebhookService;
