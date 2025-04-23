import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseAdmin } from '../lib/supabase';

/**
 * API handler for email-related operations using Supabase client
 * GET /api/emails-supabase - List emails with filters
 * GET /api/emails-supabase/:id - Get a single email with its thread
 * POST /api/emails-supabase/:id/reply - Send or save a reply
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    const { id } = req.query;

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

    // List emails with filters
    if (method === 'GET' && !id) {
      const { 
        inbox_id, 
        intent, 
        status, 
        page = '1', 
        per_page = '20',
        sort_by = 'created_at',
        sort_direction = 'desc'
      } = req.query as {
        inbox_id?: string | string[];
        intent?: string | string[];
        status?: string | string[];
        page?: string;
        per_page?: string;
        sort_by?: string;
        sort_direction?: string;
      };

      // Convert page and per_page to numbers
      const pageNum = parseInt(page as string);
      const perPageNum = parseInt(per_page as string);
      const from = (pageNum - 1) * perPageNum;
      const to = from + perPageNum - 1;

      // Build query
      let query = supabase
        .from('emails')
        .select(`
          *,
          inbox:inboxes(id, email_address, name),
          ai_responses(id, content, approved_by_user, sent_at)
        `, { count: 'exact' })
        .order(sort_by as string, { ascending: sort_direction === 'asc' })
        .range(from, to);
      
      // Apply filters
      if (inbox_id) {
        query = query.eq('inbox_id', Array.isArray(inbox_id) ? inbox_id[0] : inbox_id);
      }
      
      if (intent) {
        query = query.eq('intent', Array.isArray(intent) ? intent[0] : intent);
      }
      
      if (status) {
        query = query.eq('status', Array.isArray(status) ? status[0] : status);
      }
      
      // Execute query
      const { data: emails, error, count } = await query;
      
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      return res.status(200).json({
        success: true,
        data: emails,
        pagination: {
          total: count,
          page: pageNum,
          per_page: perPageNum,
          total_pages: Math.ceil((count || 0) / perPageNum)
        }
      });
    }

    // Get a single email with its thread
    if (method === 'GET' && id) {
      const emailId = id as string;
      
      // Get the email
      const { data: email, error: emailError } = await supabase
        .from('emails')
        .select(`
          *,
          inbox:inboxes(id, email_address, name),
          ai_responses(id, content, approved_by_user, sent_at)
        `)
        .eq('id', emailId)
        .single();
      
      if (emailError) {
        return res.status(400).json({
          success: false,
          error: emailError.message
        });
      }
      
      // Get the thread
      const { data: thread, error: threadError } = await supabase
        .from('emails')
        .select(`
          *,
          ai_responses(id, content, approved_by_user, sent_at)
        `)
        .eq('thread_id', email.thread_id)
        .order('received_at', { ascending: false });
      
      if (threadError) {
        return res.status(400).json({
          success: false,
          error: threadError.message
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          email,
          thread
        }
      });
    }

    // Send or save a reply
    if (method === 'POST' && id && req.query.action === 'reply') {
      const emailId = id as string;
      const { content, approve, send } = req.body;
      
      // Get the email to reply to
      const { data: email, error: emailError } = await supabase
        .from('emails')
        .select(`
          *,
          inbox:inboxes(id, email_address, name, bison_inbox_id)
        `)
        .eq('id', emailId)
        .single();
      
      if (emailError) {
        return res.status(400).json({
          success: false,
          error: emailError.message
        });
      }
      
      // Check if there's an existing AI response
      const { data: existingResponse, error: responseError } = await supabase
        .from('ai_responses')
        .select('*')
        .eq('email_id', emailId)
        .maybeSingle();
      
      if (responseError) {
        return res.status(400).json({
          success: false,
          error: responseError.message
        });
      }
      
      // Save or update the AI response
      let aiResponse;
      if (existingResponse) {
        const { data: updatedResponse, error: updateError } = await supabase
          .from('ai_responses')
          .update({
            content: content,
            approved_by_user: approve,
            sent_at: send ? new Date().toISOString() : null
          })
          .eq('id', existingResponse.id)
          .select()
          .single();
        
        if (updateError) {
          return res.status(400).json({
            success: false,
            error: updateError.message
          });
        }
        
        aiResponse = updatedResponse;
      } else {
        const { data: newResponse, error: insertError } = await supabase
          .from('ai_responses')
          .insert({
            email_id: emailId,
            content: content,
            approved_by_user: approve,
            sent_at: send ? new Date().toISOString() : null
          })
          .select()
          .single();
        
        if (insertError) {
          return res.status(400).json({
            success: false,
            error: insertError.message
          });
        }
        
        aiResponse = newResponse;
      }
      
      // If send is true, create a record of the sent email
      let sentEmail;
      if (send) {
        // Update the original email status
        const { error: statusError } = await supabase
          .from('emails')
          .update({ status: 'replied' })
          .eq('id', emailId);
        
        if (statusError) {
          return res.status(400).json({
            success: false,
            error: statusError.message
          });
        }
        
        // Create a record of the sent email
        const { data: newEmail, error: emailInsertError } = await supabase
          .from('emails')
          .insert({
            inbox_id: email.inbox_id,
            message_id: `reply-${Date.now()}`,
            thread_id: email.thread_id,
            subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
            body: content,
            sender: email.inbox.email_address,
            recipient: email.sender,
            status: 'sent',
            is_draft: false,
            is_sent: true,
            is_inbound: false,
            received_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (emailInsertError) {
          return res.status(400).json({
            success: false,
            error: emailInsertError.message
          });
        }
        
        sentEmail = newEmail;
        
        return res.status(200).json({
          success: true,
          data: {
            ai_response: aiResponse,
            sent_email: sentEmail
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          ai_response: aiResponse
        }
      });
    }
    
    // If no route matches
    return res.status(404).json({
      success: false,
      error: 'Not found'
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
