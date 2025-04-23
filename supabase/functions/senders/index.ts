// Supabase Edge Function for handling sender profile endpoints
import '../_shared/types.ts'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY') || ''

// Create a Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    if (path[1] === 'senders') {
      // GET /senders - List sender profiles
      if (req.method === 'GET' && !path[2]) {
        // Get workspace IDs the user has access to
        const { data: workspaces, error: workspaceError } = await supabase
          .from('workspace_users')
          .select('workspace_id')
          .eq('user_id', user.id)
        
        if (workspaceError) {
          return new Response(
            JSON.stringify({ success: false, error: workspaceError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const workspaceIds = workspaces.map(w => w.workspace_id)
        
        // Set default pagination values
        const page = parseInt(url.searchParams.get('page') || '1')
        const perPage = parseInt(url.searchParams.get('per_page') || '20')
        const offset = (page - 1) * perPage
        
        // Get sender profiles for those workspaces
        const { data: senders, error: sendersError, count } = await supabase
          .from('sender_profiles')
          .select('*', { count: 'exact' })
          .in('workspace_id', workspaceIds)
          .order('created_at', { ascending: false })
          .range(offset, offset + perPage - 1)
        
        if (sendersError) {
          return new Response(
            JSON.stringify({ success: false, error: sendersError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            data: senders,
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
      
      // POST /senders - Create a new sender profile
      if (req.method === 'POST' && !path[2]) {
        const { workspace_id, name, email, email_signature, timezone } = await req.json()
        
        // Validate required fields
        if (!workspace_id || !name || !email) {
          return new Response(
            JSON.stringify({ success: false, error: 'workspace_id, name, and email are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Check if user has access to the workspace
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspace_users')
          .select('*')
          .eq('workspace_id', workspace_id)
          .eq('user_id', user.id)
          .single()
        
        if (workspaceError || !workspace) {
          return new Response(
            JSON.stringify({ success: false, error: 'You do not have access to this workspace' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Create the sender profile
        const { data: sender, error: senderError } = await supabase
          .from('sender_profiles')
          .insert({
            user_id: user.id,
            workspace_id,
            name,
            email,
            email_signature,
            timezone: timezone || 'UTC'
          })
          .select()
          .single()
        
        if (senderError) {
          return new Response(
            JSON.stringify({ success: false, error: senderError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({ success: true, data: sender }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // GET /senders/:id - Get a single sender profile
      if (req.method === 'GET' && path[2] && !path[3]) {
        const senderId = path[2]
        
        // Get the sender profile
        const { data: sender, error: senderError } = await supabase
          .from('sender_profiles')
          .select('*')
          .eq('id', senderId)
          .single()
        
        if (senderError) {
          return new Response(
            JSON.stringify({ success: false, error: senderError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Check if user has access to the sender's workspace
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspace_users')
          .select('*')
          .eq('workspace_id', sender.workspace_id)
          .eq('user_id', user.id)
          .single()
        
        if (workspaceError || !workspace) {
          return new Response(
            JSON.stringify({ success: false, error: 'You do not have access to this sender profile' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({ success: true, data: sender }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // PUT /senders/:id - Update a sender profile
      if (req.method === 'PUT' && path[2] && !path[3]) {
        const senderId = path[2]
        const updates = await req.json()
        
        // Get the sender profile to check access
        const { data: sender, error: senderError } = await supabase
          .from('sender_profiles')
          .select('*')
          .eq('id', senderId)
          .single()
        
        if (senderError) {
          return new Response(
            JSON.stringify({ success: false, error: senderError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Check if user has access to the sender's workspace
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspace_users')
          .select('*')
          .eq('workspace_id', sender.workspace_id)
          .eq('user_id', user.id)
          .single()
        
        if (workspaceError || !workspace) {
          return new Response(
            JSON.stringify({ success: false, error: 'You do not have access to this sender profile' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Validate updates
        const allowedFields = ['name', 'email', 'email_signature', 'timezone']
        const sanitizedUpdates = Object.keys(updates)
          .filter(key => allowedFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = updates[key]
            return obj
          }, {})
        
        // Update the sender profile
        const { data: updatedSender, error: updateError } = await supabase
          .from('sender_profiles')
          .update({
            ...sanitizedUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('id', senderId)
          .select()
          .single()
        
        if (updateError) {
          return new Response(
            JSON.stringify({ success: false, error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({ success: true, data: updatedSender }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // PUT /senders/bulk-signature - Update signatures for multiple senders
      if (req.method === 'PUT' && path[2] === 'bulk-signature') {
        const { sender_ids, email_signature } = await req.json()
        
        // Validate required fields
        if (!sender_ids || !Array.isArray(sender_ids) || sender_ids.length === 0 || !email_signature) {
          return new Response(
            JSON.stringify({ success: false, error: 'sender_ids array and email_signature are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Get the sender profiles to check access
        const { data: senders, error: sendersError } = await supabase
          .from('sender_profiles')
          .select('id, workspace_id')
          .in('id', sender_ids)
        
        if (sendersError) {
          return new Response(
            JSON.stringify({ success: false, error: sendersError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Check if user has access to all sender workspaces
        const workspaceIds = [...new Set(senders.map(s => s.workspace_id))]
        const { data: workspaces, error: workspacesError } = await supabase
          .from('workspace_users')
          .select('workspace_id')
          .in('workspace_id', workspaceIds)
          .eq('user_id', user.id)
        
        if (workspacesError) {
          return new Response(
            JSON.stringify({ success: false, error: workspacesError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const accessibleWorkspaceIds = workspaces.map(w => w.workspace_id)
        const inaccessibleSenders = senders.filter(s => !accessibleWorkspaceIds.includes(s.workspace_id))
        
        if (inaccessibleSenders.length > 0) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'You do not have access to some of the sender profiles',
              inaccessible_sender_ids: inaccessibleSenders.map(s => s.id)
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Update all sender profiles
        const { data: updatedSenders, error: updateError } = await supabase
          .from('sender_profiles')
          .update({
            email_signature,
            updated_at: new Date().toISOString()
          })
          .in('id', sender_ids)
          .select()
        
        if (updateError) {
          return new Response(
            JSON.stringify({ success: false, error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: { 
              updated_count: updatedSenders.length,
              updated_sender_ids: updatedSenders.map(s => s.id)
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
