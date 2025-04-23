// Simple test script to verify the AI reply worker setup
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Configure Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in .env.local');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

// Test OpenAI API key
const openaiKey = process.env.OPENAI_API_KEY;
if (!openaiKey) {
  console.error('Error: OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}
console.log('OpenAI API Key found and loaded');

// Generate test IDs
const testUserId = uuidv4();
const testInboxId = uuidv4();
const testEmailId = uuidv4();

async function setupTestData() {
  try {
    console.log('Creating test data...');

    // 1. Create test user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: testUserId,
          email: 'test@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (userError) {
      if (userError.code === '42P01') {
        console.error('Error: The users table doesn\'t exist. You may need to create your database schema first.');
        console.log('Please run the SQL migrations to create your database tables.');
        return false;
      }
      console.error('Error creating test user:', userError);
      return false;
    }

    console.log('✅ Created test user with ID:', testUserId);

    // 2. Create test settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .insert([
        {
          user_id: testUserId,
          tone: 'professional',
          signature: 'Test User\nMail AI Backend',
          auto_reply: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (settingsError) {
      if (settingsError.code === '42P01') {
        console.error('Error: The settings table doesn\'t exist.');
        return false;
      }
      console.error('Error creating test settings:', settingsError);
      return false;
    }

    console.log('✅ Created test settings for user');

    // 3. Create test inbox
    const { data: inboxData, error: inboxError } = await supabase
      .from('inboxes')
      .insert([
        {
          id: testInboxId,
          name: 'Test Inbox',
          email: 'test-inbox@example.com',
          workspace_id: uuidv4(), // Random workspace ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (inboxError) {
      if (inboxError.code === '42P01') {
        console.error('Error: The inboxes table doesn\'t exist.');
        return false;
      }
      console.error('Error creating test inbox:', inboxError);
      return false;
    }

    console.log('✅ Created test inbox with ID:', testInboxId);

    // 4. Create test email
    const { data: emailData, error: emailError } = await supabase
      .from('emails')
      .insert([
        {
          id: testEmailId,
          inbox_id: testInboxId,
          message_id: `test-${Date.now()}@example.com`,
          thread_id: `thread-${Date.now()}`,
          subject: 'Test Email for AI Reply',
          body: 'Hello, this is a test email to verify the AI reply generator is working correctly. Could you please review the proposal I sent last week and let me know your thoughts? I\'m available for a call on Thursday or Friday if you want to discuss further. Thanks!',
          sender: 'Test Sender <sender@example.com>',
          recipient: 'test-inbox@example.com',
          status: 'new',
          is_inbound: true,
          received_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (emailError) {
      if (emailError.code === '42P01') {
        console.error('Error: The emails table doesn\'t exist.');
        return false;
      }
      console.error('Error creating test email:', emailError);
      return false;
    }

    console.log('✅ Created test email with ID:', testEmailId);

    // 5. Create a pending job for the AI reply worker
    const { data: jobData, error: jobError } = await supabase
      .from('ai_reply_jobs')
      .insert([
        {
          id: uuidv4(),
          email_id: testEmailId,
          user_id: testUserId,
          status: 'pending',
          attempts: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (jobError) {
      if (jobError.code === '42P01') {
        console.error('Error: The ai_reply_jobs table doesn\'t exist.');
        console.log('You need to create the ai_reply_jobs table. Run this SQL in Supabase:');
        console.log(`
CREATE TABLE public.ai_reply_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID REFERENCES public.emails(id),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.ai_reply_jobs(status);
        `);
        return false;
      }
      console.error('Error creating test job:', jobError);
      return false;
    }

    console.log('✅ Created test AI reply job for processing');
    console.log('\nTest data setup complete! You can now run:');
    console.log('npm run worker:start');
    console.log('\nThe worker should pick up the pending job and process it.');
    return true;
  } catch (error) {
    console.error('Unexpected error setting up test data:', error);
    return false;
  }
}

setupTestData();
