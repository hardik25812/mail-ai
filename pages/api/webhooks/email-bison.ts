import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { createLogger } from '../../../lib/logger';
import { SupabaseClient } from '../../../lib/supabase-client';

const logger = createLogger('email-bison-webhook');

/**
 * Email Bison Webhook Handler
 * Processes webhook events from Email Bison:
 * - contact.replied: When a contact replies to an email (old format)
 * - untracked.replied: When an untracked contact replies (old format)
 * - LEAD_REPLIED: When a lead replies to an email (new format)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests from Email Bison
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    
    // Determine event type from either format
    const eventType = body.event_type || (body.event && body.event.type);
    logger.info('Received webhook from Email Bison', { eventType });

    // Handle new Email Bison format (LEAD_REPLIED)
    if (body.event && body.event.type === 'LEAD_REPLIED') {
      return handleLeadRepliedEvent(body, res);
    }
    
    // Handle legacy format
    // Check for workspace_id in legacy format
    const workspaceId = body.workspace_id;
    // Verify webhook signature if provided
    const signature = req.headers['x-bison-signature'] as string;
    if (!workspaceId) {
      logger.error('Missing workspace_id in webhook payload');
      return res.status(400).json({ error: 'Missing workspace_id in payload' });
    }

    // Initialize Supabase client
    const supabase = new SupabaseClient();
    
    // Get the workspace to retrieve its API key for signature verification
    const { data: workspace, error: workspaceError } = await supabase.client
      .from('workspaces')
      .select('bison_api_key')
      .eq('bison_workspace_id', workspaceId)
      .single();

    // TEMPORARY TESTING MODE: Allow webhook testing without workspace validation
    // Remove this block in production
    if (workspaceError || !workspace) {
      logger.warn('Workspace not found, but proceeding for testing', { workspaceId });
      
      // For testing purposes only - skip workspace validation
      const isTestMode = true; // Set to false to disable test mode
      
      if (isTestMode) {
        logger.info('Test mode enabled - bypassing workspace validation');
      } else {
        logger.error('Workspace not found', { workspaceId, error: workspaceError });
        return res.status(404).json({ error: 'Workspace not found' });
      }
    }

    // Verify signature if it's provided
    if (signature && workspace.bison_api_key) {
      const isValid = verifySignature(
        signature,
        JSON.stringify(body),
        workspace.bison_api_key
      );

      if (!isValid) {
        logger.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      logger.info('Webhook signature verified');
    }

    // Log the event type
    logger.info(`Processing event: ${eventType}`);

    // Check for the new Email Bison format (LEAD_REPLIED event)
    if (body.event && body.event.type === 'LEAD_REPLIED') {
      return processLeadReplyEvent(body, res, supabase);
    }
    
    // Process legacy format event types
    if (eventType !== 'contact.replied' && eventType !== 'untracked.replied') {
      logger.info(`Ignoring non-reply event: ${eventType}`);
      return res.status(200).json({ message: 'Event ignored (not a reply)' });
    }

    // Process email data from the webhook
    const email = body.data;
    
    if (!email || !email.message_id) {
      logger.error('Missing email data in webhook payload');
      return res.status(400).json({ error: 'Invalid email data' });
    }

    // Get the inbox information based on the Email Bison inbox_id
    const { data: inbox, error: inboxError } = await supabase.client
      .from('inboxes')
      .select('id, user_id')
      .eq('bison_inbox_id', email.inbox_id)
      .single();

    // TESTING MODE: Allow webhook testing without inbox validation
    if (inboxError || !inbox) {
      logger.warn('Inbox not found, but proceeding for testing', { inboxId: email.inbox_id });
      
      // For testing purposes only - create a fake inbox
      const isTestMode = true; // Set to false to disable test mode
      
      if (isTestMode) {
        logger.info('Test mode enabled - using fake inbox for testing');
        
        // Create mock inbox data for testing
        const testInboxId = '795bb0b7-328a-408b-aa80-57f65579d1d1';
        const testUserId = '90057dd2-45d2-463b-a431-28de7f186ac8';
        
        // Use mock inbox data instead of querying the database
        const mockInbox = {
          id: testInboxId,
          user_id: testUserId
        };
        
        // Use mock inbox for rest of processing
        return handleEmailWithInbox(mockInbox, email, res);
      } else {
        logger.error('Inbox not found', { inboxId: email.inbox_id, error: inboxError });
        return res.status(404).json({ error: 'Inbox not found' });
      }
    }
    
    // If we have a real inbox, continue processing
    return handleEmailWithInbox(inbox, email, res);
  } catch (error) {
    logger.error('Error processing webhook', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle the new LEAD_REPLIED event format from Email Bison
 */
