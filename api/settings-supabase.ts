import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseAdmin } from '../lib/supabase';

/**
 * API handler for user settings operations using Supabase client
 * GET /api/settings-supabase - Get user settings
 * PUT /api/settings-supabase - Update user settings
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    
    // Get the JWT token from the request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Missing authorization header'
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    const userId = user.id;

    // GET /settings-supabase - Get user settings
    if (method === 'GET') {
      const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      // If no settings exist, create default settings
      if (!settings) {
        const defaultSettings = {
          user_id: userId,
          tone: 'professional',
          auto_reply: false,
          timezone: 'UTC'
        };
        
        const { data: newSettings, error: insertError } = await supabase
          .from('settings')
          .insert(defaultSettings)
          .select()
          .single();
        
        if (insertError) {
          return res.status(400).json({
            success: false,
            error: insertError.message
          });
        }
        
        return res.status(200).json({
          success: true,
          data: newSettings
        });
      }
      
      return res.status(200).json({
        success: true,
        data: settings
      });
    }
    
    // PUT /settings-supabase - Update user settings
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
      
      // Check if settings exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('settings')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) {
        return res.status(400).json({
          success: false,
          error: checkError.message
        });
      }
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        const { data: updatedSettings, error: updateError } = await supabase
          .from('settings')
          .update(updates)
          .eq('user_id', userId)
          .select()
          .single();
        
        if (updateError) {
          return res.status(400).json({
            success: false,
            error: updateError.message
          });
        }
        
        result = updatedSettings;
      } else {
        // Create new settings
        const { data: newSettings, error: insertError } = await supabase
          .from('settings')
          .insert({
            user_id: userId,
            ...updates,
            auto_reply: updates.auto_reply ?? false
          })
          .select()
          .single();
        
        if (insertError) {
          return res.status(400).json({
            success: false,
            error: insertError.message
          });
        }
        
        result = newSettings;
      }
      
      return res.status(200).json({
        success: true,
        data: result
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
