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
  
  // Add additional contextual instructions if provided
  if (additionalInstructions) {
    prompt += `
7. CONTEXTUAL NOTES:
   ${additionalInstructions}
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
