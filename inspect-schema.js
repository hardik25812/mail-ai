// Script to inspect the Supabase database schema
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configure Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  try {
    // List all tables
    console.log('Fetching tables...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables')
      .catch(() => {
        // Fallback to a direct query if RPC is not available
        return supabase.from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
      });

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      
      // Try another approach
      console.log('Trying alternative approach...');
      
      // Let's check if specific tables exist
      const tableNames = ['users', 'inboxes', 'emails', 'settings', 'ai_reply_jobs', 'ai_responses'];
      
      for (const tableName of tableNames) {
        try {
          // Try to select a row to see if the table exists
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error && error.code === '42P01') {
            console.log(`❌ Table '${tableName}' does not exist`);
          } else {
            console.log(`✅ Table '${tableName}' exists`);
            
            // If the table exists, try to get its columns
            try {
              const { data: columns, error: columnsError } = await supabase
                .rpc('get_columns', { table_name: tableName })
                .catch(() => {
                  return { data: null, error: { message: 'RPC not available' } };
                });
              
              if (columnsError) {
                console.log(`   Unable to fetch columns for '${tableName}': ${columnsError.message}`);
              } else if (columns) {
                console.log(`   Columns: ${columns.map(col => col.column_name).join(', ')}`);
              }
            } catch (err) {
              console.log(`   Error fetching columns: ${err.message}`);
            }
          }
        } catch (err) {
          console.log(`Error checking table '${tableName}': ${err.message}`);
        }
      }
    } else if (tables && tables.length > 0) {
      console.log('Found tables:', tables.map(t => t.table_name || t).join(', '));
      
      // Inspect specific tables we need
      for (const table of tables) {
        const tableName = table.table_name || table;
        if (['users', 'inboxes', 'emails', 'settings', 'ai_reply_jobs', 'ai_responses'].includes(tableName)) {
          // Get table columns
          try {
            const { data: columns, error: columnsError } = await supabase
              .rpc('get_columns', { table_name: tableName })
              .catch(() => {
                return supabase.from('information_schema.columns')
                  .select('column_name, data_type')
                  .eq('table_schema', 'public')
                  .eq('table_name', tableName);
              });
            
            if (columnsError) {
              console.error(`Error fetching columns for ${tableName}:`, columnsError);
            } else if (columns) {
              console.log(`\n${tableName} columns:`, columns.map(c => c.column_name).join(', '));
            }
          } catch (err) {
            console.log(`Error inspecting table '${tableName}': ${err.message}`);
          }
        }
      }
    } else {
      console.log('No tables found or error occurred');
    }

    console.log('\nRecommendations:');
    console.log('1. Create the ai_reply_jobs table if it doesn\'t exist:');
    console.log(`
    CREATE TABLE public.ai_reply_jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email_id UUID NOT NULL,
      user_id UUID NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX ON public.ai_reply_jobs(status);
    `);
    
    console.log('2. Update your test script to match the actual schema of your tables');
  } catch (error) {
    console.error('Error inspecting schema:', error);
  }
}

inspectSchema();
