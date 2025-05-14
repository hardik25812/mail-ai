/**
 * API Documentation for Mail AI
 * 
 * This file serves as comprehensive documentation for all API endpoints
 * in the Mail AI application, including their parameters, response formats,
 * and usage examples.
 */

/**
 * Email Service Endpoints
 */
export const EmailEndpoints = {
  /**
   * Get all inboxes
   * 
   * @endpoint GET /api/inboxes
   * @query workspace_id - Optional workspace ID filter
   * @returns Array of Inbox objects
   * @example
   * const { data } = await apiClient.get('/inboxes', { params: { workspace_id: 'workspace-123' } });
   */
  GET_INBOXES: '/inboxes',

  /**
   * Get emails for a specific inbox with pagination
   * 
   * @endpoint GET /api/emails
   * @query inbox_id - Required inbox ID
   * @query page - Optional page number (default: 1)
   * @query limit - Optional items per page (default: 25)
   * @query is_read - Optional filter by read status
   * @query is_flagged - Optional filter by flagged status
   * @query has_attachments - Optional filter for emails with attachments
   * @query date_from - Optional filter for emails after this date
   * @query date_to - Optional filter for emails before this date
   * @query sender - Optional filter by sender
   * @query search_term - Optional search term for email content
   * @returns Paginated response with emails array and metadata
   * @example
   * const data = await apiClient.getPaginated('/emails', 1, 25, { 
   *   inbox_id: 'inbox-123',
   *   is_read: false,
   *   search_term: 'urgent'
   * });
   */
  GET_EMAILS: '/emails',

  /**
   * Get a specific email by ID
   * 
   * @endpoint GET /api/emails/:id
   * @params id - Email ID
   * @returns Email object
   * @example
   * const { data } = await apiClient.get(`/emails/${emailId}`);
   */
  GET_EMAIL: '/emails/:id',

  /**
   * Get threads for a specific inbox with pagination
   * 
   * @endpoint GET /api/threads
   * @query inbox_id - Required inbox ID
   * @query page - Optional page number (default: 1)
   * @query limit - Optional items per page (default: 25)
   * @query is_read - Optional filter by read status
   * @query is_flagged - Optional filter by flagged status
   * @returns Paginated response with threads array and metadata
   * @example
   * const data = await apiClient.getPaginated('/threads', 1, 25, { inbox_id: 'inbox-123' });
   */
  GET_THREADS: '/threads',

  /**
   * Get a thread with all its emails
   * 
   * @endpoint GET /api/threads/:id
   * @params id - Thread ID
   * @returns Thread object with emails array
   * @example
   * const { data } = await apiClient.get(`/threads/${threadId}`);
   */
  GET_THREAD: '/threads/:id',

  /**
   * Trigger AI reply for an email
   * 
   * @endpoint POST /api/trigger-ai-reply
   * @body email_id - Email ID to reply to
   * @returns Generated reply and metadata
   * @example
   * const { data } = await apiClient.post('/trigger-ai-reply', { email_id: 'email-123' });
   */
  TRIGGER_AI_REPLY: '/trigger-ai-reply',

  /**
   * Send an email
   * 
   * @endpoint POST /api/send-email
   * @body inbox_id - Source inbox ID
   * @body thread_id - Optional thread ID for replies
   * @body recipient - Recipient email address
   * @body subject - Email subject
   * @body body - Email body
   * @body cc - Optional array of CC recipients
   * @body bcc - Optional array of BCC recipients
   * @returns Sent email object
   * @example
   * const { data } = await apiClient.post('/send-email', {
   *   inbox_id: 'inbox-123',
   *   recipient: 'user@example.com',
   *   subject: 'Hello',
   *   body: 'This is a test email'
   * });
   */
  SEND_EMAIL: '/send-email',

  /**
   * Mark email as read/unread
   * 
   * @endpoint PATCH /api/emails/:id/read-status
   * @params id - Email ID
   * @body is_read - Boolean read status
   * @returns Updated email object
   * @example
   * const { data } = await apiClient.patch(`/emails/${emailId}/read-status`, { is_read: true });
   */
  MARK_EMAIL_READ_STATUS: '/emails/:id/read-status',

  /**
   * Flag/unflag an email
   * 
   * @endpoint PATCH /api/emails/:id/flag
   * @params id - Email ID
   * @body is_flagged - Boolean flagged status
   * @returns Updated email object
   * @example
   * const { data } = await apiClient.patch(`/emails/${emailId}/flag`, { is_flagged: true });
   */
  TOGGLE_EMAIL_FLAG: '/emails/:id/flag',

  /**
   * Manually trigger inbox synchronization
   * 
   * @endpoint POST /api/inboxes/:id/sync
   * @params id - Inbox ID
   * @returns Sync status object
   * @example
   * const { data } = await apiClient.post(`/inboxes/${inboxId}/sync`);
   */
  SYNC_INBOX: '/inboxes/:id/sync',

  /**
   * Get inbox sync status
   * 
   * @endpoint GET /api/inboxes/:id/sync-status
   * @params id - Inbox ID
   * @returns Sync status object
   * @example
   * const { data } = await apiClient.get(`/inboxes/${inboxId}/sync-status`);
   */
  GET_INBOX_SYNC_STATUS: '/inboxes/:id/sync-status',

  /**
   * WebSocket connection for real-time updates
   * 
   * @endpoint WebSocket /api/ws
   * @query workspaceId - Workspace ID
   * @events
   *   - new_email: Triggered when a new email is received
   *   - email_updated: Triggered when an email is updated
   *   - inbox_sync_complete: Triggered when inbox sync is complete
   * @example
   * // Connect to WebSocket
   * const cleanup = EmailService.setupRealTimeUpdates(workspaceId, inboxId, callback);
   */
  WEBSOCKET: '/ws'
};

