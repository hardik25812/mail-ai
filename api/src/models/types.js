/**
 * Type definitions for the Mail AI application
 * These are JavaScript representations of TypeScript interfaces
 * that will be mirrored on the frontend
 */

// Email interface
const EmailSchema = {
  id: 'string',
  inboxId: 'string',
  threadId: 'string',
  subject: 'string',
  snippet: 'string',
  body: 'string',
  from: {
    email: 'string',
    name: 'string'
  },
  to: [{
    email: 'string',
    name: 'string'
  }],
  cc: [{
    email: 'string',
    name: 'string'
  }],
  bcc: [{
    email: 'string',
    name: 'string'
  }],
  date: 'Date',
  isRead: 'boolean',
  hasAttachments: 'boolean',
  labels: ['string'],
  attachments: [{
    id: 'string',
    filename: 'string',
    contentType: 'string',
    size: 'number'
  }]
};

// Email Thread interface
const EmailThreadSchema = {
  id: 'string',
  inboxId: 'string',
  subject: 'string',
  snippet: 'string',
  lastMessageDate: 'Date',
  participants: [{
    email: 'string',
    name: 'string'
  }],
  messageCount: 'number',
  unreadCount: 'number',
  messages: [EmailSchema],
  labels: ['string'],
  isStarred: 'boolean'
};

// Inbox interface
const InboxSchema = {
  id: 'string',
  workspaceId: 'string',
  name: 'string',
  email: 'string',
  provider: 'string', // 'gmail', 'outlook', etc.
  unreadCount: 'number',
  totalCount: 'number',
  lastSyncTime: 'Date',
  isActive: 'boolean',
  labels: ['string']
};

// Workspace interface
const WorkspaceSchema = {
  id: 'string',
  name: 'string',
  ownerId: 'string',
  members: [{
    userId: 'string',
    role: 'string' // 'owner', 'admin', 'member'
  }],
  createdAt: 'Date',
  updatedAt: 'Date',
  settings: {
    aiReplyEnabled: 'boolean',
    defaultReplyPrompt: 'string'
  }
};

// AI Reply interface
const AIReplySchema = {
  id: 'string',
  emailId: 'string',
  threadId: 'string',
  inboxId: 'string',
  content: 'string',
  generatedAt: 'Date',
  sentAt: 'Date',
  status: 'string', // 'draft', 'sent', 'failed'
  model: 'string', // 'gpt-4', etc.
  prompt: 'string',
  editedVersion: 'string', // If user edited the reply
  editedAt: 'Date'
};

// Reply Job interface
const ReplyJobSchema = {
  id: 'string',
  emailId: 'string',
  threadId: 'string',
  inboxId: 'string',
  createdAt: 'Date',
  completedAt: 'Date', 
  status: 'string', // 'pending', 'processing', 'completed', 'failed'
  error: 'string',
  aiReplyId: 'string', // Link to the generated reply if completed successfully
  priority: 'number',
  retries: 'number'
};

// Webhook interface
const WebhookSchema = {
  id: 'string',
  workspaceId: 'string',
  event: 'string', // 'email.received', 'reply.sent', etc.
  url: 'string',
  secret: 'string',
  isActive: 'boolean',
  createdAt: 'Date',
  lastTriggeredAt: 'Date',
  lastResponseStatus: 'number'
};

// Export all schemas
module.exports = {
  EmailSchema,
  EmailThreadSchema,
  InboxSchema,
  WorkspaceSchema,
  AIReplySchema,
  ReplyJobSchema,
  WebhookSchema
};
