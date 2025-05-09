import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../lib/database.types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Workspace ID is required' });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Handle GET request (fetch a single workspace)
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Workspace not found' });
        }
        throw new Error(`Error fetching workspace: ${error.message}`);
      }

      return res.status(200).json(data);
    }

    // Handle PUT request (update a workspace)
    if (req.method === 'PUT') {
      const updates = req.body;

      // Validate request body
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Invalid update data' });
      }

      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating workspace: ${error.message}`);
      }

      return res.status(200).json(data);
    }

    // Handle DELETE request
    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting workspace: ${error.message}`);
      }

      return res.status(204).end();
    }

    // Handle unsupported methods
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in workspace endpoint:', error);
    return res.status(500).json({ error: 'Failed to process workspace request' });
  }
}
