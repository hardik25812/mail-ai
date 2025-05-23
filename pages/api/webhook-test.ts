import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Simple test webhook endpoint
 * This endpoint will accept and log webhook payloads without requiring 
 * database connections or environmental variables
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('TEST WEBHOOK RECEIVED:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    url: req.url
  });

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Extract the payload
    const payload = req.body;
    
    // Get the event type from either format (flat or nested)
    const eventType = payload.event_type || 
                     (payload.event && payload.event.type) || 
                     'unknown';
    
    // Handle the event (just logging for test purposes)
    console.log(`[TEST WEBHOOK] Received event type: ${eventType}`);
    console.log('[TEST WEBHOOK] Payload:', JSON.stringify(payload, null, 2));
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: `Test webhook received: ${eventType}`,
      received_at: new Date().toISOString(),
      // Echo back processed data
      data: {
        eventType,
        email: payload.data?.lead?.email || payload.data?.scheduled_email?.email_subject || 'No email data',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[TEST WEBHOOK] Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error in test webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
