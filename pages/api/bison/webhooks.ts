import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import axios from 'axios';

// Email Bison API base URL
const BISON_API_BASE_URL = 'https://sender.recruitron.io/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Create authenticated Supabase client
  const supabase = createServerSupabaseClient({ req, res });
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be logged in to access this endpoint',
    });
  }

  // Get workspace settings from the database
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('id, bison_workspace_id, bison_api_key')
    .eq('user_id', session.user.id)
    .single();

  if (workspaceError || !workspace?.bison_api_key) {
    return res.status(400).json({
      error: 'Not configured',
      message: 'Email Bison API key not found. Please configure your workspace first.'
    });
  }

  // Initialize the Bison API client
  const bisonClient = axios.create({
    baseURL: BISON_API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${workspace.bison_api_key}`,
      'Content-Type': 'application/json',
    }
  });

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGet(req, res, bisonClient, workspace);
    case 'POST':
      return handlePost(req, res, bisonClient, workspace);
    case 'DELETE':
      return handleDelete(req, res, bisonClient, workspace);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Handle GET requests - List webhooks
async function handleGet(req: NextApiRequest, res: NextApiResponse, bisonClient: any, workspace: any) {
  try {
    // Get the list of webhooks from Email Bison
    const response = await bisonClient.get('/webhooks');
    
    return res.status(200).json({
      data: response.data?.data || [],
      message: 'Webhooks retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching Bison webhooks:', error);
    return res.status(error.response?.status || 500).json({ 
      error: 'API error', 
      message: error.response?.data?.message || 'Failed to fetch webhooks'
    });
  }
}

// Handle POST requests - Create a new webhook
async function handlePost(req: NextApiRequest, res: NextApiResponse, bisonClient: any, workspace: any) {
  try {
    const { url, events } = req.body;

    // Validate required fields
    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'URL and at least one event are required'
      });
    }

    // Create the webhook in Email Bison
    const response = await bisonClient.post('/webhooks', {
      url,
      events
    });
    
    return res.status(201).json({
      data: response.data?.data || {},
      message: 'Webhook created successfully'
    });
  } catch (error: any) {
    console.error('Error creating Bison webhook:', error);
    return res.status(error.response?.status || 500).json({ 
      error: 'API error', 
      message: error.response?.data?.message || 'Failed to create webhook'
    });
  }
}

// Handle DELETE requests - Remove a webhook
async function handleDelete(req: NextApiRequest, res: NextApiResponse, bisonClient: any, workspace: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Webhook ID is required'
      });
    }

    // Delete the webhook from Email Bison
    await bisonClient.delete(`/webhooks/${id}`);
    
    return res.status(200).json({
      message: 'Webhook removed successfully'
    });
  } catch (error: any) {
    console.error('Error removing Bison webhook:', error);
    return res.status(error.response?.status || 500).json({ 
      error: 'API error', 
      message: error.response?.data?.message || 'Failed to remove webhook'
    });
  }
}

// Test webhook endpoint
export async function testWebhook(req: NextApiRequest, res: NextApiResponse, bisonClient: any, webhookId: string, eventType: string) {
  try {
    // Send test event to the webhook
    const response = await bisonClient.post(`/webhook-events/test`, {
      webhook_id: webhookId,
      event_type: eventType
    });
    
    return res.status(200).json({
      data: response.data?.data || {},
      message: 'Test webhook triggered successfully'
    });
  } catch (error: any) {
    console.error('Error testing Bison webhook:', error);
    return res.status(error.response?.status || 500).json({ 
      error: 'API error', 
      message: error.response?.data?.message || 'Failed to test webhook'
    });
  }
}
