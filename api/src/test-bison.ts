import dotenv from 'dotenv';
import path from 'path';

// Load environment variables with absolute path
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Import our test client functions
import { fetchInboxes, fetchWorkspaces, verifyApiKey } from './test-bison-client';

// Run the tests in sequence
async function runTests() {
  console.log("=== EMAIL BISON API TEST ===");
  console.log("Testing Email Bison API connection with your provided configuration");
  
  try {
    // First verify the API key
    console.log("\n1. Verifying API Key...");
    const keyValid = await verifyApiKey();
    
    if (keyValid) {
      // If key is valid, try fetching inboxes and workspaces
      console.log("\n2. Fetching Inboxes...");
      await fetchInboxes();
      
      console.log("\n3. Fetching Workspaces...");
      await fetchWorkspaces();
    } else {
      console.log("\nAPI key verification failed. Please check your Email Bison API key.");
      console.log("Make sure you're using the correct key for this environment.");
    }
  } catch (error) {
    console.error("Test failed with error:", error);
  }
  
  console.log("\n=== TEST COMPLETE ===");
}

// Run the tests
runTests();