/**
 * Bison Service Endpoints
 */
export const BisonEndpoints = {
  /**
   * Get workspace details
   * 
   * @endpoint GET /api/bison/workspaces/:id
   * @params id - Workspace ID
   * @returns Workspace details with Bison connection status
   * @example
   * const { data } = await BisonService.getWorkspaceDetails(workspaceId);
   */
  GET_WORKSPACE: '/bison/workspaces/:id',

  /**
   * Connect workspace to Email Bison
   * 
   * @endpoint POST /api/bison/workspaces/:id/connect
   * @params id - Workspace ID
   * @body api_key - Email Bison API key
   * @returns Connection status
   * @example
   * const { data } = await BisonService.connectWorkspace(apiKey, workspaceId);
   */
  CONNECT_WORKSPACE: '/bison/workspaces/:id/connect',

  /**
   * Disconnect workspace from Email Bison
   * 
   * @endpoint POST /api/bison/workspaces/:id/disconnect
   * @params id - Workspace ID
   * @returns Disconnection status
   * @example
   * const { data } = await BisonService.disconnectWorkspace(workspaceId);
   */
  DISCONNECT_WORKSPACE: '/bison/workspaces/:id/disconnect',

  /**
   * Get email accounts
   * 
   * @endpoint GET /api/bison/email-accounts
   * @query workspace_id - Workspace ID
   * @returns Array of email accounts
   * @example
   * const { data } = await BisonService.getEmailAccounts(workspaceId);
   */
  GET_EMAIL_ACCOUNTS: '/bison/email-accounts',

  /**
   * Get webhooks
   * 
   * @endpoint GET /api/bison/webhooks
   * @query workspace_id - Workspace ID
   * @returns Array of webhooks
   * @example
   * const { data } = await BisonService.getWebhooks(workspaceId);
   */
  GET_WEBHOOKS: '/bison/webhooks',

  /**
   * Create webhook
   * 
   * @endpoint POST /api/bison/webhooks
   * @body workspace_id - Workspace ID
   * @body url - Webhook URL
   * @body secret - Webhook secret
   * @body events - Array of event types to subscribe to
   * @returns Created webhook
   * @example
   * const { data } = await BisonService.createWebhook({
   *   workspace_id: workspaceId,
   *   url: 'https://example.com/webhook',
   *   secret: 'webhook-secret',
   *   events: ['email.received', 'email.sent']
   * });
   */
  CREATE_WEBHOOK: '/bison/webhooks',

  /**
   * Delete webhook
   * 
   * @endpoint DELETE /api/bison/webhooks/:id
   * @params id - Webhook ID
   * @returns Deletion status
   * @example
   * const { data } = await BisonService.deleteWebhook(webhookId);
   */
  DELETE_WEBHOOK: '/bison/webhooks/:id',

  /**
   * Test webhook
   * 
   * @endpoint POST /api/bison/webhooks/:id/test
   * @params id - Webhook ID
   * @body event_type - Event type to test
   * @returns Test status
   * @example
   * const { data } = await BisonService.testWebhook(webhookId, 'email.received');
   */
  TEST_WEBHOOK: '/bison/webhooks/:id/test',

  /**
   * Get leads
   * 
   * @endpoint GET /api/bison/leads
   * @query workspace_id - Workspace ID
   * @query page - Page number
   * @query limit - Items per page
   * @returns Paginated leads
   * @example
   * const { data, meta } = await BisonService.getLeads(workspaceId, 1, 20);
   */
  GET_LEADS: '/bison/leads',

  /**
   * Get campaigns
   * 
   * @endpoint GET /api/bison/campaigns
   * @query workspace_id - Workspace ID
   * @query page - Page number
   * @query limit - Items per page
   * @returns Paginated campaigns
   * @example
   * const { data, meta } = await BisonService.getCampaigns(workspaceId, 1, 20);
   */
  GET_CAMPAIGNS: '/bison/campaigns',

  /**
   * Get email stats
   * 
   * @endpoint GET /api/bison/email-stats
   * @query workspace_id - Workspace ID
   * @query time_range - Time range (e.g., 'last_30_days')
   * @returns Email statistics
   * @example
   * const { data } = await BisonService.getEmailStats(workspaceId, 'last_30_days');
   */
  GET_EMAIL_STATS: '/bison/email-stats'
};

