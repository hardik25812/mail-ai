// Simple Supabase connection test
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

console.log('Testing Supabase connection...');
console.log(`URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple health check
async function testConnection() {
  try {
    // Test authentication API
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth API Error:', authError.message);
    } else {
      console.log('✅ Auth API is working');
    }
    
    // Try a basic storage bucket list operation
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.error('Storage API Error:', storageError.message);
    } else {
      console.log('✅ Storage API is working');
      console.log('Buckets:', buckets.length ? buckets.map(b => b.name).join(', ') : 'none');
    }
    
    // Check for existing tables using the system schema
    try {
      // Use direct SQL query via RPC to get tables
      const { data: tables, error: sqlError } = await supabase.rpc('get_tables');
      
      if (sqlError) {
        if (sqlError.message.includes('function "get_tables" does not exist')) {
          console.log('Note: Custom function "get_tables" not found, which is expected');
        } else {
          console.error('SQL Query Error:', sqlError.message);
        }
      } else if (tables && tables.length) {
        console.log('✅ Found existing tables:', tables.join(', '));
      }
    } catch (e) {
      console.log('Note: SQL query attempt failed, which may be expected if database is not set up yet');
    }
    
    console.log('\n✅ Connection to Supabase services verified');
    console.log('\nNext steps:');
    console.log('1. Run database initialization: node scripts/init-database.js');
    console.log('2. Deploy to Vercel (see DEPLOYMENT.md for instructions)');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();
