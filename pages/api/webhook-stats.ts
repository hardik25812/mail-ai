/**
 * API route for retrieving Email Bison webhook statistics
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseClient } from '../../lib/supabase-client';
import { createLogger } from '../../lib/logger';

const logger = createLogger('webhook-stats-api');
const supabase = new SupabaseClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract query parameters
    const { workspace_id, date_from, date_to } = req.query;
    
    if (!workspace_id) {
      return res.status(400).json({ error: 'workspace_id is required' });
    }

    let query = supabase.client
      .from('email_bison_event_analytics')
      .select('*')
      .eq('workspace_id', workspace_id);

    if (date_from) {
      query = query.gte('event_date', date_from);
    }
    if (date_to) {
      query = query.lte('event_date', date_to);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching webhook stats', { error });
      return res.status(500).json({ error: 'Failed to fetch webhook statistics' });
    }

    // Process the data into a usable format
    const stats = {
      totalEvents: 0,
      eventsByType: {} as Record<string, number>,
      eventsByDate: {} as Record<string, { date: string; count: number; types: Record<string, number> }>
    };

    data.forEach((row) => {
      const eventType = row.event_type;
      const eventDate = row.event_date.substring(0, 10); // YYYY-MM-DD format
      const eventCount = row.event_count;

      // Update total count
      stats.totalEvents += eventCount;

      // Update counts by type
      stats.eventsByType[eventType] = (stats.eventsByType[eventType] || 0) + eventCount;

      // Update counts by date
      if (!stats.eventsByDate[eventDate]) {
        stats.eventsByDate[eventDate] = {
          date: eventDate,
          count: 0,
          types: {}
        };
      }
      stats.eventsByDate[eventDate].count += eventCount;
      stats.eventsByDate[eventDate].types[eventType] = (stats.eventsByDate[eventDate].types[eventType] || 0) + eventCount;
    });

    return res.status(200).json(stats);
  } catch (error) {
    logger.error('Error in webhook stats API', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
