import { prisma } from '../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API handler for sender profile operations
 * GET /api/senders - List sender profiles
 * POST /api/senders - Create a new sender profile
 * GET /api/senders/:id - Get a single sender profile
 * PUT /api/senders/:id - Update a sender profile
 * PUT /api/senders/bulk-signature - Update signatures for multiple senders
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    const { id } = req.query;
    
    // For this example, we'll use query parameters for user_id and workspace_id
    // In a real app, these would come from authentication
    const userId = req.query.user_id as string;
    const workspaceId = req.query.workspace_id as string;
    
    if (!userId || !workspaceId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Workspace ID are required'
      });
    }

    // Bulk signature update
    if (method === 'PUT' && req.query.action === 'bulk-signature') {
      const { sender_ids, email_signature } = req.body;
      
      // Validate required fields
      if (!sender_ids || !Array.isArray(sender_ids) || sender_ids.length === 0 || !email_signature) {
        return res.status(400).json({
          success: false,
          error: 'sender_ids array and email_signature are required'
        });
      }
      
      // Get the sender profiles to check access
      const senders = await prisma.senderProfile.findMany({
        where: {
          id: { in: sender_ids }
        },
        select: {
          id: true,
          workspace_id: true
        }
      });
      
      if (senders.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No sender profiles found with the provided IDs'
        });
      }
      
      // Check if user has access to all sender workspaces
      const inaccessibleSenders = senders.filter(s => s.workspace_id !== workspaceId);
      
      if (inaccessibleSenders.length > 0) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to some of the sender profiles',
          inaccessible_sender_ids: inaccessibleSenders.map(s => s.id)
        });
      }
      
      // Update all sender profiles
      const updatedSenders = await prisma.$transaction(
        sender_ids.map(id => 
          prisma.senderProfile.update({
            where: { id },
            data: { email_signature }
          })
        )
      );
      
      return res.status(200).json({
        success: true,
        data: {
          updated_count: updatedSenders.length,
          updated_sender_ids: updatedSenders.map(s => s.id)
        }
      });
    }

    // GET /senders - List sender profiles
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
      const [senders, total] = await Promise.all([
        prisma.senderProfile.findMany({
          where: { workspace_id: workspaceId },
          skip,
          take: perPageNum,
          orderBy: { created_at: 'desc' }
        }),
        prisma.senderProfile.count({ where: { workspace_id: workspaceId } })
      ]);

      return res.status(200).json({
        success: true,
        data: senders,
        pagination: {
          total,
          page: pageNum,
          per_page: perPageNum,
          total_pages: Math.ceil(total / perPageNum)
        }
      });
    }

    // POST /senders - Create a new sender profile
    if (method === 'POST' && !id) {
      const { name, email, email_signature, timezone } = req.body;
      
      // Validate required fields
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: 'Name and email are required'
        });
      }
      
      // Check if email already exists in this workspace
      const existingSender = await prisma.senderProfile.findFirst({
        where: {
          workspace_id: workspaceId,
          email
        }
      });
      
      if (existingSender) {
        return res.status(400).json({
          success: false,
          error: 'A sender with this email already exists in this workspace'
        });
      }
      
      // Create the sender profile
      const sender = await prisma.senderProfile.create({
        data: {
          user_id: userId,
          workspace_id: workspaceId,
          name,
          email,
          email_signature,
          timezone: timezone || 'UTC'
        }
      });
      
      return res.status(201).json({
        success: true,
        data: sender
      });
    }

    // GET /senders/:id - Get a single sender profile
    if (method === 'GET' && id) {
      const senderId = id as string;
      
      // Get the sender profile
      const sender = await prisma.senderProfile.findUnique({
        where: { id: senderId }
      });
      
      if (!sender) {
        return res.status(404).json({
          success: false,
          error: 'Sender profile not found'
        });
      }
      
      // Verify workspace access
      if (sender.workspace_id !== workspaceId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this sender profile'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: sender
      });
    }

    // PUT /senders/:id - Update a sender profile
    if (method === 'PUT' && id) {
      const senderId = id as string;
      const { name, email, email_signature, timezone } = req.body;
      
      // Get the sender profile to check access
      const existingSender = await prisma.senderProfile.findUnique({
        where: { id: senderId }
      });
      
      if (!existingSender) {
        return res.status(404).json({
          success: false,
          error: 'Sender profile not found'
        });
      }
      
      // Verify workspace access
      if (existingSender.workspace_id !== workspaceId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this sender profile'
        });
      }
      
      // If email is changing, check if the new email already exists
      if (email && email !== existingSender.email) {
        const duplicateEmail = await prisma.senderProfile.findFirst({
          where: {
            workspace_id: workspaceId,
            email,
            id: { not: senderId }
          }
        });
        
        if (duplicateEmail) {
          return res.status(400).json({
            success: false,
            error: 'A sender with this email already exists in this workspace'
          });
        }
      }
      
      // Validate updates
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email;
      if (email_signature !== undefined) updates.email_signature = email_signature;
      if (timezone !== undefined) updates.timezone = timezone;
      
      // Update the sender profile
      const sender = await prisma.senderProfile.update({
        where: { id: senderId },
        data: updates
      });
      
      return res.status(200).json({
        success: true,
        data: sender
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
