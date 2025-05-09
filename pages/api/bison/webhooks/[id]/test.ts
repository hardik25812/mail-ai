import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import axios from 'axios';

// Email Bison API base URL
const BISON_API_BASE_URL = 'https://sender.recruitron.io/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  try {
    const { id } = req.query;
    const { event_type } = req.body;

    if (!id || !event_type) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Webhook ID and event type are required'
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

    // Send test event to the webhook
    const response = await bisonClient.post(`/webhook-events/test`, {
      webhook_id: id,
      event_type: event_type
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
