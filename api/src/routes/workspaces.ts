import express from 'express';
import type { Request, Response } from 'express';
import bisonApiClient from '../services/bison-api-client';
import { EmailBisonWorkspace, EmailBisonPaginatedResponse } from '../models/bison-types';

const router = express.Router();

/**
 * @route GET /api/workspaces
 * @desc Get all workspaces from Email Bison API
 * @access Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Extract query parameters for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    console.log('Making API request to:', `${bisonApiClient.defaults.baseURL}/api/workspaces`);
    
    try {
      // Use the correct endpoint path with /api prefix
      const response = await bisonApiClient.get('/api/workspaces', {
        params: { page, limit }
      });
      
      // Log success and data for diagnostics
      console.log('Successfully fetched workspaces from Email Bison API');
      console.log('Response has data property:', !!response.data);
      
      // Get the workspaces from the response
      const workspaces = response.data?.data || [];
      
      console.log(`Found ${workspaces.length} workspaces from Email Bison API`);
      if (workspaces.length > 0) {
        console.log('First workspace:', JSON.stringify(workspaces[0]).substring(0, 100) + '...');
      }
      
      // Return properly structured response
      return res.status(200).json({
        success: true,
        data: workspaces
      });
    } catch (apiError) {
      console.error('Error in direct API call:', apiError);
      throw apiError; // Let the outer catch block handle this
    }
  } catch (error: any) {
    console.error('Error fetching workspaces:', error);
    
    const statusCode = error.status || 500;
    const message = error.message || 'Failed to fetch workspaces';
    
    return res.status(statusCode).json({
      success: false,
      message,
      error: error.details || error.originalError?.message || error
    });
  }
});

/**
 * @route GET /api/workspaces/:id
 * @desc Get a specific workspace by ID
 * @access Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Call Email Bison API with correct endpoint for sender.recruitron.io
    const response = await bisonApiClient.get<{data: EmailBisonWorkspace, success: boolean}>(
      `/api/workspaces/${id}`
    );
    
    // Return data to client
    return res.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching workspace ${req.params.id}:`, error);
    
    const statusCode = error.status || 500;
    const message = error.message || 'Failed to fetch workspace';
    
    return res.status(statusCode).json({
      success: false,
      message,
      error: error.details || error.originalError?.message || error
    });
  }
});

export default router;
