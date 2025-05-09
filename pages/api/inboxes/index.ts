import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../lib/database.types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

      // Get query parameters for filtering
      const workspaceId = req.query.workspace_id as string;
      
      // Build query
      let query = supabase
        .from('inboxes')
        .select('*')
        .eq('active', true);
        
      // Apply workspace filter if provided
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      
      // Execute query with ordering
      const { data: inboxes, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching inboxes: ${error.message}`);
      }

      return res.status(200).json(inboxes);
    } catch (error) {
      console.error('Error in inboxes endpoint:', error);
      return res.status(500).json({ error: 'Failed to fetch inboxes' });
    }
  } else if (req.method === 'POST') {
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
      
      // Get inbox data from request body
      const { name, email_address, workspace_id, bison_inbox_id } = req.body;
      
      // Validate required fields
      if (!name || !email_address || !workspace_id || !bison_inbox_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create new inbox
      const { data: inbox, error } = await supabase
        .from('inboxes')
        .insert([
          {
            name,
            email_address,
            workspace_id,
            bison_inbox_id,
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating inbox: ${error.message}`);
      }

      return res.status(201).json(inbox);
    } catch (error) {
      console.error('Error in create inbox endpoint:', error);
      return res.status(500).json({ error: 'Failed to create inbox' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
