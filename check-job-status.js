/**
 * Script to check the status of AI reply jobs in the database
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configure Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in .env.local');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobStatus() {
  try {
    console.log('Checking AI reply jobs status...');
    
    // Get all jobs
    const { data: allJobs, error: allJobsError } = await supabase
      .from('ai_reply_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (allJobsError) {
      console.error('Error fetching jobs:', allJobsError);
      return;
    }
    
    console.log(`Found ${allJobs.length} jobs in total`);
    
    // Get pending jobs
    const { data: pendingJobs, error: pendingJobsError } = await supabase
      .from('ai_reply_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    
    if (pendingJobsError) {
      console.error('Error fetching pending jobs:', pendingJobsError);
      return;
    }
    
    console.log(`Found ${pendingJobs.length} pending jobs`);
    
    // Display job details
    if (allJobs.length > 0) {
      console.log('\nLatest jobs:');
      allJobs.forEach((job, index) => {
        console.log(`\nJob #${index + 1}:`);
        console.log(`  ID: ${job.id}`);
        console.log(`  Email ID: ${job.email_id}`);
        console.log(`  User ID: ${job.user_id}`);
        console.log(`  Status: ${job.status}`);
        console.log(`  Attempts: ${job.attempts}`);
        console.log(`  Created: ${job.created_at}`);
        console.log(`  Updated: ${job.updated_at}`);
      });
    }
    
    // Check if the worker query works
    console.log('\nTesting worker query...');
    const { data: workerQuery, error: workerQueryError } = await supabase
      .from('ai_reply_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);
    
    if (workerQueryError) {
      console.error('Error with worker query:', workerQueryError);
      return;
    }
    
    console.log(`Worker query found ${workerQuery.length} jobs`);
    if (workerQuery.length > 0) {
      console.log('First job that would be picked up by worker:');
      console.log(workerQuery[0]);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkJobStatus();
