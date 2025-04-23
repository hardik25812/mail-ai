/**
 * Simple script to create a test AI reply job
 * Adapts to your specific database schema
 */

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

async function createTestJob() {
  try {
    console.log('Starting test job creation process...');
    
    // Step 1: Get a valid user ID or create one if needed
    console.log('Looking for a valid user...');
    let { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    let userId;
    if (!users || users.length === 0) {
      // Try auth.users instead
      const { data: authUsers } = await supabase
        .from('auth.users')
        .select('id')
        .limit(1);
      
      if (authUsers && authUsers.length > 0) {
        userId = authUsers[0].id;
        console.log(`Found user in auth.users: ${userId}`);
      } else {
        userId = '023bc166-f045-4435-a724-5b812f54a2bf'; // Use the previously created user ID
        console.log(`Using hardcoded user ID: ${userId}`);
      }
    } else {
      userId = users[0].id;
      console.log(`Found user: ${userId}`);
    }
    
    // Step 2: Get or create a workspace
    console.log('Creating a test workspace...');
    const workspaceId = uuidv4();
    const { error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        id: workspaceId,
        name: 'Test Workspace',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (workspaceError) {
      console.error('Error creating workspace:', workspaceError);
      return;
    }
    
    console.log(`Created workspace: ${workspaceId}`);
    
    // Step 3: Create an inbox in that workspace
    console.log('Creating a test inbox...');
    const inboxId = uuidv4();
    
    // Get inbox table columns to adapt to your schema
    const { data: inboxColumnsData } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'inboxes')
      .eq('table_schema', 'public');
    
    const inboxColumns = inboxColumnsData || [];
    const hasEmailColumn = inboxColumns.some(col => col.column_name === 'email');
    
    const inboxData = {
      id: inboxId,
      workspace_id: workspaceId,
      name: 'Test Inbox',
      bison_inbox_id: `bison-${Date.now()}`, // Generate a fake Email Bison inbox ID
      email_address: 'test-inbox@example.com', // Required field
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add email if the column exists
    if (hasEmailColumn) {
      inboxData.email = 'test@example.com';
    }
    
    const { error: inboxError } = await supabase
      .from('inboxes')
      .insert(inboxData);
    
    if (inboxError) {
      console.error('Error creating inbox:', inboxError);
      
      // Try with a minimal set of fields
      console.log('Trying with minimal fields...');
      const { error: minimalInboxError } = await supabase
        .from('inboxes')
        .insert({
          id: inboxId,
          workspace_id: workspaceId,
          name: 'Test Inbox',
          bison_inbox_id: `bison-${Date.now()}`, // Generate a fake Email Bison inbox ID
          email_address: 'test-inbox@example.com' // Required field
        });
      
      if (minimalInboxError) {
        console.error('Error creating inbox with minimal fields:', minimalInboxError);
        return;
      }
    }
    
    console.log(`Created inbox: ${inboxId}`);
    
    // Step 4: Create a test email
    console.log('Creating a test email...');
    const emailId = uuidv4();
    const { error: emailError } = await supabase
      .from('emails')
      .insert({
        id: emailId,
        inbox_id: inboxId,
        message_id: `test-${Date.now()}@example.com`,
        thread_id: `thread-${Date.now()}`,
        subject: 'Test Email for AI Reply Worker',
        body: 'Hello, this is a test email to verify the AI reply generator. Could you please review my proposal and let me know your thoughts? I\'m available for a call on Thursday or Friday if you want to discuss further. Thanks!',
        sender: 'Test Sender <sender@example.com>',
        recipient: 'recipient@example.com',
        status: 'new',
        is_inbound: true,
        received_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (emailError) {
      console.error('Error creating email:', emailError);
      return;
    }
    
    console.log(`Created test email: ${emailId}`);
    
    // Step 5: Finally, create the AI reply job
    console.log('Creating AI reply job...');
    const jobId = uuidv4();
    const { error: jobError } = await supabase
      .from('ai_reply_jobs')
      .insert({
        id: jobId,
        email_id: emailId,
        user_id: userId,
        status: 'pending',
        attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (jobError) {
      console.error('Error creating job:', jobError);
      return;
    }
    
    console.log(`\n✅ SUCCESS! Created test AI reply job: ${jobId}`);
    console.log('\nThe AI reply worker should pick up this job soon.');
    console.log('If the worker is not running, start it with:');
    console.log('npm run worker:start');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestJob();
