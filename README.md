# Mail AI - Backend

A Supabase-compatible backend for an AI-powered inbox manager that integrates Email Bison API, OpenAI (via n8n), and other tools.

## Features

- Inbox syncing via Email Bison API
- AI reply generation via n8n webhook
- Email classification pipeline
- Custom instructions for AI responses
- Campaigns & sequences
- Timezone support
- Reply & forward merging
- Bulk signature updates

## Tech Stack

- Supabase (Postgres, RLS, Auth)
- Email Bison API
- n8n for AI reply logic
- RESTful API endpoints

## Getting Started

1. Clone this repository
2. Set up a Supabase project
3. Run the SQL migrations in the `supabase/migrations` directory
4. Deploy the Edge Functions in the `supabase/functions` directory
5. Configure environment variables

## Environment Variables

```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
EMAIL_BISON_API_KEY=your-email-bison-api-key
N8N_WEBHOOK_URL=your-n8n-webhook-url
```

## API Documentation

See the [API.md](./API.md) file for detailed API documentation.
