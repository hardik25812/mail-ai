-- Create schema for Mail AI

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create workspace_users table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS workspace_users (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Create inboxes table
CREATE TABLE IF NOT EXISTS inboxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  bison_inbox_id TEXT NOT NULL,
  email_address TEXT NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, bison_inbox_id)
);

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inbox_id UUID NOT NULL REFERENCES inboxes(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  thread_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  body_html TEXT,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  cc TEXT[] DEFAULT '{}',
  bcc TEXT[] DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('unread', 'read', 'replied', 'archived', 'deleted')),
  intent TEXT CHECK (intent IN ('inquiry', 'lead', 'support', 'spam', 'other')),
  lead_score INTEGER CHECK (lead_score >= 1 AND lead_score <= 10),
  is_draft BOOLEAN NOT NULL DEFAULT false,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  is_inbound BOOLEAN NOT NULL DEFAULT true,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (inbox_id, message_id)
);

-- Create ai_responses table
CREATE TABLE IF NOT EXISTS ai_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  approved_by_user BOOLEAN,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tone TEXT CHECK (tone IN ('formal', 'casual', 'friendly', 'professional')),
  signature TEXT,
  auto_reply BOOLEAN NOT NULL DEFAULT false,
  slack_url TEXT,
  calendly_url TEXT,
  timezone TEXT,
  example_replies JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  timezone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create campaign_steps table
CREATE TABLE IF NOT EXISTS campaign_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  delay_hours INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, step_number)
);

-- Create campaign_recipients table
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  current_step INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'unsubscribed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, email)
);

-- Create campaign_stats table
CREATE TABLE IF NOT EXISTS campaign_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  step_number INTEGER,
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_replied INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, step_number)
);

-- Create sender_profiles table for managing multiple sender identities
CREATE TABLE IF NOT EXISTS sender_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_signature TEXT,
  timezone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, email)
);

-- Create Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sender_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own user data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own user data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Workspace policies
CREATE POLICY "Users can view workspaces they belong to" ON workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_users
      WHERE workspace_users.workspace_id = workspaces.id
      AND workspace_users.user_id = auth.uid()
    )
  );

-- Workspace users policies
CREATE POLICY "Users can view workspace memberships they belong to" ON workspace_users
  FOR SELECT USING (
    workspace_users.user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_users wu
      WHERE wu.workspace_id = workspace_users.workspace_id
      AND wu.user_id = auth.uid()
      AND wu.role IN ('owner', 'admin')
    )
  );

-- Inbox policies
CREATE POLICY "Users can view inboxes in their workspaces" ON inboxes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_users
      WHERE workspace_users.workspace_id = inboxes.workspace_id
      AND workspace_users.user_id = auth.uid()
    )
  );

-- Email policies
CREATE POLICY "Users can view emails in their workspaces" ON emails
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inboxes
      JOIN workspace_users ON inboxes.workspace_id = workspace_users.workspace_id
      WHERE emails.inbox_id = inboxes.id
      AND workspace_users.user_id = auth.uid()
    )
  );

-- AI responses policies
CREATE POLICY "Users can view AI responses for emails they can access" ON ai_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM emails
      JOIN inboxes ON emails.inbox_id = inboxes.id
      JOIN workspace_users ON inboxes.workspace_id = workspace_users.workspace_id
      WHERE ai_responses.email_id = emails.id
      AND workspace_users.user_id = auth.uid()
    )
  );

-- Settings policies
CREATE POLICY "Users can view their own settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Campaign policies
CREATE POLICY "Users can view campaigns in their workspaces" ON campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_users
      WHERE workspace_users.workspace_id = campaigns.workspace_id
      AND workspace_users.user_id = auth.uid()
    )
  );

-- Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workspace_users_updated_at BEFORE UPDATE ON workspace_users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inboxes_updated_at BEFORE UPDATE ON inboxes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_responses_updated_at BEFORE UPDATE ON ai_responses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_campaign_steps_updated_at BEFORE UPDATE ON campaign_steps FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_campaign_recipients_updated_at BEFORE UPDATE ON campaign_recipients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_campaign_stats_updated_at BEFORE UPDATE ON campaign_stats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sender_profiles_updated_at BEFORE UPDATE ON sender_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO settings (user_id, tone, auto_reply, timezone)
  VALUES (NEW.id, 'professional', false, 'UTC');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Create function to update email status when AI response is sent
CREATE OR REPLACE FUNCTION update_email_status_on_ai_response()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sent_at IS NOT NULL AND OLD.sent_at IS NULL THEN
    UPDATE emails SET status = 'replied' WHERE id = NEW.email_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating email status
CREATE TRIGGER on_ai_response_sent
  AFTER UPDATE ON ai_responses
  FOR EACH ROW EXECUTE PROCEDURE update_email_status_on_ai_response();

-- Create indexes for performance
CREATE INDEX idx_emails_inbox_id ON emails(inbox_id);
CREATE INDEX idx_emails_thread_id ON emails(thread_id);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_intent ON emails(intent);
CREATE INDEX idx_ai_responses_email_id ON ai_responses(email_id);
CREATE INDEX idx_workspace_users_user_id ON workspace_users(user_id);
CREATE INDEX idx_workspace_users_workspace_id ON workspace_users(workspace_id);
CREATE INDEX idx_inboxes_workspace_id ON inboxes(workspace_id);
CREATE INDEX idx_campaigns_workspace_id ON campaigns(workspace_id);
CREATE INDEX idx_campaign_steps_campaign_id ON campaign_steps(campaign_id);
CREATE INDEX idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_stats_campaign_id ON campaign_stats(campaign_id);
CREATE INDEX idx_sender_profiles_user_id ON sender_profiles(user_id);
CREATE INDEX idx_sender_profiles_workspace_id ON sender_profiles(workspace_id);
