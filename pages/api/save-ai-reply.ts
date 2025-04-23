import { NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../lib/auth-middleware';

// Types for the request body
interface SaveAIReplyRequest {
  email_id: string;
  reply: string;
}

// Types for the API response
interface ApiResponse {
  success: boolean;
  message: string;
  reply_id?: string;
  error?: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email_id, reply } = req.body as SaveAIReplyRequest;
    const user_id = req.user.id; // Get user_id from authenticated request

    // Validate required parameters
    if (!email_id || !reply) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: email_id and reply are required',
      });
    }

    // 1. Fetch the email to verify it exists
    const email = await prisma.email.findUnique({
      where: { id: email_id },
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    // 2. Fetch user settings
    const settings = await prisma.settings.findUnique({
      where: { user_id },
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'User settings not found',
      });
    }

    // 3. Save AI response to database
    const aiResponse = await prisma.aIResponse.create({
      data: {
        email_id,
        user_id,
        content: reply,
        summary: '', // n8n could provide a summary in the future
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // 4. Handle auto-reply if enabled in settings
    if (settings.auto_reply) {
      try {
        // Use Email Bison API to send the reply
        const emailBisonApiUrl = process.env.EMAIL_BISON_API_URL;
        const emailBisonApiKey = process.env.EMAIL_BISON_API_KEY;
        
        if (emailBisonApiUrl && emailBisonApiKey) {
          // Import axios here to avoid issues with SSR
          const axios = require('axios');
          
          await axios.post(emailBisonApiUrl, {
            email_id,
            reply_content: reply,
            user_id,
            signature: settings.signature || ''
          }, {
            headers: {
              'Authorization': `Bearer ${emailBisonApiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          // Update the AI response to mark it as sent
          await prisma.aIResponse.update({
            where: { id: aiResponse.id },
            data: {
              sent_at: new Date(),
              approved_by_user: true
            }
          });
        }
      } catch (sendError) {
        console.error('Failed to auto-send email reply:', sendError);
        // Return success but note the sending failure
        return res.status(200).json({
          success: true,
          message: 'AI reply saved but auto-send failed',
          reply_id: aiResponse.id,
        });
      }
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: settings.auto_reply 
        ? 'AI reply generated and sent' 
        : 'AI reply generated and saved for review',
      reply_id: aiResponse.id,
    });
  } catch (error) {
    console.error('Error in save-ai-reply endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default withAuth(handler);
