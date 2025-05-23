/**
 * API route for managing Email Bison webhook configuration
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseClient } from '../../lib/supabase-client';
import { createLogger } from '../../lib/logger';
import WebhookService from '../../lib/services/webhook-service';

const logger = createLogger('webhook-config-api');
const supabase = new SupabaseClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle GET requests (fetch configuration)
  if (req.method === 'GET') {
    try {
      const { workspace_id } = req.query;
      
      if (!workspace_id) {
        return res.status(400).json({ error: 'workspace_id is required' });
      }

      const result = await WebhookService.getWebhookConfig(workspace_id as string);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json({ error: result.message });
      }
    } catch (error) {
      logger.error('Error fetching webhook configuration', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Handle POST requests (create/update configuration)
  else if (req.method === 'POST') {
    try {
      const { workspace_id, bison_workspace_id, workspace_name, api_key } = req.body;
      
      // Validate required fields
      if (!workspace_id || !bison_workspace_id || !workspace_name || !api_key) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['workspace_id', 'bison_workspace_id', 'workspace_name', 'api_key']
        });
      }
      
      // Validate workspace_id format (must be a UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(workspace_id)) {
        return res.status(400).json({ error: 'workspace_id must be a valid UUID' });
      }
      
      // Validate API key format (minimum length)
      if (api_key.length < 32) {
        return res.status(400).json({ error: 'API key must be at least 32 characters long' });
      }
      
      // Configure the webhook
      const result = await WebhookService.configureWebhook(
        workspace_id,
        bison_workspace_id,
        workspace_name,
        api_key
      );
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json({ error: result.message });
      }
    } catch (error) {
      logger.error('Error configuring webhook', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Handle DELETE requests (disable configuration)
  else if (req.method === 'DELETE') {
    try {
      const { workspace_id, bison_workspace_id } = req.query;
      
      if (!workspace_id || !bison_workspace_id) {
        return res.status(400).json({ error: 'workspace_id and bison_workspace_id are required' });
      }
      
      // Disable the webhook configuration
      const { error } = await supabase.client
        .from('email_bison_workspaces')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('internal_workspace_id', workspace_id)
        .eq('bison_workspace_id', bison_workspace_id);
      
      if (error) {
        logger.error('Error disabling webhook configuration', { error });
        return res.status(500).json({ error: 'Failed to disable webhook configuration' });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Webhook configuration disabled successfully'
      });
    } catch (error) {
      logger.error('Error disabling webhook configuration', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Handle unsupported methods
  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
