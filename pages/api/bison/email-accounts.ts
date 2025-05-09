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

// Handle GET requests - List email accounts
async function handleGet(req: NextApiRequest, res: NextApiResponse, bisonClient: any, workspace: any) {
  try {
    // Get the list of email accounts from Email Bison
    const response = await bisonClient.get('/sender-emails');
    
    return res.status(200).json({
      data: response.data?.data || [],
      message: 'Email accounts retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching Bison email accounts:', error);
    return res.status(error.response?.status || 500).json({ 
      error: 'API error', 
      message: error.response?.data?.message || 'Failed to fetch email accounts'
    });
  }
}

// Handle POST requests - Connect a new email account
async function handlePost(req: NextApiRequest, res: NextApiResponse, bisonClient: any, workspace: any) {
  try {
    const {
      email,
      name,
      imap_host,
      imap_port,
      imap_username,
      imap_password,
      smtp_host,
      smtp_port,
      smtp_username,
      smtp_password
    } = req.body;

    // Validate required fields
    if (!email || !name || !smtp_host || !smtp_port || !smtp_username || !smtp_password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required email account fields'
      });
    }

    // Check if IMAP details are provided
    const hasImap = imap_host && imap_port && imap_username && imap_password;

    // Create the email account in Email Bison
    const payload = {
      email,
      name,
      smtp_host,
      smtp_port,
      smtp_username,
      smtp_password,
      ...(hasImap && {
        imap_host,
        imap_port,
        imap_username,
        imap_password
      })
    };

    const response = await bisonClient.post('/sender-emails', payload);
    
    return res.status(201).json({
      data: response.data?.data || {},
      message: 'Email account connected successfully'
    });
  } catch (error: any) {
    console.error('Error connecting Bison email account:', error);
    return res.status(error.response?.status || 500).json({ 
      error: 'API error', 
      message: error.response?.data?.message || 'Failed to connect email account'
    });
  }
}

// Handle DELETE requests - Remove an email account
async function handleDelete(req: NextApiRequest, res: NextApiResponse, bisonClient: any, workspace: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email account ID is required'
      });
    }

    // Delete the email account from Email Bison
    await bisonClient.delete(`/sender-emails/${id}`);
    
    return res.status(200).json({
      message: 'Email account removed successfully'
    });
  } catch (error: any) {
    console.error('Error removing Bison email account:', error);
    return res.status(error.response?.status || 500).json({ 
      error: 'API error', 
      message: error.response?.data?.message || 'Failed to remove email account'
    });
  }
}
