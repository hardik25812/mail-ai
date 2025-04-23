// Email Bison API Configuration Script
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Default Email Bison API URL - update this if needed
const defaultEmailBisonApiUrl = 'https://api.emailbison.com/v1/send';

// Check if EMAIL_BISON_API_URL is already set
const emailBisonApiUrl = process.env.EMAIL_BISON_API_URL;

if (!emailBisonApiUrl) {
  console.log('EMAIL_BISON_API_URL not found in .env.local, adding it...');
  
  try {
    // Read the current .env.local file
    const envPath = path.join(__dirname, '..', '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Add the EMAIL_BISON_API_URL
    if (envContent.includes('EMAIL_BISON_API_KEY')) {
      // Add after the API key
      envContent = envContent.replace(
        /EMAIL_BISON_API_KEY="([^"]*)"/,
        `EMAIL_BISON_API_KEY="$1"\nEMAIL_BISON_API_URL="${defaultEmailBisonApiUrl}"`
      );
    } else {
      // Add at the end
      envContent += `\nEMAIL_BISON_API_URL="${defaultEmailBisonApiUrl}"\n`;
    }
    
    // Write back to .env.local
    fs.writeFileSync(envPath, envContent);
    
    console.log(`✅ Added EMAIL_BISON_API_URL=${defaultEmailBisonApiUrl} to .env.local`);
  } catch (error) {
    console.error('Error updating .env.local:', error.message);
  }
} else {
  console.log(`✅ EMAIL_BISON_API_URL is already set to: ${emailBisonApiUrl}`);
}

// Verify Email Bison API integration in trigger-ai-reply.ts
const apiEndpointPath = path.join(__dirname, '..', 'pages', 'api', 'trigger-ai-reply.ts');

try {
  const apiContent = fs.readFileSync(apiEndpointPath, 'utf8');
  
  if (apiContent.includes('Email Bison API') && 
      apiContent.includes('emailBisonApiUrl') && 
      apiContent.includes('axios.post(emailBisonApiUrl')) {
    console.log('✅ Email Bison API integration code found in trigger-ai-reply.ts');
  } else {
    console.log('⚠️ Email Bison API integration code may be missing or incomplete in trigger-ai-reply.ts');
    console.log('Please ensure the following code is present in the auto-reply section:');
    console.log(`
// Use Email Bison API to send the reply
const emailBisonApiUrl = process.env.EMAIL_BISON_API_URL;

if (emailBisonApiUrl) {
  await axios.post(emailBisonApiUrl, {
    email_id,
    reply_content,
    user_id,
    signature: settings.signature || ''
  });
}
    `);
  }
} catch (error) {
  console.error('Error checking trigger-ai-reply.ts:', error.message);
}

console.log('\nEmail Bison API configuration complete!');
console.log('Next steps:');
console.log('1. Push your code to GitHub');
console.log('2. Set up Row Level Security in Supabase using scripts/setup-rls.sql');
console.log('3. Deploy to Vercel using scripts/deploy.ps1 (Windows) or scripts/deploy.sh (Linux/Mac)');
