/**
 * AI Reply Generator Worker
 * Processes pending jobs from the ai_reply_jobs table:
 * 1. Fetches job, email, and user settings
 * 2. Generates AI reply using OpenAI
 * 3. Saves the reply
 * 4. Optionally sends via Email Bison and notifies Slack
 */

import dotenv from 'dotenv';
import path from 'path';
import { createLogger } from '../lib/logger';
import { SupabaseClient } from '../lib/supabase-client';
import { OpenAIClient } from '../lib/openai';
import { EmailBisonClient } from '../lib/email-bison';
import { SlackClient } from '../lib/slack';
import { buildReplyPrompt, buildSummaryPrompt } from '../lib/prompt-builder';

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

// Initialize logger
const logger = createLogger('generate-ai-reply');

// Initialize clients
const supabase = new SupabaseClient();
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
 * Process a single AI reply job
 */
async function processJob(job: any): Promise<boolean> {
  const { id: jobId, email_id: emailId, user_id: userId } = job;
  
  try {
    logger.info(`Processing job ${jobId} for email ${emailId} and user ${userId}`);
    
    // 1. Fetch the email
    const email = await supabase.getEmail(emailId);
    
    // 2. Fetch user settings
    const settings = await supabase.getUserSettings(userId);
    
    // 3. Build the prompt for OpenAI
    const prompt = buildReplyPrompt({ email, settings });
    
    // 4. Generate the AI reply
    const reply = await openai.generateEmailReply(prompt);
    
    // 5. Save the AI response to the database
    let summary = '';
    if (settings.slack_url) {
      // Generate a summary for Slack if needed
      const summaryPrompt = buildSummaryPrompt(email);
      summary = await openai.generateEmailSummary(summaryPrompt);
    }
    
    const aiResponse = await supabase.saveAIResponse({
      email_id: emailId,
      user_id: userId,
      content: reply,
      summary,
    });
    
    // 6. Send the reply via Email Bison if auto_reply is enabled
    if (settings.auto_reply) {
      try {
        await emailBison.sendReply({
          emailId,
          replyContent: reply,
          userId,
          signature: settings.signature,
        });
        
        logger.info(`Auto-reply sent for email ${emailId}`);
      } catch (error) {
        logger.error(`Error sending auto-reply for email ${emailId}`, { error });
        // Continue execution - we don't want to fail the job just because sending failed
      }
    }
    
    // 7. Send Slack notification if configured
    if (settings.slack_url) {
      try {
        await slack.sendAIReplyNotification({
          webhookUrl: settings.slack_url,
          emailSubject: email.subject,
          emailSender: email.sender,
          replyPreview: reply,
          emailId,
          dashboardUrl: process.env.DASHBOARD_URL,
        });
        
        logger.info(`Slack notification sent for email ${emailId}`);
      } catch (error) {
        logger.error(`Error sending Slack notification for email ${emailId}`, { error });
        // Continue execution - we don't want to fail the job just because notification failed
      }
    }
    
    // 8. Mark the job as completed
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
 * Main worker loop
 */
async function run() {
  logger.info('Starting AI reply generator worker');
  
  // Process jobs until stopped
  while (true) {
    try {
      // Get a pending job
      const job = await supabase.getPendingJob();
      
      if (job) {
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
