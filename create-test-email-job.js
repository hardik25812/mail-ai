// Script to create a test AI reply job in the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not configured in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample email data
const emailData = {
  id: uuidv4(),
  subject: 'Partnership Opportunity and Product Integration Questions',
  body: `Hello Team,

I hope this email finds you well. I'm Alex Chen, CTO at InnovateTech Solutions, and I've been following your Mail AI product with great interest.

We're currently exploring AI-powered solutions to enhance our client communication systems, and I believe there could be potential for partnership or integration with your platform.

I have a few specific questions:

1. Does Mail AI offer an API that can be integrated with custom CRM systems?
2. What kind of AI models are you using for sentiment analysis and customer intent detection?
3. How does your system handle multilingual emails?
4. Do you have an enterprise pricing tier for larger organizations?

Additionally, I would appreciate if we could schedule a technical call next week to discuss potential integration paths.

Thank you for your time.

Best regards,
Alex Chen
Chief Technology Officer
InnovateTech Solutions
+1 (415) 555-7890`,
  sender: 'Alex Chen <alex.chen@innovatetech.com>',
  recipient: 'partnerships@mail-ai.com',
  workspace_id: null, // Will be set after workspace is created
  inbox_id: null, // Will be set after inbox is created
  thread_id: uuidv4(),
  is_read: false,
  is_archived: false,
  is_spam: false,
  status: 'new',
  priority: 'high',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// We'll use an existing user from auth.users since we can't directly insert into that table
// For testing, we'll query for any existing user and use it
async function getExistingUser() {
  const { data, error } = await supabase
    .from('auth.users')
    .select('id')
    .limit(1);
  
  if (error || !data || data.length === 0) {
    console.log('No existing user found, using a test UUID instead');
    return { id: uuidv4() };
  }
  
  return data[0];
}

// Sample workspace data
const workspaceData = {
  id: uuidv4(),
  name: 'Test Workspace',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Sample inbox data
const inboxData = {
  id: uuidv4(),
  name: 'Partnerships',
  email_address: 'partnerships@mail-ai.com',
  workspace_id: null, // Will be set after workspace is created
  bison_inbox_id: 'bison-inbox-test-123',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Sample settings data
const settingsData = {
  id: uuidv4(),
  user_id: null, // Will be set after user is created
  tone: 'professional and enthusiastic',
  signature: `Best regards,
Taylor Rivera
Partnerships Lead at Mail AI
Email: partnerships@mail-ai.com
Phone: +1 (888) 123-4567`,
  calendly_url: 'https://calendly.com/mail-ai/partnership-call',
  custom_instructions: 'Always emphasize our enterprise capabilities and API-first approach. Mention that we support over 30 languages with our multilingual AI models.',
  auto_reply: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Sample workspace_user data
const workspaceUserData = {
  id: uuidv4(),
  user_id: null, // Will be set after user is created
  workspace_id: null, // Will be set after workspace is created
  role: 'owner',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function createTestData() {
  try {
    console.log('Creating test data...');

    // 1. Get or create test user
    console.log('Getting existing user...');
    // Let's first check if users table exists and what columns it has
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');
    
    if (tableError) {
      console.log('Error checking users table schema:', tableError.message);
    } else {
      console.log('Users table columns:', tableInfo.map(col => col.column_name));
    }
    
    // Try to find an existing user first
    const { data: existingUsers, error: userQueryError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    let user;
    if (userQueryError || !existingUsers || existingUsers.length === 0) {
      console.log('No existing user found, creating a placeholder user object');
      user = { id: uuidv4() };
      console.log(`Using placeholder user ID: ${user.id}`);
    } else {
      user = existingUsers[0];
      console.log(`Using existing user with ID: ${user.id}`);
    }

    // 2. Create test workspace
    console.log('Creating test workspace...');
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert(workspaceData)
      .select()
      .single();

    if (workspaceError) {
      throw new Error(`Failed to create workspace: ${workspaceError.message}`);
    }
    console.log(`Workspace created with ID: ${workspace.id}`);

    // 3. Create workspace_user relationship
    console.log('Creating workspace user relationship...');
    workspaceUserData.user_id = user.id;
    workspaceUserData.workspace_id = workspace.id;
    const { error: workspaceUserError } = await supabase
      .from('workspace_users')
      .insert(workspaceUserData);

    if (workspaceUserError) {
      throw new Error(`Failed to create workspace user: ${workspaceUserError.message}`);
    }
    console.log(`Workspace user relationship created`);

    // 4. Create or update user settings
    console.log('Creating user settings...');
    settingsData.user_id = user.id;
    
    // Check if settings already exist for this user
    const { data: existingSettings, error: settingsQueryError } = await supabase
      .from('settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    let settingsError;
    if (existingSettings) {
      console.log('Updating existing settings');
      const { error } = await supabase
        .from('settings')
        .update(settingsData)
        .eq('id', existingSettings.id);
      settingsError = error;
    } else {
      console.log('Creating new settings');
      const { error } = await supabase
        .from('settings')
        .insert(settingsData);
      settingsError = error;
    }

    if (settingsError) {
      throw new Error(`Failed to create/update settings: ${settingsError.message}`);
    }
    console.log(`User settings created/updated`);

    // 5. Create test inbox
    console.log('Creating test inbox...');
    inboxData.workspace_id = workspace.id;
    const { data: inbox, error: inboxError } = await supabase
      .from('inboxes')
      .insert(inboxData)
      .select()
      .single();

    if (inboxError) {
      throw new Error(`Failed to create inbox: ${inboxError.message}`);
    }
    console.log(`Inbox created with ID: ${inbox.id}`);

    // 6. Create test email
    console.log('Creating test email...');
    emailData.workspace_id = workspace.id;
    emailData.inbox_id = inbox.id;
    const { data: email, error: emailError } = await supabase
      .from('emails')
      .insert(emailData)
      .select()
      .single();

    if (emailError) {
      throw new Error(`Failed to create email: ${emailError.message}`);
    }
    console.log(`Email created with ID: ${email.id}`);

    // 7. Create AI reply job
    console.log('Creating AI reply job...');
    const jobData = {
      id: uuidv4(),
      email_id: email.id,
      user_id: user.id,
      status: 'pending',
      attempts: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: job, error: jobError } = await supabase
      .from('ai_reply_jobs')
      .insert(jobData)
      .select()
      .single();

    if (jobError) {
      throw new Error(`Failed to create AI reply job: ${jobError.message}`);
    }
    console.log(`AI reply job created with ID: ${job.id}`);

    console.log('\nTest data created successfully!');
    console.log('\nYour worker should now process this job and generate an AI reply.');
    console.log('Monitor the worker output to see the results.');

  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

createTestData();
