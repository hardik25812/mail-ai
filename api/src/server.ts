// Load environment variables at the very top
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Get the absolute path to the .env file
const envPath = path.resolve(process.cwd(), '.env');

// Log if the .env file exists
console.log('.env file exists:', fs.existsSync(envPath) ? 'YES' : 'NO');
console.log('.env file path:', envPath);

// Configure dotenv with the absolute path
dotenv.config({ path: envPath });

// Add debug logging to verify .env is being loaded
console.log('BISON_API_KEY from env:', process.env.BISON_API_KEY ? 'DEFINED (hidden for security)' : 'UNDEFINED');
console.log('PORT from env:', process.env.PORT || '(not defined)');

// Other imports
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import inboxRoutes from './routes/inboxes';
import workspaceRoutes from './routes/workspaces';
import analyticsRoutes from './routes/analytics';
import campaignsRoutes from './routes/campaigns';
import emailAccountsRoutes from './routes/email-accounts';

// Check for required environment variables
if (!process.env.BISON_API_KEY) {
  console.error('WARNING: BISON_API_KEY is not defined in environment variables');
  console.error('Make sure the .env file exists in the api directory and contains BISON_API_KEY');
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Configure CORS for Next.js frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:53883',
    'http://127.0.0.1:54070',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Routes
app.use('/api/inboxes', inboxRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/email-accounts', emailAccountsRoutes);

// Root API endpoint for basic information
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'Email Bison API',
    version: '1.0.0',
    endpoints: [
      '/api/inboxes',
      '/api/workspaces',
      '/api/analytics',
      '/api/campaigns',
      '/api/email-accounts'
    ],
    status: 'running',
    documentation: 'Access specific endpoints for Email Bison data',
    reference: 'https://sender.recruitron.io/api/reference'
  });
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

export default app;
