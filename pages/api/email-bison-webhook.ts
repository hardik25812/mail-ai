import { NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Configure webhook logging
const ENABLE_FILE_LOGGING = true;
const LOG_DIR = path.join(process.cwd(), 'logs');

// Ensure log directory exists
if (ENABLE_FILE_LOGGING) {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create log directory:', err);
  }
}

// Types for the API request
interface WebhookRequest {
  event_type: string;
  timestamp: string;
  data: {
    email_id?: string;
    thread_id?: string;
    message_id?: string;
    subject?: string;
    body?: string;
    body_html?: string;
    sender?: string;
    recipient?: string;
    inbox_id?: string;
    [key: string]: any; // Allow for additional fields
  };
  [key: string]: any; // Allow for additional top-level fields
}

// Types for the API response
interface WebhookResponse {
  success: boolean;
  message: string;
  processed_at?: string;
  error?: string;
}

/**
 * Webhook endpoint for Email Bison events
 * This endpoint can receive various event types from Email Bison
 * and process them accordingly
 */
/**
 * Log webhook data to file for debugging
 */
function logWebhook(prefix: string, data: any) {
  console.log(`[WEBHOOK] ${prefix}:`, JSON.stringify(data, null, 2));
  
  if (ENABLE_FILE_LOGGING) {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const logFile = path.join(LOG_DIR, `webhook-${timestamp}-${prefix}.json`);
      fs.writeFileSync(logFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        data
      }, null, 2));
    } catch (err) {
      console.error('Failed to write webhook log:', err);
    }
  }
}

export default async function handler(
  req: any,
  res: NextApiResponse<WebhookResponse>
) {
  // Log all incoming requests
  logWebhook('request', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query
  });

  // Only allow POST method
  if (req.method !== 'POST') {
    const response = { success: false, message: 'Method not allowed' };
    logWebhook('error-method', response);
    return res.status(405).json(response);
  }

  // Validate webhook secret to ensure requests are coming from Email Bison
  const webhookSecret = req.headers['x-webhook-secret'] || req.headers['x-api-key'];
  // In production, only use environment variable - never hardcode secrets
  const configuredSecret = process.env.EMAIL_BISON_WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET_HERE';

  logWebhook('auth-check', {
    receivedSecret: webhookSecret ? '(secret provided)' : '(no secret)',
    configuredSecret: configuredSecret ? '(secret configured)' : '(no secret configured)',
    match: webhookSecret === configuredSecret,
    secretFromEnv: Boolean(process.env.EMAIL_BISON_WEBHOOK_SECRET),
    hardcodedSecretUsed: !process.env.EMAIL_BISON_WEBHOOK_SECRET
  });

  // IMPORTANT: For production, remove this condition and use proper secret validation
  const isDevMode = process.env.NODE_ENV === 'development';
  
  if (!isDevMode && (!webhookSecret || webhookSecret !== configuredSecret)) {
    const response = { 
      success: false, 
      message: 'Unauthorized: Invalid webhook secret',
      error: 'Authentication failed - webhook secret mismatch'
    };
    logWebhook('error-auth', response);
    return res.status(401).json(response);
  }
  
  // For development testing, log but allow through
  if (isDevMode && webhookSecret !== configuredSecret) {
    console.warn('⚠️ WARNING: Webhook secret mismatch but allowing access in development mode');
    logWebhook('dev-auth-bypass', {
      message: 'Bypassing auth in development mode',
      providedSecret: webhookSecret ? webhookSecret.substring(0, 8) + '...' : '(none)'
    });
  }

  try {
    // Parse webhook payload
    const payload = req.body as WebhookRequest;
    console.log(`Received Email Bison webhook event: ${payload.event_type}`);
    logWebhook(`event-${payload.event_type}`, payload);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process different event types
    switch (payload.event_type) {
      case 'email.received':
        // Handle new email received
        await handleNewEmail(supabase, payload);
        break;
        
      case 'email.sent':
        // Handle email sent confirmation
        await handleEmailSent(supabase, payload);
        break;
        
      case 'email.replied':
        // Handle email reply received
        await handleEmailReplied(supabase, payload);
        break;

      case 'email.opened':
        // Handle email opened tracking
        await handleEmailOpened(supabase, payload);
        break;

      default:
        console.warn(`Unhandled event type: ${payload.event_type}`);
        // Still return success to acknowledge receipt
        return res.status(200).json({
          success: true,
          message: `Received unhandled event type: ${payload.event_type}`,
          processed_at: new Date().toISOString()
        });
    }

    // Return success response
    const response = {
      success: true,
      message: `Processed ${payload.event_type} event`,
      processed_at: new Date().toISOString()
    };
    logWebhook('response-success', response);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error processing webhook:', error);
    const response = {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    logWebhook('error-processing', {
      error: error instanceof Error ? { 
        message: error.message, 
        stack: error.stack 
      } : error,
      response
    });
    return res.status(500).json(response);
  }
}

