/**
 * Email Bison Webhook Endpoint
 * Receives incoming webhooks from Email Bison and processes various event types
 * Supports events like EMAIL_SENT, EMAIL_OPENED, EMAIL_REPLIED, etc.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseClient } from '../lib/supabase-client';
import { createLogger } from '../lib/logger';
import { WebSocketServer } from '../lib/websocket-server';

const logger = createLogger('email-bison-webhook');
const supabase = new SupabaseClient();
const wsServer = WebSocketServer.getInstance();

// Define webhook payload types
interface EmailBisonWebhookPayload {
  event: {
    type: string;
    name: string;
    workspace_id: number;
    workspace_name: string;
  };
  data: {
    scheduled_email?: EmailBisonScheduledEmail;
    campaign_event?: EmailBisonCampaignEvent;
    lead?: EmailBisonLead;
    campaign?: EmailBisonCampaign;
    sender_email?: EmailBisonSenderEmail;
  };
}

interface EmailBisonScheduledEmail {
  id: number;
  lead_id: number;
  sequence_step_id: number;
  email_subject: string;
  email_body: string;
  status: string;
  scheduled_date_est: string;
  scheduled_date_local: string;
  local_timezone: string;
  sent_at: string;
  opens: number;
  replies: number;
  unique_opens: number;
  unique_replies: number;
  interested: null | boolean;
}

interface EmailBisonCampaignEvent {
  id: number;
  type: string;
  created_at_local: string;
  local_timezone: string;
  created_at: string;
}

interface EmailBisonLead {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  title: string;
  company: string;
  custom_variables: Array<{ name: string; value: string }>;
  emails_sent: number;
  opens: number;
  unique_opens: number;
  replies: number;
  unique_replies: number;
  bounces: number;
}

interface EmailBisonCampaign {
  id: number;
  name: string;
}

interface EmailBisonSenderEmail {
  id: number;
  name: string;
  email: string;
  status: string;
  type: string;
  daily_limit: number;
  emails_sent: number;
  replied: number;
  opened: number;
  unsubscribed: number;
  bounced: number;
  unique_replies: number;
  unique_opens: number;
  total_leads_contacted: number;
  interested: number;
  created_at: string;
  updated_at: string;
}

/**
 * Verify webhook signature to ensure the request is legitimate
 * @param req The incoming request
 * @param signature The signature from Email Bison
 * @returns Boolean indicating whether the signature is valid
 */
function verifyWebhookSignature(req: NextApiRequest, signature: string): boolean {
  // In a production environment, you would validate the signature using a shared secret
  // For this implementation, we'll just check that the signature exists
  // TODO: Implement proper signature verification with crypto
  return !!signature;
}

/**
 * Process EMAIL_SENT event
 */
async function processEmailSentEvent(payload: EmailBisonWebhookPayload) {
  const { scheduled_email, campaign, lead, sender_email } = payload.data;
  
  if (!scheduled_email || !campaign || !lead || !sender_email) {
    logger.error('Missing required data for EMAIL_SENT event');
    return false;
  }

  try {
    // Map workspace_id to our internal workspace_id
    const { data: workspaceMapping, error: mappingError } = await supabase.client
      .from('email_bison_workspaces')
      .select('internal_workspace_id')
      .eq('bison_workspace_id', payload.event.workspace_id)
      .single();

    if (mappingError) {
      logger.error('Error finding workspace mapping', { 
        error: mappingError, 
        bison_workspace_id: payload.event.workspace_id 
      });
      return false;
    }

    const workspaceId = workspaceMapping?.internal_workspace_id;

    // Store the email sending event in our database
    const { data, error } = await supabase.client
      .from('email_bison_events')
      .insert([
        {
          event_type: payload.event.type,
          workspace_id: workspaceId,
          bison_workspace_id: payload.event.workspace_id,
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          lead_id: lead.id,
          lead_email: lead.email,
          lead_name: `${lead.first_name} ${lead.last_name}`,
          email_subject: scheduled_email.email_subject,
          email_body: scheduled_email.email_body,
          email_status: scheduled_email.status,
          sender_email: sender_email.email,
          sender_name: sender_email.name,
          event_data: payload,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      logger.error('Error saving EMAIL_SENT event', { error });
      return false;
    }

    // Notify connected clients via WebSocket
    wsServer.broadcastToWorkspace(workspaceId, 'email_bison_event', {
      type: 'email_sent',
      eventId: data.id,
      campaignId: campaign.id,
      campaignName: campaign.name,
      leadEmail: lead.email,
      leadName: `${lead.first_name} ${lead.last_name}`,
      subject: scheduled_email.email_subject,
      timestamp: new Date().toISOString()
    });

    logger.info(`EMAIL_SENT event processed successfully: ${data.id}`);
    return true;
  } catch (error) {
    logger.error('Error processing EMAIL_SENT event', { error });
    return false;
  }
}

/**
 * Process EMAIL_OPENED event
 */
async function processEmailOpenedEvent(payload: EmailBisonWebhookPayload) {
  // Similar implementation as processEmailSentEvent, but for open events
  // Would track open analytics
  logger.info('Processing EMAIL_OPENED event');
  // Implementation details omitted for brevity
  return true;
}

/**
 * Process EMAIL_REPLIED event
 */
async function processEmailRepliedEvent(payload: EmailBisonWebhookPayload) {
  // Similar implementation as processEmailSentEvent, but for reply events
  // Would track reply analytics and possibly trigger additional workflows
  logger.info('Processing EMAIL_REPLIED event');
  // Implementation details omitted for brevity
  return true;
}

/**
 * Webhook request handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the incoming webhook
    logger.info('Received webhook from Email Bison', { 
      headers: req.headers,
      body: JSON.stringify(req.body).substring(0, 1000) // Limit log size
    });

    // 1. Verify webhook signature (security measure)
    const signature = req.headers['x-email-bison-signature'] as string;
    if (!verifyWebhookSignature(req, signature)) {
      logger.error('Invalid webhook signature', { signature });
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // 2. Parse and validate the webhook payload
    const payload = req.body as EmailBisonWebhookPayload;
    
    if (!payload.event || !payload.event.type || !payload.data) {
      logger.error('Invalid webhook payload structure', { payload });
      return res.status(400).json({ error: 'Invalid payload structure' });
    }

    // 3. Process different event types
    let success = false;
    switch (payload.event.type) {
      case 'EMAIL_SENT':
        success = await processEmailSentEvent(payload);
        break;
      case 'EMAIL_OPENED':
        success = await processEmailOpenedEvent(payload);
        break;
      case 'EMAIL_REPLIED':
        success = await processEmailRepliedEvent(payload);
        break;
      default:
        logger.warn(`Unhandled event type: ${payload.event.type}`);
        // Store the event anyway for future processing
        await supabase.client
          .from('email_bison_raw_events')
          .insert([{
            event_type: payload.event.type,
            event_data: payload,
            created_at: new Date().toISOString()
          }]);
        success = true;
    }

    // 4. Return appropriate response
    if (success) {
      return res.status(200).json({
        success: true,
        message: `Successfully processed ${payload.event.type} event`
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Failed to process ${payload.event.type} event`
      });
    }
  } catch (error) {
    logger.error('Error processing webhook', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
