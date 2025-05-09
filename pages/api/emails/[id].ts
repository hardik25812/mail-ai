import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseClient } from '../../../lib/supabase-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get email ID from URL
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid email ID' });
  }

  // Initialize Supabase client
  const supabase = new SupabaseClient();

  if (req.method === 'GET') {
    try {
      // Get email by ID
      const { data: email, error } = await supabase.client
        .from('emails')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Email not found' });
        }
        throw new Error(`Error fetching email: ${error.message}`);
      }

      // If email is inbound and status is 'received', update to 'read'
      if (email.is_inbound && email.status === 'received') {
        await supabase.client
          .from('emails')
          .update({ status: 'read', updated_at: new Date().toISOString() })
          .eq('id', id);
          
        // Update the email object
        email.status = 'read';
      }

      // Get AI replies for this email
      const { data: aiReplies, error: aiReplyError } = await supabase.client
        .from('ai_responses')
        .select('*')
        .eq('email_id', id)
        .order('created_at', { ascending: false });

      if (aiReplyError) {
        console.error('Error fetching AI replies:', aiReplyError);
      }

      // Format email for frontend
      const formattedEmail = {
        ...email,
        aiReplies: aiReplies || []
      };

      return res.status(200).json(formattedEmail);
    } catch (error) {
      console.error('Error in get email endpoint:', error);
      return res.status(500).json({ error: 'Failed to fetch email' });
    }
  } else if (req.method === 'PUT') {
    try {
      // Get update data from request body
      const { status } = req.body;
      
      // Update email
      const { data: updatedEmail, error } = await supabase.client
        .from('emails')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating email: ${error.message}`);
      }

      return res.status(200).json(updatedEmail);
    } catch (error) {
      console.error('Error in update email endpoint:', error);
      return res.status(500).json({ error: 'Failed to update email' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Delete email (or mark as deleted)
      const { error } = await supabase.client
        .from('emails')
        .update({
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting email: ${error.message}`);
      }

      return res.status(200).json({ success: true, message: 'Email deleted successfully' });
    } catch (error) {
      console.error('Error in delete email endpoint:', error);
      return res.status(500).json({ error: 'Failed to delete email' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