/**
 * Handle new email received event
 */
async function handleNewEmail(supabase: any, payload: WebhookRequest) {
  const { data } = payload;
  
  if (!data.inbox_id) {
    // Try to map the recipient to an inbox
    const { data: inboxes, error: inboxError } = await supabase
      .from('inboxes')
      .select('id, bison_inbox_id, email_address')
      .eq('email_address', data.recipient)
      .limit(1);
      
    if (inboxError || !inboxes || inboxes.length === 0) {
      throw new Error(`Could not find inbox for recipient: ${data.recipient}`);
    }
    
    data.inbox_id = inboxes[0].id;
  }
  
  // Save the new email to database
  const { error: emailError } = await supabase
    .from('emails')
    .insert({
      id: data.email_id || uuidv4(),
      inbox_id: data.inbox_id,
      message_id: data.message_id,
      thread_id: data.thread_id,
      subject: data.subject,
      body: data.body,
      body_html: data.body_html,
      sender: data.sender,
      recipient: data.recipient,
      status: 'new',
      is_inbound: true,
      received_at: payload.timestamp || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bison_email_id: data.email_id
    });

  if (emailError) {
    throw new Error(`Error saving email: ${emailError.message}`);
  }

  // Check if we should generate an auto-reply
  await checkForAutoReply(supabase, data.inbox_id || '', data.email_id || uuidv4());
}

/**
 * Handle email sent confirmation
 */
async function handleEmailSent(supabase: any, payload: WebhookRequest) {
  const { data } = payload;
  
  if (!data.email_id) {
    throw new Error('Missing email_id in payload');
  }
  
  // Update email status in database
  const { error: updateError } = await supabase
    .from('emails')
    .update({
      status: 'sent',
      updated_at: new Date().toISOString(),
    })
    .eq('bison_email_id', data.email_id);

  if (updateError) {
    throw new Error(`Error updating email status: ${updateError.message}`);
  }
}

/**
 * Handle email reply received
 */
async function handleEmailReplied(supabase: any, payload: WebhookRequest) {
  // Similar to handleNewEmail but set as a reply
  await handleNewEmail(supabase, payload);
  
  // Update the status to indicate it's a reply
  if (payload.data.thread_id) {
    // Update the status of the parent email
    const { error: updateError } = await supabase
      .from('emails')
      .update({
        status: 'replied',
        updated_at: new Date().toISOString(),
      })
      .eq('thread_id', payload.data.thread_id)
      .neq('id', payload.data.email_id);

    if (updateError) {
      console.error(`Error updating parent email status: ${updateError.message}`);
      // Continue despite error
    }
  }
}

/**
 * Handle email opened tracking
 */
async function handleEmailOpened(supabase: any, payload: WebhookRequest) {
  const { data } = payload;
  
  if (!data.email_id) {
    throw new Error('Missing email_id in payload');
  }
  
  // Update email status in database
  const { error: updateError } = await supabase
    .from('emails')
    .update({
      status: 'opened',
      opened_at: payload.timestamp || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('bison_email_id', data.email_id);

  if (updateError) {
    throw new Error(`Error updating email status: ${updateError.message}`);
  }
}

/**
 * Check if we should generate an auto-reply for this email
 */
async function checkForAutoReply(supabase: any, inboxId: string, emailId: string) {
  // Skip processing if we don't have a valid inbox ID
  if (!inboxId) {
    console.log('Skipping auto-reply check: No inbox ID provided');
    return;
  }
  try {
    // Fetch the inbox with workspace
    const { data: inbox, error: inboxError } = await supabase
      .from('inboxes')
      .select('*, workspace:workspaces(*, workspace_users:workspace_users(*, user:users(*, settings:settings(*))))')
      .eq('id', inboxId)
      .single();
      
    if (inboxError || !inbox) {
      throw new Error(`Could not find inbox: ${inboxError?.message}`);
    }
    
    // Check if any users have auto-reply enabled
    const workspaceUsers = inbox.workspace?.workspace_users || [];
    const usersWithAutoReply = workspaceUsers.filter(wu => 
      (wu.role === 'owner' || wu.role === 'admin') && 
      wu.user?.settings?.auto_reply === true
    );
    
    if (usersWithAutoReply.length === 0) {
      // No users have auto-reply enabled
      return;
    }
    
    // Get the first user with auto-reply enabled
    const user = usersWithAutoReply[0].user;
    
    // Create an AI reply job
    const { error: jobError } = await supabase
      .from('ai_reply_jobs')
      .insert({
        id: uuidv4(),
        email_id: emailId,
        user_id: user.id,
        status: 'pending',
        attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (jobError) {
      throw new Error(`Error creating AI reply job: ${jobError.message}`);
    }
    
    console.log(`Created auto-reply job for email ${emailId} and user ${user.id}`);
  } catch (error) {
    console.error('Error in checkForAutoReply:', error);
    // Non-critical, so just log error and continue
  }
}
