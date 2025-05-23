/**
 * Routes for webhook management
 */
const express = require('express');
const router = express.Router();
const { mockWebhooks, generateId } = require('../data/mock-data');

// GET /api/webhooks
// Get all webhooks for a workspace
router.get('/', (req, res) => {
  const { workspaceId, event } = req.query;
  
  if (!workspaceId) {
    return res.status(400).json({
      error: {
        message: 'Missing required query parameter: workspaceId',
        status: 400
      }
    });
  }
  
  let filteredWebhooks = mockWebhooks.filter(webhook => webhook.workspaceId === workspaceId);
  
  // Filter by event type if provided
  if (event) {
    filteredWebhooks = filteredWebhooks.filter(webhook => webhook.event === event);
  }
  
  // Sort by creation date (newest first)
  filteredWebhooks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.status(200).json({
    data: filteredWebhooks,
    status: 200
  });
});

// GET /api/webhooks/:webhookId
// Get a specific webhook by ID
router.get('/:webhookId', (req, res) => {
  const { webhookId } = req.params;
  
  const webhook = mockWebhooks.find(webhook => webhook.id === webhookId);
  
  if (!webhook) {
    return res.status(404).json({
      error: {
        message: `Webhook with ID ${webhookId} not found`,
        status: 404
      }
    });
  }
  
  res.status(200).json({
    data: webhook,
    status: 200
  });
});

// POST /api/webhooks
// Create a new webhook
router.post('/', (req, res) => {
  const { 
    workspaceId, 
    event, 
    url,
    secret
  } = req.body;
  
  if (!workspaceId || !event || !url) {
    return res.status(400).json({
      error: {
        message: 'Missing required fields: workspaceId, event, url',
        status: 400
      }
    });
  }
  
  // Validate event type
  const validEvents = ['email.received', 'reply.sent', 'reply.generated'];
  if (!validEvents.includes(event)) {
    return res.status(400).json({
      error: {
        message: `Invalid event type. Must be one of: ${validEvents.join(', ')}`,
        status: 400
      }
    });
  }
  
  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({
      error: {
        message: 'Invalid URL format',
        status: 400
      }
    });
  }
  
  // Create a new webhook
  const newWebhook = {
    id: `webhook-${generateId()}`,
    workspaceId,
    event,
    url,
    secret: secret || generateRandomSecret(),
    isActive: true,
    createdAt: new Date(),
    lastTriggeredAt: null,
    lastResponseStatus: null
  };
  
  mockWebhooks.push(newWebhook);
  
  res.status(201).json({
    data: newWebhook,
    status: 201,
    message: 'Webhook created successfully'
  });
});

// PUT /api/webhooks/:webhookId
// Update a webhook
router.put('/:webhookId', (req, res) => {
  const { webhookId } = req.params;
  const updates = req.body;
  
  const webhook = mockWebhooks.find(webhook => webhook.id === webhookId);
  
  if (!webhook) {
    return res.status(404).json({
      error: {
        message: `Webhook with ID ${webhookId} not found`,
        status: 404
      }
    });
  }
  
  // Don't allow updating these fields directly
  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  delete safeUpdates.workspaceId;
  delete safeUpdates.createdAt;
  
  // If updating URL, validate format
  if (safeUpdates.url) {
    try {
      new URL(safeUpdates.url);
    } catch (error) {
      return res.status(400).json({
        error: {
          message: 'Invalid URL format',
          status: 400
        }
      });
    }
  }
  
  // If updating event, validate type
  if (safeUpdates.event) {
    const validEvents = ['email.received', 'reply.sent', 'reply.generated'];
    if (!validEvents.includes(safeUpdates.event)) {
      return res.status(400).json({
        error: {
          message: `Invalid event type. Must be one of: ${validEvents.join(', ')}`,
          status: 400
        }
      });
    }
  }
  
  // Apply updates
  Object.assign(webhook, safeUpdates);
  
  res.status(200).json({
    data: webhook,
    status: 200,
    message: 'Webhook updated successfully'
  });
});

// DELETE /api/webhooks/:webhookId
// Delete a webhook
router.delete('/:webhookId', (req, res) => {
  const { webhookId } = req.params;
  
  const webhookIndex = mockWebhooks.findIndex(webhook => webhook.id === webhookId);
  
  if (webhookIndex === -1) {
    return res.status(404).json({
      error: {
        message: `Webhook with ID ${webhookId} not found`,
        status: 404
      }
    });
  }
  
  // Remove from collection
  mockWebhooks.splice(webhookIndex, 1);
  
  res.status(200).json({
    status: 200,
    message: 'Webhook deleted successfully'
  });
});

// POST /api/webhooks/:webhookId/test
// Test a webhook by sending a test payload
router.post('/:webhookId/test', (req, res) => {
  const { webhookId } = req.params;
  
  const webhook = mockWebhooks.find(webhook => webhook.id === webhookId);
  
  if (!webhook) {
    return res.status(404).json({
      error: {
        message: `Webhook with ID ${webhookId} not found`,
        status: 404
      }
    });
  }
  
  // In a real implementation, this would actually make an HTTP request to the webhook URL
  // For mock purposes, we'll simulate a successful test
  
  // Update last triggered info
  webhook.lastTriggeredAt = new Date();
  webhook.lastResponseStatus = 200;
  
  res.status(200).json({
    data: {
      success: true,
      message: 'Test webhook sent successfully',
      webhook
    },
    status: 200
  });
});

// Helper function to generate a random webhook secret
function generateRandomSecret() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

module.exports = router;
