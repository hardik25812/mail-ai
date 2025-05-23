import express from 'express';
import type { Request, Response } from 'express';
import bisonApiClient from '../services/bison-api-client';

const router = express.Router();

/**
 * @route GET /api/email-accounts
 * @desc Get all email accounts from Email Bison API
 * @access Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    
    console.log('Fetching email accounts from Email Bison API');
    
    // Call Email Bison API using the reference documentation
    // https://sender.recruitron.io/api/reference#tag/email-accounts
    const response = await bisonApiClient.get('/api/email-accounts', {
      params: {
        page,
        limit
      }
    });
    
    return res.status(200).json({
      success: true,
      data: response.data.data,
      meta: response.data.meta,
      links: response.data.links
    });
  } catch (error: any) {
    console.error('Error fetching email accounts:', error);
    
    // Enhanced error response
    const statusCode = error.status || error.response?.status || 500;
    const errorMessage = error.message || 'Failed to fetch email accounts';
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.details || error.response?.data || error.message
    });
  }
});

/**
 * @route GET /api/email-accounts/:id
 * @desc Get a specific email account by ID
 * @access Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`Fetching email account ${id} from Email Bison API`);
    
    const response = await bisonApiClient.get(`/api/email-accounts/${id}`);
    
    return res.status(200).json({
      success: true,
      data: response.data.data
    });
  } catch (error: any) {
    console.error(`Error fetching email account ${req.params.id}:`, error);
    
    const statusCode = error.status || error.response?.status || 500;
    const errorMessage = error.message || 'Failed to fetch email account';
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.details || error.response?.data || error.message
    });
  }
});

/**
 * @route POST /api/email-accounts
 * @desc Create a new email account
 * @access Private
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const accountData = req.body;
    
    console.log('Creating new email account in Email Bison API');
    
    const response = await bisonApiClient.post('/api/email-accounts', accountData);
    
    return res.status(201).json({
      success: true,
      message: 'Email account created successfully',
      data: response.data.data
    });
  } catch (error: any) {
    console.error('Error creating email account:', error);
    
    const statusCode = error.status || error.response?.status || 500;
    const errorMessage = error.message || 'Failed to create email account';
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.details || error.response?.data || error.message
    });
  }
});

/**
 * @route PUT /api/email-accounts/:id
 * @desc Update an existing email account
 * @access Private
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const accountData = req.body;
    
    console.log(`Updating email account ${id} in Email Bison API`);
    
    const response = await bisonApiClient.put(`/api/email-accounts/${id}`, accountData);
    
    return res.status(200).json({
      success: true,
      message: 'Email account updated successfully',
      data: response.data.data
    });
  } catch (error: any) {
    console.error(`Error updating email account ${req.params.id}:`, error);
    
    const statusCode = error.status || error.response?.status || 500;
    const errorMessage = error.message || 'Failed to update email account';
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.details || error.response?.data || error.message
    });
  }
});

/**
 * @route POST /api/email-accounts/:id/import
 * @desc Import emails for a specific account
 * @access Private
 */
router.post('/:id/import', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`Importing emails for account ${id} from Email Bison API`);
    
    const response = await bisonApiClient.post(`/api/email-accounts/${id}/import`);
    
    return res.status(200).json({
      success: true,
      message: 'Email import initiated successfully',
      data: response.data
    });
  } catch (error: any) {
    console.error(`Error importing emails for account ${req.params.id}:`, error);
    
    const statusCode = error.status || error.response?.status || 500;
    const errorMessage = error.message || 'Failed to import emails';
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.details || error.response?.data || error.message
    });
  }
});

/**
 * @route GET /api/email-accounts/:id/stats
 * @desc Get email statistics for a specific account
 * @access Private
 */
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`Fetching stats for email account ${id} from Email Bison API`);
    
    const response = await bisonApiClient.get(`/api/email-accounts/${id}/stats`);
    
    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    console.error(`Error fetching stats for email account ${req.params.id}:`, error);
    
    const statusCode = error.status || error.response?.status || 500;
    const errorMessage = error.message || 'Failed to fetch email account stats';
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.details || error.response?.data || error.message
    });
  }
});

export default router;
