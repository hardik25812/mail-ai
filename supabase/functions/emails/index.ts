// Supabase Edge Function for handling email endpoints
import '../_shared/types.ts'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY') || ''
const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL') || ''
const emailBisonApiKey = Deno.env.get('EMAIL_BISON_API_KEY') || ''

// Create a Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface EmailQueryParams {
  inbox_id?: string
  intent?: string
  status?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean)
    
    // Get the JWT token from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle different routes
    if (path[1] === 'emails') {
      // GET /emails - List emails with filters
      if (req.method === 'GET' && !path[2]) {
        const params = Object.fromEntries(url.searchParams) as unknown as EmailQueryParams
        
        // Set default pagination values
        const page = params.page ? parseInt(params.page as unknown as string) : 1
        const perPage = params.per_page ? parseInt(params.per_page as unknown as string) : 20
        const offset = (page - 1) * perPage
        
        // Build the query
        let query = supabase
          .from('emails')
          .select(`
            *,
            inbox:inboxes(id, email_address, name),
            ai_responses(id, content, approved_by_user, sent_at)
          `, { count: 'exact' })
          .order(params.sort_by || 'created_at', { ascending: params.sort_direction === 'asc' })
          .range(offset, offset + perPage - 1)
        
        // Apply filters
        if (params.inbox_id) {
          query = query.eq('inbox_id', params.inbox_id)
        }
        
        if (params.intent) {
          query = query.eq('intent', params.intent)
        }
        
        if (params.status) {
          query = query.eq('status', params.status)
        }
        
        // Execute the query
        const { data: emails, error, count } = await query
        
        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            data: emails,
            pagination: {
              total: count,
              page,
              per_page: perPage,
              total_pages: Math.ceil((count || 0) / perPage)
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // GET /emails/:id - Get a single email with its thread
      if (req.method === 'GET' && path[2]) {
        const emailId = path[2]
        
        // Get the email
        const { data: email, error: emailError } = await supabase
          .from('emails')
          .select(`
            *,
            inbox:inboxes(id, email_address, name),
            ai_responses(id, content, approved_by_user, sent_at)
          `)
          .eq('id', emailId)
          .single()
        
        if (emailError) {
          return new Response(
            JSON.stringify({ success: false, error: emailError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Get the thread
        const { data: thread, error: threadError } = await supabase
          .from('emails')
          .select(`
            *,
            ai_responses(id, content, approved_by_user, sent_at)
          `)
          .eq('thread_id', email.thread_id)
          .order('received_at', { ascending: false })
        
        if (threadError) {
          return new Response(
            JSON.stringify({ success: false, error: threadError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              email,
              thread
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // POST /emails/:id/reply - Send or save a reply
      if (req.method === 'POST' && path[2] && path[3] === 'reply') {
        const emailId = path[2]
        const { content, approve, send } = await req.json()
        
        // Get the email to reply to
        const { data: email, error: emailError } = await supabase
          .from('emails')
          .select(`
            *,
            inbox:inboxes(id, email_address, name, bison_inbox_id)
          `)
          .eq('id', emailId)
          .single()
        
        if (emailError) {
          return new Response(
            JSON.stringify({ success: false, error: emailError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Check if there's an existing AI response
        const { data: existingResponse, error: responseError } = await supabase
          .from('ai_responses')
          .select('*')
          .eq('email_id', emailId)
          .maybeSingle()
        
        if (responseError) {
          return new Response(
            JSON.stringify({ success: false, error: responseError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // If no content is provided, generate an AI response via n8n
        let responseContent = content
        if (!responseContent) {
          // Get user settings for AI customization
          const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('*')
            .eq('user_id', user.id)
            .single()
          
          if (settingsError && settingsError.code !== 'PGRST116') {
            return new Response(
              JSON.stringify({ success: false, error: settingsError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          
          // Call n8n webhook to generate AI response
          try {
            const n8nResponse = await fetch(n8nWebhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: {
                  id: email.id,
                  subject: email.subject,
                  body: email.body,
                  sender: email.sender,
                  recipient: email.recipient
                },
                settings: settings || {
                  tone: 'professional',
                  signature: '',
                  example_replies: []
                }
              })
            })
            
            const n8nData = await n8nResponse.json()
            responseContent = n8nData.content
          } catch (error) {
            return new Response(
              JSON.stringify({ success: false, error: 'Failed to generate AI response' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
        
        // Save or update the AI response
        let aiResponse
        if (existingResponse) {
          const { data: updatedResponse, error: updateError } = await supabase
            .from('ai_responses')
            .update({
              content: responseContent,
              approved_by_user: approve,
              sent_at: send ? new Date().toISOString() : null
            })
            .eq('id', existingResponse.id)
            .select()
            .single()
          
          if (updateError) {
            return new Response(
              JSON.stringify({ success: false, error: updateError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          
          aiResponse = updatedResponse
        } else {
          const { data: newResponse, error: insertError } = await supabase
            .from('ai_responses')
            .insert({
              email_id: emailId,
              content: responseContent,
              approved_by_user: approve,
              sent_at: send ? new Date().toISOString() : null
            })
            .select()
            .single()
          
          if (insertError) {
            return new Response(
              JSON.stringify({ success: false, error: insertError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          
          aiResponse = newResponse
        }
        
        // If send is true, send the email via Email Bison API
        if (send) {
          try {
            // In a real implementation, this would call the Email Bison API
            // For now, we'll just simulate a successful send
            
            // Create a record of the sent email
            const { data: sentEmail, error: sentEmailError } = await supabase
              .from('emails')
              .insert({
                inbox_id: email.inbox_id,
                message_id: `reply-${Date.now()}`,
                thread_id: email.thread_id,
                subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
                body: responseContent,
                sender: email.inbox.email_address,
                recipient: email.sender,
                status: 'sent',
                is_draft: false,
                is_sent: true,
                is_inbound: false,
                received_at: new Date().toISOString()
              })
              .select()
              .single()
            
            if (sentEmailError) {
              return new Response(
                JSON.stringify({ success: false, error: sentEmailError.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }
            
            // Update the original email status
            await supabase
              .from('emails')
              .update({ status: 'replied' })
              .eq('id', emailId)
            
            return new Response(
              JSON.stringify({
                success: true,
                data: {
                  ai_response: aiResponse,
                  sent_email: sentEmail
                }
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          } catch (error) {
            return new Response(
              JSON.stringify({ success: false, error: 'Failed to send email' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              ai_response: aiResponse
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // If no route matches
    return new Response(
      JSON.stringify({ success: false, error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