/**
 * RAG Memory Service Endpoints
 */
export const RAGMemoryEndpoints = {
  /**
   * Get past replies
   * 
   * @endpoint GET /api/rag-memory/past-replies
   * @query inbox_id - Inbox ID
   * @query limit - Maximum number of replies to retrieve
   * @returns Array of past replies
   * @example
   * const { data } = await ragMemoryService.getPastReplies(inboxId, 10);
   */
  GET_PAST_REPLIES: '/rag-memory/past-replies',

  /**
   * Get similar replies
   * 
   * @endpoint POST /api/rag-memory/similar-replies
   * @body inbox_id - Inbox ID
   * @body email_id - Optional email ID
   * @body thread_id - Optional thread ID
   * @body query_text - Text to find similar replies for
   * @body limit - Optional maximum number of replies to retrieve
   * @returns Context with similar replies
   * @example
   * const { data } = await ragMemoryService.getSimilarReplies({
   *   inbox_id: inboxId,
   *   email_id: emailId,
   *   query_text: 'How to reset password'
   * });
   */
  GET_SIMILAR_REPLIES: '/rag-memory/similar-replies',

  /**
   * Generate enhanced reply
   * 
   * @endpoint POST /api/rag-memory/generate-reply
   * @body email_id - Email ID to reply to
   * @returns Generated reply with context
   * @example
   * const { data } = await ragMemoryService.generateEnhancedReply(emailId);
   */
  GENERATE_ENHANCED_REPLY: '/rag-memory/generate-reply',

  /**
   * Save reply to memory
   * 
   * @endpoint POST /api/rag-memory/save-reply
   * @body inbox_id - Inbox ID
   * @body thread_id - Thread ID
   * @body email_id - Email ID
   * @body reply_content - Reply content to save
   * @returns Saved reply
   * @example
   * const { data } = await ragMemoryService.saveReplyToMemory({
   *   inbox_id: inboxId,
   *   thread_id: threadId,
   *   email_id: emailId,
   *   reply_content: 'Here is how you reset your password...'
   * });
   */
  SAVE_REPLY: '/rag-memory/save-reply',

  /**
   * Delete past reply
   * 
   * @endpoint DELETE /api/rag-memory/past-replies/:id
   * @params id - Reply ID
   * @returns Deletion status
   * @example
   * await ragMemoryService.deletePastReply(replyId);
   */
  DELETE_PAST_REPLY: '/rag-memory/past-replies/:id',

  /**
   * Get memory stats
   * 
   * @endpoint GET /api/rag-memory/stats
   * @query workspace_id - Workspace ID
   * @returns Memory statistics
   * @example
   * const { data } = await ragMemoryService.getMemoryStats(workspaceId);
   */
  GET_MEMORY_STATS: '/rag-memory/stats'
};

/**
 * OpenAI Service Endpoints
 */