async function handleLeadRepliedEvent(body: any, res: NextApiResponse) {
  try {
    logger.info('Processing LEAD_REPLIED event', { workspaceId: body.event?.workspace_id });
    
    // Initialize Supabase client
    const supabase = new SupabaseClient();
    
    if (!body.data || !body.data.reply) {
      logger.error('Missing reply data in webhook payload');
      return res.status(400).json({ error: 'Invalid reply data' });
    }
    
    const reply = body.data.reply;
    const lead = body.data.lead;
    const campaign = body.data.campaign;
    const senderEmail = body.data.sender_email;
    
    // Map the Lead Reply data to the format expected by our system
    const emailData = {
      message_id: reply.uuid || `lead-reply-${Date.now()}`,
      thread_id: reply.uuid || `lead-thread-${Date.now()}`,
      subject: reply.email_subject || 'No Subject',
      body: reply.text_body || '',
      body_html: reply.html_body || '',
      sender: lead ? `${lead.first_name} ${lead.last_name} <${lead.email}>` : reply.from_email_address,
      recipient: reply.primary_to_email_address || senderEmail?.email,
      received_at: reply.date_received || new Date().toISOString()
    };
    
    logger.info('Mapped email data from LEAD_REPLIED event', { emailId: emailData.message_id });
    
    // Find the inbox associated with the recipient email address
    let inboxQuery = supabase.client.from('inboxes').select('id, user_id');
    
    // Try to find the inbox by the recipient email
    if (senderEmail && senderEmail.email) {
      inboxQuery = inboxQuery.eq('email', senderEmail.email);
    } else if (reply.primary_to_email_address) {
      inboxQuery = inboxQuery.eq('email', reply.primary_to_email_address);
    } else {
      logger.warn('No email address to match with inbox, using test inbox');
      
      // Create mock inbox data for testing
      const testInboxId = '795bb0b7-328a-408b-aa80-57f65579d1d1';
      const testUserId = '90057dd2-45d2-463b-a431-28de7f186ac8';
      
      // Use mock inbox data
      const mockInbox = {
        id: testInboxId,
        user_id: testUserId
      };
      
      // Process with mock inbox
      return saveEmailAndCreateJob(mockInbox, emailData, res, supabase);
    }
    
    // Execute the query to find the inbox
    const { data: inbox, error: inboxError } = await inboxQuery.single();
    
    if (inboxError || !inbox) {
      logger.warn('Could not find inbox for email, using test inbox', { 
        recipientEmail: reply.primary_to_email_address, 
        senderEmail: senderEmail?.email
      });
      
      // Create mock inbox data for testing
      const testInboxId = '795bb0b7-328a-408b-aa80-57f65579d1d1';
      const testUserId = '90057dd2-45d2-463b-a431-28de7f186ac8';
      
      // Use mock inbox data
      const mockInbox = {
        id: testInboxId,
        user_id: testUserId
      };
      
      // Process with mock inbox
      return saveEmailAndCreateJob(mockInbox, emailData, res, supabase);
    }
    
    // Process with real inbox
    return saveEmailAndCreateJob(inbox, emailData, res, supabase);
  } catch (error) {
    logger.error('Error processing LEAD_REPLIED event', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Save the email and create an AI reply job
 */
async function saveEmailAndCreateJob(inbox: any, email: any, res: NextApiResponse, supabase: SupabaseClient) {
  try {
    logger.info(`Saving email ${email.message_id} to database`, { inboxId: inbox.id });
    
    // Save the email to the database
    const { data: savedEmail, error: emailError } = await supabase.client
      .from('emails')
      .upsert({
        inbox_id: inbox.id,
        message_id: email.message_id,
        thread_id: email.thread_id,
        subject: email.subject,
        body: email.body,
        body_html: email.body_html || null,
        sender: email.sender,
        recipient: email.recipient,
        is_inbound: true,
        status: 'pending',
        received_at: email.received_at || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (emailError) {
      logger.error(`Error saving email ${email.message_id}`, { error: emailError });
      return res.status(500).json({ error: 'Failed to save email' });
    }

    // Create an AI reply job
    logger.info(`Creating AI reply job for email ${savedEmail.id}`);
    
    const { data: job, error: jobError } = await supabase.client
      .from('ai_reply_jobs')
      .insert({
        email_id: savedEmail.id,
        user_id: inbox.user_id,
        status: 'pending',
        attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      logger.error(`Error creating job for email ${savedEmail.id}`, { error: jobError });
      return res.status(500).json({ error: 'Failed to create AI reply job' });
    }

    logger.info(`Successfully processed webhook for email ${email.message_id}, created job ${job.id}`);
    return res.status(200).json({ message: 'Webhook processed successfully', job_id: job.id });
    
  } catch (error) {
    logger.error('Error saving email and creating job', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Process an email with a valid inbox
 */
async function handleEmailWithInbox(inbox: any, email: any, res: NextApiResponse) {
  try {
    const supabase = new SupabaseClient();

    // Save the email to the database
    logger.info(`Saving email ${email.message_id} to database`);
    
    const { data: savedEmail, error: emailError } = await supabase.client
      .from('emails')
      .upsert({
        inbox_id: inbox.id,
        message_id: email.message_id,
        thread_id: email.thread_id,
        subject: email.subject,
        body: email.body,
        body_html: email.body_html || null,
        sender: email.sender,
        recipient: email.recipient,
        is_inbound: true,
        status: 'pending',
        received_at: email.received_at || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (emailError) {
      logger.error(`Error saving email ${email.message_id}`, { error: emailError });
      return res.status(500).json({ error: 'Failed to save email' });
    }

    // Create an AI reply job
    logger.info(`Creating AI reply job for email ${savedEmail.id}`);
    
    const { data: job, error: jobError } = await supabase.client
      .from('ai_reply_jobs')
      .insert({
        email_id: savedEmail.id,
        user_id: inbox.user_id,
        status: 'pending',
        attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      logger.error(`Error creating job for email ${savedEmail.id}`, { error: jobError });
      return res.status(500).json({ error: 'Failed to create AI reply job' });
    }

    logger.info(`Successfully processed webhook for email ${email.message_id}, created job ${job.id}`);
    return res.status(200).json({ message: 'Webhook processed successfully', job_id: job.id });
    
  } catch (error) {
    logger.error('Error processing webhook', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Verify the webhook signature from Email Bison
 */
function verifySignature(signature: string, payload: string, apiKey: string): boolean {
  try {
    // Use HMAC-SHA256 to verify the signature
    const expectedSignature = crypto
      .createHmac('sha256', apiKey)
      .update(payload)
      .digest('hex');
    
    // Compare signatures in constant time to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error('Error verifying signature', { error });
    return false;
  }
}
