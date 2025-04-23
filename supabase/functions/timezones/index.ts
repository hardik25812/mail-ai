// Supabase Edge Function for timezones lookup
import '../_shared/types.ts'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// List of common timezones with their display names and offsets
const timezones = [
  { value: 'UTC', label: 'UTC', offset: '+00:00' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)', offset: '-05:00' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)', offset: '-06:00' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)', offset: '-07:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', offset: '-08:00' },
  { value: 'America/Anchorage', label: 'Alaska', offset: '-09:00' },
  { value: 'Pacific/Honolulu', label: 'Hawaii', offset: '-10:00' },
  { value: 'Europe/London', label: 'London', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Paris', offset: '+01:00' },
  { value: 'Europe/Berlin', label: 'Berlin', offset: '+01:00' },
  { value: 'Europe/Athens', label: 'Athens', offset: '+02:00' },
  { value: 'Europe/Moscow', label: 'Moscow', offset: '+03:00' },
  { value: 'Asia/Dubai', label: 'Dubai', offset: '+04:00' },
  { value: 'Asia/Kolkata', label: 'Mumbai', offset: '+05:30' },
  { value: 'Asia/Singapore', label: 'Singapore', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo', offset: '+09:00' },
  { value: 'Australia/Sydney', label: 'Sydney', offset: '+10:00' },
  { value: 'Pacific/Auckland', label: 'Auckland', offset: '+12:00' },
  { value: 'America/Sao_Paulo', label: 'Sao Paulo', offset: '-03:00' },
  { value: 'Africa/Cairo', label: 'Cairo', offset: '+02:00' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg', offset: '+02:00' }
]

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only handle GET requests
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return the list of timezones
    return new Response(
      JSON.stringify({ success: true, data: timezones }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
