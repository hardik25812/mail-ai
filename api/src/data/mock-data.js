/**
 * Mock data for the Mail AI application
 * This will be used for local development until real data integration is complete
 */

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Generate realistic mock emails
const mockWorkspaces = [
  {
    id: 'ws-1',
    name: 'Personal Workspace',
    ownerId: 'user-1',
    members: [
      { userId: 'user-1', role: 'owner' }
    ],
    createdAt: new Date('2025-04-01T10:00:00Z'),
    updatedAt: new Date('2025-05-15T14:30:00Z'),
    settings: {
      aiReplyEnabled: true,
      defaultReplyPrompt: 'Reply professionally and concisely'
    }
  },
  {
    id: 'ws-2',
    name: 'Work Workspace',
    ownerId: 'user-1',
    members: [
      { userId: 'user-1', role: 'owner' },
      { userId: 'user-2', role: 'admin' },
      { userId: 'user-3', role: 'member' }
    ],
    createdAt: new Date('2025-04-10T15:20:00Z'),
    updatedAt: new Date('2025-05-10T09:45:00Z'),
    settings: {
      aiReplyEnabled: true,
      defaultReplyPrompt: 'Reply professionally and thoroughly'
    }
  }
];

const mockInboxes = [
  {
    id: 'inbox-1',
    workspaceId: 'ws-1',
    name: 'Personal Gmail',
    email: 'john.doe@gmail.com',
    provider: 'gmail',
    unreadCount: 3,
    totalCount: 143,
    lastSyncTime: new Date('2025-05-17T23:30:00Z'),
    isActive: true,
    labels: ['important', 'personal']
  },
  {
    id: 'inbox-2',
    workspaceId: 'ws-2',
    name: 'Work Outlook',
    email: 'john.doe@company.com',
    provider: 'outlook',
    unreadCount: 12,
    totalCount: 578,
    lastSyncTime: new Date('2025-05-17T23:45:00Z'),
    isActive: true,
    labels: ['work', 'important']
  }
];

