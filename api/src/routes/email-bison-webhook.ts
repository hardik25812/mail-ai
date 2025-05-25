/**
 * Email Bison Webhook Handler
 * Receives and processes real-time email events from Email Bison
 */
import express from 'express';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import crypto from 'crypto';

// Import environment variables
const BISON_API_KEY = process.env.BISON_API_KEY;
const BISON_API_URL = process.env.BISON_API_URL || 'https://sender.recruitron.io/api';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Create router
const router = express.Router();

// Webhook statistics for monitoring
const webhookStats = {
  totalReceived: 0,
  newEmailsReceived: 0,
  repliesSent: 0,
  errors: 0,
  lastWebhookAt: null as Date | null
};

// In-memory storage for emails (replace with database in production)
const emailStore: Record<string, any> = {};

// Middleware to validate webhook request
const validateWebhook = (req: Request, res: Response, next: Function) => {
  // Check for basic headers and auth if needed
  // In production, you would verify webhook signatures here
  
  // Example signature verification (uncomment and adapt when Email Bison provides signatures)
  /*
  const signature = req.headers['x-bison-signature'] as string;
  if (!signature) {
    return res.status(401).json({ success: false, message: 'Missing signature' });
  }
  
  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET || '');
  const calculatedSignature = hmac.update(payload).digest('hex');
  
  if (calculatedSignature !== signature) {
    return res.status(401).json({ success: false, message: 'Invalid signature' });
  }
  */
  
  next();
};

// Main webhook handler
router.post('/', express.json(), validateWebhook, async (req: Request, res: Response) => {
  try {
    // Log webhook receipt
    console.log('===============================================');
    console.log('WEBHOOK RECEIVED at', new Date().toISOString());
    console.log('REQUEST BODY:', JSON.stringify(req.body, null, 2));
    console.log('===============================================');
    
    // Update stats
    webhookStats.totalReceived++;
    webhookStats.lastWebhookAt = new Date();
    
    const { event, data } = req.body;
    
    // Process webhook asynchronously
    // We respond quickly to the webhook sender, then process in the background
    res.status(200).json({ success: true, message: 'Webhook received successfully' });
    
    // Process the webhook event
    await processWebhookEvent(event, data);
  } catch (error) {
    // Log error and update stats
    logWebhookError(error, 'webhook-handler');
    webhookStats.errors++;
    
    // Still return 200 to avoid Email Bison retrying (we can change this if retry is desired)
    res.status(200).json({ success: false, message: 'Error processing webhook' });
  }
});

// Stats endpoint to monitor webhook activity
router.get('/stats', (req: Request, res: Response) => {
  res.json({
    ...webhookStats,
    emailsStored: Object.keys(emailStore).length
  });
});

/**
 * Process webhook event based on type
 */
async function processWebhookEvent(event: string, data: any) {
  // Handle different event types
  try {
    switch (event) {
      case 'new_email_received':
        await withRetry(() => handleNewEmail(data));
        break;
      
      case 'email_replied':
        await withRetry(() => handleEmailReplied(data));
        break;
      
      case 'email_read':
        await withRetry(() => handleEmailRead(data));
        break;
      
      // Add more event types as needed
      default:
        console.log(`Unhandled webhook event type: ${event}`);
    }
  } catch (error) {
    logWebhookError(error, `process-event-${event}`);
    throw error; // Re-throw for higher level handling
  }
}

/**
 * Handle new email received event
 */
