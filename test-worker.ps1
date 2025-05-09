# Test script for the AI Reply Generator Worker
# This script creates a test email and AI reply job directly in the database

# ======= CONFIGURATION =======
# Values from your Supabase database
$userId = "023bc166-f045-4435-a724-5b812f54a2bf"  # User ID

Write-Host "Creating a test email and AI reply job..." -ForegroundColor Cyan

# Create a Node.js script to insert test data directly
$testScript = @"
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestData() {
  try {
    // Generate UUIDs
    const emailId = uuidv4();
    const messageId = uuidv4();
    const threadId = uuidv4();
    
    // 1. Create a test email
    console.log('Creating test email...');
    const { data: email, error: emailError } = await supabase
      .from('emails')
      .insert([
        {
          id: emailId,
          inbox_id: uuidv4(), // Random inbox ID
          message_id: messageId,
          thread_id: threadId,
          subject: 'Test Email for AI Reply',
          body: 'Hello, I recently came across your service and I am interested in learning more. Could you please provide information about your pricing and features? Thanks, Test User',
          body_html: '<p>Hello, I recently came across your service and I am interested in learning more. Could you please provide information about your pricing and features?</p><p>Thanks,<br>Test User</p>',
          sender: 'test.user@example.com',
          recipient: 'inbox@yourdomain.com',
          cc: [],
          bcc: [],
          status: 'received',
          is_draft: false,
          is_sent: false,
          is_inbound: true,
          received_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();
      
    if (emailError) {
      throw new Error(`Error creating test email: ${emailError.message}`);
    }
    
    console.log(`Test email created with ID: ${email.id}`);
    
    // 2. Create an AI reply job
    console.log('Creating AI reply job...');
    const { data: job, error: jobError } = await supabase
      .from('ai_reply_jobs')
      .insert([
        {
          email_id: email.id,
          user_id: '023bc166-f045-4435-a724-5b812f54a2bf', // User ID from PowerShell
          status: 'pending',
          attempts: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();
      
    if (jobError) {
      throw new Error(`Error creating AI reply job: ${jobError.message}`);
    }
    
    console.log(`AI reply job created with ID: ${job.id}`);
    console.log('Test data created successfully!');
    
    return { email, job };
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();
"@

# Write the test script to a temporary file
$tempScriptPath = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "test-worker-script.js")
$testScript | Out-File -FilePath $tempScriptPath -Encoding utf8

try {
    # Run the Node.js script to create test data
    Write-Host "Running test script to create data..." -ForegroundColor Yellow
    node $tempScriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Test data created successfully!" -ForegroundColor Green
        Write-Host "Now you can run the worker to process the job:" -ForegroundColor Cyan
        Write-Host ".\start-worker.ps1" -ForegroundColor Cyan
    } else {
        Write-Host "Error creating test data. Check the error messages above." -ForegroundColor Red
    }
} finally {
    # Clean up the temporary file
    if (Test-Path $tempScriptPath) {
        Remove-Item $tempScriptPath
    }
}
