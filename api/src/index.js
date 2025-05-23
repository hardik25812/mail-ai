const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Import route handlers
const emailRoutes = require('./routes/emails');
const aiReplyRoutes = require('./routes/ai-replies');
const replyJobsRoutes = require('./routes/reply-jobs');
const webhooksRoutes = require('./routes/webhooks');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend (critical for local development)
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies

// API Routes
app.use('/api/emails', emailRoutes);
app.use('/api/ai-replies', aiReplyRoutes);
app.use('/api/reply-jobs', replyJobsRoutes);
app.use('/api/webhooks', webhooksRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Something went wrong!',
      status: err.status || 500
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

module.exports = app;