async function handleNewEmail(data: any) {
  const { inboxId, subject, body, messageId, sender, recipients, attachments } = data;
  
  try {
    console.log(`🧠 Processing new email: "${subject}" from ${sender}`);
    webhookStats.newEmailsReceived++;
    
    // 1. Save to database
    await saveEmailToDatabase({ 
      inboxId, 
      messageId, 
      subject, 
      body, 
      sender, 
      recipients, 
      attachments,
      receivedAt: new Date(),
      status: 'received'
    });
    
    // 2. Analyze with AI to determine if a reply is needed
    const shouldReply = await analyzeEmailForReply(subject, body);
    
    if (shouldReply) {
      // 3. Generate AI reply
      const reply = await generateAIReply(subject, body, sender);
      
      // 4. Send reply via Email Bison
      const replyResult = await sendReplyViaEmailBison({ 
        messageId, 
        inboxId, 
        reply, 
        replyToEmail: sender 
      });
      
      // 5. Update email status in database
      if (replyResult.success) {
        await updateEmailStatus(messageId, 'replied', replyResult.replyId);
        webhookStats.repliesSent++;
        console.log(`✅ Automated reply sent for email: "${subject}"`);
      } else {
        await updateEmailStatus(messageId, 'reply_failed');
        console.log(`❌ Failed to send automated reply for: "${subject}"`);
      }
    } else {
      await updateEmailStatus(messageId, 'no_reply_needed');
      console.log(`⏭️ No automated reply needed for: "${subject}"`);
    }
  } catch (error) {
    logWebhookError(error, 'handle-new-email');
    await updateEmailStatus(messageId, 'processing_error');
  }
}

/**
 * Handle email replied event
 */
async function handleEmailReplied(data: any) {
  const { messageId, subject, replyId } = data;
  console.log(`📩 Email replied: ${subject}`);
  
  try {
    // Update the original email status
    await updateEmailStatus(messageId, 'user_replied', replyId);
    
    // Add additional tracking logic as needed
  } catch (error) {
    logWebhookError(error, 'handle-email-replied');
  }
}

/**
 * Handle email read event
 */
async function handleEmailRead(data: any) {
  const { messageId, subject } = data;
  console.log(`👁️ Email read: ${subject}`);
  
  try {
    // Update email status
    await updateEmailStatus(messageId, 'read');
    
    // Add additional tracking logic as needed
  } catch (error) {
    logWebhookError(error, 'handle-email-read');
  }
}

/**
 * Save email to database
 * In production, replace with actual database operations
 */
async function saveEmailToDatabase(emailData: any): Promise<void> {
  try {
    // In-memory storage (replace with database in production)
    emailStore[emailData.messageId] = {
      ...emailData,
      storedAt: new Date()
    };
    
    console.log(`📝 Email saved to database: ${emailData.subject}`);
    
    // In production, you would use a real database:
    // await db.collection('emails').insertOne(emailData);
  } catch (error) {
    logWebhookError(error, 'save-email-to-db');
    throw error;
  }
}

/**
 * Update email status in database
 */
async function updateEmailStatus(
  messageId: string, 
  status: string, 
  relatedId?: string
): Promise<void> {
  try {
    // Update in-memory store
    if (emailStore[messageId]) {
      emailStore[messageId].status = status;
      emailStore[messageId].updatedAt = new Date();
      
      if (relatedId) {
        emailStore[messageId].relatedId = relatedId;
      }
      
      console.log(`📊 Email status updated: ${messageId} -> ${status}`);
    }
    
    // In production with a real database:
    // await db.collection('emails').updateOne(
    //   { messageId },
    //   { $set: { status, updatedAt: new Date(), ...(relatedId ? { relatedId } : {}) } }
    // );
  } catch (error) {
    logWebhookError(error, 'update-email-status');
  }
}

/**
 * Analyze email to determine if it needs an AI reply
 */
async function analyzeEmailForReply(subject: string, body: string): Promise<boolean> {
  try {
    // In a production system, use NLP/AI to determine if a reply is needed
    // For example, checking if it's a spam, auto-reply, or requires human attention
    
    // Simple checks for demonstration:
    const noReplyPatterns = [
      'noreply@',
      'do-not-reply',
      'automatic response',
      'out of office',
      'unsubscribe'
    ];
    
    // Check if the email is from a no-reply address or is an auto-response
    const isNoReplyEmail = noReplyPatterns.some(pattern => 
      subject.toLowerCase().includes(pattern) || body.toLowerCase().includes(pattern)
    );
    
    // For testing purposes, most emails will get a reply
    // In production, implement more sophisticated logic
    return !isNoReplyEmail;
  } catch (error) {
    logWebhookError(error, 'analyze-email');
    // Default to not replying in case of error
    return false;
  }
}

