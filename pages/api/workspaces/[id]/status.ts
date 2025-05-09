import { NextApiRequest, NextApiResponse } from 'next';
import { createLogger } from '../../../../lib/logger';
import { SupabaseClient } from '../../../../lib/supabase-client';

const logger = createLogger('workspace-bison-status');

/**
 * Get the Email Bison connection status for a workspace
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get workspace ID from URL
    const { id } = req.query;
    
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid workspace ID' });
    }

    // Initialize Supabase client
    const supabase = new SupabaseClient();
    
    // Get the workspace
    const { data: workspace, error: workspaceError } = await supabase.client
      .from('workspaces')
      .select('id, name, bison_api_key, bison_workspace_id')
      .eq('id', id)
      .single();
    
    if (workspaceError || !workspace) {
      logger.error('Workspace not found', { id, error: workspaceError });
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Return the connection status
    return res.status(200).json({
      id: workspace.id,
      name: workspace.name,
      bison_workspace_id: workspace.bison_workspace_id,
      bison_workspace_name: workspace.bison_workspace_id ? 'Email Bison Workspace' : null,
      is_connected: !!workspace.bison_api_key && !!workspace.bison_workspace_id
    });
    
  } catch (error) {
    logger.error('Error getting workspace status', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
