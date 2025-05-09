import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseClient } from '../../lib/supabase-client';
import { EmailBisonClient } from '../../lib/email-bison';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize clients
    const supabase = new SupabaseClient();
    const emailBison = new EmailBisonClient();
    
    // Get email data from request body
    const { 
      inbox_id, 
      thread_id, 
      recipient, 
      subject, 
      body, 
      cc = [], 
      bcc = [] 
    } = req.body;
    
    // Validate required fields
    if (!inbox_id || !recipient || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get inbox details
    const { data: inbox, error: inboxError } = await supabase.getInbox(inbox_id);

    if (inboxError || !inbox) {
      return res.status(404).json({ error: 'Inbox not found' });
    }

    // Generate a unique message ID
    const messageId = `${Date.now()}.${Math.random().toString(36).substring(2)}@mail-ai.com`;
    
    // Save email to database first
    const { data: email, error: saveError } = await supabase.client
      .from('emails')
      .insert([
        {
          inbox_id,
          message_id: messageId,
          thread_id: thread_id || messageId, // Use provided thread_id or create new one
          subject,
          body,
          body_html: null, // You could add HTML version if needed
          sender: inbox.email_address,
          recipient,
          cc,
          bcc,
          status: 'sending',
          is_draft: false,
          is_sent: false,
          is_inbound: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (saveError) {
      throw new Error(`Error saving email: ${saveError.message}`);
    }

    // Send email via Email Bison
    const sendResult = await emailBison.sendEmail({
      from: inbox.email_address,
      to: recipient,
      subject,
      body,
      cc,
      bcc
    });

    if (!sendResult.success) {
      // Update email status to failed
      await supabase.client
        .from('emails')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', email.id);
        
      throw new Error(`Failed to send email: ${sendResult.error}`);
    }

    // Update email status to sent
    const { data: updatedEmail, error: updateError } = await supabase.client
      .from('emails')
      .update({
        status: 'sent',
        is_sent: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', email.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating email status:', updateError);
    }

    return res.status(200).json({
      success: true,
      email_id: email.id,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error in send email endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send email',
      details: error.message
    });
  }
}
