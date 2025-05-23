/**
 * Routes for AI reply job management
 */
const express = require('express');
const router = express.Router();
const { mockReplyJobs, generateId } = require('../data/mock-data');

// GET /api/reply-jobs
// Get all reply jobs with filtering options
router.get('/', (req, res) => {
  const { status, inboxId, threadId, emailId } = req.query;
  
  let filteredJobs = [...mockReplyJobs];
  
  // Apply filters
  if (status) {
    filteredJobs = filteredJobs.filter(job => job.status === status);
  }
  
  if (inboxId) {
    filteredJobs = filteredJobs.filter(job => job.inboxId === inboxId);
  }
  
  if (threadId) {
    filteredJobs = filteredJobs.filter(job => job.threadId === threadId);
  }
  
  if (emailId) {
    filteredJobs = filteredJobs.filter(job => job.emailId === emailId);
  }
  
  // Sort by creation date (newest first)
  filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.status(200).json({
    data: filteredJobs,
    status: 200
  });
});

// GET /api/reply-jobs/:jobId
// Get a specific reply job by ID
router.get('/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  const job = mockReplyJobs.find(job => job.id === jobId);
  
  if (!job) {
    return res.status(404).json({
      error: {
        message: `Reply job with ID ${jobId} not found`,
        status: 404
      }
    });
  }
  
  res.status(200).json({
    data: job,
    status: 200
  });
});

// POST /api/reply-jobs
// Create a new reply job (for manual triggering)
router.post('/', (req, res) => {
  const { 
    emailId, 
    threadId, 
    inboxId, 
    priority = 1 
  } = req.body;
  
  if (!emailId || !threadId || !inboxId) {
    return res.status(400).json({
      error: {
        message: 'Missing required fields: emailId, threadId, inboxId',
        status: 400
      }
    });
  }
  
  // Check if a job for this email already exists
  const existingJob = mockReplyJobs.find(job => 
    job.emailId === emailId && 
    ['pending', 'processing'].includes(job.status)
  );
  
  if (existingJob) {
    return res.status(409).json({
      error: {
        message: `A reply job for email ${emailId} is already in progress`,
        status: 409
      }
    });
  }
  
  // Create a new job
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
    priority,
    retries: 0
  };
  
  mockReplyJobs.push(newJob);
  
  res.status(201).json({
    data: newJob,
    status: 201,
    message: 'Reply job created successfully'
  });
});

// PUT /api/reply-jobs/:jobId
// Update a reply job (e.g., retry or cancel)
router.put('/:jobId', (req, res) => {
  const { jobId } = req.params;
  const updates = req.body;
  
  const job = mockReplyJobs.find(job => job.id === jobId);
  
  if (!job) {
    return res.status(404).json({
      error: {
        message: `Reply job with ID ${jobId} not found`,
        status: 404
      }
    });
  }
  
  // Handle special case: retrying a failed job
  if (updates.action === 'retry' && job.status === 'failed') {
    job.status = 'pending';
    job.retries += 1;
    job.error = null;
  } 
  // Handle special case: cancelling a job
  else if (updates.action === 'cancel' && ['pending', 'processing'].includes(job.status)) {
    job.status = 'cancelled';
    job.completedAt = new Date();
  }
  // Apply normal updates
  else {
    // Don't allow overriding these fields directly
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.createdAt;
    delete safeUpdates.action;
    
    Object.assign(job, safeUpdates);
  }
  
  res.status(200).json({
    data: job,
    status: 200,
    message: 'Reply job updated successfully'
  });
});

// DELETE /api/reply-jobs/:jobId
// Delete a reply job
router.delete('/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  const jobIndex = mockReplyJobs.findIndex(job => job.id === jobId);
  
  if (jobIndex === -1) {
    return res.status(404).json({
      error: {
        message: `Reply job with ID ${jobId} not found`,
        status: 404
      }
    });
  }
  
  // Remove from collection
  mockReplyJobs.splice(jobIndex, 1);
  
  res.status(200).json({
    status: 200,
    message: 'Reply job deleted successfully'
  });
});

module.exports = router;
