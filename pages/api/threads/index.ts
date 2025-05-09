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

  if (req.method === 'GET') {
    try {
      // Initialize Supabase client
      const supabase = new SupabaseClient();
      
      // Get query parameters
      const { inbox_id, page = '1', limit = '20' } = req.query;
      
      // Validate inbox_id
      if (!inbox_id) {
        return res.status(400).json({ error: 'inbox_id is required' });
      }

      // Parse pagination parameters
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      // Get all unique thread IDs for this inbox
      const { data: threadIds, error: threadIdsError } = await supabase.client
        .from('emails')
        .select('thread_id')
        .eq('inbox_id', inbox_id)
        .order('created_at', { ascending: false });

      if (threadIdsError) {
        throw new Error(`Error fetching thread IDs: ${threadIdsError.message}`);
      }

      // Get unique thread IDs
      const uniqueThreadIds = [...new Set(threadIds?.map(item => item.thread_id))];
      
      // Apply pagination to thread IDs
      const paginatedThreadIds = uniqueThreadIds.slice(offset, offset + limitNum);
      
      // For each thread ID, get the latest email and count
      const threads = await Promise.all(paginatedThreadIds.map(async (threadId) => {
        // Get latest email in thread
        const { data: latestEmails, error: latestError } = await supabase.client
          .from('emails')
          .select('*')
          .eq('thread_id', threadId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (latestError) {
          console.error(`Error fetching latest email for thread ${threadId}:`, latestError);
          return null;
        }

        if (!latestEmails || latestEmails.length === 0) {
          return null;
        }

        const latestEmail = latestEmails[0];

        // Count emails in thread
        const { count: messageCount, error: countError } = await supabase.client
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', threadId);

        if (countError) {
          console.error(`Error counting emails for thread ${threadId}:`, countError);
          return null;
        }

        // Count unique participants
        const { data: participants, error: participantsError } = await supabase.client
          .from('emails')
          .select('sender')
          .eq('thread_id', threadId);

        if (participantsError) {
          console.error(`Error fetching participants for thread ${threadId}:`, participantsError);
          return null;
        }

        const participantCount = new Set(participants?.map(p => p.sender)).size;

        // Check if thread has unread messages
        const { count: unreadCount, error: unreadError } = await supabase.client
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', threadId)
          .eq('status', 'received');

        if (unreadError) {
          console.error(`Error counting unread emails for thread ${threadId}:`, unreadError);
          return null;
        }

        // Extract sender name from email address
        let senderName = '';
        const nameMatch = latestEmail.sender.match(/^([^<]+)</);
        if (nameMatch && nameMatch[1]) {
          senderName = nameMatch[1].trim();
        } else {
          // If no name in format, use part before @ as name
          senderName = latestEmail.sender.split('@')[0];
        }

        return {
          id: threadId,
          subject: latestEmail.subject,
          preview: latestEmail.body.substring(0, 100) + (latestEmail.body.length > 100 ? '...' : ''),
          date: new Date(latestEmail.created_at).toLocaleString(),
          participant_count: participantCount,
          message_count: messageCount,
          last_message_at: latestEmail.created_at,
          has_unread: unreadCount > 0,
          latest_email: {
            ...latestEmail,
            senderName,
            senderEmail: latestEmail.sender.match(/<(.+)>/) ? latestEmail.sender.match(/<(.+)>/)[1] : latestEmail.sender,
          }
        };
      }));

      // Filter out null values (threads that had errors)
      const validThreads = threads.filter(thread => thread !== null);

      return res.status(200).json(validThreads);
    } catch (error) {
      console.error('Error in threads endpoint:', error);
      return res.status(500).json({ error: 'Failed to fetch threads' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
