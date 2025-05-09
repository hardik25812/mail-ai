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

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGet(req, res, supabase);
    case 'POST':
      return handlePost(req, res, supabase);
    case 'PUT':
      return handlePut(req, res, supabase);
    case 'DELETE':
      return handleDelete(req, res, supabase);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Handle GET requests
async function handleGet(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Get workspace settings from the database
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('id, bison_workspace_id, bison_api_key')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      return res.status(500).json({ 
        error: 'Database error', 
        message: error.message 
      });
    }

    if (!workspace?.bison_api_key) {
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

    // Return workspace connection status
    return res.status(200).json({
      data: {
        bison_connected: !!workspace.bison_api_key,
        bison_workspace_id: workspace.bison_workspace_id
      }
    });
  } catch (error: any) {
    console.error('Error handling Bison GET request:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message || 'Something went wrong' 
    });
  }
}

// Handle POST requests
async function handlePost(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { api_key, workspace_id } = req.body;

    if (!api_key) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'API key is required'
      });
    }

    // Initialize the Bison API client to verify the API key
    const bisonClient = axios.create({
      baseURL: BISON_API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      }
    });

    // Verify the API key by making a simple request
    try {
      await bisonClient.get('/users');
    } catch (apiError: any) {
      return res.status(400).json({
        error: 'Invalid API key',
        message: 'Could not verify the Email Bison API key'
      });
    }

    // Get the user ID from the session
    const userId = session.user.id;

    // Update the workspace with the Bison API key
    const { data, error } = await supabase
      .from('workspaces')
      .update({
        bison_api_key: api_key,
        bison_workspace_id: workspace_id,
        bison_connected: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select('id, bison_workspace_id, bison_connected')
      .single();

    if (error) {
      return res.status(500).json({ 
        error: 'Database error', 
        message: error.message 
      });
    }

    return res.status(200).json({ 
      data,
      message: 'Email Bison connected successfully' 
    });
  } catch (error: any) {
    console.error('Error handling Bison POST request:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message || 'Something went wrong' 
    });
  }
}

// Handle PUT requests
async function handlePut(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  return res.status(501).json({ error: 'Not implemented' });
}

// Handle DELETE requests
async function handleDelete(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Get the user ID from the session
    const userId = session.user.id;

    // Update the workspace to remove Bison connection
    const { data, error } = await supabase
      .from('workspaces')
      .update({
        bison_api_key: null,
        bison_workspace_id: null,
        bison_connected: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select('id, bison_connected')
      .single();

    if (error) {
      return res.status(500).json({ 
        error: 'Database error', 
        message: error.message 
      });
    }

    return res.status(200).json({ 
      data,
      message: 'Email Bison disconnected successfully' 
    });
  } catch (error: any) {
    console.error('Error handling Bison DELETE request:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message || 'Something went wrong' 
    });
  }
}
