// Create AI reply job table and test job
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

async function setupAIReplyTable() {
  try {
    console.log('Checking if ai_reply_jobs table exists...');
    
    // Try to query the table to see if it exists
    const { data, error } = await supabase
      .from('ai_reply_jobs')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('❌ ai_reply_jobs table does not exist. Creating it...');
      
      // Execute SQL to create the table
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE public.ai_reply_jobs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email_id UUID NOT NULL,
            user_id UUID NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            attempts INTEGER NOT NULL DEFAULT 0,
            last_error TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
          );
          CREATE INDEX ON public.ai_reply_jobs(status);
        `
      });
      
      if (createError) {
        console.error('Error creating ai_reply_jobs table:', createError);
        console.log('\nPlease run this SQL in the Supabase SQL Editor:');
        console.log(`
          CREATE TABLE public.ai_reply_jobs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email_id UUID NOT NULL,
            user_id UUID NOT NULL,
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
      
      console.log('✅ ai_reply_jobs table created successfully');
    } else {
      console.log('✅ ai_reply_jobs table already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error checking/creating ai_reply_jobs table:', error);
    return false;
  }
}

async function createTestData() {
  try {
    // Get any existing email and user
    console.log('Checking for existing emails...');
    const { data: emails, error: emailError } = await supabase
      .from('emails')
      .select('id, subject, body, sender')
      .limit(1);
    
    if (emailError) {
      console.error('Error fetching emails:', emailError);
      if (emailError.code === '42P01') {
        console.log('❌ emails table does not exist. Please make sure your database is properly initialized.');
      }
      return false;
    }
    
    let emailId, userId;
    
    if (emails && emails.length > 0) {
      console.log('✅ Found existing email:', emails[0].id);
      emailId = emails[0].id;
      
      // Print email details
      console.log(`   Subject: ${emails[0].subject}`);
      console.log(`   From: ${emails[0].sender}`);
      console.log(`   Body preview: ${emails[0].body.substring(0, 50)}...`);
      
      // Get any existing user
      console.log('Checking for existing users...');
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (userError) {
        console.error('Error fetching users:', userError);
        if (userError.code === '42P01') {
          console.log('❌ users table does not exist.');
        }
        // Generate a random user ID as fallback
        userId = uuidv4();
        console.log(`Using generated user ID: ${userId}`);
      } else if (users && users.length > 0) {
        console.log('✅ Found existing user:', users[0].id);
        userId = users[0].id;
      } else {
        // Generate a random user ID as fallback
        userId = uuidv4();
        console.log(`Using generated user ID: ${userId}`);
      }
      
      // Create a test job
      console.log('Creating test AI reply job...');
      const { data: jobData, error: jobError } = await supabase
        .from('ai_reply_jobs')
        .insert([
          {
            id: uuidv4(),
            email_id: emailId,
            user_id: userId,
            status: 'pending',
            attempts: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (jobError) {
        console.error('Error creating test job:', jobError);
        return false;
      }
      
      console.log('✅ Created test AI reply job with ID:', jobData[0].id);
      console.log('\nTest data setup complete! You can now run:');
      console.log('npm run worker:start');
      console.log('\nThe worker should pick up the pending job and process it.');
      
      return true;
    } else {
      console.log('❌ No existing emails found. Creating a sample email...');
      
      // Create a sample email first
      // First get a valid inbox ID if possible
      const { data: inboxes, error: inboxError } = await supabase
        .from('inboxes')
        .select('id')
        .limit(1);
      
      let inboxId;
      
      if (inboxError) {
        console.error('Error fetching inboxes:', inboxError);
        if (inboxError.code === '42P01') {
          console.log('❌ inboxes table does not exist.');
        }
        // Use a random inbox ID
        inboxId = uuidv4();
        console.log(`Using generated inbox ID: ${inboxId}`);
      } else if (inboxes && inboxes.length > 0) {
        console.log('✅ Found existing inbox:', inboxes[0].id);
        inboxId = inboxes[0].id;
      } else {
        // Use a random inbox ID
        inboxId = uuidv4();
        console.log(`Using generated inbox ID: ${inboxId}`);
      }
      
      // Get any existing user
      console.log('Checking for existing users...');
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (userError) {
        console.error('Error fetching users:', userError);
        if (userError.code === '42P01') {
          console.log('❌ users table does not exist.');
        }
        // Generate a random user ID as fallback
        userId = uuidv4();
        console.log(`Using generated user ID: ${userId}`);
      } else if (users && users.length > 0) {
        console.log('✅ Found existing user:', users[0].id);
        userId = users[0].id;
      } else {
        // Generate a random user ID as fallback
        userId = uuidv4();
        console.log(`Using generated user ID: ${userId}`);
      }
      
      // Create a test email
      console.log('Creating test email...');
      const { data: emailData, error: createEmailError } = await supabase
        .from('emails')
        .insert([
          {
            id: uuidv4(),
            inbox_id: inboxId,
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
      
      if (createEmailError) {
        console.error('Error creating test email:', createEmailError);
        return false;
      }
      
      console.log('✅ Created test email with ID:', emailData[0].id);
      emailId = emailData[0].id;
      
      // Create a test job
      console.log('Creating test AI reply job...');
      const { data: jobData, error: jobError } = await supabase
        .from('ai_reply_jobs')
        .insert([
          {
            id: uuidv4(),
            email_id: emailId,
            user_id: userId,
            status: 'pending',
            attempts: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (jobError) {
        console.error('Error creating test job:', jobError);
        return false;
      }
      
      console.log('✅ Created test AI reply job with ID:', jobData[0].id);
      console.log('\nTest data setup complete! You can now run:');
      console.log('npm run worker:start');
      console.log('\nThe worker should pick up the pending job and process it.');
      
      return true;
    }
  } catch (error) {
    console.error('Unexpected error setting up test data:', error);
    return false;
  }
}

async function main() {
  const tableCreated = await setupAIReplyTable();
  if (tableCreated) {
    await createTestData();
  }
}

main();
