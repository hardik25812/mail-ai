/**
 * Test script for the AI reply generation worker
 * Creates a test job and runs the worker to process it
 */

import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../lib/logger';
import { SupabaseClient } from '../lib/supabase-client';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize logger
const logger = createLogger('test-worker');

// Initialize Supabase client
const supabase = new SupabaseClient();

/**
 * Create a test email and job
 */
async function createTestData(userId: string) {
  try {
    logger.info('Creating test data');
    
    // 1. Create a test email
    const { data: email, error: emailError } = await supabase.client
      .from('emails')
      .insert([
        {
          inbox_id: uuidv4(), // You may want to use an actual inbox ID
          message_id: `test-${Date.now()}@example.com`,
          thread_id: `thread-${Date.now()}`,
          subject: 'Test Email for AI Reply',
          body: 'Hello, this is a test email to verify the AI reply generator is working correctly. Can you please confirm receipt and let me know when we can schedule a meeting? Thanks!',
          sender: 'Test User <test@example.com>',
          recipient: 'ai@yourdomain.com',
          status: 'new',
          is_inbound: true,
          received_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    
    if (emailError) {
      throw new Error(`Failed to create test email: ${emailError.message}`);
    }
    
    logger.info(`Created test email ${email.id}`);
    
    // 2. Create a test job
    const { data: job, error: jobError } = await supabase.client
      .from('ai_reply_jobs')
      .insert([
        {
          email_id: email.id,
          user_id: userId,
          status: 'pending',
          attempts: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    
    if (jobError) {
      throw new Error(`Failed to create test job: ${jobError.message}`);
    }
    
    logger.info(`Created test job ${job.id}`);
    
    return {
      emailId: email.id,
      jobId: job.id,
    };
  } catch (error) {
    logger.error('Error creating test data', { error });
    throw error;
  }
}

/**
 * Check if a job has been processed
 */
async function checkJobStatus(jobId: string): Promise<'pending' | 'processing' | 'completed' | 'failed'> {
  const { data, error } = await supabase.client
    .from('ai_reply_jobs')
    .select('status')
    .eq('id', jobId)
    .single();
  
  if (error) {
    throw new Error(`Failed to check job status: ${error.message}`);
  }
  
  return data.status;
}

/**
 * Check if an AI response was created
 */
async function checkAiResponse(emailId: string) {
  const { data, error } = await supabase.client
    .from('ai_responses')
    .select('*')
    .eq('email_id', emailId);
  
  if (error) {
    throw new Error(`Failed to check AI response: ${error.message}`);
  }
  
  return data.length > 0 ? data[0] : null;
}

/**
 * Run the test
 */
async function runTest() {
  if (!process.argv[2]) {
    logger.error('Please provide a user ID as a command line argument');
    process.exit(1);
  }
  
  const userId = process.argv[2];
  logger.info(`Starting test with user ID: ${userId}`);
  
  try {
    // Create test data
    const { emailId, jobId } = await createTestData(userId);
    
    // Start the worker in a separate process
    logger.info('Starting the worker process...');
    logger.info('The worker should pick up the test job we just created');
    logger.info('Check the worker logs to see the job being processed');
    
    // Poll for job completion
    logger.info('Polling for job completion...');
    
    let status = await checkJobStatus(jobId);
    let attempts = 0;
    
    while (status === 'pending' || status === 'processing') {
      logger.info(`Current job status: ${status}, checking again in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      status = await checkJobStatus(jobId);
      
      // Prevent infinite loops
      attempts++;
      if (attempts > 12) { // 1 minute max
        logger.warn('Reached maximum polling attempts, may still be processing');
        break;
      }
    }
    
    logger.info(`Final job status: ${status}`);
    
    // Check if an AI response was created
    const aiResponse = await checkAiResponse(emailId);
    
    if (aiResponse) {
      logger.info('✅ Test passed! AI response was created:');
      logger.info(`Content: ${aiResponse.content.substring(0, 100)}...`);
    } else {
      logger.error('❌ Test failed! No AI response was created');
    }
    
    logger.info('Test completed');
  } catch (error) {
    logger.error('Test failed with error', { error });
    process.exit(1);
  }
}

// Run the test
runTest();
