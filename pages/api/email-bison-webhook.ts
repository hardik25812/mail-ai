import { NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
  workspace_id?: string | number;
  workspace_name?: string;
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

  // Verify webhook signature to ensure requests are coming from Email Bison
  const bisonSignature = req.headers['x-bison-signature'] as string;
  const webhookSecret = process.env.BISON_WEBHOOK_SECRET || process.env.EMAIL_BISON_WEBHOOK_SECRET || '';
  const isDevMode = process.env.NODE_ENV === 'development';
  
  // Function to verify webhook signature using HMAC
  function verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
    try {
      // Create HMAC using the shared secret
      const hmac = crypto.createHmac('sha256', secret);
      // Update HMAC with the stringified payload
      hmac.update(JSON.stringify(payload));
      // Get the digest in hex format
      const calculatedSignature = hmac.digest('hex');
      // Compare the calculated signature with the one provided in the request
      return crypto.timingSafeEqual(
        Buffer.from(calculatedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }
  
  // Log authentication check details (without exposing secrets)
  logWebhook('auth-check', {
    receivedSignature: bisonSignature ? '(signature provided)' : '(no signature)',
    configuredSecret: webhookSecret ? '(secret configured)' : '(no secret configured)',
    secretFromEnv: Boolean(webhookSecret),
  });
  
  // Verify the signature in production mode
  if (!isDevMode && webhookSecret) {
    // If signature is missing or invalid, return 401 Unauthorized
    if (!bisonSignature || !verifyWebhookSignature(req.body, bisonSignature, webhookSecret)) {
      const response = { 
        success: false, 
        message: 'Unauthorized: Invalid webhook signature',
        error: 'Authentication failed - signature verification failed'
      };
      logWebhook('error-auth', response);
      return res.status(401).json(response);
    }
    
    // Log successful verification
    logWebhook('auth-success', {
      message: 'Webhook signature verified successfully'
    });
  } else if (isDevMode) {
    // For development testing, log but allow through
    console.warn('⚠️ WARNING: Running in development mode, bypassing signature verification');
    logWebhook('dev-auth-bypass', {
      message: 'Bypassing auth in development mode',
      signatureProvided: Boolean(bisonSignature)
    });
  }

  try {
    // Parse webhook payload - handle both flat and nested structures
    const payload = req.body;
    
    // Extract event type from either format (flat or nested)
    const eventType = payload.event_type || 
                    (payload.event && payload.event.type) || 
                    'unknown';
    
    // Normalize the payload to match our expected structure
    const normalizedPayload: WebhookRequest = {
      event_type: eventType,
      timestamp: payload.timestamp || new Date().toISOString(),
      data: payload.data || {},
      ...payload // Keep other fields
    };
    
    // If using the nested structure, add important fields to our normalized version
    if (payload.event) {
      normalizedPayload.workspace_id = payload.event.workspace_id;
      normalizedPayload.workspace_name = payload.event.workspace_name;
    }
    
    console.log(`Received Email Bison webhook event: ${eventType}`);
    logWebhook(`event-${eventType}`, normalizedPayload);

    // Initialize Supabase client if configured
    let supabase = null;
    const isDevMode = process.env.NODE_ENV === 'development';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        supabase = createClient(supabaseUrl, supabaseKey);
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        // In dev mode, we'll continue without Supabase
        if (!isDevMode) {
          throw new Error('Failed to initialize Supabase client');
        }
      }
    } else if (!isDevMode) {
      // Only throw in production mode
      throw new Error('Supabase credentials not configured');
    } else {
      console.warn('⚠️ WARNING: Supabase credentials not configured, running in mock mode');
    }

    // Process different event types
    switch (eventType) {
      case 'email.received':
      case 'EMAIL_RECEIVED':
        // Handle new email received
        if (supabase) {
          await handleNewEmail(supabase, normalizedPayload);
        } else {
          console.log('[DEV MODE] Would handle new email received:', normalizedPayload);
        }
        break;
        
      case 'email.sent':
      case 'EMAIL_SENT':
        // Handle email sent confirmation
        if (supabase) {
          await handleEmailSent(supabase, normalizedPayload);
        } else {
          console.log('[DEV MODE] Would handle email sent:', normalizedPayload);
          // Just log the event in development mode
          await logToWebhookEventsTable(normalizedPayload);
        }
        break;
        
      case 'email.replied':
      case 'EMAIL_REPLIED':
        // Handle email reply received
        if (supabase) {
          await handleEmailReplied(supabase, normalizedPayload);
        } else {
          console.log('[DEV MODE] Would handle email replied:', normalizedPayload);
        }
        break;

      case 'email.opened':
      case 'EMAIL_OPENED':
        // Handle email opened tracking
        if (supabase) {
          await handleEmailOpened(supabase, normalizedPayload);
        } else {
          console.log('[DEV MODE] Would handle email opened:', normalizedPayload);
        }
        break;

      default:
        console.warn(`Unhandled event type: ${eventType}`);
        // Still return success to acknowledge receipt
        return res.status(200).json({
          success: true,
          message: `Received unhandled event type: ${eventType}`,
          processed_at: new Date().toISOString()
        });
    }

    // Return success response
    const response = {
      success: true,
      message: `Processed ${eventType} event`,
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
 * Log webhook event to a simple file in development mode
 * This is used when Supabase is not available
 */
async function logToWebhookEventsTable(payload: WebhookRequest) {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'webhook-events.json');
    let events = [];
    
    // Read existing events if file exists
    if (fs.existsSync(logFile)) {
      try {
        const content = fs.readFileSync(logFile, 'utf8');
        events = JSON.parse(content);
      } catch (err) {
        console.error('Error reading events file:', err);
      }
    }
    
    // Add new event
    events.push({
      id: events.length + 1,
      event_type: payload.event_type,
      workspace_id: payload.workspace_id || null,
      created_at: new Date().toISOString(),
      event_data: payload
    });
    
    // Write back to file
    fs.writeFileSync(logFile, JSON.stringify(events, null, 2));
  } catch (err) {
    console.error('Error logging to webhook events file:', err);
  }
}

/**
 * Log Email Bison webhook event to the database
 */
async function logEmailBisonEvent(supabase: any, payload: WebhookRequest) {
  if (!supabase) {
    // Use file-based logging as fallback
    return logToWebhookEventsTable(payload);
  }
  
  try {
    // Extract key information from the payload
    const { data } = payload;
    const workspaceId = payload.workspace_id || 
                      (payload.event && payload.event.workspace_id) || 
                      null;
                      
    const emailData = data.scheduled_email || data;
    const leadData = data.lead || {};
                      
    // Insert event into email_bison_events table
    const { error } = await supabase
      .from('email_bison_events')
      .insert({
        event_type: payload.event_type,
        workspace_id: workspaceId,
        bison_workspace_id: Number(workspaceId) || null,
        campaign_id: data.campaign?.id || null,
        campaign_name: data.campaign?.name || null,
        lead_id: leadData.id || null,
        lead_email: leadData.email || null,
        lead_name: `${leadData.first_name || ''} ${leadData.last_name || ''}`.trim() || null,
        email_subject: emailData.email_subject || null,
        email_status: emailData.status || null,
        sender_email: data.sender_email?.email || null,
        sender_name: data.sender_email?.name || null,
        event_data: payload,
        processed: true,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging webhook event:', error);
    }
    
    // Also log the raw event for debugging purposes
    await supabase
      .from('email_bison_raw_events')
      .insert({
        event_type: payload.event_type,
        payload: payload,
        created_at: new Date().toISOString()
      });
      
  } catch (error) {
    console.error('Error in logEmailBisonEvent:', error);
    // Don't rethrow, as this is a non-critical operation
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
  
  if (!data.email_id && !data.scheduled_email?.id) {
    // Try to extract email_id from different payload formats
    const emailId = data.scheduled_email?.id || data.email_id;
    if (!emailId) {
      console.warn('Missing email_id in payload, creating mock record for development');
      // In development mode, we'll just log this
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEV MODE] Would update email status to sent for email:', data);
        return;
      } else {
        throw new Error('Missing email_id in payload');
      }
    }
  }
  
  // Get the email ID from either format
  const emailId = data.scheduled_email?.id || data.email_id;
  
  try {
    // Update email status in database
    const { error: updateError } = await supabase
      .from('emails')
      .update({
        status: 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('bison_email_id', emailId);

    if (updateError) {
      throw new Error(`Error updating email status: ${updateError.message}`);
    }
    
    // Also log the webhook event to our events table
    await logEmailBisonEvent(supabase, payload);
  } catch (error) {
    console.error('Error in handleEmailSent:', error);
    throw error;
  }
}

/**
 * Handle email opened tracking
 */
async function handleEmailOpened(supabase: any, payload: WebhookRequest) {
  const { data } = payload;
  
  // Get the email ID from either format
  const emailId = data.scheduled_email?.id || data.email_id;
  
  if (!emailId) {
    console.warn('Missing email_id in email opened payload');
    // In development mode, we'll just log this
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV MODE] Would record email opened for:', data);
      return;
    } else {
      throw new Error('Missing email_id in payload');
    }
  }
  
  try {
    // Update email status in database to indicate it was opened
    const { error: updateError } = await supabase
      .from('emails')
      .update({
        opened: true,
        opened_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('bison_email_id', emailId);

    if (updateError) {
      throw new Error(`Error updating email opened status: ${updateError.message}`);
    }
    
    // Log the webhook event
    await logEmailBisonEvent(supabase, payload);
  } catch (error) {
    console.error('Error in handleEmailOpened:', error);
    throw error;
  }
}

/**
 * Handle email replied event
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
      wu.user?.settings?.auto_reply_enabled === true
    );
    
    if (usersWithAutoReply.length === 0) {
      console.log('No users with auto-reply enabled for this inbox');
      return;
    }
    
    // TODO: Implement auto-reply logic with AI
    console.log('Would generate auto-reply for email', emailId, 'in inbox', inboxId);
    
    // This would call an AI endpoint or use OpenAI directly
    // For now, just log that we would do this
    return;
  } catch (error) {
    console.error('Error checking for auto-reply:', error);
    // Don't rethrow as this is a non-critical operation
  }
}
