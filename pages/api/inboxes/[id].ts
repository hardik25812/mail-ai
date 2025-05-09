import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../lib/database.types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get inbox ID from URL
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid inbox ID' });
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

  if (req.method === 'GET') {
    try {
      // Get inbox by ID
      const { data: inbox, error } = await supabase
        .from('inboxes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Inbox not found' });
        }
        throw new Error(`Error fetching inbox: ${error.message}`);
      }

      return res.status(200).json(inbox);
    } catch (error) {
      console.error('Error in get inbox endpoint:', error);
      return res.status(500).json({ error: 'Failed to fetch inbox' });
    }
  } else if (req.method === 'PUT') {
    try {
      // Get update data from request body
      const { name, active } = req.body;
      
      // Update inbox
      const { data: inbox, error } = await supabase
        .from('inboxes')
        .update({
          name: name,
          active: active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating inbox: ${error.message}`);
      }

      return res.status(200).json(inbox);
    } catch (error) {
      console.error('Error in update inbox endpoint:', error);
      return res.status(500).json({ error: 'Failed to update inbox' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Delete inbox (or mark as inactive)
      const { error } = await supabase
        .from('inboxes')
        .update({
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting inbox: ${error.message}`);
      }

      return res.status(200).json({ success: true, message: 'Inbox deactivated successfully' });
    } catch (error) {
      console.error('Error in delete inbox endpoint:', error);
      return res.status(500).json({ error: 'Failed to delete inbox' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
