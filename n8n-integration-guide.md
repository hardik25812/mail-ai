# n8n Integration Guide for Mail AI

This guide explains how to set up n8n to handle AI reply generation and email classification for the Mail AI backend.

## Overview

n8n is used in Mail AI for:
1. Generating AI replies to emails using OpenAI
2. Classifying incoming emails (intent and lead scoring)
3. Processing webhook requests from the Mail AI backend

## Prerequisites

- n8n installed and running (self-hosted or cloud)
- OpenAI API key
- Mail AI backend deployed

## Setup Instructions

### 1. Install n8n

If you don't have n8n set up yet, you can install it using one of these methods:

**Docker:**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**NPM:**
```bash
npm install n8n -g
n8n start
```

### 2. Configure n8n

1. Access the n8n web interface (default: http://localhost:5678)
2. Go to Settings > Credentials and add:
   - OpenAI API credentials
   - Any other services you want to integrate (Slack, etc.)

### 3. Create Email Classification Workflow

This workflow will classify incoming emails by intent and assign a lead score.

1. Create a new workflow named "Mail AI - Email Classification"
2. Add a Webhook node as the trigger:
   - Method: POST
   - Path: /mail-ai/classify
   - Authentication: Header Auth (use the same key as your SYNC_API_KEY)
   - Response Mode: Last Node

3. Add an OpenAI node:
   - Operation: Complete
   - Model: gpt-4 (or your preferred model)
   - Prompt: 
   ```
   You are an AI assistant that classifies emails. Analyze the following email and classify it:

   Subject: {{$json.email.subject}}
   From: {{$json.email.sender}}
   Body: {{$json.email.body}}

   Classify this email into one of these categories: inquiry, lead, support, spam, other
   Also rate it as a lead from 1-10 (10 being the highest quality lead)

   Return your answer in this JSON format:
   {
     "intent": "category",
     "lead_score": number,
     "explanation": "brief explanation"
   }
   ```
   - Output Format: JSON

4. Add a Set node to format the response:
   - Keep only the intent and lead_score fields
   - Add any additional processing if needed

5. Save and activate the workflow
6. Copy the webhook URL for later use

### 4. Create AI Reply Generation Workflow

This workflow will generate AI replies to emails based on user settings.

1. Create a new workflow named "Mail AI - Reply Generation"
2. Add a Webhook node as the trigger:
   - Method: POST
   - Path: /mail-ai/generate-reply
   - Authentication: Header Auth (use the same key as your SYNC_API_KEY)
   - Response Mode: Last Node

3. Add a Function node to prepare the context:
   ```javascript
   const email = $input.item.json.email;
   const settings = $input.item.json.settings;
   
   // Prepare signature
   const signature = settings.signature || '';
   
   // Prepare examples
   let exampleReplies = '';
   if (settings.example_replies && settings.example_replies.length > 0) {
     exampleReplies = 'Here are some example replies in my style:\n\n' + 
       settings.example_replies.join('\n\n');
   }
   
   return {
     email,
     settings,
     signature,
     exampleReplies,
     tone: settings.tone || 'professional'
   };
   ```

4. Add an OpenAI node:
   - Operation: Complete
   - Model: gpt-4 (or your preferred model)
   - Prompt: 
   ```
   You are an AI assistant that generates email replies. Write a reply to the following email in a {{$json.tone}} tone:

   Subject: {{$json.email.subject}}
   From: {{$json.email.sender}}
   Body: {{$json.email.body}}

   {{$json.exampleReplies}}

   Write a concise and helpful response. Do not include any placeholders or notes to the user.
   If the email is a meeting request, suggest scheduling a time and include the Calendly link if available: {{$json.settings.calendly_url}}
   
   End the email with this signature:
   {{$json.signature}}
   ```
   - Max Tokens: 1000
   - Temperature: 0.7
   - Output Format: Text

5. Add a Set node to format the response:
   ```javascript
   return {
     content: $input.item.json.text
   };
   ```

6. Save and activate the workflow
7. Copy the webhook URL for later use

### 5. Update Mail AI Backend Configuration

1. Update your `.env` file with the n8n webhook URLs:
   ```
   N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/mail-ai/generate-reply
   N8N_CLASSIFY_WEBHOOK_URL=https://your-n8n-instance/webhook/mail-ai/classify
   ```

2. Update the `sync/index.ts` file to use the correct webhook URL for classification

### 6. Advanced Features (Optional)

#### Slack Integration

1. Add a Slack node to your reply generation workflow
2. Configure it to send notifications when high-value leads are detected
3. Use the `slack_url` from user settings to determine where to send notifications

#### Calendar Integration

1. Create a new workflow for calendar scheduling
2. Use Google Calendar or Microsoft Calendar nodes
3. Connect it to the reply generation workflow to suggest available meeting times

## Testing the Integration

1. Send a test email to one of your Mail AI inboxes
2. Check the n8n execution logs to see if the classification workflow is triggered
3. Use the Mail AI API to request an AI-generated reply
4. Verify that the reply is generated correctly

## Troubleshooting

- **Webhook not triggering**: Check your firewall settings and make sure n8n is accessible from the internet
- **OpenAI errors**: Verify your API key and check your usage limits
- **JSON parsing errors**: Check the format of the data being sent to n8n

## Security Considerations

- Use HTTPS for all webhook URLs
- Set strong authentication for your n8n instance
- Rotate your API keys regularly
- Consider using environment variables for sensitive information
