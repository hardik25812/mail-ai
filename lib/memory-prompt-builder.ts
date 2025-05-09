/**
 * Memory-based prompt builder for OpenAI GPT-4
 * Generates optimized prompts for AI email replies using past reply examples
 */

import { buildReplyPrompt, buildSummaryPrompt } from './prompt-builder';
import { PastReply } from './supabase-client-extensions';
import { createLogger } from './logger';

// Define interfaces similar to those in prompt-builder
interface Email {
  id: string;
  subject: string;
  body: string;
  sender: string;
  recipient: string;
  inbox_id: string;
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

interface PromptOptions {
  email: Email;
  settings: UserSettings;
  additionalInstructions?: string;
}

const logger = createLogger('memory-prompt-builder');

/**
 * Extended prompt options with past replies
 */
export interface MemoryPromptOptions extends PromptOptions {
  pastReplies?: PastReply[];
}

/**
 * Builds a memory-enhanced prompt for OpenAI GPT-4 to generate an email reply
 * Uses past replies as examples to improve reply quality
 */
export function buildMemoryReplyPrompt(options: MemoryPromptOptions): string {
  const { email, settings, additionalInstructions, pastReplies } = options;
  
  // Start with a base prompt
  let prompt = `
=== EMAIL REPLY GENERATION SYSTEM ===

You are an AI assistant helping respond to incoming customer emails.

=== ANALYSIS INSTRUCTIONS ===

First, analyze the customer's email carefully and determine:
- What are they asking about? (pricing, demo, support, etc.)
- How urgent is it?
- What tone should be used in the reply? (formal, friendly, apologetic)
`;

  // Add memory examples if available
  if (pastReplies && pastReplies.length > 0) {
    logger.info(`Including ${pastReplies.length} past replies as examples`);
    
    prompt += `
=== PAST REPLY EXAMPLES ===

Here are examples of past replies from this inbox that you should use as a reference for style, tone, and format:

${pastReplies.map((reply, index) => `EXAMPLE ${index + 1}:\n${reply.content}\n---`).join('\n')}

Please maintain a similar tone, style, and structure in your response.
`;
  } else {
    logger.info('No past replies available, using standard prompt');
    
    prompt += `
=== STYLE GUIDANCE ===

Without past examples, please use a ${settings.tone || 'professional'} tone that is helpful and concise.
`;
  }

  // Add response instructions
  prompt += `
=== RESPONSE INSTRUCTIONS ===

Write a professional, helpful reply that:
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