export const OpenAIEndpoints = {
  /**
   * Generate a completion
   * 
   * @endpoint POST /api/ai/completions
   * @body messages - Array of messages (system, user, assistant)
   * @body config - Optional configuration (model, temperature, etc.)
   * @returns Completion response
   * @example
   * const { data } = await openAIService.generateCompletion({
   *   messages: [
   *     { role: 'system', content: 'You are a helpful assistant.' },
   *     { role: 'user', content: 'Hello!' }
   *   ],
   *   config: { temperature: 0.7 }
   * });
   */
  GENERATE_COMPLETION: '/ai/completions',

  /**
   * Generate an email reply
   * 
   * @endpoint POST /api/ai/generate-email-reply
   * @body email_id - Email ID to reply to
   * @body template_id - Optional template ID
   * @body custom_instructions - Optional custom instructions
   * @body config - Optional configuration (model, temperature, etc.)
   * @returns Generated reply
   * @example
   * const { data } = await openAIService.generateEmailReply(emailId, {
   *   template_id: 'template-123',
   *   custom_instructions: 'Be very polite'
   * });
   */
  GENERATE_EMAIL_REPLY: '/ai/generate-email-reply',

  /**
   * Generate a thread summary
   * 
   * @endpoint POST /api/ai/thread-summary
   * @body thread_id - Thread ID to summarize
   * @returns Generated summary
   * @example
   * const { data } = await openAIService.generateThreadSummary(threadId);
   */
  GENERATE_THREAD_SUMMARY: '/ai/thread-summary',

  /**
   * Get email templates
   * 
   * @endpoint GET /api/ai/email-templates
   * @returns Array of email templates
   * @example
   * const { data } = await openAIService.getEmailTemplates();
   */
  GET_EMAIL_TEMPLATES: '/ai/email-templates',

  /**
   * Create email template
   * 
   * @endpoint POST /api/ai/email-templates
   * @body name - Template name
   * @body description - Template description
   * @body system_prompt - System prompt
   * @body example_input - Optional example input
   * @body example_output - Optional example output
   * @body default_config - Default configuration
   * @returns Created template
   * @example
   * const { data } = await openAIService.createEmailTemplate({
   *   name: 'Customer Support',
   *   description: 'Template for customer support replies',
   *   system_prompt: 'You are a helpful customer support agent...',
   *   default_config: { temperature: 0.5 }
   * });
   */
  CREATE_EMAIL_TEMPLATE: '/ai/email-templates',

  /**
   * Update email template
   * 
   * @endpoint PUT /api/ai/email-templates/:id
   * @params id - Template ID
   * @body updates - Template updates
   * @returns Updated template
   * @example
   * const { data } = await openAIService.updateEmailTemplate(templateId, {
   *   name: 'Updated Template Name'
   * });
   */
  UPDATE_EMAIL_TEMPLATE: '/ai/email-templates/:id',

  /**
   * Delete email template
   * 
   * @endpoint DELETE /api/ai/email-templates/:id
   * @params id - Template ID
   * @returns Deletion status
   * @example
   * await openAIService.deleteEmailTemplate(templateId);
   */
  DELETE_EMAIL_TEMPLATE: '/ai/email-templates/:id',

  /**
   * Check API key validity
   * 
   * @endpoint POST /api/ai/check-api-key
   * @body api_key - OpenAI API key
   * @returns Validity status
   * @example
   * const { data } = await openAIService.checkAPIKey(apiKey);
   */
  CHECK_API_KEY: '/ai/check-api-key'
};

/**
 * Analytics Service Endpoints
 */
export const AnalyticsEndpoints = {
  /**
   * Get email volume statistics
   * 
   * @endpoint GET /api/analytics/email-volume
   * @query workspace_id - Workspace ID
   * @query time_range - Time range
   * @returns Email volume statistics
   * @example
   * const { data } = await AnalyticsService.getEmailVolume(workspaceId, 'last_30_days');
   */
  GET_EMAIL_VOLUME: '/analytics/email-volume',

  /**
   * Get response time metrics
   * 
   * @endpoint GET /api/analytics/response-time
   * @query workspace_id - Workspace ID
   * @query time_range - Time range
   * @returns Response time metrics
   * @example
   * const { data } = await AnalyticsService.getResponseTime(workspaceId, 'last_30_days');
   */
  GET_RESPONSE_TIME: '/analytics/response-time',

  /**
   * Get email type distribution
   * 
   * @endpoint GET /api/analytics/email-types
   * @query workspace_id - Workspace ID
   * @query time_range - Time range
   * @returns Email type distribution
   * @example
   * const { data } = await AnalyticsService.getEmailTypes(workspaceId, 'last_30_days');
   */
  GET_EMAIL_TYPES: '/analytics/email-types',

  /**
   * Export analytics data
   * 
   * @endpoint GET /api/analytics/export
   * @query workspace_id - Workspace ID
   * @query type - Export type (csv, json, excel)
   * @query time_range - Time range
   * @returns Download URL or data
   * @example
   * const { data } = await AnalyticsService.exportData(workspaceId, 'csv', 'last_30_days');
   */
  EXPORT_DATA: '/analytics/export'
};

/**
 * System Endpoints
 */
export const SystemEndpoints = {
  /**
   * Submit logs
   * 
   * @endpoint POST /api/logs
   * @body logs - Array of log entries
   * @body app_version - Application version
   * @body environment - Environment (development, production)
   * @returns Log submission status
   * @example
   * // Handled automatically by the logging service
   */
  SUBMIT_LOGS: '/logs',

  /**
   * Health check
   * 
   * @endpoint GET /api/health
   * @returns Health status
   * @example
   * const { data } = await apiClient.get('/health');
   */
  HEALTH_CHECK: '/health'
};

/**
 * All API Endpoints
 */
export const AllEndpoints = {
  ...EmailEndpoints,
  ...BisonEndpoints,
  ...RAGMemoryEndpoints,
  ...OpenAIEndpoints,
  ...AnalyticsEndpoints,
  ...SystemEndpoints
};

export default AllEndpoints;
