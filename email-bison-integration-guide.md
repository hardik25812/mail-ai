# Email Bison API Integration Guide for Mail AI

This guide explains how to integrate the Email Bison API with the Mail AI backend for fetching and sending emails.

## Overview

The Email Bison API is used in Mail AI for:
1. Fetching emails from user inboxes
2. Sending emails and replies
3. Tracking email status (delivered, opened, etc.)
4. Managing email threads

## Prerequisites

- Email Bison API key
- Mail AI backend deployed
- Supabase project set up

## Setup Instructions

### 1. Obtain Email Bison API Credentials

1. Sign up for an Email Bison API account
2. Create an API key with the following permissions:
   - Read emails
   - Send emails
   - Manage webhooks
3. Store your API key securely

### 2. Update Environment Variables

Add your Email Bison API key to your environment:

```bash
# In your .env file
EMAIL_BISON_API_KEY=your-email-bison-api-key
```

### 3. Implement Email Fetching

Replace the mock implementation in `sync/index.ts` with actual Email Bison API calls:

```typescript
// Real implementation of fetchEmailsFromBison
async function fetchEmailsFromBison(inboxId: string, lastSyncedAt: string | null) {
  try {
    const url = `https://api.emailbison.com/v1/inboxes/${inboxId}/messages`;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (lastSyncedAt) {
      params.append('since', lastSyncedAt);
    }
    params.append('limit', '100');
    
    // Make API request
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${emailBisonApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Email Bison API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform Email Bison response to our format
    return data.messages.map(message => ({
      message_id: message.id,
      thread_id: message.thread_id,
      subject: message.subject,
      body: message.text_content,
      body_html: message.html_content,
      sender: message.from,
      recipient: message.to.join(', '),
      cc: message.cc || [],
      bcc: message.bcc || [],
      received_at: message.received_at
    }));
  } catch (error) {
    console.error('Error fetching emails from Email Bison:', error);
    throw error;
  }
}
```

### 4. Implement Email Sending

Update the email reply function in `emails/index.ts` to use the Email Bison API:

```typescript
// Send email via Email Bison API
async function sendEmailViaBison(inboxId, to, subject, body, threadId = null) {
  try {
    const url = `https://api.emailbison.com/v1/inboxes/${inboxId}/send`;
    
    const payload = {
      to: [to],
      subject,
      text_content: body,
      html_content: body.replace(/\n/g, '<br>'),
      thread_id: threadId
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailBisonApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Email Bison API error: ${errorData.error || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending email via Email Bison:', error);
    throw error;
  }
}
```

### 5. Set Up Email Bison Webhooks

Configure webhooks to receive real-time email events:

1. Create a webhook endpoint in your Supabase Edge Functions:

```typescript
// In supabase/functions/webhooks/index.ts
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
    // Verify webhook signature
    const signature = req.headers.get('x-email-bison-signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing webhook signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // In a real implementation, verify the signature here
    
    // Parse webhook payload
    const payload = await req.json()
    
    // Handle different event types
    switch (payload.event) {
      case 'email.received':
        await handleEmailReceived(payload)
        break
      case 'email.delivered':
        await handleEmailDelivered(payload)
        break
      case 'email.opened':
        await handleEmailOpened(payload)
        break
      case 'email.clicked':
        await handleEmailClicked(payload)
        break
      case 'email.replied':
        await handleEmailReplied(payload)
        break
      case 'email.bounced':
        await handleEmailBounced(payload)
        break
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Implement event handlers
async function handleEmailReceived(payload) {
  // Process new email
}

async function handleEmailDelivered(payload) {
  // Update email status
}

async function handleEmailOpened(payload) {
  // Track email open
}

async function handleEmailClicked(payload) {
  // Track email click
}

async function handleEmailReplied(payload) {
  // Process reply
}

async function handleEmailBounced(payload) {
  // Handle bounce
}
```

2. Register your webhook with Email Bison:

```typescript
// Register webhook with Email Bison
async function registerWebhook() {
  try {
    const url = 'https://api.emailbison.com/v1/webhooks';
    
    const payload = {
      url: 'https://your-supabase-project.functions.supabase.co/webhooks',
      events: [
        'email.received',
        'email.delivered',
        'email.opened',
        'email.clicked',
        'email.replied',
        'email.bounced'
      ],
      active: true
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailBisonApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Email Bison API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Webhook registered successfully:', data);
    
    return data;
  } catch (error) {
    console.error('Error registering webhook:', error);
    throw error;
  }
}
```

### 6. Implement Campaign Email Sending

Update the campaign processing function to use Email Bison:

```typescript
// In process-campaigns.ts
async function sendCampaignEmail(campaign, step, recipient) {
  try {
    // Get sender profile
    const { data: sender } = await supabase
      .from('sender_profiles')
      .select('*')
      .eq('workspace_id', campaign.workspace_id)
      .limit(1)
      .single();
    
    // Get inbox ID for this sender
    const { data: inbox } = await supabase
      .from('inboxes')
      .select('*')
      .eq('email_address', sender.email)
      .limit(1)
      .single();
    
    if (!inbox) {
      throw new Error(`No inbox found for sender ${sender.email}`);
    }
    
    // Prepare email content
    const subject = step.subject;
    const body = step.body + '\n\n' + (sender.email_signature || '');
    
    // Send via Email Bison
    const response = await sendEmailViaBison(
      inbox.bison_inbox_id,
      recipient.email,
      subject,
      body
    );
    
    // Create email record
    const { data: email } = await supabase
      .from('emails')
      .insert({
        inbox_id: inbox.id,
        message_id: response.id,
        thread_id: response.thread_id,
        subject,
        body,
        sender: sender.email,
        recipient: recipient.email,
        status: 'sent',
        is_draft: false,
        is_sent: true,
        is_inbound: false,
        received_at: new Date().toISOString()
      })
      .select()
      .single();
    
    // Update campaign stats
    await updateCampaignStats(campaign.id, step.step_number, 'emails_sent');
    
    return true;
  } catch (error) {
    console.error('Error sending campaign email:', error);
    return false;
  }
}
```

## Testing the Integration

1. Set up a test inbox in Email Bison
2. Configure the inbox in your Mail AI backend
3. Run the sync job to fetch emails
4. Test sending a reply to an email
5. Verify that webhooks are working correctly

## Monitoring and Debugging

1. Set up logging for all Email Bison API calls
2. Monitor webhook events in real-time
3. Create a dashboard to track email delivery rates and engagement

## Security Best Practices

1. Store API keys in environment variables, never in code
2. Verify webhook signatures to prevent spoofing
3. Use HTTPS for all API calls
4. Implement rate limiting to prevent abuse
5. Regularly audit email sending activity

## Error Handling

Implement robust error handling for common Email Bison API issues:

```typescript
async function handleEmailBisonError(error) {
  if (error.response && error.response.status === 429) {
    // Rate limit exceeded
    console.log('Rate limit exceeded, retrying in 60 seconds');
    await new Promise(resolve => setTimeout(resolve, 60000));
    return true; // Retry
  } else if (error.response && error.response.status === 401) {
    // Authentication error
    console.error('API key invalid or expired');
    // Send alert to admin
    return false; // Don't retry
  } else {
    // Other errors
    console.error('Email Bison API error:', error);
    return false; // Don't retry
  }
}
```

## Advanced Features

### Email Analytics

Track and analyze email engagement metrics:

```typescript
async function generateEmailAnalytics(workspaceId, startDate, endDate) {
  // Query Email Bison API for analytics
  const url = `https://api.emailbison.com/v1/analytics`;
  
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate
  });
  
  const response = await fetch(`${url}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${emailBisonApiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  // Process and store analytics data
  // ...
  
  return data;
}
```

### Email Templates

Implement template management for campaigns:

```typescript
// Create a template in Email Bison
async function createEmailTemplate(name, subject, body) {
  const url = 'https://api.emailbison.com/v1/templates';
  
  const payload = {
    name,
    subject,
    text_content: body,
    html_content: body.replace(/\n/g, '<br>')
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${emailBisonApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// Send email using a template
async function sendEmailWithTemplate(inboxId, to, templateId, variables) {
  const url = `https://api.emailbison.com/v1/inboxes/${inboxId}/send`;
  
  const payload = {
    to: [to],
    template_id: templateId,
    variables
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${emailBisonApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}
```

## Conclusion

By following this guide, you've successfully integrated the Email Bison API with your Mail AI backend. This integration enables your application to fetch and send emails, track engagement, and manage campaigns effectively.
