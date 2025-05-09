import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseClient } from '../../../lib/supabase-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get thread ID from URL
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid thread ID' });
  }

  if (req.method === 'GET') {
    try {
      // Initialize Supabase client
      const supabase = new SupabaseClient();
      
      // Get all emails in this thread
      const { data: emails, error } = await supabase.client
        .from('emails')
        .select('*')
        .eq('thread_id', id)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Error fetching thread emails: ${error.message}`);
      }

      if (!emails || emails.length === 0) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // Get AI replies for emails in this thread
      const emailIds = emails.map(email => email.id);
      const { data: aiReplies, error: aiReplyError } = await supabase.client
        .from('ai_responses')
        .select('*')
        .in('email_id', emailIds)
        .order('created_at', { ascending: true });

      if (aiReplyError) {
        console.error('Error fetching AI replies:', aiReplyError);
      }

      // Map AI replies to their respective emails
      const aiRepliesMap = (aiReplies || []).reduce((map, reply) => {
        if (!map[reply.email_id]) {
          map[reply.email_id] = [];
        }
        map[reply.email_id].push(reply);
        return map;
      }, {});

      // Format emails with AI replies
      const formattedEmails = emails.map(email => {
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
          labels: [], // You would fetch these from a separate labels table
          aiReplies: aiRepliesMap[email.id] || []
        };
      });

      // Create thread object
      const thread = {
        id,
        subject: emails[0].subject,
        participant_count: new Set(emails.map(email => email.sender)).size,
        message_count: emails.length,
        last_message_at: emails[emails.length - 1].created_at,
        emails: formattedEmails
      };

      // Mark unread emails as read
      const unreadEmailIds = emails
        .filter(email => email.is_inbound && email.status === 'received')
        .map(email => email.id);

      if (unreadEmailIds.length > 0) {
        await supabase.client
          .from('emails')
          .update({ status: 'read', updated_at: new Date().toISOString() })
          .in('id', unreadEmailIds);
      }

      return res.status(200).json(thread);
    } catch (error) {
      console.error('Error in get thread endpoint:', error);
      return res.status(500).json({ error: 'Failed to fetch thread' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
