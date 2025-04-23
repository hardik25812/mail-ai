# n8n Workflow Integration Guide for Mail AI

This guide explains how to set up the n8n workflow for AI-powered email replies in the Mail AI backend.

## Workflow Overview

The n8n workflow handles the following steps:
1. Receives webhook requests with `email_id` and `user_id`
2. Fetches user settings from Supabase
3. Fetches the email content from Supabase
4. Builds a prompt for OpenAI GPT-4
5. Generates an AI reply using OpenAI
6. Sends the reply back to your API
7. Sends a Slack notification if configured

## Setup Instructions

### 1. Import the Workflow

1. Open your n8n instance
2. Go to Workflows → Import From File
3. Upload the `n8n-workflow.json` file from this repository

### 2. Configure Credentials

1. Set up Supabase credentials:
   - Go to the "Fetch User Settings" and "Fetch Email" nodes
   - Configure your Supabase API URL and API Key

2. Set up OpenAI credentials:
   - Go to the "OpenAI GPT-4" node
   - Add your OpenAI API Key in the Authentication section

### 3. Update Webhook URL

1. Update the "Save Reply to Supabase" node with your actual API endpoint:
   - Replace `https://your-api.vercel.app/api/save-ai-reply` with your deployed API URL
   - If testing locally, use your local URL (e.g., `http://localhost:3000/api/save-ai-reply`)

### 4. Activate the Workflow

1. Click "Activate" in the top-right corner of the n8n interface
2. Copy the webhook URL from the "Webhook" node
3. Update your `.env.local` file with this URL:
   ```
   N8N_WEBHOOK_URL=your-webhook-url
   ```

## Testing the Workflow

To test the workflow:

1. Make a POST request to your `/api/trigger-ai-reply` endpoint with:
   ```json
   {
     "email_id": "your-email-id",
     "user_id": "your-user-id"
   }
   ```

2. The workflow should:
   - Fetch the user settings and email
   - Generate a reply with GPT-4
   - Save the reply to your database
   - Send a Slack notification if configured

## Customizing the Workflow

You can customize the workflow by:

1. Modifying the prompt in the "Build Prompt" node
2. Changing the OpenAI model in the "OpenAI GPT-4" node
3. Adding additional processing steps for the email content
4. Implementing more complex logic for when to send Slack notifications

## Troubleshooting

If you encounter issues:

1. Check the execution logs in n8n
2. Verify your Supabase and OpenAI credentials
3. Ensure your API endpoint is accessible from n8n
4. Check that the database queries are returning the expected data
