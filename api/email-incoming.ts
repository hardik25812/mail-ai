/**
 * Email Bison Webhook Endpoint
 * Receives incoming emails from Email Bison and creates AI reply jobs
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseClient } from '../lib/supabase-client';
import { createLogger } from '../lib/logger';

const logger = createLogger('email-incoming-webhook');
const supabase = new SupabaseClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Received webhook from Email Bison');

    // Parse the webhook payload
    const {
      subject,
      body,
      body_html,
      sender,
      recipient,
      inbox_id,
      user_id,
      thread_id,
      message_id,
      campaign_id,
      cc,
      bcc,
    } = req.body;

    // Validate required fields
    if (!subject || !body || !sender || !inbox_id || !user_id || !message_id) {
      logger.error('Missing required fields in webhook payload', { payload: req.body });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    logger.info(`Processing email from ${sender} to inbox ${inbox_id}`);

    // 1. Save the incoming email to the emails table
    const { data: email, error: emailError } = await supabase.client
      .from('emails')
      .insert([
        {
          inbox_id,
          message_id,
          thread_id: thread_id || message_id, // Use message_id as thread_id if not provided
          subject,
          body,
          body_html: body_html || null,
          sender,
          recipient: recipient || '',
          cc: cc || [],
          bcc: bcc || [],
          status: 'received',
          is_draft: false,
          is_sent: false,
          is_inbound: true,
          received_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (emailError) {
      logger.error('Error saving email to database', { error: emailError });
      return res.status(500).json({ error: 'Failed to save email' });
    }

    logger.info(`Email saved with ID ${email.id}`);

    // 2. Create a new AI reply job
    const { data: job, error: jobError } = await supabase.client
      .from('ai_reply_jobs')
      .insert([
        {
          email_id: email.id,
          user_id,
          status: 'pending',
          attempts: 0,
          campaign_id: campaign_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (jobError) {
      logger.error('Error creating AI reply job', { error: jobError });
      return res.status(500).json({ error: 'Failed to create AI reply job' });
    }

    logger.info(`AI reply job created with ID ${job.id}`);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Email received and AI reply job created',
      email_id: email.id,
      job_id: job.id,
    });
  } catch (error) {
    logger.error('Error processing webhook', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
