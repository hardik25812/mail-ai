import { NextApiRequest, NextApiResponse } from 'next';
import { createLogger } from '../../../../lib/logger';
import { SupabaseClient } from '../../../../lib/supabase-client';
import { EmailBisonClient } from '../../../../lib/email-bison';
import axios from 'axios';

const logger = createLogger('connect-bison-workspace');

/**
 * Connect a workspace to Email Bison with the provided API key
 * Verifies the API key by making a GET /me request to Bison
 * Stores the API key and Bison workspace ID in the database
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get workspace ID from URL
    const { id } = req.query;
    
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid workspace ID' });
    }

    // Get API key from request body
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Initialize Supabase client
    const supabase = new SupabaseClient();
    
    // First, check if the workspace exists
    const { data: workspace, error: workspaceError } = await supabase.client
      .from('workspaces')
      .select('id')
      .eq('id', id)
      .single();
    
    if (workspaceError || !workspace) {
      logger.error('Workspace not found', { id, error: workspaceError });
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Validate the API key by fetching workspace info from Email Bison
    try {
      logger.info('Validating Bison API key by fetching workspace info');
      
      const bisonClient = new EmailBisonClient({ apiKey });
      const bisonWorkspace = await verifyBisonApiKey(bisonClient);

      if (!bisonWorkspace || !bisonWorkspace.id) {
        logger.error('Invalid Bison API key');
        return res.status(400).json({ error: 'Invalid Bison API key' });
      }

      // Update the workspace with the Bison API key and workspace ID
      const { error: updateError } = await supabase.client
        .from('workspaces')
        .update({
          bison_api_key: apiKey,
          bison_workspace_id: bisonWorkspace.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (updateError) {
        logger.error('Error updating workspace', { error: updateError });
        return res.status(500).json({ error: 'Failed to update workspace' });
      }

      // Register webhooks with Email Bison
      await registerBisonWebhooks(bisonClient);

      logger.info('Successfully connected workspace to Email Bison', { workspaceId: id, bisonWorkspaceId: bisonWorkspace.id });
      
      return res.status(200).json({
        message: 'Successfully connected to Email Bison',
        workspace_id: id,
        bison_workspace_id: bisonWorkspace.id,
        name: bisonWorkspace.name
      });
      
    } catch (error) {
      logger.error('Error validating Bison API key', { error });
      return res.status(400).json({ error: 'Invalid or expired Email Bison API key' });
    }
    
  } catch (error) {
    logger.error('Error connecting workspace to Bison', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Verify a Bison API key by making a GET /me request
 */
async function verifyBisonApiKey(bisonClient: EmailBisonClient): Promise<any> {
  const response = await axios.get(
    `${bisonClient.getApiUrl()}/me`, 
    {
      headers: {
        'Authorization': `Bearer ${bisonClient.getApiKey()}`
      }
    }
  );
  
  return response.data;
}

/**
 * Register webhooks with Email Bison
 */
async function registerBisonWebhooks(bisonClient: EmailBisonClient): Promise<void> {
  // Get the webhook URL
  const webhookUrl = process.env.PUBLIC_WEBHOOK_URL || 
    `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/webhooks/email-bison`;
  
  logger.info(`Registering webhooks with Email Bison: ${webhookUrl}`);
  
  try {
    // Register webhooks for reply events
    await axios.post(
      `${bisonClient.getApiUrl()}/webhooks`,
      {
        url: webhookUrl,
        events: ['contact.replied', 'untracked.replied'],
        active: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bisonClient.getApiKey()}`
        }
      }
    );
    
    logger.info('Successfully registered webhooks with Email Bison');
  } catch (error) {
    logger.error('Error registering webhooks with Email Bison', { error });
    throw error;
  }
}
