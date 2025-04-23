import { prisma } from '../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API handler for email-related operations
 * GET /api/emails - List emails with filters
 * GET /api/emails/:id - Get a single email with its thread
 * POST /api/emails/:id/reply - Send or save a reply
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    const { id } = req.query;

    // List emails with filters
    if (method === 'GET' && !id) {
      const { 
        inbox_id, 
        intent, 
        status, 
        page = '1', 
        per_page = '20',
        sort_by = 'created_at',
        sort_direction = 'desc'
      } = req.query;

      // Convert page and per_page to numbers
      const pageNum = parseInt(page as string);
      const perPageNum = parseInt(per_page as string);
      const skip = (pageNum - 1) * perPageNum;

      // Build filter conditions
      const where: any = {};
      if (inbox_id) where.inbox_id = inbox_id as string;
      if (intent) where.intent = intent as string;
      if (status) where.status = status as string;

      // Execute query with pagination
      const [emails, total] = await Promise.all([
        prisma.email.findMany({
          where,
          skip,
          take: perPageNum,
          orderBy: {
            [sort_by as string]: sort_direction === 'asc' ? 'asc' : 'desc'
          },
          include: {
            inbox: {
              select: {
                id: true,
                email_address: true,
                name: true
              }
            },
            ai_responses: {
              select: {
                id: true,
                content: true,
                approved_by_user: true,
                sent_at: true
              }
            }
          }
        }),
        prisma.email.count({ where })
      ]);

      return res.status(200).json({
        success: true,
        data: emails,
        pagination: {
          total,
          page: pageNum,
          per_page: perPageNum,
          total_pages: Math.ceil(total / perPageNum)
        }
      });
    }

    // Get a single email with its thread
    if (method === 'GET' && id) {
      const emailId = id as string;

      // Get the email
      const email = await prisma.email.findUnique({
        where: { id: emailId },
        include: {
          inbox: {
            select: {
              id: true,
              email_address: true,
              name: true
            }
          },
          ai_responses: {
            select: {
              id: true,
              content: true,
              approved_by_user: true,
              sent_at: true
            }
          }
        }
      });

      if (!email) {
        return res.status(404).json({
          success: false,
          error: 'Email not found'
        });
      }

      // Get the thread
      const thread = await prisma.email.findMany({
        where: { thread_id: email.thread_id },
        orderBy: { received_at: 'desc' },
        include: {
          ai_responses: {
            select: {
              id: true,
              content: true,
              approved_by_user: true,
              sent_at: true
            }
          }
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          email,
          thread
        }
      });
    }

    // Send or save a reply
    if (method === 'POST' && id && req.query.action === 'reply') {
      const emailId = id as string;
      const { content, approve, send } = req.body;

      // Get the email to reply to
      const email = await prisma.email.findUnique({
        where: { id: emailId },
        include: {
          inbox: true
        }
      });

      if (!email) {
        return res.status(404).json({
          success: false,
          error: 'Email not found'
        });
      }

      // Check if there's an existing AI response
      const existingResponse = await prisma.aIResponse.findFirst({
        where: { email_id: emailId }
      });

      // Save or update the AI response
      let aiResponse;
      if (existingResponse) {
        aiResponse = await prisma.aIResponse.update({
          where: { id: existingResponse.id },
          data: {
            content: content,
            approved_by_user: approve,
            sent_at: send ? new Date() : null
          }
        });
      } else {
        aiResponse = await prisma.aIResponse.create({
          data: {
            email_id: emailId,
            content: content,
            approved_by_user: approve,
            sent_at: send ? new Date() : null
          }
        });
      }

      // If send is true, create a record of the sent email
      let sentEmail;
      if (send) {
        // Update the original email status
        await prisma.email.update({
          where: { id: emailId },
          data: { status: 'replied' }
        });

        // Create a record of the sent email
        sentEmail = await prisma.email.create({
          data: {
            inbox_id: email.inbox_id,
            message_id: `reply-${Date.now()}`,
            thread_id: email.thread_id,
            subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
            body: content,
            sender: email.inbox.email_address,
            recipient: email.sender,
            status: 'sent',
            is_draft: false,
            is_sent: true,
            is_inbound: false,
            received_at: new Date()
          }
        });

        return res.status(200).json({
          success: true,
          data: {
            ai_response: aiResponse,
            sent_email: sentEmail
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ai_response: aiResponse
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
