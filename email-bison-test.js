// Script to test the Email Bison webhook integration
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const crypto = require('crypto');

// Webhook endpoint (local development URL)
const webhookUrl = 'http://localhost:3000/api/bison/webhooks';

console.log(`Testing webhook at: ${webhookUrl}`);

// Sample Email Bison webhook payload using the new LEAD_REPLIED format
const mockEmailPayload = {
  "event": {
    "type": "LEAD_REPLIED",
    "name": "Lead Replied",
    "workspace_id": 1,
    "workspace_name": "Test Team"
  },
  "data": {
    "reply": {
      "id": 2,
      "uuid": "test-email-" + Date.now(),
      "email_subject": "Re: Test Subject",
      "interested": false,
      "automated_reply": false,
      "html_body": "<div dir=\"ltr\">I'm very interested in learning more about your product.</div>",
      "text_body": "I'm very interested in learning more about your product.",
      "from_name": "Test User",
      "from_email_address": "test@example.com",
      "primary_to_email_address": "inbox@mail-ai.com",
      "date_received": new Date().toISOString()
    },
    "lead": {
      "email": "test@example.com",
      "first_name": "Test",
      "last_name": "User",
      "company": "Test Company"
    },
    "campaign": {
      "id": 1,
      "name": "Test Campaign"
    },
    "sender_email": {
      "email": "inbox@mail-ai.com",
      "status": "connected"
    }
  }
};

// Function to create HMAC signature for payload
function createHmacSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

// Send the webhook request
async function sendWebhookRequest() {
  try {
    console.log('Sending test webhook request to Email Bison webhook endpoint...');
    console.log('Payload preview:', JSON.stringify(mockEmailPayload, null, 2).substring(0, 500) + '...');
    
    // Make the API call - no signature required for testing
    const response = await axios.post(webhookUrl, mockEmailPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`\nWebhook response status: ${response.status} ${response.statusText}`);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('\nNow monitor the Next.js and Worker logs to see the email being processed!');
    
  } catch (error) {
    console.error('Error sending webhook request:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Execute the test
sendWebhookRequest();
