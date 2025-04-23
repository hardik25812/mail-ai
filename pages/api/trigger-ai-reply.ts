import { NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { withAuth, AuthenticatedRequest } from '../../lib/auth-middleware';
import { v4 as uuidv4 } from 'uuid';

// Types for the request body
interface TriggerAIReplyRequest {
  email_id: string;
}

// Types for the n8n response
interface N8nResponse {
  reply_content: string;
  should_notify_slack: boolean;
  summary?: string;
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
    const { email_id } = req.body as TriggerAIReplyRequest;
    const user_id = req.user.id; // Get user_id from authenticated request

    // Validate required parameters
    if (!email_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: email_id is required',
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        message: 'Supabase credentials not configured',
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Fetch the email data
    const { data: email, error: emailError } = await supabase
      .from('emails')
      .select('*')
      .eq('id', email_id)
      .single();
    
    if (emailError || !email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }
    
    // Fetch thread emails
    const { data: threadEmails, error: threadError } = await supabase
      .from('emails')
      .select('*')
      .eq('thread_id', email.thread_id)
      .order('created_at', { ascending: true });
    
    if (threadError) {
      console.error('Error fetching thread emails:', threadError);
      // Continue without thread emails
    }

    // 2. Fetch the user settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user_id)
      .single();
    
    if (settingsError || !settings) {
      return res.status(404).json({
        success: false,
        message: 'User settings not found',
      });
    }

    // 3. Instead of sending to n8n webhook, create an AI reply job
    // Create the job in the ai_reply_jobs table
    const { data: job, error: jobError } = await supabase
      .from('ai_reply_jobs')
      .insert({
        id: uuidv4(),
        email_id: email_id,
        user_id: user_id,
        status: 'pending',
        attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (jobError) {
      return res.status(500).json({
        success: false,
        message: `Failed to create AI reply job: ${jobError.message}`,
      });
    }
    
    // Update email status to processing
    const { error: updateError } = await supabase
      .from('emails')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString() 
      })
      .eq('id', email_id);
    
    if (updateError) {
      console.error(`Error updating email status: ${updateError.message}`);
      // Continue despite error
    }
    
    // Return early since the worker will handle the actual processing
    return res.status(200).json({
      success: true,
      message: 'AI reply job created successfully. The worker will process it shortly.',
      reply_id: job[0].id,
    });

    // The code below is no longer needed as the worker will handle all this
    // The worker will:
    // 1. Generate the AI reply using OpenAI
    // 2. Save the response to the database
    // 3. Handle Slack notifications if configured
    // 4. Send auto-replies via Email Bison if enabled
  } catch (error) {
    console.error('Error in trigger-ai-reply endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default withAuth(handler);
