// Supabase Edge Function for processing campaign emails (Cron triggered)
import '../_shared/types.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY') || ''
const emailBisonApiKey = Deno.env.get('EMAIL_BISON_API_KEY') || ''

// Create a Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// This function will be triggered by a cron job
Deno.serve(async () => {
  try {
    console.log('Starting campaign processing job...')
    
    // Get all active campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, name, workspace_id, timezone')
      .eq('status', 'active')
    
    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError)
      return new Response(
        JSON.stringify({ success: false, error: campaignsError.message }),
        { status: 500 }
      )
    }
    
    console.log(`Found ${campaigns.length} active campaigns to process`)
    
    const results = []
    
    // Process each campaign
    for (const campaign of campaigns) {
      const result = await processCampaign(campaign)
      results.push(result)
    }
    
    // Summarize results
    const totalEmailsSent = results.reduce((sum, result) => sum + result.emails_sent, 0)
    const failedCampaigns = results.filter(result => !result.success).length
    
    console.log(`Campaign processing completed: ${totalEmailsSent} emails sent, ${failedCampaigns} campaigns failed`)
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          campaigns_processed: campaigns.length,
          campaigns_failed: failedCampaigns,
          emails_sent: totalEmailsSent,
          results
        }
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in campaign processing job:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    )
  }
})

async function processCampaign(campaign: any) {
  try {
    console.log(`Processing campaign ${campaign.id} (${campaign.name})...`)
    
    // Get campaign steps
    const { data: steps, error: stepsError } = await supabase
      .from('campaign_steps')
      .select('*')
      .eq('campaign_id', campaign.id)
      .order('step_number', { ascending: true })
    
    if (stepsError) {
      throw new Error(`Error fetching campaign steps: ${stepsError.message}`)
    }
    
    if (steps.length === 0) {
      return {
        campaign_id: campaign.id,
        name: campaign.name,
        emails_sent: 0,
        success: true,
        message: 'No steps defined for this campaign'
      }
    }
    
    // Get recipients who are due for their next step
    const { data: recipients, error: recipientsError } = await supabase
      .from('campaign_recipients')
      .select('*')
      .eq('campaign_id', campaign.id)
      .eq('status', 'active')
    
    if (recipientsError) {
      throw new Error(`Error fetching campaign recipients: ${recipientsError.message}`)
    }
    
    console.log(`Found ${recipients.length} active recipients in campaign ${campaign.id}`)
    
    let emailsSent = 0
    
    // Process each recipient
    for (const recipient of recipients) {
      // Get the current step for this recipient
      const currentStepNumber = recipient.current_step
      const nextStep = steps.find(step => step.step_number === currentStepNumber + 1)
      
      // If there's no next step, mark the recipient as completed
      if (!nextStep) {
        await supabase
          .from('campaign_recipients')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', recipient.id)
        
        continue
      }
      
      // Check if it's time to send the next step
      // In a real implementation, we would use the campaign timezone and delay_hours
      // For now, we'll just send the next step if the recipient has been in the current step for at least 24 hours
      const lastUpdated = new Date(recipient.updated_at)
      const now = new Date()
      const hoursSinceLastUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceLastUpdate < nextStep.delay_hours) {
        console.log(`Recipient ${recipient.id} not yet due for next step (${hoursSinceLastUpdate.toFixed(1)}h < ${nextStep.delay_hours}h)`)
        continue
      }
      
      // Send the email for the next step
      const success = await sendCampaignEmail(campaign, nextStep, recipient)
      
      if (success) {
        // Update recipient's current step
        await supabase
          .from('campaign_recipients')
          .update({
            current_step: nextStep.step_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', recipient.id)
        
        // Update campaign stats
        await updateCampaignStats(campaign.id, nextStep.step_number, 'emails_sent')
        
        emailsSent++
      }
    }
    
    return {
      campaign_id: campaign.id,
      name: campaign.name,
      emails_sent: emailsSent,
      success: true
    }
  } catch (error) {
    console.error(`Error processing campaign ${campaign.id}:`, error)
    
    return {
      campaign_id: campaign.id,
      name: campaign.name,
      emails_sent: 0,
      success: false,
      error: error.message
    }
  }
}

async function sendCampaignEmail(campaign: any, step: any, recipient: any) {
  try {
    console.log(`Sending campaign email to ${recipient.email} (Campaign: ${campaign.id}, Step: ${step.step_number})`)
    
    // Get sender profile for this campaign
    // In a real implementation, we would have a sender_id in the campaign table
    // For now, we'll just get any sender profile from the workspace
    const { data: senders, error: sendersError } = await supabase
      .from('sender_profiles')
      .select('*')
      .eq('workspace_id', campaign.workspace_id)
      .limit(1)
    
    if (sendersError || !senders || senders.length === 0) {
      throw new Error('No sender profile found for this campaign')
    }
    
    const sender = senders[0]
    
    // In a real implementation, this would call the Email Bison API
    // For now, we'll just simulate sending an email
    
    // Create a record of the sent email
    const { data: email, error: emailError } = await supabase
      .from('emails')
      .insert({
        inbox_id: null, // In a real implementation, this would be the inbox_id associated with the sender
        message_id: `campaign-${campaign.id}-step-${step.step_number}-${Date.now()}`,
        thread_id: `campaign-${campaign.id}-${recipient.id}`,
        subject: step.subject,
        body: step.body,
        sender: sender.email,
        recipient: recipient.email,
        status: 'sent',
        is_draft: false,
        is_sent: true,
        is_inbound: false,
        received_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (emailError) {
      throw new Error(`Error creating email record: ${emailError.message}`)
    }
    
    console.log(`Campaign email sent to ${recipient.email} (Email ID: ${email.id})`)
    
    return true
  } catch (error) {
    console.error('Error sending campaign email:', error)
    return false
  }
}

async function updateCampaignStats(campaignId: string, stepNumber: number, field: string) {
  try {
    // Check if stats record exists for this campaign and step
    const { data: stats, error: statsError } = await supabase
      .from('campaign_stats')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('step_number', stepNumber)
      .maybeSingle()
    
    if (statsError) {
      throw new Error(`Error checking campaign stats: ${statsError.message}`)
    }
    
    if (stats) {
      // Update existing stats record
      await supabase
        .from('campaign_stats')
        .update({
          [field]: supabase.rpc('increment', { inc: 1 }),
          updated_at: new Date().toISOString()
        })
        .eq('id', stats.id)
    } else {
      // Create new stats record
      await supabase
        .from('campaign_stats')
        .insert({
          campaign_id: campaignId,
          step_number: stepNumber,
          [field]: 1
        })
    }
  } catch (error) {
    console.error('Error updating campaign stats:', error)
  }
}
