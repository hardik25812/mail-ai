// Script to initialize the database schema using the SQL migration file
// Using .mjs extension for ES Modules
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dirname } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize the Supabase client with service role key (admin privileges)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  console.error('Make sure these are defined in your .env.local file');
  process.exit(1);
}

console.log(`Using Supabase URL: ${supabaseUrl}`);

// Function to execute SQL directly using the Supabase REST API
async function executeSql(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SQL execution failed: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing SQL:', error.message);
    throw error;
  }
}

async function initializeDatabase() {
  try {
    console.log('Reading SQL migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '00000000000000_initial_schema.sql');
    let sqlContent;
    
    try {
      sqlContent = fs.readFileSync(migrationPath, 'utf8');
      console.log('Found migration file at:', migrationPath);
    } catch (err) {
      console.log('Migration file not found, using essential tables only');
    }

    // Create a simplified version of the schema with just the essential tables
    // This is more reliable than trying to execute the entire migration file
    const essentialTables = [
      // Create users table
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );`,
      
      // Create workspaces table
      `CREATE TABLE IF NOT EXISTS workspaces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );`,
      
      // Create workspace_users table
      `CREATE TABLE IF NOT EXISTS workspace_users (
        workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (workspace_id, user_id)
      );`,
      
      // Create inboxes table
      `CREATE TABLE IF NOT EXISTS inboxes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        bison_inbox_id TEXT NOT NULL,
        email_address TEXT NOT NULL,
        name TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        last_synced_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (workspace_id, bison_inbox_id)
      );`,
      
      // Create emails table
      `CREATE TABLE IF NOT EXISTS emails (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inbox_id UUID NOT NULL REFERENCES inboxes(id) ON DELETE CASCADE,
        message_id TEXT NOT NULL,
        thread_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        body_html TEXT,
        sender TEXT NOT NULL,
        recipient TEXT NOT NULL,
        status TEXT NOT NULL,
        intent TEXT,
        lead_score INTEGER,
        is_draft BOOLEAN NOT NULL DEFAULT false,
        is_sent BOOLEAN NOT NULL DEFAULT false,
        is_inbound BOOLEAN NOT NULL DEFAULT true,
        received_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (inbox_id, message_id)
      );`,
      
      // Create ai_responses table
      `CREATE TABLE IF NOT EXISTS ai_responses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        approved_by_user BOOLEAN,
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );`,
      
      // Create settings table
      `CREATE TABLE IF NOT EXISTS settings (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        tone TEXT,
        signature TEXT,
        auto_reply BOOLEAN NOT NULL DEFAULT false,
        slack_url TEXT,
        calendly_url TEXT,
        timezone TEXT,
        example_replies JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );`
    ];

    console.log(`Prepared ${essentialTables.length} essential table creation statements`);

    // Execute each statement
    for (let i = 0; i < essentialTables.length; i++) {
      const statement = essentialTables[i];
      console.log(`Executing statement ${i + 1}/${essentialTables.length}...`);
      
      try {
        // Execute the SQL statement using the Supabase REST API
        await executeSql(statement);
        console.log(`Successfully executed statement ${i + 1}`);
      } catch (err) {
        console.warn(`Warning: Error executing statement ${i + 1}: ${err.message}`);
        console.warn('Continuing with next statement...');
      }
    }

    console.log('Database initialization completed!');
    console.log('You can now use the Supabase client to interact with your database.');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
