# Mail AI Backend - Supabase Integration Guide

This guide explains how to use the Supabase client integration for the Mail AI backend instead of Prisma ORM.

## Overview

We've switched from using Prisma's direct database operations to using Supabase's client library (`@supabase/supabase-js`) for database access. This approach is more reliable since Supabase's client is specifically designed to work with Supabase databases.

## Setup

1. Make sure you have the required dependencies installed:

```bash
npm install @supabase/supabase-js node-fetch dotenv
```

2. Ensure your `.env.local` file contains the following variables:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Initialization

We've created a script to initialize the database schema:

```bash
node scripts/init-database.js
```

This script will create all the essential tables in your Supabase database:

- users
- workspaces
- workspace_users
- inboxes
- emails
- ai_responses
- settings

## API Endpoints

We've created example API endpoints that use the Supabase client:

- `api/emails-supabase.ts`: Handles email-related operations
  - GET /api/emails-supabase - List emails with filters
  - GET /api/emails-supabase/:id - Get a single email with its thread
  - POST /api/emails-supabase/:id/reply - Send or save a reply

- `api/settings-supabase.ts`: Handles user settings operations
  - GET /api/settings-supabase - Get user settings
  - PUT /api/settings-supabase - Update user settings

## TypeScript Types

We've created TypeScript type definitions for the database schema in `lib/database.types.ts`. These types provide a strongly-typed interface for working with the Supabase client.

## Supabase Client

The Supabase client is initialized in `lib/supabase.ts`. This file provides:

- `supabase`: A client with anonymous privileges
- `supabaseAdmin`: A client with service role privileges

## Example Usage

Here's an example of how to use the Supabase client in your code:

```typescript
import { supabase, supabaseAdmin } from '../lib/supabase';

// Query data
const { data, error } = await supabase
  .from('emails')
  .select('*')
  .eq('status', 'unread');

// Insert data
const { data: newEmail, error: insertError } = await supabase
  .from('emails')
  .insert({
    inbox_id: 'some-inbox-id',
    message_id: 'some-message-id',
    thread_id: 'some-thread-id',
    subject: 'Hello',
    body: 'This is a test email',
    sender: 'sender@example.com',
    recipient: 'recipient@example.com',
    status: 'unread',
    is_inbound: true,
    received_at: new Date().toISOString()
  })
  .select()
  .single();

// Update data
const { data: updatedEmail, error: updateError } = await supabase
  .from('emails')
  .update({ status: 'read' })
  .eq('id', 'some-email-id')
  .select()
  .single();

// Delete data
const { error: deleteError } = await supabase
  .from('emails')
  .delete()
  .eq('id', 'some-email-id');
```

## Authentication

The API endpoints include authentication using Supabase JWT tokens. The token is extracted from the Authorization header and verified using the Supabase admin client.

## Next Steps

1. Convert the remaining API endpoints to use the Supabase client
2. Test the API endpoints with real data
3. Implement frontend integration with the API endpoints
4. Deploy the backend to a production environment