/**
 * Generate AI reply for an email
 */
async function generateAIReply(subject: string, body: string, sender: string): Promise<string> {
  try {
    console.log(`🤖 Generating AI reply for: "${subject}"`);
    
    // If OpenAI API key is available, use it
    if (OPENAI_API_KEY) {
      try {
        // Make API call to OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system', 
                content: 'You are a helpful email assistant. Write a professional, concise, and helpful reply.'
              },
              {
                role: 'user', 
                content: `Write a reply to this email. Subject: ${subject}\n\nBody: ${body}`
              }
            ],
            max_tokens: 500
          })
        });
        
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          return data.choices[0].message.content.trim();
        }
      } catch (aiError) {
        console.error('Error calling OpenAI API:', aiError);
        // Fall back to template reply
      }
    }
    
    // Fallback to template-based reply if OpenAI is not available
    // Extract first name from sender email
    const firstName = extractNameFromEmail(sender);
    
    return `Dear ${firstName},

Thank you for your email regarding "${subject}". I've received your message and will review it carefully.

I'll get back to you with a more detailed response soon. If your matter is urgent, please let me know.

Best regards,
Email Bison AI Assistant`;
  } catch (error) {
    logWebhookError(error, 'generate-ai-reply');
    // Return a simple fallback reply in case of error
    return `Thank you for your email. I've received your message and will get back to you soon.

Best regards,
Email Bison AI Assistant`;
  }
}

/**
 * Send a reply via Email Bison API
 */
async function sendReplyViaEmailBison({ 
  messageId, 
  inboxId, 
  reply, 
  replyToEmail 
}: { 
  messageId: string;
  inboxId: string;
  reply: string;
  replyToEmail: string;
}): Promise<{success: boolean, replyId?: string}> {
  try {
    console.log(`📤 Sending reply via Email Bison API to ${replyToEmail}`);
    
    if (!BISON_API_KEY) {
      throw new Error('BISON_API_KEY not configured');
    }
    
    // Call Email Bison API to send the reply
    const response = await fetch(`${BISON_API_URL}/emails/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BISON_API_KEY}`
      },
      body: JSON.stringify({
        inboxId,
        messageId,
        content: reply
      })
    });
    
    // Parse the response
    if (response.ok) {
      const result = await response.json();
      console.log('Reply API response:', result);
      return { 
        success: true, 
        replyId: result.data?.id || `reply-${Date.now()}`
      };
    } else {
      const errorData = await response.text();
      throw new Error(`API error: ${response.status} - ${errorData}`);
    }
  } catch (error) {
    logWebhookError(error, 'send-reply');
    
    // For demo purposes, pretend the reply was sent
    // Remove this in production and handle errors properly
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Demo mode: Simulating successful reply to ${replyToEmail}`);
      console.log(`Reply content (first 100 chars): ${reply.substring(0, 100)}...`);
      return { success: true, replyId: `mock-reply-${Date.now()}` };
    }
    
    return { success: false };
  }
}

/**
 * Extract a name from email address
 */
function extractNameFromEmail(email: string): string {
  try {
    // Try to extract the part before the @ symbol
    const namePart = email.split('@')[0] || '';
    
    // Convert something like 'john.doe' to 'John'
    const firstName = namePart.split('.')[0] || '';
    
    // Capitalize first letter
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  } catch (error) {
    return 'there'; // Fallback
  }
}

/**
 * Error logging helper
 */
function logWebhookError(error: any, context: string) {
  console.error(`⛔ Webhook Error [${context}]:`, error);
  
  // In production, send to error monitoring service
  // For example: Sentry.captureException(error);
}

/**
 * Retry helper for operations
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let retries = 0;
  let lastError: any;
  
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      retries++;
      
      if (retries >= maxRetries) break;
      
      console.log(`🔄 Retrying operation, attempt ${retries}/${maxRetries}`);
      await new Promise(r => setTimeout(r, 1000 * retries)); // Exponential backoff
    }
  }
  
  console.error(`❌ Operation failed after ${maxRetries} retries`);
  throw lastError;
}

export default router;

