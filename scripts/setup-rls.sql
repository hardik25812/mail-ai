-- Row Level Security (RLS) Setup for Mail AI Backend
-- Run this in the Supabase SQL Editor to secure your database

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Users can only read/update their own records
CREATE POLICY "Users can view own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Create policies for workspaces table
-- Users can view workspaces they belong to
CREATE POLICY "Users can view workspaces they belong to" 
  ON workspaces FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM workspace_users 
      WHERE workspace_users.workspace_id = workspaces.id 
      AND workspace_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update workspaces they own" 
  ON workspaces FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM workspace_users 
      WHERE workspace_users.workspace_id = workspaces.id 
      AND workspace_users.user_id = auth.uid()
      AND workspace_users.role = 'owner'
    )
  );

-- Create policies for workspace_users table
-- Users can view workspace memberships they belong to
CREATE POLICY "Users can view workspace memberships" 
  ON workspace_users FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM workspace_users wu 
      WHERE wu.workspace_id = workspace_users.workspace_id 
      AND wu.user_id = auth.uid()
    )
  );

-- Create policies for inboxes table
-- Users can view inboxes in workspaces they belong to
CREATE POLICY "Users can view inboxes in their workspaces" 
  ON inboxes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM workspace_users 
      WHERE workspace_users.workspace_id = inboxes.workspace_id 
      AND workspace_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update inboxes in workspaces they admin" 
  ON inboxes FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM workspace_users 
      WHERE workspace_users.workspace_id = inboxes.workspace_id 
      AND workspace_users.user_id = auth.uid()
      AND workspace_users.role IN ('owner', 'admin')
    )
  );

-- Create policies for emails table
-- Users can view emails in inboxes they have access to
CREATE POLICY "Users can view emails in their inboxes" 
  ON emails FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM inboxes
      JOIN workspace_users ON inboxes.workspace_id = workspace_users.workspace_id
      WHERE inboxes.id = emails.inbox_id
      AND workspace_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update emails in their inboxes" 
  ON emails FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM inboxes
      JOIN workspace_users ON inboxes.workspace_id = workspace_users.workspace_id
      WHERE inboxes.id = emails.inbox_id
      AND workspace_users.user_id = auth.uid()
    )
  );

-- Create policies for ai_responses table
-- Users can view AI responses for emails they have access to
CREATE POLICY "Users can view AI responses for their emails" 
  ON ai_responses FOR SELECT 
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM emails
      JOIN inboxes ON emails.inbox_id = inboxes.id
      JOIN workspace_users ON inboxes.workspace_id = workspace_users.workspace_id
      WHERE emails.id = ai_responses.email_id
      AND workspace_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own AI responses" 
  ON ai_responses FOR UPDATE 
  USING (user_id = auth.uid());

-- Create policies for settings table
-- Users can only view/update their own settings
CREATE POLICY "Users can view own settings" 
  ON settings FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings" 
  ON settings FOR UPDATE 
  USING (user_id = auth.uid());

-- Allow users to insert their own settings
CREATE POLICY "Users can insert own settings" 
  ON settings FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Allow users to insert their own AI responses
CREATE POLICY "Users can insert own AI responses" 
  ON ai_responses FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Allow workspace admins to insert emails in their inboxes
CREATE POLICY "Users can insert emails in their inboxes" 
  ON emails FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inboxes
      JOIN workspace_users ON inboxes.workspace_id = workspace_users.workspace_id
      WHERE inboxes.id = inbox_id
      AND workspace_users.user_id = auth.uid()
    )
  );
