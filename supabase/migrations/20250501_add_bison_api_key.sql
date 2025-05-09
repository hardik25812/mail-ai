-- Add Bison API key to workspaces table
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS bison_api_key TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS bison_workspace_id TEXT;

-- Create an index for faster lookups by bison_workspace_id
CREATE INDEX IF NOT EXISTS workspaces_bison_workspace_id_idx ON workspaces(bison_workspace_id);

-- Add comment for documentation
COMMENT ON COLUMN workspaces.bison_api_key IS 'API key for Email Bison workspace - unique per workspace';
COMMENT ON COLUMN workspaces.bison_workspace_id IS 'Workspace ID from Email Bison for 1:1 mapping';
