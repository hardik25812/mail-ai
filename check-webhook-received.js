// Script to check if webhook data was received
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not configured in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentActivity() {
  console.log('Checking for recent webhook activity...');

  // Check for recent emails
  const { data: recentEmails, error: emailsError } = await supabase
    .from('emails')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (emailsError) {
    console.error('Error fetching recent emails:', emailsError);
  } else {
    console.log('\n=== Recent Emails ===');
    if (recentEmails.length === 0) {
      console.log('No recent emails found');
    } else {
      recentEmails.forEach(email => {
        console.log(`- ID: ${email.id}`);
        console.log(`  Subject: ${email.subject}`);
        console.log(`  Status: ${email.status}`);
        console.log(`  Created: ${email.created_at}`);
        console.log(`  Bison Email ID: ${email.bison_email_id || 'N/A'}`);
        console.log('  ---');
      });
    }
  }

  // Check for recent AI reply jobs
  const { data: recentJobs, error: jobsError } = await supabase
    .from('ai_reply_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (jobsError) {
    console.error('Error fetching recent AI reply jobs:', jobsError);
  } else {
    console.log('\n=== Recent AI Reply Jobs ===');
    if (recentJobs.length === 0) {
      console.log('No recent AI reply jobs found');
    } else {
      recentJobs.forEach(job => {
        console.log(`- ID: ${job.id}`);
        console.log(`  Email ID: ${job.email_id}`);
        console.log(`  Status: ${job.status}`);
        console.log(`  Created: ${job.created_at}`);
        console.log(`  Attempts: ${job.attempts}`);
        console.log('  ---');
      });
    }
  }

  // Check if there's a webhook_logs table and if it exists, query it
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'webhook_logs');

  if (!tablesError && tables.length > 0) {
    const { data: logs, error: logsError } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!logsError && logs) {
      console.log('\n=== Recent Webhook Logs ===');
      if (logs.length === 0) {
        console.log('No recent webhook logs found');
      } else {
        logs.forEach(log => {
          console.log(`- ID: ${log.id}`);
          console.log(`  Event Type: ${log.event_type}`);
          console.log(`  Created: ${log.created_at}`);
          console.log('  ---');
        });
      }
    }
  }

  console.log('\nWebhook Verification Complete');
}

checkRecentActivity().catch(err => {
  console.error('Error running check:', err);
  process.exit(1);
});
