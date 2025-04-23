// Deployment script for Mail AI backend
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  projectDir: __dirname,
  supabaseDir: path.join(__dirname, 'supabase'),
  migrationsDir: path.join(__dirname, 'supabase', 'migrations'),
  functionsDir: path.join(__dirname, 'supabase', 'functions'),
};

// Helper function to run commands
function runCommand(command, options = {}) {
  console.log(`\n> ${command}\n`);
  try {
    return execSync(command, {
      stdio: 'inherit',
      ...options,
    });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Check if Supabase CLI is installed
function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    console.log('✅ Supabase CLI is installed');
  } catch (error) {
    console.error('❌ Supabase CLI is not installed. Please install it first:');
    console.error('npm install -g supabase');
    process.exit(1);
  }
}

// Initialize Supabase project
function initializeProject() {
  console.log('\n🚀 Initializing Supabase project...');
  
  if (!fs.existsSync(path.join(config.projectDir, 'supabase'))) {
    runCommand('supabase init', { cwd: config.projectDir });
    console.log('✅ Supabase project initialized');
  } else {
    console.log('✅ Supabase project already initialized');
  }
}

// Start Supabase local development
function startLocalDevelopment() {
  console.log('\n🚀 Starting Supabase local development...');
  runCommand('supabase start', { cwd: config.projectDir });
}

// Apply migrations
function applyMigrations() {
  console.log('\n🚀 Applying database migrations...');
  
  // Get all migration files
  const migrationFiles = fs.readdirSync(config.migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  if (migrationFiles.length === 0) {
    console.log('❌ No migration files found');
    return;
  }
  
  // Apply each migration
  migrationFiles.forEach(file => {
    console.log(`Applying migration: ${file}`);
    const migrationPath = path.join(config.migrationsDir, file);
    runCommand(`supabase db push --db-url "postgres://postgres:postgres@localhost:54322/postgres" ${migrationPath}`, { cwd: config.projectDir });
  });
  
  console.log('✅ Migrations applied successfully');
}

// Deploy Edge Functions
function deployFunctions() {
  console.log('\n🚀 Deploying Edge Functions...');
  
  // Get all function directories
  const functionDirs = fs.readdirSync(config.functionsDir)
    .filter(dir => {
      const stats = fs.statSync(path.join(config.functionsDir, dir));
      return stats.isDirectory() && !dir.startsWith('_');
    });
  
  if (functionDirs.length === 0) {
    console.log('❌ No function directories found');
    return;
  }
  
  // Deploy each function
  functionDirs.forEach(dir => {
    console.log(`Deploying function: ${dir}`);
    runCommand(`supabase functions deploy ${dir}`, { cwd: config.projectDir });
  });
  
  console.log('✅ Functions deployed successfully');
}

// Set environment variables
function setEnvironmentVariables() {
  console.log('\n🚀 Setting environment variables...');
  
  // Define your environment variables here
  const envVars = {
    'SUPABASE_URL': process.env.SUPABASE_URL || 'http://localhost:54321',
    'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY || '',
    'EMAIL_BISON_API_KEY': process.env.EMAIL_BISON_API_KEY || '',
    'N8N_WEBHOOK_URL': process.env.N8N_WEBHOOK_URL || '',
    'SYNC_API_KEY': process.env.SYNC_API_KEY || 'dev-sync-key',
  };
  
  // Set each environment variable
  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      console.log(`Setting ${key}`);
      runCommand(`supabase secrets set ${key}=${value}`, { cwd: config.projectDir });
    } else {
      console.warn(`⚠️ Warning: ${key} is not set`);
    }
  });
  
  console.log('✅ Environment variables set successfully');
}

// Main function
async function main() {
  console.log('📧 Mail AI Backend Deployment');
  console.log('============================');
  
  // Check prerequisites
  checkSupabaseCLI();
  
  // Initialize project
  initializeProject();
  
  // Start local development
  startLocalDevelopment();
  
  // Apply migrations
  applyMigrations();
  
  // Set environment variables
  setEnvironmentVariables();
  
  // Deploy functions
  deployFunctions();
  
  console.log('\n✅ Deployment completed successfully!');
  console.log('\nLocal Supabase Studio: http://localhost:54323');
  console.log('API Endpoint: http://localhost:54321');
  
  console.log('\n📝 Next steps:');
  console.log('1. Set up your frontend to connect to the Supabase backend');
  console.log('2. Configure n8n for AI reply generation');
  console.log('3. Set up Email Bison API integration');
}

// Run the main function
main().catch(error => {
  console.error('Error during deployment:', error);
  process.exit(1);
});