// Create mock email threads
const mockEmailThreads = [
  {
    id: 'thread-1',
    inboxId: 'inbox-1',
    subject: 'Weekend plans',
    snippet: 'Hey, what are your plans for this weekend?',
    lastMessageDate: new Date('2025-05-17T18:22:00Z'),
    participants: [
      { email: 'jane.smith@gmail.com', name: 'Jane Smith' },
      { email: 'john.doe@gmail.com', name: 'John Doe' }
    ],
    messageCount: 4,
    unreadCount: 1,
    messages: [
      {
        id: 'email-1',
        inboxId: 'inbox-1',
        threadId: 'thread-1',
        subject: 'Weekend plans',
        snippet: 'Hey, what are your plans for this weekend?',
        body: '<p>Hey John,</p><p>What are your plans for this weekend? I was thinking we could go hiking if the weather is nice.</p><p>Cheers,<br>Jane</p>',
        from: { email: 'jane.smith@gmail.com', name: 'Jane Smith' },
        to: [{ email: 'john.doe@gmail.com', name: 'John Doe' }],
        cc: [],
        bcc: [],
        date: new Date('2025-05-16T15:30:00Z'),
        isRead: true,
        hasAttachments: false,
        labels: ['personal'],
        attachments: []
      },
      {
        id: 'email-2',
        inboxId: 'inbox-1',
        threadId: 'thread-1',
        subject: 'Re: Weekend plans',
        snippet: 'Hiking sounds great! Which trail do you have in mind?',
        body: '<p>Hi Jane,</p><p>Hiking sounds great! Which trail do you have in mind?</p><p>Best,<br>John</p>',
        from: { email: 'john.doe@gmail.com', name: 'John Doe' },
        to: [{ email: 'jane.smith@gmail.com', name: 'Jane Smith' }],
        cc: [],
        bcc: [],
        date: new Date('2025-05-16T16:45:00Z'),
        isRead: true,
        hasAttachments: false,
        labels: ['personal', 'sent'],
        attachments: []
      },
      {
        id: 'email-3',
        inboxId: 'inbox-1',
        threadId: 'thread-1',
        subject: 'Re: Weekend plans',
        snippet: 'I was thinking about Eagle Creek. It\'s a beautiful trail with...',
        body: '<p>John,</p><p>I was thinking about Eagle Creek. It\'s a beautiful trail with waterfalls and great views. We could start around 9am on Saturday?</p><p>Jane</p>',
        from: { email: 'jane.smith@gmail.com', name: 'Jane Smith' },
        to: [{ email: 'john.doe@gmail.com', name: 'John Doe' }],
        cc: [],
        bcc: [],
        date: new Date('2025-05-17T10:15:00Z'),
        isRead: true,
        hasAttachments: false,
        labels: ['personal'],
        attachments: []
      },
      {
        id: 'email-4',
        inboxId: 'inbox-1',
        threadId: 'thread-1',
        subject: 'Re: Weekend plans',
        snippet: 'Sounds perfect! I\'ll pick you up at 8:30am. Do you need any gear?',
        body: '<p>Sounds perfect! I\'ll pick you up at 8:30am. Do you need any gear? I have extra hiking poles if you need them.</p><p>Looking forward to it!<br>John</p>',
        from: { email: 'jane.smith@gmail.com', name: 'Jane Smith' },
        to: [{ email: 'john.doe@gmail.com', name: 'John Doe' }],
        cc: [],
        bcc: [],
        date: new Date('2025-05-17T18:22:00Z'),
        isRead: false,
        hasAttachments: false,
        labels: ['personal', 'important'],
        attachments: []
      }
    ],
    labels: ['personal'],
    isStarred: true
  },
  {
    id: 'thread-2',
    inboxId: 'inbox-2',
    subject: 'Quarterly Report Review',
    snippet: 'Please review the attached quarterly report by EOD...',
    lastMessageDate: new Date('2025-05-17T16:05:00Z'),
    participants: [
      { email: 'manager@company.com', name: 'Alex Manager' },
      { email: 'john.doe@company.com', name: 'John Doe' },
      { email: 'finance@company.com', name: 'Finance Team' }
    ],
    messageCount: 2,
    unreadCount: 1,
    messages: [
      {
        id: 'email-5',
        inboxId: 'inbox-2',
        threadId: 'thread-2',
        subject: 'Quarterly Report Review',
        snippet: 'Please review the attached quarterly report by EOD...',
        body: '<p>Hello Team,</p><p>Please review the attached quarterly report by EOD Friday. I need feedback especially on sections 3 and 5.</p><p>Regards,<br>Alex</p>',
        from: { email: 'manager@company.com', name: 'Alex Manager' },
        to: [
          { email: 'john.doe@company.com', name: 'John Doe' },
          { email: 'finance@company.com', name: 'Finance Team' }
        ],
        cc: [],
        bcc: [],
        date: new Date('2025-05-17T14:30:00Z'),
        isRead: true,
        hasAttachments: true,
        labels: ['work', 'important'],
        attachments: [
          {
            id: 'attach-1',
            filename: 'Q2_2025_Report_Draft.pdf',
            contentType: 'application/pdf',
            size: 2457862
          }
        ]
      },
      {
        id: 'email-6',
        inboxId: 'inbox-2',
        threadId: 'thread-2',
        subject: 'Re: Quarterly Report Review',
        snippet: 'I\'ve reviewed section 3 and found a few discrepancies in the...',
        body: '<p>Alex,</p><p>I\'ve reviewed section 3 and found a few discrepancies in the financial projections. The growth estimates seem a bit optimistic compared to market trends.</p><p>Also, the charts on page 15 need updating with the latest data.</p><p>Best regards,<br>Finance Team</p>',
        from: { email: 'finance@company.com', name: 'Finance Team' },
        to: [
          { email: 'manager@company.com', name: 'Alex Manager' },
          { email: 'john.doe@company.com', name: 'John Doe' }
        ],
        cc: [],
        bcc: [],
        date: new Date('2025-05-17T16:05:00Z'),
        isRead: false,
        hasAttachments: false,
        labels: ['work'],
        attachments: []
      }
    ],
    labels: ['work', 'important'],
    isStarred: false
  },
  {
    id: 'thread-3',
    inboxId: 'inbox-1',
    subject: 'Dinner reservation confirmed',
    snippet: 'Your reservation for 4 people at La Trattoria on May 20...',
    lastMessageDate: new Date('2025-05-17T10:23:00Z'),
    participants: [
      { email: 'reservations@latrattoria.com', name: 'La Trattoria Reservations' },
      { email: 'john.doe@gmail.com', name: 'John Doe' }
    ],
    messageCount: 1,
    unreadCount: 1,
    messages: [
      {
        id: 'email-7',
        inboxId: 'inbox-1',
        threadId: 'thread-3',
        subject: 'Dinner reservation confirmed',
        snippet: 'Your reservation for 4 people at La Trattoria on May 20...',
        body: '<p>Dear John,</p><p>Your reservation for 4 people at La Trattoria on May 20, 2025 at 7:30 PM has been confirmed.</p><p>We look forward to serving you!</p><p>Best regards,<br>La Trattoria Team</p>',
        from: { email: 'reservations@latrattoria.com', name: 'La Trattoria Reservations' },
        to: [{ email: 'john.doe@gmail.com', name: 'John Doe' }],
        cc: [],
        bcc: [],
        date: new Date('2025-05-17T10:23:00Z'),
        isRead: false,
        hasAttachments: false,
        labels: ['personal'],
        attachments: []
      }
    ],
    labels: ['personal'],
    isStarred: false
  }
];

