/**
 * AI Reply Generator Worker with RAG Dynamic Memory
 * Processes pending jobs from the ai_reply_jobs table:
 * 1. Fetches job, email, and user settings
 * 2. Retrieves past replies from the same inbox for context
 * 3. Generates AI reply using OpenAI with memory-enhanced prompts
 * 4. Saves the reply and updates the memory database
 * 5. Sends via Email Bison and optionally notifies Slack
 */

import dotenv from 'dotenv';
import path from 'path';
import { createLogger } from '../lib/logger';
import { SupabaseClient } from '../lib/supabase-client';
import { extendSupabaseClient } from '../lib/supabase-client-extensions';
import { OpenAIClient } from '../lib/openai';
import { EmailBisonClient } from '../lib/email-bison';
import { SlackClient } from '../lib/slack';
import { buildReplyPrompt, buildSummaryPrompt } from '../lib/prompt-builder';
import { buildMemoryReplyPrompt } from '../lib/memory-prompt-builder';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

// Fallback to default .env if needed
dotenv.config();

// Make sure we can use NEXT_PUBLIC_SUPABASE_URL as a fallback for SUPABASE_URL
if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
}

console.log('Environment configuration loaded');
console.log('Supabase URL:', process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '(not found)');
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '(found)' : '(not found)');
console.log('Email Bison API Key:', process.env.EMAIL_BISON_API_KEY ? '(found)' : '(not found)');

// Initialize logger
const logger = createLogger('generate-ai-reply');

// Initialize clients
const supabaseBase = new SupabaseClient();
// Extend the Supabase client with memory capabilities
const supabase = extendSupabaseClient(supabaseBase);
const openai = new OpenAIClient();
const emailBison = new EmailBisonClient();
const slack = new SlackClient();

// Maximum retry attempts for processing a job
const MAX_RETRIES = 3;

// Exponential backoff delays in milliseconds (2s, 4s, 8s)
const BACKOFF_DELAYS = [2000, 4000, 8000];

// Sleep function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Process a single AI reply job with memory-enhanced prompting
 */
