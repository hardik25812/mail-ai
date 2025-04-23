-- SQL script to create test data for the AI reply worker

-- 1. First, find a valid user from the auth.users table
-- SELECT id FROM auth.users LIMIT 1;
-- Replace USER_ID below with this value

-- 2. Create a test workspace if needed
INSERT INTO public.workspaces (
  id, name, created_at, updated_at
)
VALUES (
  gen_random_uuid(), 'Test Workspace', now(), now()
)
RETURNING id;
-- Copy the workspace_id from the result

-- 3. Create a test inbox in that workspace
INSERT INTO public.inboxes (
  id, workspace_id, name, created_at, updated_at
)
VALUES (
  gen_random_uuid(), 
  '-- PASTE WORKSPACE_ID HERE --', 
  'Test Inbox', 
  now(), 
  now()
)
RETURNING id;
-- Copy the inbox_id from the result

-- 4. Create a test email in that inbox
INSERT INTO public.emails (
  id, inbox_id, subject, body, sender, recipient, 
  status, is_inbound, received_at, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  '-- PASTE INBOX_ID HERE --',
  'Test Email for AI Reply',
  'Hello, this is a test email to verify the AI reply generator. Could you please review my proposal and let me know your thoughts? I''m available for a call on Thursday or Friday if you want to discuss further. Thanks!',
  'Test Sender <sender@example.com>',
  'recipient@example.com',
  'new',
  true,
  now(),
  now(),
  now()
)
RETURNING id;
-- Copy the email_id from the result

-- 5. Create an AI reply job
INSERT INTO public.ai_reply_jobs (
  id, email_id, user_id, status, attempts, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  '-- PASTE EMAIL_ID HERE --',
  '-- PASTE USER_ID HERE --',
  'pending',
  0,
  now(),
  now()
)
RETURNING id;
