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

    // Get time range and format from query params
    const timeRange = req.query.time_range as string || '30d';
    const format = req.query.format as 'csv' | 'json' || 'csv';
    
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

    // Fetch emails for the time period
    const { data: emails, error } = await supabase
      .from('emails')
      .select('created_at, subject, sender, recipient, status, is_inbound, is_sent')
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching emails: ${error.message}`);
    }

    // Prepare data for export
    const exportData = emails?.map(email => ({
      date: new Date(email.created_at).toISOString().split('T')[0],
      time: new Date(email.created_at).toISOString().split('T')[1].substring(0, 8),
      subject: email.subject,
      sender: email.sender,
      recipient: email.recipient,
      type: email.is_inbound ? 'Received' : (email.is_sent ? 'Sent' : 'Draft'),
      status: email.status
    })) || [];

    // Format data based on requested format
    if (format === 'json') {
      // Set response headers for JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="mail-ai-analytics-${timeRange}.json"`);
      
      // Return JSON data
      return res.status(200).json(exportData);
    } else {
      // Format as CSV
      const headers = ['Date', 'Time', 'Subject', 'Sender', 'Recipient', 'Type', 'Status'];
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      exportData.forEach(row => {
        // Escape fields that might contain commas
        const escapedRow = [
          row.date,
          row.time,
          `"${row.subject.replace(/"/g, '""')}"`, // Escape quotes in subject
          `"${row.sender.replace(/"/g, '""')}"`,
          `"${row.recipient.replace(/"/g, '""')}"`,
          row.type,
          row.status
        ];
        
        csvContent += escapedRow.join(',') + '\n';
      });
      
      // Set response headers for CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="mail-ai-analytics-${timeRange}.csv"`);
      
      // Return CSV data
      return res.status(200).send(csvContent);
    }
  } catch (error) {
    console.error('Error in analytics export endpoint:', error);
    return res.status(500).json({ error: 'Failed to export analytics data' });
  }
}
