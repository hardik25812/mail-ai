import { prisma } from '../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API handler for campaign operations
 * GET /api/campaigns - List campaigns
 * POST /api/campaigns - Create a new campaign
 * GET /api/campaigns/:id - Get a single campaign with its steps
 * PUT /api/campaigns/:id - Update a campaign
 * GET /api/campaigns/:id/stats - Get campaign statistics
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    const { id } = req.query;
    
    // For this example, we'll use a query parameter for workspace_id
    // In a real app, this would come from authentication
    const workspaceId = req.query.workspace_id as string;
    
    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        error: 'Workspace ID is required'
      });
    }

    // GET /campaigns - List campaigns
    if (method === 'GET' && !id) {
      const { 
        page = '1', 
        per_page = '20'
      } = req.query;

      // Convert page and per_page to numbers
      const pageNum = parseInt(page as string);
      const perPageNum = parseInt(per_page as string);
      const skip = (pageNum - 1) * perPageNum;

      // Execute query with pagination
      const [campaigns, total] = await Promise.all([
        prisma.campaign.findMany({
          where: { workspace_id: workspaceId },
          skip,
          take: perPageNum,
          orderBy: { created_at: 'desc' }
        }),
        prisma.campaign.count({ where: { workspace_id: workspaceId } })
      ]);

      return res.status(200).json({
        success: true,
        data: campaigns,
        pagination: {
          total,
          page: pageNum,
          per_page: perPageNum,
          total_pages: Math.ceil(total / perPageNum)
        }
      });
    }

    // POST /campaigns - Create a new campaign
    if (method === 'POST' && !id) {
      const { name, description, timezone } = req.body;
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Name is required'
        });
      }
      
      // Create the campaign
      const campaign = await prisma.campaign.create({
        data: {
          workspace_id: workspaceId,
          name,
          description,
          timezone: timezone || 'UTC',
          status: 'draft'
        }
      });
      
      return res.status(201).json({
        success: true,
        data: campaign
      });
    }

    // GET /campaigns/:id - Get a single campaign with its steps
    if (method === 'GET' && id && !req.query.stats) {
      const campaignId = id as string;
      
      // Get the campaign with its steps
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          campaign_steps: {
            orderBy: { step_number: 'asc' }
          }
        }
      });
      
      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found'
        });
      }
      
      // Verify workspace access
      if (campaign.workspace_id !== workspaceId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this campaign'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: campaign
      });
    }

    // PUT /campaigns/:id - Update a campaign
    if (method === 'PUT' && id && !req.query.stats) {
      const campaignId = id as string;
      const { name, description, status, timezone } = req.body;
      
      // Get the campaign to check access
      const existingCampaign = await prisma.campaign.findUnique({
        where: { id: campaignId }
      });
      
      if (!existingCampaign) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found'
        });
      }
      
      // Verify workspace access
      if (existingCampaign.workspace_id !== workspaceId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this campaign'
        });
      }
      
      // Validate updates
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (status !== undefined) updates.status = status;
      if (timezone !== undefined) updates.timezone = timezone;
      
      // Update the campaign
      const campaign = await prisma.campaign.update({
        where: { id: campaignId },
        data: updates
      });
      
      return res.status(200).json({
        success: true,
        data: campaign
      });
    }

    // GET /campaigns/:id/stats - Get campaign statistics
    if (method === 'GET' && id && req.query.stats) {
      const campaignId = id as string;
      
      // Get the campaign to check access
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId }
      });
      
      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found'
        });
      }
      
      // Verify workspace access
      if (campaign.workspace_id !== workspaceId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this campaign'
        });
      }
      
      // Get campaign steps
      const steps = await prisma.campaignStep.findMany({
        where: { campaign_id: campaignId },
        orderBy: { step_number: 'asc' }
      });
      
      // Get campaign stats
      const stats = await prisma.campaignStat.findMany({
        where: { campaign_id: campaignId }
      });
      
      // Get recipient stats
      const recipients = await prisma.$queryRaw`
        SELECT status, COUNT(*) as count
        FROM campaign_recipients
        WHERE campaign_id = ${campaignId}
        GROUP BY status
      `;
      
      // Calculate overall stats
      const overallStats = {
        total_recipients: 0,
        active: 0,
        completed: 0,
        unsubscribed: 0,
        pending: 0
      };
      
      // @ts-ignore - recipients is an array of objects with status and count
      recipients.forEach((r: any) => {
        overallStats.total_recipients += Number(r.count);
        overallStats[r.status.toLowerCase()] = Number(r.count);
      });
      
      // Map stats to steps
      const stepStats = steps.map(step => {
        const stepStat = stats.find(s => s.step_number === step.step_number) || {
          emails_sent: 0,
          emails_delivered: 0,
          emails_opened: 0,
          emails_clicked: 0,
          emails_replied: 0,
          emails_bounced: 0
        };
        
        const deliveredCount = stepStat.emails_delivered || 0;
        const openedCount = stepStat.emails_opened || 0;
        
        return {
          step_number: step.step_number,
          subject: step.subject,
          delay_hours: step.delay_hours,
          stats: {
            sent: stepStat.emails_sent || 0,
            delivered: deliveredCount,
            opened: openedCount,
            clicked: stepStat.emails_clicked || 0,
            replied: stepStat.emails_replied || 0,
            bounced: stepStat.emails_bounced || 0,
            open_rate: deliveredCount > 0 ? (openedCount / deliveredCount) * 100 : 0,
            click_rate: openedCount > 0 ? ((stepStat.emails_clicked || 0) / openedCount) * 100 : 0,
            reply_rate: deliveredCount > 0 ? ((stepStat.emails_replied || 0) / deliveredCount) * 100 : 0
          }
        };
      });
      
      return res.status(200).json({
        success: true,
        data: {
          campaign_id: campaignId,
          name: campaign.name,
          status: campaign.status,
          overall: overallStats,
          steps: stepStats
        }
      });
    }
    
    // If no route matches
    return res.status(404).json({
      success: false,
      error: 'Not found'
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
