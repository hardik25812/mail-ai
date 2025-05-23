/**
 * API route for retrieving Email Bison webhook events
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseClient } from '../../lib/supabase-client';
import { createLogger } from '../../lib/logger';

const logger = createLogger('webhook-events-api');
const supabase = new SupabaseClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract query parameters
    const { workspace_id, page = '1', limit = '25', event_type, lead_email, date_from, date_to } = req.query;
    
    if (!workspace_id) {
      return res.status(400).json({ error: 'workspace_id is required' });
    }

    // Calculate pagination range
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    // Start query builder
    let query = supabase.client
      .from('email_bison_events')
      .select('*', { count: 'exact' })
      .eq('workspace_id', workspace_id)
      .order('created_at', { ascending: false })
      .range(from, to);

    // Add filters if provided
    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    if (lead_email) {
      query = query.ilike('lead_email', `%${lead_email}%`);
    }
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching webhook events', { error });
      return res.status(500).json({ error: 'Failed to fetch webhook events' });
    }

    return res.status(200).json({
      data,
      total: count || 0,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    logger.error('Error in webhook events API', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
