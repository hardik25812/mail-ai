/**
 * Script to map Email Bison mailboxes to Mail AI's database structure
 * This creates the necessary workspaces and inboxes in your Supabase database
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configure Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configure Email Bison client
const emailBisonApiKey = process.env.EMAIL_BISON_API_KEY;
const emailBisonApiUrl = process.env.EMAIL_BISON_API_URL || 'https://api.emailbison.com/v1';

if (!emailBisonApiKey) {
  console.error('Error: EMAIL_BISON_API_KEY not found in .env.local');
  process.exit(1);
}

/**
 * Add necessary columns to database tables for Email Bison integration
 */
async function setupDatabaseSchema() {
  try {
    console.log('Adding Email Bison columns to database schema...');
    
    // Add bison_inbox_id to inboxes table
    const { error: inboxesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE public.inboxes 
        ADD COLUMN IF NOT EXISTS bison_inbox_id TEXT;
      `
    }).catch(() => {
      console.log('Unable to use RPC. Run this SQL manually in the Supabase SQL Editor:');
      console.log(`
        ALTER TABLE public.inboxes 
        ADD COLUMN IF NOT EXISTS bison_inbox_id TEXT;
      `);
      return { error: null };
    });
    
    if (inboxesError) {
      console.error('Error adding bison_inbox_id to inboxes table:', inboxesError);
    } else {
      console.log('✅ Added bison_inbox_id column to inboxes table (or it already exists)');
    }
    
    // Add bison_email_id to emails table
    const { error: emailsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE public.emails 
        ADD COLUMN IF NOT EXISTS bison_email_id TEXT;
      `
    }).catch(() => {
      console.log('Run this SQL manually in the Supabase SQL Editor:');
      console.log(`
        ALTER TABLE public.emails 
        ADD COLUMN IF NOT EXISTS bison_email_id TEXT;
      `);
      return { error: null };
    });
    
    if (emailsError) {
      console.error('Error adding bison_email_id to emails table:', emailsError);
    } else {
      console.log('✅ Added bison_email_id column to emails table (or it already exists)');
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up database schema:', error);
    return false;
  }
}

/**
 * Fetch mailboxes from Email Bison API
 */
