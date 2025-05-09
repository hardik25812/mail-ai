import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../lib/database.types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Get query parameters
    const timeRange = req.query.time_range as string || '30d';
    const groupBy = req.query.group_by as 'day' | 'week' | 'month' || 'day';
    const workspaceId = req.query.workspace_id as string;
    
    // Validate workspace ID if provided
    if (workspaceId && typeof workspaceId !== 'string') {
      return res.status(400).json({ error: 'Invalid workspace ID format' });
    }
    
    // Array to store inbox IDs if filtering by workspace
    let inboxIds: string[] | null = null;
    
    // Calculate the start date based on time range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '12m':
        startDate.setMonth(now.getMonth() - 12);
        break;
      case '30d':
      default:
        startDate.setDate(now.getDate() - 30);
        break;
    }

    // Format dates for Supabase query
    const startDateStr = startDate.toISOString();
    const endDateStr = now.toISOString();

    // If filtering by workspace, get the inboxes first
    if (workspaceId) {
      const { data: inboxes, error: inboxError } = await supabase
        .from('inboxes')
        .select('id')
        .eq('workspace_id', workspaceId);
        
      if (inboxError) {
        throw new Error(`Error fetching workspace inboxes: ${inboxError.message}`);
      }
      
      if (!inboxes || inboxes.length === 0) {
        // No inboxes for this workspace, return empty data
        return res.status(200).json([]);
      }
      
      // Store inbox IDs for filtering emails
      inboxIds = inboxes.map(inbox => inbox.id);
    }
    
    // Build query for emails
    let emailsQuery = supabase
      .from('emails')
      .select('created_at, is_inbound, status, inbox_id')
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .order('created_at', { ascending: true });
      
    // Add workspace filter if provided
    if (workspaceId && inboxIds && inboxIds.length > 0) {
      emailsQuery = emailsQuery.in('inbox_id', inboxIds);
    }
    
    // Fetch all emails in the date range
    const { data: emails, error } = await emailsQuery;

    if (error) {
      throw new Error(`Error fetching emails: ${error.message}`);
    }

    // Group emails by date according to groupBy parameter
    const groupedData: Record<string, { received: number; replied: number; autoReplied: number }> = {};

    emails?.forEach(email => {
      let dateKey = '';
      const emailDate = new Date(email.created_at);
      
      // Format date key based on groupBy
      switch (groupBy) {
        case 'week':
          // Get the first day of the week (Sunday)
          const firstDayOfWeek = new Date(emailDate);
          const day = emailDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
          firstDayOfWeek.setDate(emailDate.getDate() - day);
          dateKey = firstDayOfWeek.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'month':
          dateKey = `${emailDate.getFullYear()}-${String(emailDate.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'day':
        default:
          dateKey = emailDate.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
      }

      // Initialize group if it doesn't exist
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = { received: 0, replied: 0, autoReplied: 0 };
      }

      // Count emails by type
      if (email.is_inbound) {
        groupedData[dateKey].received += 1;
      }
      
      if (email.status === 'replied') {
        groupedData[dateKey].autoReplied += 1;
      }
      
      if (!email.is_inbound && email.status !== 'draft') {
        groupedData[dateKey].replied += 1;
      }
    });

    // Convert to array format for charts
    const result = Object.entries(groupedData).map(([date, counts]) => {
      // Format the date label based on groupBy
      let name = date;
      if (groupBy === 'day') {
        // For daily, just show day of week (e.g., "Mon")
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayOfWeek = new Date(date).getDay();
        name = dayNames[dayOfWeek];
      } else if (groupBy === 'week') {
        // For weekly, show "Week of MM/DD"
        const weekDate = new Date(date);
        name = `Week of ${weekDate.getMonth() + 1}/${weekDate.getDate()}`;
      } else if (groupBy === 'month') {
        // For monthly, show "Jan", "Feb", etc.
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const [year, month] = date.split('-');
        name = `${monthNames[parseInt(month) - 1]} ${year}`;
      }

      return {
        name,
        received: counts.received,
        replied: counts.replied,
        autoReplied: counts.autoReplied,
      };
    });

    // Return the time series data
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in email activity endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch email activity data' });
  }
}
