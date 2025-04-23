// Script to set up a cron job for email syncing and auto-replies
require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate a secure API key if one doesn't exist
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Update .env.local with the SYNC_API_KEY
function updateEnvFile(apiKey) {
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('SYNC_API_KEY=')) {
    // Replace existing key
    envContent = envContent.replace(
      /SYNC_API_KEY="?([^"\n]*)"?/,
      `SYNC_API_KEY="${apiKey}"`
    );
  } else {
    // Add new key
    envContent += `\n# API key for email sync and auto-reply\nSYNC_API_KEY="${apiKey}"\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  return apiKey;
}

// Create cron job configuration
function createCronConfig(apiKey, apiUrl) {
  const cronConfig = {
    schedule: '*/15 * * * *', // Every 15 minutes
    command: `curl -X POST ${apiUrl}/api/sync-and-auto-reply -H "x-api-key: ${apiKey}" -H "Content-Type: application/json" -d '{}'`
  };
  
  // Write to a cron configuration file
  const cronConfigPath = path.join(__dirname, '..', 'cron-config.json');
  fs.writeFileSync(cronConfigPath, JSON.stringify(cronConfig, null, 2));
  
  console.log(`✅ Created cron configuration at: ${cronConfigPath}`);
  console.log('Schedule: Every 15 minutes');
  console.log(`Command: ${cronConfig.command}`);
}

// Main function
function setup() {
  console.log('Setting up cron job for email syncing and auto-replies...');
  
  // Check if we have a deployment URL
  const apiUrl = process.env.NEXT_PUBLIC_DEPLOYMENT_URL || 'http://localhost:3000';
  
  // Generate or get API key
  let apiKey = process.env.SYNC_API_KEY;
  if (!apiKey) {
    apiKey = generateApiKey();
    apiKey = updateEnvFile(apiKey);
    console.log(`✅ Generated new SYNC_API_KEY and added to .env.local`);
  } else {
    console.log(`✅ Using existing SYNC_API_KEY from .env.local`);
  }
  
  // Create cron configuration
  createCronConfig(apiKey, apiUrl);
  
  console.log('\nTo set up the cron job:');
  console.log('1. For Linux/Mac:');
  console.log('   - Run: crontab -e');
  console.log(`   - Add: ${cronConfig.schedule} ${cronConfig.command}`);
  console.log('2. For Windows:');
  console.log('   - Open Task Scheduler');
  console.log('   - Create a new task that runs every 15 minutes');
  console.log(`   - Action: Start a program, Program/script: curl, Arguments: -X POST ${apiUrl}/api/sync-and-auto-reply -H "x-api-key: ${apiKey}" -H "Content-Type: application/json" -d '{}'`);
  console.log('3. For Vercel/Serverless:');
  console.log('   - Use a service like Uptime Robot, Cronitor, or GitHub Actions');
  console.log(`   - Set up a scheduled HTTP POST request to ${apiUrl}/api/sync-and-auto-reply`);
  console.log(`   - Include header: x-api-key: ${apiKey}`);
}

// Run the setup
setup();
