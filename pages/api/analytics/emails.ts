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
    const workspaceId = req.query.workspace_id as string;
    
    // Validate workspace ID if provided
    if (workspaceId && typeof workspaceId !== 'string') {
      return res.status(400).json({ error: 'Invalid workspace ID format' });
    }
    
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

    // Get previous period for comparison
    const previousStartDate = new Date(startDate);
    if (timeRange === '12m') {
      previousStartDate.setMonth(previousStartDate.getMonth() - 12);
    } else {
      // For days-based ranges
      const days = parseInt(timeRange);
      previousStartDate.setDate(previousStartDate.getDate() - days);
    }
    const previousStartDateStr = previousStartDate.toISOString();

    // Build base query for workspace filtering
    let query = supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);
      
    // Add workspace filter if provided
    if (workspaceId) {
      // First get all inboxes for the workspace
      const { data: inboxes, error: inboxError } = await supabase
        .from('inboxes')
        .select('id')
        .eq('workspace_id', workspaceId);
        
      if (inboxError) {
        throw new Error(`Error fetching workspace inboxes: ${inboxError.message}`);
      }
      
      if (!inboxes || inboxes.length === 0) {
        // No inboxes for this workspace, return zeros
        return res.status(200).json({
          total: 0,
          received: 0,
          sent: 0,
          auto_replied: 0,
          growth_percentage: 0,
        });
      }
      
      // Get all inbox IDs
      const inboxIds = inboxes.map(inbox => inbox.id);
      
      // Add inbox filter to our query
      query = query.in('inbox_id', inboxIds);
    }
    
    // Query total emails in current period
    const { count: totalEmails, error: totalError } = await query;

    if (totalError) {
      throw new Error(`Error fetching total emails: ${totalError.message}`);
    }

    // Query received emails
    let receivedQuery = supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('is_inbound', true)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);
      
    // Add workspace filter if provided
    if (workspaceId && inboxIds) {
      receivedQuery = receivedQuery.in('inbox_id', inboxIds);
    }
    
    const { count: receivedEmails, error: receivedError } = await receivedQuery;

    if (receivedError) {
      throw new Error(`Error fetching received emails: ${receivedError.message}`);
    }

    // Query sent emails
    let sentQuery = supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('is_sent', true)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);
      
    // Add workspace filter if provided
    if (workspaceId && inboxIds) {
      sentQuery = sentQuery.in('inbox_id', inboxIds);
    }
    
    const { count: sentEmails, error: sentError } = await sentQuery;

    if (sentError) {
      throw new Error(`Error fetching sent emails: ${sentError.message}`);
    }

    // Query auto-replied emails
    let repliedQuery = supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'replied')
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);
      
    // Add workspace filter if provided
    if (workspaceId && inboxIds) {
      repliedQuery = repliedQuery.in('inbox_id', inboxIds);
    }
    
    const { count: autoRepliedEmails, error: autoRepliedError } = await repliedQuery;

    if (autoRepliedError) {
      throw new Error(`Error fetching auto-replied emails: ${autoRepliedError.message}`);
    }

    // Query total emails in previous period for growth calculation
    let previousQuery = supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousStartDateStr)
      .lt('created_at', startDateStr);
      
    // Add workspace filter if provided
    if (workspaceId && inboxIds) {
      previousQuery = previousQuery.in('inbox_id', inboxIds);
    }
    
    const { count: previousTotalEmails, error: previousError } = await previousQuery;

    if (previousError) {
      throw new Error(`Error fetching previous period emails: ${previousError.message}`);
    }

    // Calculate growth percentage
    let growthPercentage = 0;
    if (previousTotalEmails && previousTotalEmails > 0) {
      growthPercentage = ((totalEmails! - previousTotalEmails) / previousTotalEmails) * 100;
    }

    // Return email statistics
    return res.status(200).json({
      total: totalEmails || 0,
      received: receivedEmails || 0,
      sent: sentEmails || 0,
      auto_replied: autoRepliedEmails || 0,
      growth_percentage: Math.round(growthPercentage * 100) / 100, // Round to 2 decimal places
    });
  } catch (error) {
    console.error('Error in email analytics endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch email analytics' });
  }
}
