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
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Handle GET requests - List leads or get specific lead details
async function handleGet(req: NextApiRequest, res: NextApiResponse, bisonClient: any, workspace: any) {
  try {
    const { id, page = 1, limit = 20 } = req.query;

    // If ID is provided, get specific lead details
    if (id) {
      const response = await bisonClient.get(`/leads/${id}`);
      
      return res.status(200).json({
        data: response.data?.data || {},
        message: 'Lead details retrieved successfully'
      });
    } 
    
    // Otherwise, list all leads with pagination
    const response = await bisonClient.get('/leads', {
      params: {
        page,
        limit
      }
    });
    
    return res.status(200).json({
      data: response.data?.data || [],
      meta: response.data?.meta || {},
      message: 'Leads retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching Bison leads:', error);
    return res.status(error.response?.status || 500).json({ 
      error: 'API error', 
      message: error.response?.data?.message || 'Failed to fetch leads'
    });
  }
}

// Handle POST requests - Create a new lead
async function handlePost(req: NextApiRequest, res: NextApiResponse, bisonClient: any, workspace: any) {
  try {
    const {
      email,
      first_name,
      last_name,
      company,
      title,
      custom_variables,
    } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email is required'
      });
    }

    // Create the lead in Email Bison
    const response = await bisonClient.post('/leads', {
      email,
      first_name,
      last_name,
      company,
      title,
      ...(custom_variables && { custom_variables })
    });
    
    return res.status(201).json({
      data: response.data?.data || {},
      message: 'Lead created successfully'
    });
  } catch (error: any) {
    console.error('Error creating Bison lead:', error);
    return res.status(error.response?.status || 500).json({ 
      error: 'API error', 
      message: error.response?.data?.message || 'Failed to create lead'
    });
  }
}

// API endpoint for getting lead emails (sent, scheduled, etc.)
export async function getLeadEmails(req: NextApiRequest, res: NextApiResponse, bisonClient: any, leadId: string) {
  try {
    // Get lead emails
    const sentResponse = await bisonClient.get(`/leads/${leadId}/sent-emails`);
    const scheduledResponse = await bisonClient.get(`/leads/${leadId}/scheduled-emails`);
    
    return res.status(200).json({
      data: {
        sent: sentResponse.data?.data || [],
        scheduled: scheduledResponse.data?.data || []
      },
      message: 'Lead emails retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching lead emails:', error);
    return res.status(error.response?.status || 500).json({ 
      error: 'API error', 
      message: error.response?.data?.message || 'Failed to fetch lead emails'
    });
  }
}
