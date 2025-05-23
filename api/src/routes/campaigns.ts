import express from 'express';
import type { Request, Response } from 'express';
import bisonApiClient from '../services/bison-api-client';

const router = express.Router();

/**
 * @route GET /api/campaigns
 * @desc Get all campaigns from Email Bison API
 * @access Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    
    console.log('Fetching campaigns from Email Bison API');
    
    // Call Email Bison API using the reference documentation
    // https://sender.recruitron.io/api/reference#tag/campaigns
    const response = await bisonApiClient.get('/api/campaigns', {
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
    console.error('Error fetching campaigns:', error);
    
    // Enhanced error response
    const statusCode = error.status || error.response?.status || 500;
    const errorMessage = error.message || 'Failed to fetch campaigns';
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.details || error.response?.data || error.message
    });
  }
});

/**
 * @route GET /api/campaigns/:id
 * @desc Get a specific campaign by ID
 * @access Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`Fetching campaign ${id} from Email Bison API`);
    
    const response = await bisonApiClient.get(`/api/campaigns/${id}`);
    
    return res.status(200).json({
      success: true,
      data: response.data.data
    });
  } catch (error: any) {
    console.error(`Error fetching campaign ${req.params.id}:`, error);
    
    const statusCode = error.status || error.response?.status || 500;
    const errorMessage = error.message || 'Failed to fetch campaign';
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.details || error.response?.data || error.message
    });
  }
});

/**
 * @route POST /api/campaigns
 * @desc Create a new campaign
 * @access Private
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const campaignData = req.body;
    
    console.log('Creating new campaign in Email Bison API');
    
    const response = await bisonApiClient.post('/api/campaigns', campaignData);
    
    return res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: response.data.data
    });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    
    const statusCode = error.status || error.response?.status || 500;
    const errorMessage = error.message || 'Failed to create campaign';
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.details || error.response?.data || error.message
    });
  }
});

/**
 * @route PUT /api/campaigns/:id
 * @desc Update an existing campaign
 * @access Private
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaignData = req.body;
    
    console.log(`Updating campaign ${id} in Email Bison API`);
    
    const response = await bisonApiClient.put(`/api/campaigns/${id}`, campaignData);
    
    return res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: response.data.data
    });
  } catch (error: any) {
    console.error(`Error updating campaign ${req.params.id}:`, error);
    
    const statusCode = error.status || error.response?.status || 500;
    const errorMessage = error.message || 'Failed to update campaign';
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.details || error.response?.data || error.message
    });
  }
});

/**
 * @route DELETE /api/campaigns/:id
 * @desc Delete a campaign
 * @access Private
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`Deleting campaign ${id} from Email Bison API`);
    
    await bisonApiClient.delete(`/api/campaigns/${id}`);
    
    return res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error: any) {
    console.error(`Error deleting campaign ${req.params.id}:`, error);
    
    const statusCode = error.status || error.response?.status || 500;
    const errorMessage = error.message || 'Failed to delete campaign';
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.details || error.response?.data || error.message
    });
  }
});

export default router;
