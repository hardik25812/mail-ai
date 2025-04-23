# Supabase Edge Functions for Mail AI

This directory contains Supabase Edge Functions that provide serverless API endpoints for the Mail AI application.

## TypeScript Setup

Supabase Edge Functions run in the Deno environment, which has different TypeScript semantics than Node.js. The following setup has been implemented to ensure proper TypeScript type checking:

1. **Type Definitions**: Custom TypeScript definitions for Deno APIs and Supabase client are in `deno.d.ts`.

2. **TypeScript Configuration**: A `tsconfig.json` has been added with:
   - Support for importing TypeScript files with `.ts` extensions
   - ESNext module format
   - Configuration for Deno's environment

3. **Type Helpers**: A shared types file in `_shared/types.ts` and `_shared/types-helpers.ts` provide:
   - Error handling utilities
   - Type definitions for database models
   - Helper functions for working with indexed objects

## Function Structure

Each Edge Function follows a consistent pattern:

1. Import the shared types
2. Set up CORS headers and Supabase client
3. Handle authentication
4. Process the request based on HTTP method and path
5. Return a well-formatted JSON response

## Available Functions

- `campaigns`: Manage email campaigns, including CRUD operations and statistics
- `emails`: Handle email interactions, including fetching, sending, and organizing emails
- `senders`: Manage sender profiles
- `settings`: Handle user settings
- `sync`: Synchronize emails from external services
- `timezones`: Provide timezone information

## Cron Jobs

Automated tasks run on a schedule:

- `cron/process-campaigns`: Process email campaign sequences
- `cron/sync-emails`: Synchronize emails from connected inboxes

## Error Handling

All functions include proper error handling using TypeScript's type system, ensuring:

1. API errors are properly typed
2. Unknown errors are safely handled
3. Authentication errors return appropriate status codes
4. Database errors include details in the response
