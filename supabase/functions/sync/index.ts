// Supabase Edge Function for syncing emails manually
import '../_shared/types.ts'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY') || ''
const emailBisonApiKey = Deno.env.get('EMAIL_BISON_API_KEY') || ''
const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL') || ''

// Create a Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mock function to simulate fetching emails from Email Bison API
async function fetchEmailsFromBison(inboxId: string, lastSyncedAt: string | null) {
  // In a real implementation, this would call the Email Bison API
  // For now, we'll just return mock data
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Generate a random number of emails (0-5)
  const numEmails = Math.floor(Math.random() * 6)
  const emails = []
  
  for (let i = 0; i < numEmails; i++) {
    const now = new Date()
    const messageId = `msg-${Date.now()}-${i}`
    const threadId = `thread-${Date.now() % 10000}`
    
    emails.push({
      message_id: messageId,
      thread_id: threadId,
      subject: `Test Email ${i + 1}`,
      body: `This is a test email body ${i + 1}`,
      body_html: `<p>This is a test email body ${i + 1}</p>`,
      sender: `sender${i + 1}@example.com`,
      recipient: `recipient@example.com`,
      received_at: now.toISOString()
    })
  }
  
  return emails
}

// Function to classify email intent and score using n8n webhook
async function classifyEmail(email: any) {
  try {
    // Call n8n webhook to classify email
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'classify',
        email: {
          id: email.id,
          subject: email.subject,
          body: email.body,
          sender: email.sender,
          recipient: email.recipient
        }
      })
    })
    
    const data = await response.json()
    
    return {
      intent: data.intent || 'other',
      lead_score: data.lead_score || null
    }
  } catch (error) {
    console.error('Error classifying email:', error)
    return {
      intent: 'other',
      lead_score: null
    }
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Verify API key from request header
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey || apiKey !== Deno.env.get('SYNC_API_KEY')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get request body
    const { inbox_id } = await req.json()
    
    // If inbox_id is provided, sync only that inbox
    if (inbox_id) {
      const { data: inbox, error: inboxError } = await supabase
        .from('inboxes')
        .select('*')
        .eq('id', inbox_id)
        .eq('active', true)
        .single()
      
      if (inboxError) {
        return new Response(
          JSON.stringify({ success: false, error: inboxError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      const result = await syncInbox(inbox)
      
      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Otherwise, sync all active inboxes
    const { data: inboxes, error: inboxesError } = await supabase
      .from('inboxes')
      .select('*')
      .eq('active', true)
    
    if (inboxesError) {
      return new Response(
        JSON.stringify({ success: false, error: inboxesError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const results = []
    
    for (const inbox of inboxes) {
      const result = await syncInbox(inbox)
      results.push(result)
    }
    
    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function syncInbox(inbox: any) {
  try {
    // Fetch emails from Email Bison API
    const emails = await fetchEmailsFromBison(inbox.bison_inbox_id, inbox.last_synced_at)
    
    const newEmails = []
    
    // Process each email
    for (const email of emails) {
      // Check if email already exists
      const { data: existingEmail, error: existingEmailError } = await supabase
        .from('emails')
        .select('id')
        .eq('inbox_id', inbox.id)
        .eq('message_id', email.message_id)
        .maybeSingle()
      
      if (existingEmailError) {
        console.error('Error checking existing email:', existingEmailError)
        continue
      }
      
      if (existingEmail) {
        continue // Skip if email already exists
      }
      
      // Insert new email
      const { data: newEmail, error: newEmailError } = await supabase
        .from('emails')
        .insert({
          inbox_id: inbox.id,
          message_id: email.message_id,
          thread_id: email.thread_id,
          subject: email.subject,
          body: email.body,
          body_html: email.body_html,
          sender: email.sender,
          recipient: email.recipient,
          status: 'unread',
          is_inbound: true,
          received_at: email.received_at
        })
        .select()
        .single()
      
      if (newEmailError) {
        console.error('Error inserting new email:', newEmailError)
        continue
      }
      
      // Classify email intent and score
      const { intent, lead_score } = await classifyEmail(newEmail)
      
      // Update email with classification
      const { data: updatedEmail, error: updateError } = await supabase
        .from('emails')
        .update({
          intent,
          lead_score
        })
        .eq('id', newEmail.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating email classification:', updateError)
      } else {
        newEmails.push(updatedEmail)
      }
    }
    
    // Update inbox last_synced_at
    await supabase
      .from('inboxes')
      .update({
        last_synced_at: new Date().toISOString()
      })
      .eq('id', inbox.id)
    
    return {
      inbox_id: inbox.id,
      emails_synced: newEmails.length,
      emails: newEmails
    }
  } catch (error) {
    console.error('Error syncing inbox:', error)
    return {
      inbox_id: inbox.id,
      error: error.message,
      emails_synced: 0,
      emails: []
    }
  }
}
