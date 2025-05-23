/**
 * Email Bison Webhook Tunnel Setup
 * 
 * This script:
 * 1. Starts an ngrok tunnel for the Email Bison webhook endpoint
 * 2. Registers the webhook URL with Email Bison API
 * 3. Provides a dashboard to monitor webhook events
 */

require('dotenv').config();
const ngrok = require('ngrok');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Simple logger implementation for the script
const createLogger = (component) => {
  return {
    info: (message, metadata) => {
      console.log(`[INFO] [${component}] ${message}`, metadata || '');
    },
    error: (message, metadata) => {
      console.error(`[ERROR] [${component}] ${message}`, metadata || '');
    },
    debug: (message, metadata) => {
      console.log(`[DEBUG] [${component}] ${message}`, metadata || '');
    },
    warn: (message, metadata) => {
      console.warn(`[WARN] [${component}] ${message}`, metadata || '');
    }
  };
};

const logger = createLogger('webhook-tunnel');
const WEBHOOK_PATH = '/api/webhook-bison';
const LOCAL_PORT = process.env.PORT || 3000;

// Email Bison API Configuration
const BISON_API_KEY = process.env.EMAIL_BISON_API_KEY;
const BISON_WORKSPACE_ID = process.env.EMAIL_BISON_WORKSPACE_ID;

if (!BISON_API_KEY) {
  logger.error('EMAIL_BISON_API_KEY is not set in .env file');
  process.exit(1);
}

if (!BISON_WORKSPACE_ID) {
  logger.error('EMAIL_BISON_WORKSPACE_ID is not set in .env file');
  process.exit(1);
}

// Load ngrok configuration from ngrok.yml if available
let ngrokConfig = {};
const ngrokConfigPath = path.join(__dirname, '..', 'ngrok.yml');
if (fs.existsSync(ngrokConfigPath)) {
  logger.info(`Loading ngrok configuration from ${ngrokConfigPath}`);
  try {
    // Load configuration without requiring yaml parser
    const configContent = fs.readFileSync(ngrokConfigPath, 'utf8');
    // Basic parsing for authtoken
    const authTokenMatch = configContent.match(/authtoken:\s*(.+)/);
    if (authTokenMatch && authTokenMatch[1]) {
      ngrokConfig.authtoken = authTokenMatch[1].trim();
      logger.info('Loaded ngrok authtoken from configuration');
    }
  } catch (error) {
    logger.warn(`Failed to parse ngrok.yml: ${error.message}`);
  }
}

// Use environment variables as fallback for ngrok config
if (!ngrokConfig.authtoken && process.env.NGROK_AUTHTOKEN) {
  ngrokConfig.authtoken = process.env.NGROK_AUTHTOKEN;
  logger.info('Using NGROK_AUTHTOKEN from environment');
}

if (!ngrokConfig.authtoken) {
  logger.error('No ngrok authtoken found. Please set NGROK_AUTHTOKEN in .env or add authtoken to ngrok.yml');
  process.exit(1);
}

/**
 * Start the ngrok tunnel
 */
async function startNgrokTunnel() {
  try {
    logger.info(`Starting ngrok tunnel for port ${LOCAL_PORT}...`);
    
    const url = await ngrok.connect({
      addr: LOCAL_PORT,
      authtoken: ngrokConfig.authtoken,
      region: process.env.NGROK_REGION || 'us',
      onStatusChange: (status) => {
        logger.info(`Ngrok status: ${status}`);
      },
      onLogEvent: (data) => {
        logger.debug(`Ngrok log: ${data}`);
      },
    });
    
    logger.info(`Ngrok tunnel established: ${url}`);
    
    // Construct webhook URL by appending the webhook path
    const webhookUrl = `${url}${WEBHOOK_PATH}`;
    logger.info(`Webhook URL: ${webhookUrl}`);
    
    // Save the URL to a file for reference
    fs.writeFileSync(
      path.join(__dirname, '..', 'webhook-url.txt'),
      `Webhook URL: ${webhookUrl}\nGenerated: ${new Date().toISOString()}\n`
    );
    
    // Register webhook with Email Bison if API key is available
    if (BISON_API_KEY && BISON_WORKSPACE_ID) {
      await registerWebhookWithEmailBison(webhookUrl);
    }
    
    return webhookUrl;
  } catch (error) {
    logger.error(`Failed to start ngrok tunnel: ${error.message}`);
    throw error;
  }
}

/**
 * Register the webhook URL with Email Bison API
 */
async function registerWebhookWithEmailBison(webhookUrl) {
  try {
    logger.info('Registering webhook URL with Email Bison...');
    
    // The endpoint to register webhooks with Email Bison
    // This is a placeholder - replace with the actual Email Bison API endpoint
    const bisonApiEndpoint = `https://api.emailbison.com/v1/workspaces/${BISON_WORKSPACE_ID}/webhooks`;
    
    const response = await axios.post(
      bisonApiEndpoint,
      {
        url: webhookUrl,
        events: [
          'EMAIL_SENT',
          'EMAIL_OPENED',
          'EMAIL_REPLIED',
          'EMAIL_BOUNCED',
          'EMAIL_UNSUBSCRIBED',
          'CAMPAIGN_STARTED',
          'CAMPAIGN_COMPLETED'
        ],
        active: true,
        description: 'Mail AI webhook for real-time email events'
      },
      {
        headers: {
          'Authorization': `Bearer ${BISON_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    logger.info('Webhook registered successfully with Email Bison');
    logger.debug('Registration response:', response.data);
    
    return response.data;
  } catch (error) {
    logger.error(`Failed to register webhook with Email Bison: ${error.message}`);
    logger.error('API response:', error.response?.data || 'No response data');
    
    // We'll log the error but not throw, since the tunnel is still useful for manual testing
    return null;
  }
}

/**
 * Verify the webhook connection by sending a test event
 */
async function verifyWebhookConnection() {
  try {
    logger.info('Verifying webhook connection...');
    
    // The endpoint to send a test event
    // This is a placeholder - replace with the actual Email Bison API endpoint
    const bisonTestEndpoint = `https://api.emailbison.com/v1/workspaces/${BISON_WORKSPACE_ID}/webhooks/test`;
    
    const response = await axios.post(
      bisonTestEndpoint,
      {
        event_type: 'TEST_EVENT',
        payload: {
          test: true,
          timestamp: new Date().toISOString()
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${BISON_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    logger.info('Test event sent successfully');
    return response.data;
  } catch (error) {
    logger.error(`Failed to send test event: ${error.message}`);
    return null;
  }
}

/**
 * Monitor for incoming webhook events
 */
function setupWebhookMonitoring() {
  // This could be enhanced to create a local HTTP server to receive and display webhook events
  // For now we just log a message
  logger.info('Webhook monitoring active. Check webhook-url.txt for the current URL.');
  logger.info('Press Ctrl+C to stop the tunnel');
}

/**
 * Main function
 */
async function main() {
  try {
    // Start the tunnel
    const webhookUrl = await startNgrokTunnel();
    
    // Set up monitoring
    setupWebhookMonitoring();
    
    // Keep the process running
    process.on('SIGINT', async () => {
      logger.info('Shutting down ngrok tunnel...');
      await ngrok.kill();
      logger.info('Ngrok tunnel closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error(`Webhook tunnel setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Start the script
main();
