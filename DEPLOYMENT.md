# Mail AI - Deployment Guide

This guide will walk you through deploying the Mail AI backend and connecting it to your Vercel frontend.

## Prerequisites

- Supabase account and project
- Vercel account
- n8n instance for AI workflows
- Email Bison API credentials

## 1. Database Setup

First, initialize your Supabase database with the required schema:

```bash
# Run the database initialization script
node scripts/init-database.js
```

Verify in the Supabase dashboard that all tables have been created successfully.

## 2. Configure Environment Variables

Ensure your `.env.local` file contains all required variables:

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
EMAIL_BISON_API_URL=your-email-bison-api-url
EMAIL_BISON_API_KEY=your-email-bison-api-key
N8N_WEBHOOK_URL=your-n8n-webhook-url
```

## 3. Set Up Row Level Security (RLS)

In the Supabase dashboard, set up RLS policies for each table to ensure proper access control:

1. Navigate to the Authentication > Policies section
2. For each table, create policies that restrict access to the user's own data
3. Example policy for emails table:
   - Name: "Users can only access their own emails"
   - Target roles: authenticated
   - Using expression: `(auth.uid() = user_id)`

## 4. Deploy to Vercel

### Option 1: Deploy from GitHub

1. Push your code to a GitHub repository
2. Log in to Vercel and create a new project
3. Select your repository
4. Configure the project:
   - Framework preset: Next.js
   - Root directory: ./
   - Build command: `npm run build`
   - Output directory: .next
5. Add environment variables from your `.env.local` file
6. Deploy

### Option 2: Deploy using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the project:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project
5. Set environment variables:
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_KEY
   vercel env add N8N_WEBHOOK_URL
   vercel env add EMAIL_BISON_API_URL
   ```

## 5. Set Up n8n Workflow

1. Create a new workflow in n8n
2. Add an HTTP Trigger node as the entry point
   - Method: POST
   - Path: /ai-generate-reply
   - Authentication: None (or add Basic Auth for security)
3. Add an OpenAI node to generate email replies
4. Configure the workflow to return the expected response format:
   ```json
   {
     "reply_content": "Generated email reply",
     "should_notify_slack": true,
     "summary": "Brief summary of the email"
   }
   ```
5. Activate the workflow and copy the webhook URL

## 6. Connect Frontend to Backend

In your frontend code:

1. Use the Supabase client for authentication
2. Make API calls to your deployed backend endpoints
3. Example API call to trigger AI reply:
   ```typescript
   const triggerAIReply = async (emailId: string) => {
     const { data: user } = await supabase.auth.getUser();
     const response = await fetch('/api/trigger-ai-reply', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${user.session.access_token}`
       },
       body: JSON.stringify({ email_id: emailId })
     });
     return response.json();
   };
   ```

## 7. Testing the Deployment

1. Create a test user in Supabase
2. Log in to your frontend application
3. Send a test email
4. Trigger the AI reply generation
5. Verify the response is saved in the database

## Troubleshooting

- **Authentication Issues**: Ensure Supabase JWT verification is working correctly
- **Database Connection Errors**: Check your Supabase connection strings
- **n8n Webhook Failures**: Verify the webhook URL is accessible from your backend
- **CORS Errors**: Configure CORS settings in your Vercel project

## Production Considerations

- Set up monitoring and logging
- Configure rate limiting to prevent abuse
- Set up CI/CD for automated deployments
- Create database backups
- Implement proper error handling and retry logic
