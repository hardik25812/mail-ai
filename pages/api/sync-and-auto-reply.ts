import { NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Types for the API response
interface ApiResponse {
  success: boolean;
  message: string;
  processed_emails?: number;
  auto_replies_sent?: number;
  error?: string;
}

// This endpoint doesn't require authentication as it's meant to be called
// by a cron job or Supabase Edge Function with a secret key
export default async function handler(
  req: any,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Check for API key authorization
  const apiKey = req.headers['x-api-key'];
  const configuredApiKey = process.env.SYNC_API_KEY;

  if (!apiKey || apiKey !== configuredApiKey) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Invalid or missing API key' 
    });
  }

  try {
    // 1. Sync emails from Email Bison API
    const syncedEmails = await syncEmailsFromBison();
    
    // 2. Find emails that need auto-replies
    const emailsNeedingReplies = await findEmailsNeedingReplies();
    
    // 3. Generate and send auto-replies
    const autoRepliesSent = await generateAndSendAutoReplies(emailsNeedingReplies);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Email sync and auto-reply process completed',
      processed_emails: syncedEmails.length,
      auto_replies_sent: autoRepliesSent,
    });
  } catch (error) {
    console.error('Error in sync-and-auto-reply endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Function to sync emails from Email Bison API
async function syncEmailsFromBison() {
  const emailBisonApiUrl = process.env.EMAIL_BISON_API_URL;
  const emailBisonApiKey = process.env.EMAIL_BISON_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!emailBisonApiUrl || !emailBisonApiKey) {
    throw new Error('Email Bison API URL or key not configured');
  }
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Get all active inboxes
  const { data: inboxes, error: inboxesError } = await supabase
    .from('inboxes')
    .select('*, workspace:workspaces(*)')
    .eq('active', true);
    
  if (inboxesError) {
    throw new Error(`Failed to fetch inboxes: ${inboxesError.message}`);
  }
  
  const syncedEmails = [];
  
  // For each inbox, fetch new emails
  for (const inbox of inboxes || []) {
    try {
      // Call Email Bison API to get new emails
      // This is a placeholder - adjust according to Email Bison's actual API
      const response = await axios.get(`${emailBisonApiUrl}/inbox/${inbox.bison_inbox_id}/emails`, {
        headers: {
          'Authorization': `Bearer ${emailBisonApiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          since: inbox.last_synced_at || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours if no sync
        }
      });
      
      const newEmails = response.data.emails || [];
      
      // Save new emails to database
      for (const emailData of newEmails) {
        const { data: email, error: emailError } = await supabase
          .from('emails')
          .insert({
            id: uuidv4(),
            inbox_id: inbox.id,
            message_id: emailData.message_id,
            thread_id: emailData.thread_id,
            subject: emailData.subject,
            body: emailData.body,
            body_html: emailData.body_html || null,
            sender: emailData.sender,
            recipient: emailData.recipient,
            status: 'new',
            is_inbound: true,
            received_at: new Date(emailData.received_at).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (emailError) {
          console.error(`Error saving email: ${emailError.message}`);
          continue;
        }
        
        syncedEmails.push(email);
      }
      
      // Update last synced timestamp
      const { error: updateError } = await supabase
        .from('inboxes')
        .update({ 
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', inbox.id);
      
      if (updateError) {
        console.error(`Error updating inbox last_synced_at: ${updateError.message}`);
      }
    } catch (error) {
      console.error(`Error syncing inbox ${inbox.id}:`, error);
      // Continue with next inbox
    }
  }
  
  return syncedEmails;
}

// Function to find emails that need auto-replies
async function findEmailsNeedingReplies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // This is a complex query that's not easily translated to Supabase's query builder
  // We'll use a simpler approach that may require some additional filtering in code
  
  // First, get all emails that are inbound and new
  const { data: emails, error: emailsError } = await supabase
    .from('emails')
    .select('*, inbox:inboxes(*, workspace:workspaces(*, workspace_users:workspace_users(*, user:users(*, settings:settings(*)))))')
    .eq('is_inbound', true)
    .eq('status', 'new');
  
  if (emailsError) {
    throw new Error(`Failed to fetch emails: ${emailsError.message}`);
  }
  
  // Next, get all emails that already have AI responses
  const { data: emailsWithResponses, error: responsesError } = await supabase
    .from('ai_responses')
    .select('email_id');
  
  if (responsesError) {
    throw new Error(`Failed to fetch AI responses: ${responsesError.message}`);
  }
  
  // Filter out emails that already have responses
  const emailIdsWithResponses = new Set(emailsWithResponses?.map(r => r.email_id) || []);
  
  // Filter emails that need replies (don't have responses and have users with auto_reply enabled)
  const emailsNeedingReplies = (emails || []).filter(email => {
    // Skip if already has a response
    if (emailIdsWithResponses.has(email.id)) {
      return false;
    }
    
    // Check if there are workspace users with auto_reply enabled
    const workspaceUsers = email.inbox?.workspace?.workspace_users || [];
    
    return workspaceUsers.some(wu => {
      return (
        (wu.role === 'owner' || wu.role === 'admin') &&
        wu.user?.settings?.auto_reply === true
      );
    });
  });
  
  return emailsNeedingReplies;
}

// Function to generate and send auto-replies
async function generateAndSendAutoReplies(emails) {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  let autoRepliesSent = 0;
  
  // For each email, generate and send a reply
  for (const email of emails) {
    try {
      // Get the first admin/owner user with auto_reply enabled
      const user = email.inbox.workspace.workspace_users[0]?.user;
      
      if (!user) {
        console.warn(`No eligible user found for email ${email.id}`);
        continue;
      }
      
      // Create a job in the AI reply queue instead of calling n8n
      const { data: job, error } = await supabase
        .from('ai_reply_jobs')
        .insert({
          id: uuidv4(),
          email_id: email.id,
          user_id: user.id,
          status: 'pending',
          attempts: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        throw new Error(`Failed to create AI reply job: ${error.message}`);
      }
      
      // Update email status
      const { error: updateError } = await supabase
        .from('emails')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', email.id);
      
      if (updateError) {
        console.error(`Error updating email status: ${updateError.message}`);
      }
      
      console.log(`Created AI reply job ${job[0].id} for email ${email.id}`);
      autoRepliesSent++;
    } catch (error) {
      console.error(`Error processing auto-reply for email ${email.id}:`, error);
      // Continue with next email
    }
  }
  
  return autoRepliesSent;
}
