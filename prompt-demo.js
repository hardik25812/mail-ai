// Test the enhanced prompt builder
require('dotenv').config({ path: '.env.local' });
const { buildReplyPrompt } = require('./dist/lib/prompt-builder');
const { OpenAIClient } = require('./dist/lib/openai');
const fs = require('fs');

// Sample email data
const sampleEmail = {
  id: 'test-email-123',
  subject: 'Question about product features and pricing',
  body: `Hi there,

I'm interested in your Mail AI product and had a few questions:

1. Does it integrate with Gmail and Outlook?
2. What AI models do you use for email analysis?
3. How much does it cost per month for a small team of 5 people?
4. Do you offer a trial period?

Also, I'd like to schedule a demo if possible.

Thanks,
Michael Johnson
Marketing Director, TechCorp`,
  sender: 'Michael Johnson <michael.johnson@techcorp.com>',
  recipient: 'sales@yourcompany.com',
  thread_id: 'thread-123'
};

// Sample user settings
const userSettings = {
  user_id: 'user-123',
  tone: 'professional and friendly',
  signature: 'Best regards,\nSarah Thompson\nCustomer Success Manager\n+1 (555) 123-4567',
  calendly_url: 'https://calendly.com/yourcompany/demo',
  custom_instructions: 'Mention our 15% discount for annual subscriptions when discussing pricing.'
};

// Generate the prompt
const prompt = buildReplyPrompt({
  email: sampleEmail,
  settings: userSettings,
  additionalInstructions: 'This is a high-priority lead based on company size.'
});

// Save the generated prompt to a file for review
fs.writeFileSync('generated-prompt.txt', prompt);
console.log('Generated prompt saved to generated-prompt.txt');

// Function to generate AI response
async function generateReply() {
  try {
    console.log('Generating AI reply...');
    
    const openai = new OpenAIClient({
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000
    });
    
    const response = await openai.generateEmailReply(prompt);
    
    if (response) {
      console.log('\n=== GENERATED EMAIL REPLY ===\n');
      console.log(response);
      fs.writeFileSync('generated-reply.txt', response);
      console.log('\nReply saved to generated-reply.txt');
    } else {
      console.error('Failed to generate response');
    }
  } catch (error) {
    console.error('Error generating reply:', error);
  }
}

// Run the generator if OpenAI API key is available
if (process.env.OPENAI_API_KEY) {
  generateReply();
} else {
  console.log('OpenAI API key not found. Only saving the prompt without generating a reply.');
}
