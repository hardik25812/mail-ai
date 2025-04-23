/**
 * Slack webhook integration for notifications
 * Sends notifications about AI-generated email replies to Slack
 */

import axios from 'axios';
import { createLogger } from './logger';

const logger = createLogger('slack');

export interface SlackConfig {
  fallbackWebhookUrl?: string;
}

export interface SlackNotificationOptions {
  webhookUrl: string;
  message: string;
  username?: string;
  iconEmoji?: string;
  channel?: string;
}

export class SlackClient {
  private fallbackWebhookUrl: string | undefined;
  
  constructor(config: SlackConfig = {}) {
    this.fallbackWebhookUrl = config.fallbackWebhookUrl || process.env.SLACK_FALLBACK_URL;
  }
  
  /**
   * Send a notification to Slack
   */
  async sendNotification(options: SlackNotificationOptions): Promise<void> {
    const { webhookUrl, message, username, iconEmoji, channel } = options;
    
    try {
      logger.info('Sending Slack notification');
      
      const url = webhookUrl || this.fallbackWebhookUrl;
      
      if (!url) {
        logger.warn('No Slack webhook URL provided, skipping notification');
        return;
      }
      
      await axios.post(url, {
        text: message,
        username: username || 'Mail AI Bot',
        icon_emoji: iconEmoji || ':robot_face:',
        channel,
      });
      
      logger.info('Slack notification sent successfully');
    } catch (error) {
      logger.error('Error sending Slack notification', { error });
      
      // Don't throw - Slack notifications are non-critical
      logger.warn('Continuing despite Slack notification failure');
    }
  }
  
  /**
   * Send an AI reply notification to Slack
   */
  async sendAIReplyNotification(options: {
    webhookUrl: string;
    emailSubject: string;
    emailSender: string;
    replyPreview: string;
    emailId: string;
    dashboardUrl?: string;
  }): Promise<void> {
    const { webhookUrl, emailSubject, emailSender, replyPreview, emailId, dashboardUrl } = options;
    
    // Create a rich Slack message with formatted text
    // Use type assertion to avoid TypeScript errors with the Slack block structure
    const message: any = {
      text: `New AI reply generated :robot_face:`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'New AI Reply Generated :robot_face:',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*From:*\n${emailSender}`,
            },
            {
              type: 'mrkdwn',
              text: `*Subject:*\n${emailSubject}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*AI Reply:*\n${replyPreview.substring(0, 280)}${replyPreview.length > 280 ? '...' : ''}`,
          },
        },
      ],
    };
    
    // Add a dashboard link if provided
    if (dashboardUrl) {
      message.blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View in Dashboard',
              emoji: true,
            },
            url: `${dashboardUrl}/emails/${emailId}`,
          },
        ],
      });
    }
    
    try {
      logger.info(`Sending AI reply notification for email ${emailId}`);
      
      const url = webhookUrl || this.fallbackWebhookUrl;
      
      if (!url) {
        logger.warn('No Slack webhook URL provided, skipping notification');
        return;
      }
      
      await axios.post(url, message);
      
      logger.info('AI reply notification sent to Slack');
    } catch (error) {
      logger.error(`Error sending AI reply notification for email ${emailId}`, { error });
      
      // Fallback to simple text message if rich format fails
      try {
        await this.sendNotification({
          webhookUrl,
          message: `New AI reply to "${emailSubject}" from ${emailSender}. Preview: ${replyPreview.substring(0, 100)}...`,
        });
      } catch {
        logger.error('Fallback notification also failed');
      }
    }
  }
}
