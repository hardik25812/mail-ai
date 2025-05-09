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

    // Get time range from query params
    const timeRange = req.query.time_range as string || '30d';
    
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

    // For now, we'll return sample meeting data
    // In a real implementation, you would query your meetings table
    
    // Sample data based on time range
    let bookedMeetings = 0;
    let completedMeetings = 0;
    let cancelledMeetings = 0;
    let previousBookedMeetings = 0;
    
    // Generate realistic sample data based on time range
    switch (timeRange) {
      case '7d':
        bookedMeetings = 12;
        completedMeetings = 10;
        cancelledMeetings = 2;
        previousBookedMeetings = 10;
        break;
      case '90d':
        bookedMeetings = 85;
        completedMeetings = 72;
        cancelledMeetings = 13;
        previousBookedMeetings = 65;
        break;
      case '12m':
        bookedMeetings = 320;
        completedMeetings = 275;
        cancelledMeetings = 45;
        previousBookedMeetings = 240;
        break;
      case '30d':
      default:
        bookedMeetings = 42;
        completedMeetings = 35;
        cancelledMeetings = 7;
        previousBookedMeetings = 36;
        break;
    }

    // Calculate growth percentage
    const growthPercentage = ((bookedMeetings - previousBookedMeetings) / previousBookedMeetings) * 100;

    // Return meeting statistics
    return res.status(200).json({
      booked: bookedMeetings,
      completed: completedMeetings,
      cancelled: cancelledMeetings,
      growth_percentage: Math.round(growthPercentage * 100) / 100 // Round to 2 decimal places
    });
  } catch (error) {
    console.error('Error in meetings analytics endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch meeting analytics' });
  }
}
