import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseClient } from '../../../lib/supabase-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Initialize Supabase client
      const supabase = new SupabaseClient();
      
      // Get query parameters
      const { inbox_id, page = '1', limit = '20', status } = req.query;
      
      // Validate inbox_id
      if (!inbox_id) {
        return res.status(400).json({ error: 'inbox_id is required' });
      }

      // Parse pagination parameters
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      // Build query
      let query = supabase.client
        .from('emails')
        .select('*')
        .eq('inbox_id', inbox_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);
      
      // Add status filter if provided
      if (status) {
        query = query.eq('status', status);
      }
      
      // Execute query
      const { data: emails, error, count } = await query;

      if (error) {
        throw new Error(`Error fetching emails: ${error.message}`);
      }

      // Format emails for frontend
      const formattedEmails = emails?.map(email => {
        // Extract sender name from email address
        let senderName = '';
        const nameMatch = email.sender.match(/^([^<]+)</);
        if (nameMatch && nameMatch[1]) {
          senderName = nameMatch[1].trim();
        } else {
          // If no name in format, use part before @ as name
          senderName = email.sender.split('@')[0];
        }

        return {
          ...email,
          senderName,
          senderEmail: email.sender.match(/<(.+)>/) ? email.sender.match(/<(.+)>/)[1] : email.sender,
          isUnread: email.status === 'received',
          hasAttachments: false, // You would check this from a separate attachments table
          labels: [] // You would fetch these from a separate labels table
        };
      });

      return res.status(200).json(formattedEmails);
    } catch (error) {
      console.error('Error in emails endpoint:', error);
      return res.status(500).json({ error: 'Failed to fetch emails' });
    }
  } else if (req.method === 'POST') {
    try {
      // Initialize Supabase client
      const supabase = new SupabaseClient();
      
      // Get email data from request body
      const { 
        inbox_id, 
        subject, 
        body, 
        body_html, 
        recipient, 
        cc = [], 
        bcc = [], 
        thread_id 
      } = req.body;
      
      // Validate required fields
      if (!inbox_id || !subject || !body || !recipient) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Get inbox details
      const { data: inbox, error: inboxError } = await supabase.client
        .from('inboxes')
        .select('email_address')
        .eq('id', inbox_id)
        .single();

      if (inboxError) {
        throw new Error(`Error fetching inbox: ${inboxError.message}`);
      }

      // Generate a unique message ID
      const messageId = `${Date.now()}.${Math.random().toString(36).substring(2)}@mail-ai.com`;
      
      // Create new email as draft
      const { data: email, error } = await supabase.client
        .from('emails')
        .insert([
          {
            inbox_id,
            message_id: messageId,
            thread_id: thread_id || messageId, // Use provided thread_id or create new one
            subject,
            body,
            body_html: body_html || null,
            sender: inbox.email_address,
            recipient,
            cc,
            bcc,
            status: 'draft',
            is_draft: true,
            is_sent: false,
            is_inbound: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating email: ${error.message}`);
      }

      return res.status(201).json(email);
    } catch (error) {
      console.error('Error in create email endpoint:', error);
      return res.status(500).json({ error: 'Failed to create email' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
