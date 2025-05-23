/**
 * Routes for email-related endpoints
 */
const express = require('express');
const router = express.Router();
const { 
  mockEmailThreads, 
  mockInboxes, 
  generateId 
} = require('../data/mock-data');

// GET /api/emails/threads
// Get all email threads with pagination support
router.get('/threads', (req, res) => {
  const { inboxId, page = 1, limit = 20, label } = req.query;
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  
  // Filter threads by inbox if provided
  let filteredThreads = mockEmailThreads;
  if (inboxId) {
    filteredThreads = filteredThreads.filter(thread => thread.inboxId === inboxId);
  }
  
  // Filter by label if provided
  if (label) {
    filteredThreads = filteredThreads.filter(thread => thread.labels.includes(label));
  }
  
  // Sort threads by last message date (newest first)
  filteredThreads.sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
  
  // Paginate results
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedThreads = filteredThreads.slice(startIndex, endIndex);
  
  // Return paginated results with metadata
  res.status(200).json({
    data: paginatedThreads,
    meta: {
      total: filteredThreads.length,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(filteredThreads.length / pageSize)
    }
  });
});

// GET /api/emails/threads/:threadId
// Get a specific email thread by ID
router.get('/threads/:threadId', (req, res) => {
  const { threadId } = req.params;
  
  const thread = mockEmailThreads.find(thread => thread.id === threadId);
  
  if (!thread) {
    return res.status(404).json({
      error: {
        message: `Thread with ID ${threadId} not found`,
        status: 404
      }
    });
  }
  
  res.status(200).json({
    data: thread,
    status: 200
  });
});

// GET /api/emails/inboxes
// Get all inboxes for a user's workspaces
router.get('/inboxes', (req, res) => {
  const { workspaceId } = req.query;
  
  let filteredInboxes = mockInboxes;
  if (workspaceId) {
    filteredInboxes = filteredInboxes.filter(inbox => inbox.workspaceId === workspaceId);
  }
  
  res.status(200).json({
    data: filteredInboxes,
    status: 200
  });
});

// GET /api/emails/inboxes/:inboxId
// Get a specific inbox by ID
router.get('/inboxes/:inboxId', (req, res) => {
  const { inboxId } = req.params;
  
  const inbox = mockInboxes.find(inbox => inbox.id === inboxId);
  
  if (!inbox) {
    return res.status(404).json({
      error: {
        message: `Inbox with ID ${inboxId} not found`,
        status: 404
      }
    });
  }
  
  res.status(200).json({
    data: inbox,
    status: 200
  });
});

// GET /api/emails/:emailId
// Get a specific email by ID
router.get('/:emailId', (req, res) => {
  const { emailId } = req.params;
  
  // Find the email in any thread
  let email = null;
  for (const thread of mockEmailThreads) {
    const foundEmail = thread.messages.find(message => message.id === emailId);
    if (foundEmail) {
      email = foundEmail;
      break;
    }
  }
  
  if (!email) {
    return res.status(404).json({
      error: {
        message: `Email with ID ${emailId} not found`,
        status: 404
      }
    });
  }
  
  res.status(200).json({
    data: email,
    status: 200
  });
});

// PATCH /api/emails/:emailId
// Update a specific email (e.g., mark as read)
router.patch('/:emailId', (req, res) => {
  const { emailId } = req.params;
  const updates = req.body;
  
  // Find and update the email in any thread
  let email = null;
  for (const thread of mockEmailThreads) {
    const foundEmail = thread.messages.find(message => message.id === emailId);
    if (foundEmail) {
      // Apply updates
      Object.assign(foundEmail, updates);
      email = foundEmail;
      
      // If marking as read, update thread unread count
      if (updates.isRead === true && !foundEmail.isRead) {
        thread.unreadCount = Math.max(0, thread.unreadCount - 1);
      } else if (updates.isRead === false && foundEmail.isRead) {
        thread.unreadCount += 1;
      }
      
      break;
    }
  }
  
  if (!email) {
    return res.status(404).json({
      error: {
        message: `Email with ID ${emailId} not found`,
        status: 404
      }
    });
  }
  
  res.status(200).json({
    data: email,
    status: 200,
    message: 'Email updated successfully'
  });
});

// POST /api/emails (only for simulation)
// Simulate receiving a new email
router.post('/', (req, res) => {
  const { inboxId, threadId, from, to, subject, body } = req.body;
  
  if (!inboxId || !from || !subject || !body) {
    return res.status(400).json({
      error: {
        message: 'Missing required fields: inboxId, from, subject, body',
        status: 400
      }
    });
  }
  
  // Check if the inbox exists
  const inbox = mockInboxes.find(inbox => inbox.id === inboxId);
  if (!inbox) {
    return res.status(404).json({
      error: {
        message: `Inbox with ID ${inboxId} not found`,
        status: 404
      }
    });
  }
  
  const newEmail = {
    id: `email-${generateId()}`,
    inboxId,
    threadId: threadId || `thread-${generateId()}`,
    subject,
    snippet: body.substring(0, 100).replace(/<[^>]*>/g, ''),
    body,
    from,
    to: to || [{ email: inbox.email, name: inbox.name }],
    cc: [],
    bcc: [],
    date: new Date(),
    isRead: false,
    hasAttachments: false,
    labels: [],
    attachments: []
  };
  
  // If threadId provided, add to existing thread
  if (threadId) {
    const thread = mockEmailThreads.find(thread => thread.id === threadId);
    if (thread) {
      thread.messages.push(newEmail);
      thread.lastMessageDate = newEmail.date;
      thread.unreadCount += 1;
      thread.messageCount += 1;
      thread.snippet = newEmail.snippet;
      
      // Add sender to participants if not already present
      const senderExists = thread.participants.some(p => p.email === from.email);
      if (!senderExists) {
        thread.participants.push(from);
      }
      
      res.status(201).json({
        data: newEmail,
        status: 201,
        message: 'Email added to thread successfully'
      });
    } else {
      return res.status(404).json({
        error: {
          message: `Thread with ID ${threadId} not found`,
          status: 404
        }
      });
    }
  } else {
    // Create a new thread
    const newThread = {
      id: newEmail.threadId,
      inboxId,
      subject,
      snippet: newEmail.snippet,
      lastMessageDate: newEmail.date,
      participants: [from, ...newEmail.to],
      messageCount: 1,
      unreadCount: 1,
      messages: [newEmail],
      labels: [],
      isStarred: false
    };
    
    mockEmailThreads.push(newThread);
    
    res.status(201).json({
      data: newEmail,
      status: 201,
      message: 'Email and new thread created successfully'
    });
  }
  
  // Update inbox unread count
  inbox.unreadCount += 1;
  inbox.totalCount += 1;
  inbox.lastSyncTime = new Date();
});

module.exports = router;
