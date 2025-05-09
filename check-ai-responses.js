/**
 * Script to check AI responses in the database
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

async function checkAIResponses() {
  try {
    console.log('Checking AI responses...');
    
    // Get the latest AI responses
    const { data: responses, error: responsesError } = await supabase
      .from('ai_responses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (responsesError) {
      console.error('Error fetching AI responses:', responsesError);
      return;
    }
    
    console.log(`Found ${responses.length} AI responses`);
    
    // Display response details
    if (responses.length > 0) {
      console.log('\nLatest AI responses:');
      responses.forEach((response, index) => {
        console.log(`\nResponse #${index + 1}:`);
        console.log(`  ID: ${response.id}`);
        console.log(`  Email ID: ${response.email_id}`);
        console.log(`  User ID: ${response.user_id}`);
        console.log(`  Created: ${response.created_at}`);
        console.log('  Content: \n' + '-'.repeat(80) + '\n' + response.content + '\n' + '-'.repeat(80));
      });
      
      // Get the corresponding emails for context
      console.log('\nFetching corresponding emails for context...');
      for (const response of responses) {
        const { data: email, error: emailError } = await supabase
          .from('emails')
          .select('*')
          .eq('id', response.email_id)
          .single();
        
        if (emailError) {
          console.error(`Error fetching email ${response.email_id}:`, emailError);
          continue;
        }
        
        console.log(`\nEmail for Response ID ${response.id}:`);
        console.log(`  Subject: ${email.subject}`);
        console.log(`  From: ${email.sender}`);
        console.log('  Body: \n' + '-'.repeat(80) + '\n' + email.body + '\n' + '-'.repeat(80));
      }
    } else {
      console.log('No AI responses found in the database.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAIResponses();
