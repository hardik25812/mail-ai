// Script to update test environment variables
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

// Generate a test webhook secret
const testWebhookSecret = 'test_webhook_secret_' + Math.random().toString(36).substring(2, 15);

try {
  console.log('Reading current .env.local file...');
  let envContent = '';
  
  try {
    // Try to read existing file content
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No existing .env.local file found. Creating a new one.');
      envContent = '';
    } else {
      throw err;
    }
  }
  
  // Check if EMAIL_BISON_WEBHOOK_SECRET already exists
  if (envContent.includes('EMAIL_BISON_WEBHOOK_SECRET=')) {
    console.log('EMAIL_BISON_WEBHOOK_SECRET already exists in .env.local');
    console.log('Current value:', process.env.EMAIL_BISON_WEBHOOK_SECRET || '(not set)');
    
    // Update existing value
    envContent = envContent.replace(
      /EMAIL_BISON_WEBHOOK_SECRET=.*/,
      `EMAIL_BISON_WEBHOOK_SECRET=${testWebhookSecret}`
    );
    console.log('Updated EMAIL_BISON_WEBHOOK_SECRET in .env.local');
  } else {
    // Add the new variable
    envContent += `\nEMAIL_BISON_WEBHOOK_SECRET=${testWebhookSecret}\n`;
    console.log('Added EMAIL_BISON_WEBHOOK_SECRET to .env.local');
  }
  
  // Write back to file
  fs.writeFileSync(envPath, envContent);
  console.log(`Successfully updated .env.local with test webhook secret: ${testWebhookSecret}`);
  console.log('Please restart your Next.js server and worker to apply the changes.');
  
} catch (error) {
  console.error('Error updating .env.local file:', error);
}