async function processJob(job: any): Promise<boolean> {
  const { id: jobId, email_id: emailId, user_id: userId, campaign_id: campaignId } = job;
  
  try {
    logger.info(`Processing job ${jobId} for email ${emailId} and user ${userId}`);
    
    // 1. Fetch the email
    const email = await supabase.getEmail(emailId);
    
    // 2. Fetch user settings
    const settings = await supabase.getUserSettings(userId);
    
    // 3. Fetch past replies for the inbox to use as examples
    logger.info(`Fetching past replies for inbox ${email.inbox_id}`);
    let pastReplies: Array<any> = [];
    try {
      pastReplies = await supabase.memory.getLatestPastReplies(email.inbox_id, 5);
      logger.info(`Retrieved ${pastReplies.length} past replies for context`);
    } catch (error: any) {
      logger.warn(`Could not fetch past replies, falling back to standard prompt: ${error.message}`);
    }
    
    // 4. Build the memory-enhanced prompt for OpenAI
    const prompt = buildMemoryReplyPrompt({ 
      email, 
      settings,
      pastReplies,
      additionalInstructions: campaignId ? `This email is part of campaign ${campaignId}. Consider the campaign context in your reply.` : undefined
    });
    
    // 5. Generate the AI reply
    logger.info(`Calling OpenAI to generate reply for email ${emailId}`);
    const reply = await openai.generateEmailReply(prompt);
    logger.info(`OpenAI reply generated successfully for email ${emailId}`);
    
    // 6. Save the AI response to the database
    let summary = '';
    if (settings.slack_url) {
      // Generate a summary for Slack if needed
      logger.info(`Generating summary for Slack notification for email ${emailId}`);
      const summaryPrompt = buildSummaryPrompt(email);
      summary = await openai.generateEmailSummary(summaryPrompt);
    }
    
    logger.info(`Saving AI response to database for email ${emailId}`);
    const aiResponse = await supabase.saveAIResponse({
      email_id: emailId,
      user_id: userId,
      content: reply,
      summary,
    });
    logger.info(`AI response saved with ID ${aiResponse.id}`);
    
    // 7. Save the reply to the past_replies table for future context
    try {
      logger.info(`Saving reply to past_replies for inbox ${email.inbox_id}`);
      await supabase.memory.savePastReply({
        inbox_id: email.inbox_id,
        email_id: emailId,
        content: reply,
        is_ai: true
      });
      logger.info(`Reply saved to past_replies successfully`);
    } catch (error: any) {
      logger.warn(`Failed to save reply to past_replies: ${error.message}`);
      // Continue execution even if saving to past_replies fails
    }
    
    // 6. Always send the reply via Email Bison
    try {
      logger.info(`Sending email via Email Bison for email ${emailId}`);
      
      // Get the inbox details for the email
      const inbox = await supabase.getInbox(email.inbox_id);
      
      if (!inbox) {
        throw new Error(`Inbox not found for email ${emailId}`);
      }
      
      // Format the subject as a reply
      let replySubject = email.subject;
      if (!replySubject.startsWith('Re:')) {
        replySubject = `Re: ${replySubject}`;
      }
      
      // Add signature if available
      const fullReplyContent = settings.signature 
        ? `${reply}\n\n${settings.signature}` 
        : reply;
      
      // Use the sendEmail method
      await emailBison.sendEmail({
        to: email.sender,
        subject: replySubject,
        body: fullReplyContent,
        inboxId: inbox.bison_inbox_id,
      });
      
      logger.info(`Reply sent successfully to ${email.sender} for email ${emailId}`);
      
      // Update the email status to replied
      await supabase.updateEmailStatus(emailId, 'replied');
    } catch (error) {
      logger.error(`Error sending reply for email ${emailId}`, { error });
      // Continue execution - we don't want to fail the job just because sending failed
    }
    
    // 7. Send Slack notification if configured
    if (settings.slack_url) {
      try {
        logger.info(`Sending Slack notification for email ${emailId}`);
        await slack.sendAIReplyNotification({
          webhookUrl: settings.slack_url,
          emailSubject: email.subject,
          emailSender: email.sender,
          replyPreview: reply,
          emailId,
          dashboardUrl: process.env.DASHBOARD_URL,
        });
        
        logger.info(`Slack notification sent successfully for email ${emailId}`);
      } catch (error) {
        logger.error(`Error sending Slack notification for email ${emailId}`, { error });
        // Continue execution - we don't want to fail the job just because notification failed
      }
    } else {
      logger.info(`No Slack URL configured for user ${userId}, skipping notification`);
    }
    
    // 8. Mark the job as completed
    logger.info(`Marking job ${jobId} as completed`);
    await supabase.updateJobStatus(jobId, 'completed');
    
    logger.info(`Job ${jobId} completed successfully`);
    return true;
  } catch (error) {
    logger.error(`Error processing job ${jobId}`, { error });
    
    // Increment attempt count
    const attempts = await supabase.incrementJobAttempt(
      jobId,
      error instanceof Error ? error.message : String(error)
    );
    
    // If max retries reached, mark as failed
    if (attempts >= MAX_RETRIES) {
      logger.error(`Job ${jobId} failed after ${attempts} attempts`);
      await supabase.updateJobStatus(
        jobId,
        'failed',
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
    
    // Otherwise, it will be retried on the next poll
    logger.warn(`Job ${jobId} will be retried (attempt ${attempts}/${MAX_RETRIES})`);
    return false;
  }
}

/**
 * Fetch new emails from Email Bison and create jobs for them
 */
async function checkEmailBisonForNewEmails() {
  try {
    logger.info('Checking Email Bison for new emails...');
    
    // Get all connected inboxes
    const inboxes = await supabase.getConnectedInboxes();
    
    if (!inboxes || inboxes.length === 0) {
      logger.info('No connected inboxes found, skipping Email Bison check');
      return;
    }
    
    logger.info(`Found ${inboxes.length} connected inboxes, checking for new emails`);
    
    // For each inbox, check for new emails
    for (const inbox of inboxes) {
      try {
        logger.info(`Checking for new emails in inbox ${inbox.id} (${inbox.email})`);
        
        // Get new emails from Email Bison for this inbox
        const newEmails = await emailBison.getNewEmails(inbox.id);
        
        if (!newEmails || newEmails.length === 0) {
          logger.info(`No new emails found for inbox ${inbox.id}`);
          continue;
        }
        
        logger.info(`Found ${newEmails.length} new emails for inbox ${inbox.id}`);
        
        // For each new email, create a job
        for (const email of newEmails) {
          try {
            // Save the email to the database
            logger.info(`Saving email ${email.message_id} to database`);
            const savedEmail = await supabase.saveEmail({
              inbox_id: inbox.id,
              message_id: email.message_id,
              thread_id: email.thread_id,
              subject: email.subject,
              body: email.body,
              sender: email.sender,
              recipient: email.recipient || inbox.email,
              status: 'new',
              is_inbound: true,
              received_at: email.received_at || new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            
            // Create a job for this email
            logger.info(`Creating job for email ${savedEmail.id}`);
            await supabase.createJob({
              email_id: savedEmail.id,
              user_id: inbox.user_id,
              status: 'pending',
              attempts: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            
            logger.info(`Job created successfully for email ${savedEmail.id}`);
          } catch (emailError) {
            logger.error(`Error processing email ${email.message_id}`, { error: emailError });
            // Continue with next email
          }
        }
      } catch (inboxError) {
        logger.error(`Error checking inbox ${inbox.id}`, { error: inboxError });
        // Continue with next inbox
      }
    }
    
    logger.info('Finished checking Email Bison for new emails');
  } catch (error) {
    logger.error('Error checking Email Bison for new emails', { error });
  }
}

/**
 * Ensures the past_replies table exists
 * If not, logs a warning but allows the worker to continue
 */
async function checkPastRepliesTable() {
  try {
    const exists = await supabase.memory.checkPastRepliesTableExists();
    if (!exists) {
      logger.warn('past_replies table does not exist. Please create it using the following SQL:');
      logger.warn(`
        create table public.past_replies (
          id uuid primary key default gen_random_uuid(),
          inbox_id uuid references inboxes(id) on delete cascade,
          email_id uuid references emails(id) on delete cascade,
          content text not null,
          is_ai boolean default false,
          created_at timestamptz default now()
        );
        create index on past_replies(inbox_id);
      `);
    } else {
      logger.info('past_replies table exists, RAG Dynamic Memory system is ready');
    }
    return exists;
  } catch (error: any) {
    logger.error('Error checking past_replies table', { error });
    return false;
  }
}

/**
 * Main worker loop
 */
async function run() {
  logger.info('Starting AI reply generator worker with RAG Dynamic Memory');
  
  // Check if past_replies table exists
  await checkPastRepliesTable();
  
  logger.info('Worker is now running in webhook-driven mode');
  logger.info('New emails will be processed via the /api/webhooks/email-bison endpoint');
  
  // Process jobs until stopped
  while (true) {
    try {
      // Get a pending job
      logger.info('Polling for pending AI reply jobs...');
      const job = await supabase.getPendingJob();
      
      if (job) {
        logger.info(`Found pending job ${job.id}, processing...`);
        // Process the job
        await processJob(job);
      } else {
        // No pending jobs, wait a bit before polling again
        logger.debug('No pending jobs, waiting before next poll');
        await sleep(5000); // Wait 5 seconds
      }
    } catch (error) {
      logger.error('Error in main worker loop', { error });
      
      // Wait a bit before trying again to avoid hammering the database
      logger.info('Waiting 10 seconds before next poll due to error');
      await sleep(10000); // Wait 10 seconds
    }
  }
}

/**
 * Handle process shutdown
 */
function setupGracefulShutdown() {
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully');
    process.exit(0);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', { reason, promise });
  });
  
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error });
    process.exit(1);
  });
}

// Set up graceful shutdown
setupGracefulShutdown();

// Start the worker
run().catch((error) => {
  logger.error('Fatal error starting worker', { error });
  process.exit(1);
});