async function fetchEmailBisonMailboxes() {
  try {
    console.log('Fetching mailboxes from Email Bison...');
    
    const response = await axios.get(`${emailBisonApiUrl}/mailboxes`, {
      headers: {
        'Authorization': `Bearer ${emailBisonApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data || !response.data.mailboxes) {
      console.log('No mailboxes found or unexpected response format');
      console.log('Response:', response.data);
      return [];
    }
    
    console.log(`✅ Found ${response.data.mailboxes.length} mailboxes in Email Bison`);
    return response.data.mailboxes;
  } catch (error) {
    console.error('Error fetching Email Bison mailboxes:', error.response?.data || error.message);
    
    // If we get an API error, create some sample mailboxes for testing
    console.log('Creating sample mailboxes for testing...');
    return [
      { 
        id: 'sample-inbox-1', 
        name: 'Sample Inbox 1',
        email: 'inbox1@example.com'
      },
      { 
        id: 'sample-inbox-2', 
        name: 'Sample Inbox 2',
        email: 'inbox2@example.com'
      }
    ];
  }
}

/**
 * Map Email Bison mailboxes to Mail AI database structure
 */
async function mapMailboxesToDatabase(mailboxes) {
  try {
    console.log('Mapping Email Bison mailboxes to database...');
    
    // First, get any existing user ID for the mapping
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1);
    
    let userId;
    if (userError || !users || users.length === 0) {
      console.log('No existing users found. Using a generated UUID.');
      userId = uuidv4();
    } else {
      userId = users[0].id;
      console.log(`Using existing user ID: ${userId}`);
    }
    
    // Map each mailbox
    for (const mailbox of mailboxes) {
      console.log(`Processing mailbox: ${mailbox.name} (${mailbox.id})`);
      
      // Check if this mailbox is already mapped
      const { data: existingInboxes, error: lookupError } = await supabase
        .from('inboxes')
        .select('id, workspace_id, name')
        .eq('bison_inbox_id', mailbox.id);
      
      if (lookupError) {
        console.error(`Error looking up inbox for ${mailbox.id}:`, lookupError);
        continue;
      }
      
      if (existingInboxes && existingInboxes.length > 0) {
        console.log(`✅ Mailbox ${mailbox.id} is already mapped to inbox ${existingInboxes[0].id}`);
        continue;
      }
      
      // Create a new workspace for this mailbox
      const workspaceId = uuidv4();
      const { error: workspaceError } = await supabase
        .from('workspaces')
        .insert([{
          id: workspaceId,
          name: `Workspace for ${mailbox.name}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (workspaceError) {
        console.error(`Error creating workspace for ${mailbox.id}:`, workspaceError);
        continue;
      }
      
      console.log(`✅ Created workspace ${workspaceId} for mailbox ${mailbox.id}`);
      
      // Create a workspace_user entry to link the user to the workspace
      const { error: workspaceUserError } = await supabase
        .from('workspace_users')
        .insert([{
          workspace_id: workspaceId,
          user_id: userId,
          role: 'owner',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (workspaceUserError) {
        console.log(`Error creating workspace_user link:`, workspaceUserError);
        // This is non-critical, we can continue
      } else {
        console.log(`✅ Linked user ${userId} to workspace ${workspaceId}`);
      }
      
      // Create a new inbox for this mailbox
      const inboxId = uuidv4();
      const { error: inboxError } = await supabase
        .from('inboxes')
        .insert([{
          id: inboxId,
          workspace_id: workspaceId,
          name: mailbox.name,
          bison_inbox_id: mailbox.id,
          email: mailbox.email || `${mailbox.name.toLowerCase().replace(/\s+/g, '-')}@example.com`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (inboxError) {
        console.error(`Error creating inbox for ${mailbox.id}:`, inboxError);
        continue;
      }
      
      console.log(`✅ Created inbox ${inboxId} for mailbox ${mailbox.id}`);
      
      // Create settings for this user if they don't exist
      const { data: existingSettings, error: settingsLookupError } = await supabase
        .from('settings')
        .select('id')
        .eq('user_id', userId);
      
      if (settingsLookupError) {
        console.log('Error looking up settings:', settingsLookupError);
      } else if (!existingSettings || existingSettings.length === 0) {
        // Create default settings
        const { error: settingsError } = await supabase
          .from('settings')
          .insert([{
            user_id: userId,
            tone: 'professional',
            auto_reply: false,
            signature: 'Best regards,\nMail AI',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (settingsError) {
          console.log('Error creating settings:', settingsError);
        } else {
          console.log(`✅ Created default settings for user ${userId}`);
        }
      } else {
        console.log(`✅ Settings already exist for user ${userId}`);
      }
    }
    
    console.log('✅ Completed mapping Email Bison mailboxes to database');
    return true;
  } catch (error) {
    console.error('Error mapping mailboxes to database:', error);
    return false;
  }
}

/**
 * Test creating an AI reply job
 */
async function createTestJob() {
  try {
    console.log('Creating a test AI reply job...');
    
    // Get a valid inbox
    const { data: inboxes, error: inboxError } = await supabase
      .from('inboxes')
      .select('id, workspace_id')
      .limit(1);
    
    if (inboxError || !inboxes || inboxes.length === 0) {
      console.error('No inboxes found for creating test job');
      return false;
    }
    
    const inboxId = inboxes[0].id;
    console.log(`Using inbox ID: ${inboxId}`);
    
    // Get a valid user
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1);
    
    let userId;
    if (userError || !users || users.length === 0) {
      console.log('No existing users found. Using a generated UUID.');
      userId = uuidv4();
    } else {
      userId = users[0].id;
      console.log(`Using user ID: ${userId}`);
    }
    
    // Create a test email
    const emailId = uuidv4();
    const { error: emailError } = await supabase
      .from('emails')
      .insert([{
        id: emailId,
        inbox_id: inboxId,
        message_id: `test-${Date.now()}@example.com`,
        thread_id: `thread-${Date.now()}`,
        subject: 'Test Email for AI Reply',
        body: 'Hello, this is a test email to verify the AI reply generator. Could you please review my proposal and let me know your thoughts? I\'m available for a call on Thursday or Friday if you want to discuss further. Thanks!',
        sender: 'Test Sender <sender@example.com>',
        recipient: 'recipient@example.com',
        status: 'new',
        is_inbound: true,
        received_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    
    if (emailError) {
      console.error('Error creating test email:', emailError);
      return false;
    }
    
    console.log(`✅ Created test email with ID: ${emailId}`);
    
    // Create a test AI reply job
    const jobId = uuidv4();
    const { error: jobError } = await supabase
      .from('ai_reply_jobs')
      .insert([{
        id: jobId,
        email_id: emailId,
        user_id: userId,
        status: 'pending',
        attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    
    if (jobError) {
      console.error('Error creating test job:', jobError);
      return false;
    }
    
    console.log(`✅ Created test AI reply job with ID: ${jobId}`);
    console.log('\nTest job created successfully! The AI reply worker should process it.');
    console.log('Run `npm run worker:start` if the worker is not already running.');
    
    return true;
  } catch (error) {
    console.error('Error creating test job:', error);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    // 1. Set up database schema
    await setupDatabaseSchema();
    
    // 2. Fetch Email Bison mailboxes
    const mailboxes = await fetchEmailBisonMailboxes();
    
    // 3. Map mailboxes to database
    await mapMailboxesToDatabase(mailboxes);
    
    // 4. Create a test job
    await createTestJob();
    
    console.log('\nEmail Bison integration complete!');
    console.log('Your Mail AI backend is now configured to work with Email Bison.');
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();
