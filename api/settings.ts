import { prisma } from '../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API handler for user settings operations
 * GET /api/settings - Get user settings
 * PUT /api/settings - Update user settings
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    
    // Get user ID from request (in a real app, this would come from authentication)
    // For this example, we'll use a query parameter
    const userId = req.query.user_id as string;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // GET /settings - Get user settings
    if (method === 'GET') {
      const settings = await prisma.settings.findUnique({
        where: { user_id: userId }
      });
      
      // If no settings exist, create default settings
      if (!settings) {
        const defaultSettings = await prisma.settings.create({
          data: {
            user_id: userId,
            tone: 'professional',
            auto_reply: false,
            timezone: 'UTC'
          }
        });
        
        return res.status(200).json({
          success: true,
          data: defaultSettings
        });
      }
      
      return res.status(200).json({
        success: true,
        data: settings
      });
    }
    
    // PUT /settings - Update user settings
    if (method === 'PUT') {
      const {
        tone,
        signature,
        auto_reply,
        slack_url,
        calendly_url,
        timezone,
        example_replies
      } = req.body;
      
      // Validate updates
      const updates: any = {};
      if (tone !== undefined) updates.tone = tone;
      if (signature !== undefined) updates.signature = signature;
      if (auto_reply !== undefined) updates.auto_reply = auto_reply;
      if (slack_url !== undefined) updates.slack_url = slack_url;
      if (calendly_url !== undefined) updates.calendly_url = calendly_url;
      if (timezone !== undefined) updates.timezone = timezone;
      if (example_replies !== undefined) updates.example_replies = example_replies;
      
      // Update settings using upsert to create if not exists
      const settings = await prisma.settings.upsert({
        where: { user_id: userId },
        update: updates,
        create: {
          user_id: userId,
          ...updates,
          auto_reply: updates.auto_reply ?? false
        }
      });
      
      return res.status(200).json({
        success: true,
        data: settings
      });
    }
    
    // If no route matches
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
