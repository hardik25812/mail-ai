import express from 'express';
import type { Request, Response } from 'express';
import bisonApiClient from '../services/bison-api-client';

const router = express.Router();

/**
 * @route GET /api/analytics/email-volume
 * @desc Get email volume statistics from Email Bison API
 * @access Private
 */
router.get('/email-volume', async (req: Request, res: Response) => {
  try {
    const { workspace_id, interval = 'week' } = req.query;
    
    // Validate inputs
    if (!workspace_id) {
      return res.status(400).json({
        success: false,
        message: 'Workspace ID is required'
      });
    }
    
    console.log(`Fetching email volume for workspace ${workspace_id} with interval ${interval}`);
    
    // In a real implementation, we would fetch this from Email Bison API
    // For now, return mock data that matches the expected structure
    const mockData = {
      total: 120,
      received: 85,
      sent: 35,
      auto_replied: 15,
      growth_percentage: 12
    };
    
    return res.status(200).json(mockData);
  } catch (error: any) {
    console.error('Error fetching email volume:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch email volume',
      error: error.message
    });
  }
});

/**
 * @route GET /api/analytics/email-types
 * @desc Get email type distribution from Email Bison API
 * @access Private
 */
router.get('/email-types', async (req: Request, res: Response) => {
  try {
    const { workspace_id } = req.query;
    
    // Validate inputs
    if (!workspace_id) {
      return res.status(400).json({
        success: false,
        message: 'Workspace ID is required'
      });
    }
    
    // Mock data
    const mockData = [
      { name: 'Support', value: 45 },
      { name: 'Sales', value: 30 },
      { name: 'Inquiry', value: 15 },
      { name: 'Other', value: 10 }
    ];
    
    return res.status(200).json(mockData);
  } catch (error: any) {
    console.error('Error fetching email types:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch email types',
      error: error.message
    });
  }
});

/**
 * @route GET /api/analytics/response-time
 * @desc Get response time metrics from Email Bison API
 * @access Private
 */
router.get('/response-time', async (req: Request, res: Response) => {
  try {
    const { workspace_id } = req.query;
    
    // Validate inputs
    if (!workspace_id) {
      return res.status(400).json({
        success: false,
        message: 'Workspace ID is required'
      });
    }
    
    // Mock data
    const mockData = {
      average_minutes: 25,
      improvement_percentage: 15
    };
    
    return res.status(200).json(mockData);
  } catch (error: any) {
    console.error('Error fetching response time:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch response time',
      error: error.message
    });
  }
});

/**
 * @route POST /api/analytics/import-from-email-bison
 * @desc Import analytics data from Email Bison API
 * @access Private
 */
router.post('/import-from-email-bison', async (req: Request, res: Response) => {
  try {
    const { workspace_id } = req.body;
    
    console.log('Importing analytics data from Email Bison', workspace_id ? `for workspace ${workspace_id}` : '');
    
    // In a real implementation, we would call the Email Bison API to fetch analytics data
    // For now, we'll return mock data
    
    const mockData = {
      emailStats: {
        total: 120,
        received: 85,
        sent: 35,
        auto_replied: 15,
        growth_percentage: 12
      },
      responseTimeStats: {
        average_minutes: 25,
        improvement_percentage: 15
      },
      meetingStats: {
        booked: 12,
        completed: 9,
        cancelled: 3,
        growth_percentage: 8
      }
    };
    
    return res.status(200).json({
      success: true,
      message: 'Analytics data imported successfully',
      data: mockData
    });
  } catch (error: any) {
    console.error('Error importing analytics from Email Bison:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to import analytics data from Email Bison',
      error: error.message
    });
  }
});

export default router;
