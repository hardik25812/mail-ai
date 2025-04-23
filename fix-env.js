// Fix environment file issues
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

// Fix the Email Bison API URL/code issue
envContent = envContent.replace(
  /EMAIL_BISON_API_KEY=.*?\/?\/? ?Use Email Bison API to send the reply\s*const emailBisonApiUrl = process\.env\.EMAIL_BISON_API_URL;/,
  'EMAIL_BISON_API_KEY="PLACEHOLDER_API_KEY"\nEMAIL_BISON_API_URL="https://api.emailbison.com/v1/send"'
);

// Fix or add OpenAI API key
if (envContent.includes('OPENAI_API_KEY=')) {
  // Replace existing key with placeholder
  envContent = envContent.replace(
    /OPENAI_API_KEY=.*/,
    'OPENAI_API_KEY="PLACEHOLDER_API_KEY"'
  );
} else {
  // Add OpenAI API key placeholder
  envContent += '\n# OpenAI API\nOPENAI_API_KEY="PLACEHOLDER_API_KEY"\n';
}

// Write back to .env.local
fs.writeFileSync(envPath, envContent);

console.log('✅ Environment file fixed. The following variables are now properly set:');
console.log('- EMAIL_BISON_API_KEY');
console.log('- EMAIL_BISON_API_URL');
console.log('- OPENAI_API_KEY');
