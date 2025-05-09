import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase-client';
import { EmailBisonClient } from '@/lib/email-bison';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient();
    
    // Initialize Email Bison client
    const emailBisonClient = new EmailBisonClient({
      apiUrl: process.env.EMAIL_BISON_API_URL || 'https://api.emailbison.com',
      apiKey: process.env.EMAIL_BISON_API_KEY || '',
    });

    // Fetch analytics data from Email Bison
    const bisonAnalytics = await emailBisonClient.getAnalytics();
    
    // Process email statistics
    const emailStats = {
      total: bisonAnalytics.emails.total || 0,
      received: bisonAnalytics.emails.received || 0,
      sent: bisonAnalytics.emails.sent || 0,
      auto_replied: bisonAnalytics.emails.auto_replied || 0,
      growth_percentage: bisonAnalytics.emails.growth_percentage || 0,
    };
    
    // Process response time statistics
    const responseTimeStats = {
      average_minutes: bisonAnalytics.response_time.average_minutes || 0,
      improvement_percentage: bisonAnalytics.response_time.improvement_percentage || 0,
    };
    
    // Process meeting statistics
    const meetingStats = {
      booked: bisonAnalytics.meetings.booked || 0,
      completed: bisonAnalytics.meetings.completed || 0,
      cancelled: bisonAnalytics.meetings.cancelled || 0,
      growth_percentage: bisonAnalytics.meetings.growth_percentage || 0,
    };
    
    // Store the imported analytics data in our database
    const timeRange = req.query.time_range || '30d';
    const currentDate = new Date().toISOString();
    
    // Store email stats
    const { error: emailStatsError } = await supabase
      .from('analytics_email_stats')
      .insert({
        time_range: timeRange,
        total: emailStats.total,
        received: emailStats.received,
        sent: emailStats.sent,
        auto_replied: emailStats.auto_replied,
        growth_percentage: emailStats.growth_percentage,
        created_at: currentDate,
      });
    
    if (emailStatsError) throw emailStatsError;
    
    // Store response time stats
    const { error: responseTimeError } = await supabase
      .from('analytics_response_time')
      .insert({
        time_range: timeRange,
        average_minutes: responseTimeStats.average_minutes,
        improvement_percentage: responseTimeStats.improvement_percentage,
        created_at: currentDate,
      });
    
    if (responseTimeError) throw responseTimeError;
    
    // Store meeting stats
    const { error: meetingStatsError } = await supabase
      .from('analytics_meetings')
      .insert({
        time_range: timeRange,
        booked: meetingStats.booked,
        completed: meetingStats.completed,
        cancelled: meetingStats.cancelled,
        growth_percentage: meetingStats.growth_percentage,
        created_at: currentDate,
      });
    
    if (meetingStatsError) throw meetingStatsError;
    
    // Return the imported analytics data
    return res.status(200).json({
      emailStats,
      responseTimeStats,
      meetingStats,
    });
  } catch (error) {
    console.error('Error importing analytics from Email Bison:', error);
    return res.status(500).json({ error: 'Failed to import analytics from Email Bison' });
  }
}
