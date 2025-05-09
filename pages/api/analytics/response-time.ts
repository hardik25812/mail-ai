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
        // No inboxes for this workspace, return zeros
        return res.status(200).json({
          average_minutes: 0,
          improvement_percentage: 0
        });
      }
      
      // Store inbox IDs for filtering emails
      inboxIds = inboxes.map(inbox => inbox.id);
    }
    
    // Build query for emails
    let threadsQuery = supabase
      .from('emails')
      .select('thread_id, created_at, is_inbound, status, inbox_id')
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .order('created_at', { ascending: true });
      
    // Add workspace filter if provided
    if (workspaceId && inboxIds && inboxIds.length > 0) {
      threadsQuery = threadsQuery.in('inbox_id', inboxIds);
    }
    
    // Fetch threads with their emails to calculate response times
    const { data: threads, error: threadsError } = await threadsQuery;

    if (threadsError) {
      throw new Error(`Error fetching threads: ${threadsError.message}`);
    }

    // Group emails by thread
    const threadMap: Record<string, { emails: any[] }> = {};
    
    threads?.forEach(email => {
      if (!threadMap[email.thread_id]) {
        threadMap[email.thread_id] = { emails: [] };
      }
      
      threadMap[email.thread_id].emails.push({
        created_at: email.created_at,
        is_inbound: email.is_inbound,
        status: email.status
      });
    });

    // Calculate response times for each thread
    let totalResponseTime = 0;
    let responseCount = 0;

    Object.values(threadMap).forEach(thread => {
      // Sort emails by creation time
      thread.emails.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      // Find pairs of inbound emails and their responses
      for (let i = 0; i < thread.emails.length - 1; i++) {
        const currentEmail = thread.emails[i];
        const nextEmail = thread.emails[i + 1];
        
        // If current is inbound and next is outbound (a reply)
        if (currentEmail.is_inbound && !nextEmail.is_inbound) {
          const inboundTime = new Date(currentEmail.created_at).getTime();
          const responseTime = new Date(nextEmail.created_at).getTime();
          
          // Calculate response time in minutes
          const responseTimeMinutes = (responseTime - inboundTime) / (1000 * 60);
          
          totalResponseTime += responseTimeMinutes;
          responseCount++;
        }
      }
    });

    // Calculate average response time
    const averageResponseTime = responseCount > 0 
      ? Math.round(totalResponseTime / responseCount) 
      : 0;

    // Build query for previous period data
    let previousQuery = supabase
      .from('emails')
      .select('thread_id, created_at, is_inbound, status, inbox_id')
      .gte('created_at', previousStartDateStr)
      .lt('created_at', startDateStr)
      .order('created_at', { ascending: true });
      
    // Add workspace filter if provided
    if (workspaceId && inboxIds && inboxIds.length > 0) {
      previousQuery = previousQuery.in('inbox_id', inboxIds);
    }
    
    // Fetch previous period data for comparison
    const { data: previousThreads, error: previousError } = await previousQuery;

    if (previousError) {
      throw new Error(`Error fetching previous threads: ${previousError.message}`);
    }

    // Calculate previous period response time
    const previousThreadMap: Record<string, { emails: any[] }> = {};
    
    previousThreads?.forEach(email => {
      if (!previousThreadMap[email.thread_id]) {
        previousThreadMap[email.thread_id] = { emails: [] };
      }
      
      previousThreadMap[email.thread_id].emails.push({
        created_at: email.created_at,
        is_inbound: email.is_inbound,
        status: email.status
      });
    });

    let previousTotalResponseTime = 0;
    let previousResponseCount = 0;

    Object.values(previousThreadMap).forEach(thread => {
      thread.emails.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      for (let i = 0; i < thread.emails.length - 1; i++) {
        const currentEmail = thread.emails[i];
        const nextEmail = thread.emails[i + 1];
        
        if (currentEmail.is_inbound && !nextEmail.is_inbound) {
          const inboundTime = new Date(currentEmail.created_at).getTime();
          const responseTime = new Date(nextEmail.created_at).getTime();
          const responseTimeMinutes = (responseTime - inboundTime) / (1000 * 60);
          
          previousTotalResponseTime += responseTimeMinutes;
          previousResponseCount++;
        }
      }
    });

    const previousAverageResponseTime = previousResponseCount > 0 
      ? Math.round(previousTotalResponseTime / previousResponseCount) 
      : 0;

    // Calculate improvement percentage
    let improvementPercentage = 0;
    if (previousAverageResponseTime > 0 && averageResponseTime > 0) {
      // Negative means improvement (less time to respond)
      improvementPercentage = ((previousAverageResponseTime - averageResponseTime) / previousAverageResponseTime) * 100;
    }

    // Return response time statistics
    return res.status(200).json({
      average_minutes: averageResponseTime,
      improvement_percentage: Math.round(improvementPercentage * 100) / 100 // Round to 2 decimal places
    });
  } catch (error) {
    console.error('Error in response time analytics endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch response time analytics' });
  }
}
