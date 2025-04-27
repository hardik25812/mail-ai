/**
 * Script to check for existing inboxes in the database
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

async function checkInboxes() {
  try {
    console.log('Checking for existing inboxes...');
    
    // Get all inboxes
    const { data: inboxes, error: inboxesError } = await supabase
      .from('inboxes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (inboxesError) {
      console.error('Error fetching inboxes:', inboxesError);
      return;
    }
    
    console.log(`Found ${inboxes.length} inboxes`);
    
    // Display inbox details
    if (inboxes.length > 0) {
      console.log('\nExisting inboxes:');
      inboxes.forEach((inbox, index) => {
        console.log(`\nInbox #${index + 1}:`);
        console.log(`  ID: ${inbox.id}`);
        console.log(`  Name: ${inbox.name}`);
        console.log(`  Workspace ID: ${inbox.workspace_id}`);
        console.log(`  Bison Inbox ID: ${inbox.bison_inbox_id}`);
        console.log(`  Email Address: ${inbox.email_address}`);
        console.log(`  Active: ${inbox.active}`);
        console.log(`  Created: ${inbox.created_at}`);
      });
    } else {
      console.log('No inboxes found in the database.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkInboxes();
