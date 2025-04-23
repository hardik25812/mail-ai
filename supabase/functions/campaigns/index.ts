// Supabase Edge Function for handling campaign endpoints
import '../_shared/types.ts'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
import { corsHeaders } from '../_shared/cors.ts'
import { 
  Campaign, 
  CampaignStep, 
  CampaignStats,
  RecordWithStatus, 
  WorkspaceUser,
  OrderOptions,
  User,
  UserIdentity,
  SupabaseAuthResponse,
  handleError, 
  createStringIndexedObject
} from '../_shared/types-helpers.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY') || ''

// Create a Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Process step stats with proper typing
function processCampaignSteps(campaign: Campaign, steps: CampaignStep[]): Record<string, {
  step_id: string;
  subject: string;
  sequence: number;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
}> {
  interface StepStats {
    step_id: string;
    subject: string;
    sequence: number;
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  }
  
  const stepsStats = createStringIndexedObject<StepStats>()
  
  steps.forEach((step: CampaignStep) => {
    const stepStats: StepStats = {
      step_id: step.id,
      subject: step.subject,
      sequence: step.sequence_number,
      sent: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
    }
    stepsStats[step.id] = stepStats
  })
  
  return stepsStats
}

serve(async (req: Request): Promise<Response> => {
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

    // Verify the JWT token and get the user using a simpler approach
    let userId: string;
    try {
      const { error, data } = await supabase.auth.getUser(token)
      
      if (error || !data) {
        return new Response(
          JSON.stringify({ success: false, error: error?.message || 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Extract the user ID directly from the data object
      // Using any type here to bypass TypeScript errors and move forward
      userId = (data as any).user?.id
      
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'User ID not found' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (authError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle different routes
    if (path[1] === 'campaigns') {
      // GET /campaigns - List campaigns
      if (req.method === 'GET' && !path[2]) {
        // Get workspace IDs the user has access to
        const { data: workspaces, error: workspaceError } = await supabase
          .from('workspace_users')
          .select('workspace_id')
          .eq('user_id', userId)

        if (workspaceError) {
          return new Response(
            JSON.stringify({ success: false, error: workspaceError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const workspaceIds = workspaces.map((w: WorkspaceUser) => w.workspace_id)

        // Set default pagination values
        const page = parseInt(url.searchParams.get('page') || '1')
        const perPage = parseInt(url.searchParams.get('per_page') || '20')
        const offset = (page - 1) * perPage

        // Get campaigns for those workspaces with count
        const { data: campaigns, error: campaignError, count } = await supabase
          .from('campaigns')
          .select('*')
          .in('workspace_id', workspaceIds)
          .order('created_at', { ascending: false })
          .limit(perPage)
          .offset(offset)
          
        // Get related data in separate queries to avoid potential issues
        if (campaigns && campaigns.length > 0) {
          // Define campaign type for type safety
          interface CampaignItem extends Campaign {
            workspace?: { id: string; name: string };
            steps?: Array<{ id: string; campaign_id: string; step_number: number }>;
          }
          
          // Get workspace data
          const { data: workspaceData } = await supabase
            .from('workspaces')
            .select('id, name')
            .in('id', campaigns.map((c: Campaign) => c.workspace_id))
            
          // Get steps data
          const { data: stepsData } = await supabase
            .from('campaign_steps')
            .select('id, campaign_id, step_number')
            .in('campaign_id', campaigns.map((c: Campaign) => c.id))
            
          // Attach related data to campaigns
          campaigns.forEach((campaign: CampaignItem) => {
            campaign.workspace = workspaceData?.find((w: { id: string }) => w.id === campaign.workspace_id)
            campaign.steps = stepsData?.filter((s: { campaign_id: string }) => s.campaign_id === campaign.id) || []
          })
        }

        if (campaignError) {
          return new Response(
            JSON.stringify({ success: false, error: campaignError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: campaigns,
            meta: {
              page,
              per_page: perPage,
              total_pages: Math.ceil((count || 0) / perPage)
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // POST /campaigns - Create a new campaign
      if (req.method === 'POST' && !path[2]) {
        const { workspace_id, name, description, timezone } = await req.json()

        // Validate required fields
        if (!workspace_id || !name) {
          return new Response(
            JSON.stringify({ success: false, error: 'Workspace ID and name are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if user has access to the workspace
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspace_users')
          .select('*')
          .eq('workspace_id', workspace_id)
          .eq('user_id', userId)
          .single()

        if (workspaceError || !workspace) {
          return new Response(
            JSON.stringify({ success: false, error: 'You do not have access to this workspace' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Create the campaign
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            workspace_id,
            name,
            description,
            timezone: timezone || 'UTC',
            status: 'draft'
          })
          .select()
          .single()

        if (campaignError) {
          return new Response(
            JSON.stringify({ success: false, error: campaignError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: campaign }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // GET /campaigns/:id - Get a single campaign
      if (req.method === 'GET' && path[2] && !path[3]) {
        const campaignId = path[2]

        // Get the campaign
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select(`
            *,
            workspace:workspaces(*)
          `)
          .eq('id', campaignId)
          .single()
        
        if (campaignError) {
          return new Response(
            JSON.stringify({ success: false, error: campaignError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Check if user has access to the campaign's workspace
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspace_users')
          .select('*')
          .eq('workspace_id', campaign.workspace_id)
          .eq('user_id', userId)
          .single()

        if (workspaceError || !workspace) {
          return new Response(
            JSON.stringify({ success: false, error: 'You do not have access to this campaign' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: campaign }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // PUT /campaigns/:id - Update a campaign
      if (req.method === 'PUT' && path[2] && !path[3]) {
        const campaignId = path[2]
        const updates = await req.json()

        // Get the campaign to check access
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .single()
        
        if (campaignError) {
          return new Response(
            JSON.stringify({ success: false, error: campaignError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Check if user has access to the campaign's workspace
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspace_users')
          .select('*')
          .eq('workspace_id', campaign.workspace_id)
          .eq('user_id', userId)
          .single()

        if (workspaceError || !workspace) {
          return new Response(
            JSON.stringify({ success: false, error: 'You do not have access to this campaign' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Validate updates
        const allowedFields = ['name', 'description', 'status', 'timezone']
        const sanitizedUpdates = Object.keys(updates)
          .filter(key => allowedFields.includes(key))
          .reduce<Record<string, any>>((obj, key) => {
            obj[key] = updates[key]
            return obj
          }, {})

        // Update the campaign
        const { data: updatedCampaign, error: updateError } = await supabase
          .from('campaigns')
          .update(sanitizedUpdates)
          .eq('id', campaignId)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ success: false, error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: updatedCampaign }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // GET /campaigns/:id/stats - Get campaign statistics
      if (req.method === 'GET' && path[2] && path[3] === 'stats') {
        const campaignId = path[2]

        // Get the campaign to check access
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .single()
        
        if (campaignError) {
          return new Response(
            JSON.stringify({ success: false, error: campaignError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Check if user has access to the campaign's workspace
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspace_users')
          .select('*')
          .eq('workspace_id', campaign.workspace_id)
          .eq('user_id', userId)
          .single()

        if (workspaceError || !workspace) {
          return new Response(
            JSON.stringify({ success: false, error: 'You do not have access to this campaign' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get campaign steps
        const { data: steps, error: stepsError } = await supabase
          .from('campaign_steps')
          .select('*')
          .eq('campaign_id', campaignId)
          .order('step_number', { ascending: true } as OrderOptions)

        if (stepsError) {
          return new Response(
            JSON.stringify({ success: false, error: stepsError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get campaign stats
        const { data: stats, error: statsError } = await supabase
          .from('campaign_stats')
          .select('*')
          .eq('campaign_id', campaignId)

        if (statsError) {
          return new Response(
            JSON.stringify({ success: false, error: statsError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get recipient stats
        const { data: recipients, error: recipientsError } = await supabase
          .rpc('get_recipient_stats_by_campaign', {
            campaign_id: campaignId
          })

        if (recipientsError) {
          return new Response(
            JSON.stringify({ success: false, error: recipientsError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Calculate overall stats
        const overallStats = {
          total_recipients: 0,
          active: 0,
          completed: 0,
          unsubscribed: 0,
          pending: 0
        }

        recipients.forEach((r: RecordWithStatus) => {
          overallStats.total_recipients += r.count || 0
          
          // Use safe index access with type checking
          if (r.status && r.status in overallStats) {
            const statusKey = r.status as keyof typeof overallStats
            overallStats[statusKey] = r.count || 0
          }
        })

        // Map stats to steps
        const stepStats = steps.map((step: CampaignStep) => {
          const stepStat = stats.find((s: CampaignStats) => 
            s.step_number === (step.step_number || step.sequence_number)
          ) || {
            emails_sent: 0,
            emails_delivered: 0,
            emails_opened: 0,
            emails_clicked: 0,
            emails_replied: 0,
            emails_bounced: 0
          }

          return {
            step_number: step.step_number || step.sequence_number,
            subject: step.subject,
            delay_hours: step.delay_hours,
            stats: {
              sent: stepStat.emails_sent,
              delivered: stepStat.emails_delivered || 0,
              opened: stepStat.emails_opened,
              clicked: stepStat.emails_clicked,
              replied: stepStat.emails_replied,
              bounced: stepStat.emails_bounced,
              open_rate: (stepStat.emails_delivered || 0) > 0 ? 
                (stepStat.emails_opened / (stepStat.emails_delivered || 1)) * 100 : 0,
              click_rate: stepStat.emails_opened > 0 ? 
                (stepStat.emails_clicked / stepStat.emails_opened) * 100 : 0,
              reply_rate: (stepStat.emails_delivered || 0) > 0 ? 
                (stepStat.emails_replied / (stepStat.emails_delivered || 1)) * 100 : 0
            }
          }
        })

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              campaign,
              steps: stepStats,
              stats: overallStats
            }
          }), 
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // If no route matches
    return new Response(
      JSON.stringify({ success: false, error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: handleError(error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
