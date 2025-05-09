/**
 * Script to view the latest AI response
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function viewLatestResponse() {
  try {
    // Get the latest AI response
    const { data: response, error: responseError } = await supabase
      .from('ai_responses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (responseError) {
      console.error('Error fetching latest AI response:', responseError);
      return;
    }
    
    if (!response) {
      console.log('No AI responses found in the database.');
      return;
    }
    
    console.log('Latest AI Response:');
    console.log('===================');
    console.log(`ID: ${response.id}`);
    console.log(`Email ID: ${response.email_id}`);
    console.log(`User ID: ${response.user_id}`);
    console.log(`Created: ${response.created_at}`);
    console.log('\nContent:');
    console.log('--------');
    console.log(response.content);
    
    // Get the corresponding email
    const { data: email, error: emailError } = await supabase
      .from('emails')
      .select('*')
      .eq('id', response.email_id)
      .single();
    
    if (emailError) {
      console.error(`Error fetching email ${response.email_id}:`, emailError);
      return;
    }
    
    console.log('\nOriginal Email:');
    console.log('==============');
    console.log(`Subject: ${email.subject}`);
    console.log(`From: ${email.sender}`);
    console.log(`To: ${email.recipient}`);
    console.log('\nBody:');
    console.log('-----');
    console.log(email.body);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

viewLatestResponse();
