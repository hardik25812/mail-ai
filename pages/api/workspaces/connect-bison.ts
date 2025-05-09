import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../lib/database.types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Extract request data
    const { workspaceId, apiKey } = req.body;

    // Validate request data
    if (!workspaceId || !apiKey) {
      return res.status(400).json({ 
        success: false,
        message: 'Workspace ID and API key are required' 
      });
    }

    if (typeof apiKey !== 'string' || apiKey.length < 32) {
      return res.status(400).json({ 
        success: false,
        message: 'API key is invalid' 
      });
    }

    // In a real implementation, this would call the Email Bison API
    // For now, we'll simulate a successful connection
    
    // Mock response data from Email Bison
    const bisonWorkspaceId = `bison-${Date.now()}`;
    const bisonWorkspaceName = "Email Bison Workspace";
    
    // Update the workspace with Bison information
    const { data, error } = await supabase
      .from('workspaces')
      .update({
        is_connected: true,
        bison_workspace_id: bisonWorkspaceId,
        bison_workspace_name: bisonWorkspaceName,
        updated_at: new Date().toISOString()
      })
      .eq('id', workspaceId)
      .select();

    if (error) {
      throw new Error(`Error updating workspace: ${error.message}`);
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Successfully connected to Email Bison',
      data: {
        is_connected: true,
        bison_workspace_id: bisonWorkspaceId,
        bison_workspace_name: bisonWorkspaceName
      }
    });
  } catch (error) {
    console.error('Error connecting to Email Bison:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to connect to Email Bison' 
    });
  }
}
