/**
 * Script to export the latest AI response to a text file
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configure Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportLatestResponse() {
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
    
    // Format the output
    let output = '';
    output += 'Latest AI Response:\n';
    output += '===================\n';
    output += `ID: ${response.id}\n`;
    output += `Email ID: ${response.email_id}\n`;
    output += `User ID: ${response.user_id}\n`;
    output += `Created: ${response.created_at}\n\n`;
    output += 'Content:\n';
    output += '--------\n';
    output += `${response.content}\n\n`;
    
    output += 'Original Email:\n';
    output += '==============\n';
    output += `Subject: ${email.subject}\n`;
    output += `From: ${email.sender}\n`;
    output += `To: ${email.recipient}\n\n`;
    output += 'Body:\n';
    output += '-----\n';
    output += `${email.body}\n`;
    
    // Write to file
    const outputFile = path.join(__dirname, 'latest-ai-response.txt');
    fs.writeFileSync(outputFile, output, 'utf8');
    
    console.log(`Latest AI response exported to: ${outputFile}`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

exportLatestResponse();
