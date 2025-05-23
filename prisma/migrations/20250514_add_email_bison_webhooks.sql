-- Migration to add Email Bison webhook tables and related schemas
-- This migration adds tables for storing and processing Email Bison webhook events

-- Table for workspace mapping between Email Bison and our system
CREATE TABLE IF NOT EXISTS "email_bison_workspaces" (
    "id" SERIAL PRIMARY KEY,
    "bison_workspace_id" INTEGER NOT NULL,
    "internal_workspace_id" UUID NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
    "workspace_name" TEXT NOT NULL,
    "api_key" TEXT, -- Stored encrypted
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_webhook_received" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("bison_workspace_id", "internal_workspace_id")
);

-- Table for processed webhook events
CREATE TABLE IF NOT EXISTS "email_bison_events" (
    "id" SERIAL PRIMARY KEY,
    "event_type" TEXT NOT NULL,
    "workspace_id" UUID NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
    "bison_workspace_id" INTEGER NOT NULL,
    "campaign_id" INTEGER,
    "campaign_name" TEXT,
    "lead_id" INTEGER,
    "lead_email" TEXT,
    "lead_name" TEXT,
    "email_subject" TEXT,
    "email_body" TEXT,
    "email_status" TEXT,
    "sender_email" TEXT,
    "sender_name" TEXT,
    "event_data" JSONB NOT NULL, -- Store the full event payload
    "processed" BOOLEAN NOT NULL DEFAULT true,
    "processed_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS "email_bison_events_workspace_id_idx" ON "email_bison_events"("workspace_id");
CREATE INDEX IF NOT EXISTS "email_bison_events_event_type_idx" ON "email_bison_events"("event_type");
CREATE INDEX IF NOT EXISTS "email_bison_events_lead_email_idx" ON "email_bison_events"("lead_email");

-- Table for raw webhook events (for debugging and reprocessing)
CREATE TABLE IF NOT EXISTS "email_bison_raw_events" (
    "id" SERIAL PRIMARY KEY,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table for webhook processing errors
CREATE TABLE IF NOT EXISTS "email_bison_webhook_errors" (
    "id" SERIAL PRIMARY KEY,
    "event_type" TEXT,
    "error_message" TEXT NOT NULL,
    "event_data" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email_bison_workspaces
DROP TRIGGER IF EXISTS update_email_bison_workspaces_timestamp ON "email_bison_workspaces";
CREATE TRIGGER update_email_bison_workspaces_timestamp
BEFORE UPDATE ON "email_bison_workspaces"
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Create view for analytics
CREATE OR REPLACE VIEW email_bison_event_analytics AS
SELECT 
    workspace_id,
    event_type,
    DATE_TRUNC('day', created_at) AS event_date,
    COUNT(*) AS event_count
FROM 
    email_bison_events
GROUP BY 
    workspace_id, event_type, DATE_TRUNC('day', created_at);
