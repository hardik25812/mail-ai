/**
 * Routes for AI-generated replies
 */
const express = require('express');
const router = express.Router();
const { 
  mockAIReplies, 
  mockEmailThreads, 
  mockReplyJobs,
  generateId 
} = require('../data/mock-data');

// GET /api/ai-replies
// Get all AI replies with filtering options
router.get('/', (req, res) => {
  const { emailId, threadId, inboxId, status } = req.query;
  
  let filteredReplies = [...mockAIReplies];
  
  // Apply filters
  if (emailId) {
    filteredReplies = filteredReplies.filter(reply => reply.emailId === emailId);
  }
  
  if (threadId) {
    filteredReplies = filteredReplies.filter(reply => reply.threadId === threadId);
  }
  
  if (inboxId) {
    filteredReplies = filteredReplies.filter(reply => reply.inboxId === inboxId);
  }
  
  if (status) {
    filteredReplies = filteredReplies.filter(reply => reply.status === status);
  }
  
  // Sort by generation date (newest first)
  filteredReplies.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
  
  res.status(200).json({
    data: filteredReplies,
    status: 200
  });
});

// GET /api/ai-replies/:replyId
// Get a specific AI reply by ID
router.get('/:replyId', (req, res) => {
  const { replyId } = req.params;
  
  const reply = mockAIReplies.find(reply => reply.id === replyId);
  
  if (!reply) {
    return res.status(404).json({
      error: {
        message: `AI reply with ID ${replyId} not found`,
        status: 404
      }
    });
  }
  
  res.status(200).json({
    data: reply,
    status: 200
  });
});

// POST /api/ai-replies
// Generate a new AI reply (mock implementation)
router.post('/', (req, res) => {
  const { 
    emailId, 
    threadId, 
    inboxId, 
    prompt, 
    model = 'gpt-4' 
  } = req.body;
  
  if (!emailId || !threadId || !inboxId) {
    return res.status(400).json({
      error: {
        message: 'Missing required fields: emailId, threadId, inboxId',
        status: 400
      }
    });
  }
  
  // Find the email to reply to
  let email = null;
  let thread = null;
  
  thread = mockEmailThreads.find(t => t.id === threadId);
  if (thread) {
    email = thread.messages.find(msg => msg.id === emailId);
  }
  
  if (!email || !thread) {
    return res.status(404).json({
      error: {
        message: `Email with ID ${emailId} not found`,
        status: 404
      }
    });
  }
  
  // Create a new job (simulating async processing)
  const newJob = {
    id: `job-${generateId()}`,
    emailId,
    threadId,
    inboxId,
    createdAt: new Date(),
    completedAt: null,
    status: 'pending',
    error: null,
    aiReplyId: null,
    priority: 1,
    retries: 0
  };
  
  mockReplyJobs.push(newJob);
  
  // For mock purposes, we'll "instantly" create a reply
  // In a real implementation, this would be handled by a separate worker
  setTimeout(() => {
    // Update job to processing
    newJob.status = 'processing';
    
    // Simulate AI generation delay (3 seconds)
    setTimeout(() => {
      // Create a mock AI-generated reply
      const newReply = {
        id: `reply-${generateId()}`,
        emailId,
        threadId,
        inboxId,
        // Generate a tailored mock response
        content: generateMockReply(email),
        generatedAt: new Date(),
        sentAt: null,
        status: 'draft', // Start as draft
        model,
        prompt: prompt || 'Draft a concise and professional response',
        editedVersion: null,
        editedAt: null
      };
      
      mockAIReplies.push(newReply);
      
      // Update job to completed
      newJob.status = 'completed';
      newJob.completedAt = new Date();
      newJob.aiReplyId = newReply.id;
    }, 3000);
  }, 500);
  
  // Return the job immediately
  res.status(202).json({
    data: newJob,
    status: 202,
    message: 'AI reply generation started'
  });
});

// PUT /api/ai-replies/:replyId
// Update an AI reply (e.g., edit content or send)
router.put('/:replyId', (req, res) => {
  const { replyId } = req.params;
  const updates = req.body;
  
  const reply = mockAIReplies.find(reply => reply.id === replyId);
  
  if (!reply) {
    return res.status(404).json({
      error: {
        message: `AI reply with ID ${replyId} not found`,
        status: 404
      }
    });
  }
  
  // Handle special case: marking as sent
  if (updates.status === 'sent' && reply.status !== 'sent') {
    reply.sentAt = new Date();
    
    // For mock purposes, we can add a simulated "sent" email to the thread
    const thread = mockEmailThreads.find(t => t.id === reply.threadId);
    if (thread) {
      // Find the email we're replying to
      const originalEmail = thread.messages.find(msg => msg.id === reply.emailId);
      
      if (originalEmail) {
        // Create a sent email from this reply
        const sentEmail = {
          id: `email-${generateId()}`,
          inboxId: reply.inboxId,
          threadId: reply.threadId,
          subject: `Re: ${thread.subject}`,
          snippet: reply.content.substring(0, 100).replace(/\\n/g, ' '),
          body: `<p>${reply.content.replace(/\\n\\n/g, '</p><p>').replace(/\\n/g, '<br>')}</p>`,
          from: { 
            // Use the inbox's email as the sender
            email: thread.messages[0].to[0].email, 
            name: thread.messages[0].to[0].name 
          },
          to: [originalEmail.from],
          cc: [],
          bcc: [],
          date: new Date(),
          isRead: true,
          hasAttachments: false,
          labels: ['sent'],
          attachments: []
        };
        
        // Add to thread
        thread.messages.push(sentEmail);
        thread.lastMessageDate = sentEmail.date;
        thread.messageCount += 1;
        thread.snippet = sentEmail.snippet;
      }
    }
  }
  
  // If editing the content
  if (updates.content && updates.content !== reply.content) {
    reply.editedVersion = updates.content;
    reply.editedAt = new Date();
  }
  
  // Apply all updates
  Object.assign(reply, updates);
  
  res.status(200).json({
    data: reply,
    status: 200,
    message: 'AI reply updated successfully'
  });
});

// DELETE /api/ai-replies/:replyId
// Delete an AI reply
router.delete('/:replyId', (req, res) => {
  const { replyId } = req.params;
  
  const replyIndex = mockAIReplies.findIndex(reply => reply.id === replyId);
  
  if (replyIndex === -1) {
    return res.status(404).json({
      error: {
        message: `AI reply with ID ${replyId} not found`,
        status: 404
      }
    });
  }
  
  // Remove from collection
  mockAIReplies.splice(replyIndex, 1);
  
  res.status(200).json({
    status: 200,
    message: 'AI reply deleted successfully'
  });
});

// Helper function to generate a mock reply based on the original email
function generateMockReply(email) {
  const sender = email.from.name.split(' ')[0]; // Get first name
  const isWorkEmail = email.labels.includes('work');
  
  if (isWorkEmail) {
    return `Hello ${sender},\n\nThank you for your email. I've reviewed the information you've provided and will take care of this as soon as possible.\n\nI'll get back to you with updates by the end of the day.\n\nBest regards,\nJohn`;
  } else {
    return `Hi ${sender},\n\nThanks for reaching out! I appreciate your message and will respond more thoroughly when I have a bit more time later today.\n\nTalk soon,\nJohn`;
  }
}

module.exports = router;
