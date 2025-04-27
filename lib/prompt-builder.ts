/**
 * Prompt builder for OpenAI GPT-4
 * Generates optimized prompts for AI email replies based on user settings and email content
 */

// Define simplified types instead of importing from Supabase
interface Email {
  id: string;
  subject: string;
  body: string;
  sender: string;
  recipient: string;
  [key: string]: any;
}

interface UserSettings {
  user_id: string;
  tone?: string;
  signature?: string;
  calendly_url?: string;
  custom_instructions?: string;
  auto_reply?: boolean;
  slack_url?: string;
  [key: string]: any;
}



export interface PromptOptions {
  email: Email;
  settings: UserSettings;
  additionalInstructions?: string;
}

/**
 * Builds a prompt for OpenAI GPT-4 to generate an email reply
 */
export function buildReplyPrompt(options: PromptOptions): string {
  const { email, settings, additionalInstructions } = options;
  
  // Extract sender name for personalization
  const senderName = extractSenderName(email.sender);
  
  // Build a comprehensive prompt for AI
  let prompt = `
=== EMAIL REPLY GENERATION SYSTEM ===

You are an AI assistant helping respond to incoming customer emails.

=== ANALYSIS INSTRUCTIONS ===

First, analyze the customer's email carefully and determine:
- What are they asking about? (pricing, demo, support, etc.)
- How urgent is it?
- What tone should be used in the reply? (formal, friendly, apologetic)

=== RESPONSE INSTRUCTIONS ===

Then, write a professional, helpful reply that:
- Directly answers the customer's question
- Offers additional help if needed
- Uses a ${settings.tone || 'professional'} tone overall, but adjust based on your analysis
- Addresses the sender by name when appropriate
- Organizes information logically with paragraphs for different topics
- Uses bullet points or numbered lists for multiple items when appropriate
`;

  // Add Calendly if available
  if (settings.calendly_url) {
    prompt += `- Includes this Calendly link for booking a call (if appropriate): ${settings.calendly_url}
`;
  }

  // Add custom instructions if configured by the user
  if (settings.custom_instructions) {
    prompt += `
=== CUSTOM INSTRUCTIONS ===
${settings.custom_instructions}
`;
  }
  
  // Add signature instruction
  if (settings.signature) {
    prompt += `
=== SIGNATURE ===
End with this exact signature:
${settings.signature}
`;
  }
  
  // Add additional contextual instructions if provided
  if (additionalInstructions) {
    prompt += `
=== CONTEXTUAL NOTES ===
${additionalInstructions}
`;
  }

  // Email context
  prompt += `
=== EMAIL CONTEXT ===

Subject: ${email.subject}
Body: ${email.body}

=== RESPONSE ===

Write your response below. Include only the email content, not your analysis. Start with an appropriate greeting and end with the signature if provided.`;
  
  return prompt;
}

/**
 * Extracts a person's name from an email address
 * E.g., "John Doe <john@example.com>" -> "John"
 */
function extractSenderName(sender: string): string {
  // If the sender is in the format "Name <email>"
  const nameMatch = sender.match(/^([^<]+)</);
  if (nameMatch && nameMatch[1]) {
    // Extract first name
    const fullName = nameMatch[1].trim();
    const firstName = fullName.split(' ')[0];
    return firstName;
  }
  
  // If just an email address
  const emailMatch = sender.match(/^([^@]+)@/);
  if (emailMatch && emailMatch[1]) {
    return emailMatch[1]; // Return username part
  }
  
  return 'there'; // Default fallback
}

/**
 * Builds a prompt for summarizing an email for Slack notifications
 */
export function buildSummaryPrompt(email: Email): string {
  return `
=== EMAIL SUMMARY SYSTEM ===

You are an expert email analyst. Your task is to create a concise summary of the email below for a Slack notification.

=== INSTRUCTIONS ===

1. Create a single-sentence summary (maximum 15 words)
2. Capture the key message, request, or purpose of the email
3. Prioritize actionable items if present
4. Maintain a neutral, factual tone
5. If the email contains multiple topics, focus on the most important one

=== EMAIL CONTENT ===

SUBJECT: ${email.subject}
FROM: ${email.sender}

${email.body.substring(0, 800)}${email.body.length > 800 ? '...' : ''}

=== SUMMARY ===

Provide only the summary sentence without any explanation or additional text.`;
}
