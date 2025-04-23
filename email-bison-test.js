// Script to test the Email Bison webhook integration
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const crypto = require('crypto');

// Get webhook secret from environment variables
const webhookSecret = process.env.EMAIL_BISON_WEBHOOK_SECRET;
if (!webhookSecret) {
  console.error('Error: EMAIL_BISON_WEBHOOK_SECRET is not set in .env.local');
  process.exit(1);
}

// Webhook endpoint (local development server)
const webhookUrl = 'http://localhost:3002/api/email-bison-webhook';

// Sample Email Bison webhook payload for a new incoming email
const mockEmailPayload = {
  event: 'email.received',
  data: {
    email: {
      id: 'test-email-' + Date.now(),
      thread_id: 'test-thread-' + Date.now(),
      inbox_id: 'bison-inbox-123',
      subject: 'Request for Custom Integration and Enterprise Pricing',
      from: {
        email: 'james.wilson@enterprise-corp.com',
        name: 'James Wilson'
      },
      to: [
        {
          email: 'partnerships@mail-ai.com',
          name: 'Partnerships'
        }
      ],
      received_at: new Date().toISOString(),
      text_body: `Hello Mail AI Team,

I hope this message finds you well. I'm James Wilson, the CTO at Enterprise Corp.

We're looking to implement an AI-powered email management solution across our organization and your Mail AI product has caught our attention. After reviewing your website, I have a few questions:

1. Does your product offer any custom integration options with our internal ticketing system?
2. We have specific compliance requirements for data handling. Can you provide details on your data security and compliance certifications?
3. What is your enterprise pricing structure for approximately 500 users?
4. Do you provide dedicated support and training during implementation?

We would also like to schedule a demo with your technical team next week to discuss the specifics of our requirements.

Looking forward to your response.

Best regards,
James Wilson
Chief Technology Officer
Enterprise Corp
Phone: +1 (212) 555-9876`,
      html_body: `<p>Hello Mail AI Team,</p>
<p>I hope this message finds you well. I'm James Wilson, the CTO at Enterprise Corp.</p>
<p>We're looking to implement an AI-powered email management solution across our organization and your Mail AI product has caught our attention. After reviewing your website, I have a few questions:</p>
<ol>
  <li>Does your product offer any custom integration options with our internal ticketing system?</li>
  <li>We have specific compliance requirements for data handling. Can you provide details on your data security and compliance certifications?</li>
  <li>What is your enterprise pricing structure for approximately 500 users?</li>
  <li>Do you provide dedicated support and training during implementation?</li>
</ol>
<p>We would also like to schedule a demo with your technical team next week to discuss the specifics of our requirements.</p>
<p>Looking forward to your response.</p>
<p>Best regards,<br>
James Wilson<br>
Chief Technology Officer<br>
Enterprise Corp<br>
Phone: +1 (212) 555-9876</p>`,
      attachments: []
    },
    workspace: {
      id: 'test-workspace-123'
    }
  },
  timestamp: new Date().toISOString()
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
    
    // Create HMAC signature for payload
    const signature = createHmacSignature(mockEmailPayload, webhookSecret);
    
    // Make the API call
    const response = await axios.post(webhookUrl, mockEmailPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Email-Bison-Signature': signature
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