// Create mock AI replies
const mockAIReplies = [
  {
    id: 'reply-1',
    emailId: 'email-2',
    threadId: 'thread-1',
    inboxId: 'inbox-1',
    content: "Hi Jane,\n\nEagle Creek sounds perfect for Saturday! 9am works well for me. I'll bring water and snacks. Should we plan to have lunch on the trail or afterwards?\n\nLooking forward to it,\nJohn",
    generatedAt: new Date('2025-05-17T10:30:00Z'),
    sentAt: new Date('2025-05-17T10:35:00Z'),
    status: 'sent',
    model: 'gpt-4',
    prompt: 'Reply to this email about hiking plans',
    editedVersion: null,
    editedAt: null
  },
  {
    id: 'reply-2',
    emailId: 'email-5',
    threadId: 'thread-2',
    inboxId: 'inbox-2',
    content: "Hello Alex,\n\nI've reviewed the quarterly report and have the following feedback:\n\nSection 3: The market analysis looks solid, but I suggest we add more context around the competitive landscape.\n\nSection 5: The financial projections align with our targets, though we might want to include a more conservative scenario as well.\n\nI'll discuss these points in our meeting tomorrow.\n\nBest regards,\nJohn",
    generatedAt: new Date('2025-05-17T15:20:00Z'),
    sentAt: null,
    status: 'draft',
    model: 'gpt-4',
    prompt: 'Draft a professional reply to the quarterly report review request',
    editedVersion: null,
    editedAt: null
  }
];

// Create mock reply jobs
const mockReplyJobs = [
  {
    id: 'job-1',
    emailId: 'email-4',
    threadId: 'thread-1',
    inboxId: 'inbox-1',
    createdAt: new Date('2025-05-17T18:25:00Z'),
    completedAt: null,
    status: 'processing',
    error: null,
    aiReplyId: null,
    priority: 1,
    retries: 0
  },
  {
    id: 'job-2',
    emailId: 'email-6',
    threadId: 'thread-2',
    inboxId: 'inbox-2',
    createdAt: new Date('2025-05-17T16:10:00Z'),
    completedAt: null,
    status: 'pending',
    error: null,
    aiReplyId: null,
    priority: 2,
    retries: 0
  },
  {
    id: 'job-3',
    emailId: 'email-2',
    threadId: 'thread-1',
    inboxId: 'inbox-1',
    createdAt: new Date('2025-05-17T10:20:00Z'),
    completedAt: new Date('2025-05-17T10:30:00Z'),
    status: 'completed',
    error: null,
    aiReplyId: 'reply-1',
    priority: 1,
    retries: 0
  }
];

// Create mock webhooks
const mockWebhooks = [
  {
    id: 'webhook-1',
    workspaceId: 'ws-1',
    event: 'email.received',
    url: 'https://example.com/webhook/email-received',
    secret: 'secret-key-1',
    isActive: true,
    createdAt: new Date('2025-05-01T12:00:00Z'),
    lastTriggeredAt: new Date('2025-05-17T18:22:00Z'),
    lastResponseStatus: 200
  },
  {
    id: 'webhook-2',
    workspaceId: 'ws-1',
    event: 'reply.sent',
    url: 'https://example.com/webhook/reply-sent',
    secret: 'secret-key-2',
    isActive: true,
    createdAt: new Date('2025-05-01T12:05:00Z'),
    lastTriggeredAt: new Date('2025-05-17T10:35:00Z'),
    lastResponseStatus: 200
  }
];

// Export all mock data
module.exports = {
  mockWorkspaces,
  mockInboxes,
  mockEmailThreads,
  mockAIReplies,
  mockReplyJobs,
  mockWebhooks,
  generateId
};
