// Scheduled function to sync emails from connected inboxes
import '../_shared/types.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY') || ''
const syncApiKey = Deno.env.get('SYNC_API_KEY') || ''

// Create a Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// This function will be triggered by a cron job
Deno.serve(async () => {
  try {
    console.log('Starting email sync job...')
    
    // Get all active inboxes
    const { data: inboxes, error: inboxesError } = await supabase
      .from('inboxes')
      .select('id, workspace_id, bison_inbox_id, email_address, last_synced_at')
      .eq('active', true)
    
    if (inboxesError) {
      console.error('Error fetching inboxes:', inboxesError)
      return new Response(
        JSON.stringify({ success: false, error: inboxesError.message }),
        { status: 500 }
      )
    }
    
    console.log(`Found ${inboxes.length} active inboxes to sync`)
    
    // Process inboxes in batches to avoid overloading the system
    const batchSize = 5
    const results = []
    
    for (let i = 0; i < inboxes.length; i += batchSize) {
      const batch = inboxes.slice(i, i + batchSize)
      
      // Process batch in parallel
      const batchPromises = batch.map(inbox => syncInbox(inbox))
      const batchResults = await Promise.all(batchPromises)
      
      results.push(...batchResults)
      
      // Add a small delay between batches
      if (i + batchSize < inboxes.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // Summarize results
    const totalEmails = results.reduce((sum, result) => sum + result.emails_synced, 0)
    const failedInboxes = results.filter(result => result.error).length
    
    console.log(`Sync completed: ${totalEmails} new emails synced, ${failedInboxes} inboxes failed`)
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          inboxes_processed: inboxes.length,
          inboxes_failed: failedInboxes,
          emails_synced: totalEmails,
          results
        }
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in sync job:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    )
  }
})

async function syncInbox(inbox: any) {
  try {
    console.log(`Syncing inbox ${inbox.id} (${inbox.email_address})...`)
    
    // Call the sync function for this inbox
    const response = await fetch(`${supabaseUrl}/functions/v1/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': syncApiKey
      },
      body: JSON.stringify({
        inbox_id: inbox.id
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Sync API error: ${errorData.error || response.statusText}`)
    }
    
    const result = await response.json()
    
    console.log(`Inbox ${inbox.id}: synced ${result.data.emails_synced} new emails`)
    
    return {
      inbox_id: inbox.id,
      email_address: inbox.email_address,
      emails_synced: result.data.emails_synced,
      success: true
    }
  } catch (error) {
    console.error(`Error syncing inbox ${inbox.id}:`, error)
    
    return {
      inbox_id: inbox.id,
      email_address: inbox.email_address,
      emails_synced: 0,
      success: false,
      error: error.message
    }
  }
}
