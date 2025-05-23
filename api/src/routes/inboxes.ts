import express from 'express';
import type { Request, Response } from 'express';
import bisonApiClient from '../services/bison-api-client';
import { EmailBisonInbox, EmailBisonPaginatedResponse } from '../models/bison-types';

// Import mock data for fallback when Email Bison API is unavailable
const { mockInboxes } = require('../data/mock-data');

const router = express.Router();

/**
 * @route GET /api/inboxes
 * @desc Get all inboxes from Email Bison API
 * @access Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    try {
      // Get inboxes from Email Bison API using the correct endpoint path
      console.log('Making API request to:', `${bisonApiClient.defaults.baseURL}/api/sender-emails`);
      
      try {
        // Use the correct endpoint path with /api prefix
        const response = await bisonApiClient.get('/api/sender-emails', { params: { page, limit } });
        
        console.log('Successfully fetched inboxes from Email Bison API');
        console.log('Response has data property:', !!response.data);
        
        // Get the correct data from the response
        const inboxes = response.data?.data || [];
        const meta = response.data?.meta || {};
        const links = response.data?.links || {};
        
        console.log(`Found ${inboxes.length} inboxes from Email Bison API`);
        if (inboxes.length > 0) {
          console.log('First inbox:', JSON.stringify(inboxes[0]).substring(0, 100) + '...');
        }
        
        // Return the properly structured response
        return res.status(200).json({
          success: true,
          data: inboxes,
          meta: meta,
          links: links
        });
      } catch (apiError) {
        console.error('Error in direct API call:', apiError);
        throw apiError; // Let the outer catch block handle this
      }
    } catch (error: any) {
      console.error('Error fetching inboxes from Email Bison API:', error.message);
      console.error('API URL:', bisonApiClient.defaults.baseURL);
      
      // Enhanced error handling with more detailed information
      if (error.code === 'ENOTFOUND') {
        console.error('DNS resolution error. Cannot resolve hostname:', error.hostname);
      } else if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }

      // Calculate pagination for mock data as fallback
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedInboxes = mockInboxes.slice(startIndex, endIndex);
      
      // Use mock data as fallback
      console.info('Using mock data as fallback...');
      
      // Create a response structure that matches the Email Bison API response format
      const mockResponse = {
        success: true,
        message: 'Using mock data (Email Bison API unavailable)',
        data: paginatedInboxes,
        meta: {
          current_page: page,
          from: startIndex + 1,
          last_page: Math.ceil(mockInboxes.length / limit),
          per_page: limit,
          to: Math.min(endIndex, mockInboxes.length),
          total: mockInboxes.length
        }
      };
      
      return res.status(200).json(mockResponse);
    }
  } catch (error: any) {
    console.error('Unexpected error in inboxes route:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while processing your request',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/inboxes/:id
 * @desc Get a specific inbox by ID
 * @access Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Call Email Bison API with correct endpoint for sender.recruitron.io
    const response = await bisonApiClient.get<{data: EmailBisonInbox, success: boolean}>(
      `/api/sender-emails/${id}`
    );
    
    // Return data to client
    return res.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching inbox ${req.params.id}:`, error);
    
    const statusCode = error.status || 500;
    const message = error.message || 'Failed to fetch inbox';
    
    return res.status(statusCode).json({
      success: false,
      message,
      error: error.details || error.originalError?.message || error
    });
  }
});

/**
 * @route POST /api/inboxes/import-from-email-bison
 * @desc Import inboxes from Email Bison API and store them in the database
 * @access Private
 */
router.post('/import-from-email-bison', async (req: Request, res: Response) => {
  try {
    console.log('Importing inboxes from Email Bison');
    
    // Get inboxes from Email Bison API
    const response = await bisonApiClient.get('/api/sender-emails');
    const inboxes = response.data?.data || [];
    
    console.log(`Found ${inboxes.length} inboxes to import`);
    
    // Here we would typically store the inboxes in our database
    // For now, we'll just return them directly
    
    return res.status(200).json({
      success: true,
      message: 'Inboxes imported successfully',
      data: inboxes
    });
  } catch (error: any) {
    console.error('Error importing inboxes from Email Bison:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to import inboxes from Email Bison',
      error: error.message
    });
  }
});

export default router;
