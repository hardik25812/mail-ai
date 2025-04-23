// Sample Reply Generator - Tests our enhanced prompt with Email Bison integration
require('dotenv').config({ path: '.env.local' });
const { OpenAIClient } = require('./dist/lib/openai');
const fs = require('fs');

// Create a more targeted test to demonstrate the enhanced prompt system
const sampleEmail = {
  id: 'demo-123',
  subject: 'Partnership Opportunity and Product Integration Questions',
  body: `Hello Team,

I hope this email finds you well. I'm Alex Chen, CTO at InnovateTech Solutions, and I've been following your Mail AI product with great interest.

We're currently exploring AI-powered solutions to enhance our client communication systems, and I believe there could be potential for partnership or integration with your platform.

I have a few specific questions:

1. Does Mail AI offer an API that can be integrated with custom CRM systems?
2. What kind of AI models are you using for sentiment analysis and customer intent detection?
3. How does your system handle multilingual emails?
4. Do you have an enterprise pricing tier for larger organizations?

Additionally, I would appreciate if we could schedule a technical call next week to discuss potential integration paths.

Thank you for your time.

Best regards,
Alex Chen
Chief Technology Officer
InnovateTech Solutions
+1 (415) 555-7890`,
  sender: 'Alex Chen <alex.chen@innovatetech.com>',
  recipient: 'partnerships@mail-ai.com',
};

// User settings that mirror what would be in the database
const userSettings = {
  user_id: 'user-123',
  tone: 'professional and enthusiastic',
  signature: `Best regards,
Taylor Rivera
Partnerships Lead at Mail AI
Email: partnerships@mail-ai.com
Phone: +1 (888) 123-4567`,
  calendly_url: 'https://calendly.com/mail-ai/partnership-call',
  custom_instructions: 'Always emphasize our enterprise capabilities and API-first approach. Mention that we support over 30 languages with our multilingual AI models.',
  auto_reply: true,
};

// Manually build a prompt that matches our enhanced format in prompt-builder.ts
function buildEnhancedPrompt(email, settings) {
  // Extract sender name
  const nameMatch = email.sender.match(/^([^<]+)</);
  const senderName = nameMatch && nameMatch[1] ? nameMatch[1].trim().split(' ')[0] : 'there';
  
  let prompt = `
=== EMAIL REPLY GENERATION SYSTEM ===

You are an expert email communication assistant. Your task is to draft a professional and appropriate response to the email below.

=== INSTRUCTIONS ===

1. TONE & STYLE:
   - Use a ${settings.tone || 'professional'} tone
   - Be clear, concise, and respectful
   - Maintain proper email etiquette
   - Address the sender by name when appropriate
   - Use business-appropriate language

2. CONTENT GUIDELINES:
   - Thoroughly address ALL questions or points raised in the original email
   - Provide specific, relevant information (avoid vague responses)
   - If you can't answer a specific question, acknowledge it and offer an alternative or next step
   - Maintain a positive, solution-oriented approach
   - Do NOT make up information you don't have

3. STRUCTURE:
   - Begin with an appropriate greeting using the sender's name when possible
   - Organize your response in a logical manner
   - Use paragraphs to separate different topics
   - Use bullet points or numbered lists for multiple items when appropriate
   - End with an appropriate closing
`;

  // Add Calendly if available
  if (settings.calendly_url) {
    prompt += `
4. SCHEDULING ASSISTANCE:
   - If the sender is requesting a meeting, call, or appointment, offer this Calendly link: ${settings.calendly_url}
   - Only include this link if relevant to their request
`;
  }

  // Add custom instructions if configured by the user
  if (settings.custom_instructions) {
    prompt += `
5. SPECIAL INSTRUCTIONS:
   ${settings.custom_instructions}
`;
  }
  
  // Add signature instruction
  if (settings.signature) {
    prompt += `
6. SIGNATURE:
   - End the email with this exact signature:
   ${settings.signature}
`;
  }

  // Email context
  prompt += `
=== EMAIL CONTEXT ===

SENDER: ${email.sender}
RECIPIENT: ${email.recipient}
SUBJECT: ${email.subject}

=== ORIGINAL EMAIL CONTENT ===

${email.body}

=== RESPONSE ===

Draft a reply addressing the above email based on the instructions provided. Write only the email body, without including your reasoning or explanations. Do not prefix with "Dear" or "Hello" - just start with the appropriate greeting.`;
  
  return prompt;
}

// Generate the enhanced prompt
const enhancedPrompt = buildEnhancedPrompt(sampleEmail, userSettings);

// Save the generated prompt to a file for inspection
fs.writeFileSync('enhanced-prompt-sample.txt', enhancedPrompt);
console.log('Enhanced prompt saved to enhanced-prompt-sample.txt');

// Function to generate AI response
async function generateReply() {
  try {
    console.log('Generating AI reply with enhanced prompt...');
    
    const openai = new OpenAIClient({
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000
    });
    
    const response = await openai.generateEmailReply(enhancedPrompt);
    
    if (response) {
      console.log('\n=== GENERATED EMAIL REPLY ===\n');
      console.log(response);
      fs.writeFileSync('enhanced-sample-reply.txt', response);
      console.log('\nReply saved to enhanced-sample-reply.txt');
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
