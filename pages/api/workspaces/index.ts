import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../lib/database.types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Handle GET request (fetch all workspaces)
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching workspaces: ${error.message}`);
      }

      return res.status(200).json(data || []);
    }

    // Handle POST request (create a new workspace)
    if (req.method === 'POST') {
      const { name } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Name is required' });
      }

      const { data, error } = await supabase
        .from('workspaces')
        .insert([{ name, is_connected: false }])
        .select();

      if (error) {
        throw new Error(`Error creating workspace: ${error.message}`);
      }

      return res.status(201).json(data?.[0] || null);
    }
  } catch (error) {
    console.error('Error in workspaces endpoint:', error);
    return res.status(500).json({ error: 'Failed to process workspace request' });
  }
}
