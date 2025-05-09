// Check workspace configuration in the database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkWorkspaces() {
  // Create Supabase client using environment variables
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  
  // Query all workspaces
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('*');
    
  if (error) {
    console.error('Error fetching workspaces:', error);
    return;
  }
  
  console.log(`Found ${workspaces.length} workspaces:`);
  
  // Display workspace info focusing on Email Bison related fields
  workspaces.forEach(workspace => {
    console.log('\n-----------------------------------');
    console.log(`Workspace ID: ${workspace.id}`);
    console.log(`Name: ${workspace.name || 'N/A'}`);
    console.log(`Bison Workspace ID: ${workspace.bison_workspace_id || 'N/A'}`);
    console.log(`Bison API Key: ${workspace.bison_api_key ? '✓ Present' : '✗ Missing'}`);
    console.log(`Bison Connected: ${workspace.bison_connected ? 'Yes' : 'No'}`);
  });
  
  // Now let's check if the specific ID exists
  console.log('\n-----------------------------------');
  console.log("Searching for workspace with bison_workspace_id = 'bison-1745772223441'");
  
  const { data: matchingWorkspace, error: searchError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('bison_workspace_id', 'bison-1745772223441')
    .single();
    
  if (searchError) {
    console.error('Error searching for workspace:', searchError);
  } else if (matchingWorkspace) {
    console.log('Found matching workspace:', matchingWorkspace.id);
  } else {
    console.log('No workspace found with that Bison ID');
  }
}

checkWorkspaces();
