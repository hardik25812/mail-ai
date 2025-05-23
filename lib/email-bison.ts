/**
 * Email Bison API wrapper
 * Handles sending email replies through the Email Bison API
 */

import axios from 'axios';
import { createLogger } from './logger';

const logger = createLogger('email-bison');

export interface EmailBisonConfig {
  apiKey: string;
  apiUrl: string;
}

export interface SendReplyOptions {
  emailId: string;
  replyContent: string;
  userId: string;
  signature?: string;
  ccAddresses?: string[];
  bccAddresses?: string[];
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  inboxId: string;
  cc?: string[];
  bcc?: string[];
}

export interface EmailBisonInbox {
  id: string;
  name: string;
  email: string;
  provider: string;
  connected: boolean;
  lastSyncedAt: string;
}

export interface EmailBisonAnalytics {
  emails: {
    total: number;
    received: number;
    sent: number;
    auto_replied: number;
    growth_percentage: number;
  };
  response_time: {
    average_minutes: number;
    improvement_percentage: number;
  };
  meetings: {
    booked: number;
    completed: number;
    cancelled: number;
    growth_percentage: number;
  };
}

export interface EmailData {
  message_id: string;
  thread_id: string;
  subject: string;
  body: string;
  sender: string;
  recipient?: string;
  received_at?: string;
}

export class EmailBisonClient {
  private config: EmailBisonConfig;
  
  constructor(config: Partial<EmailBisonConfig> = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.EMAIL_BISON_API_KEY || '',
      apiUrl: config.apiUrl || process.env.EMAIL_BISON_API_URL || 'https://sender.recruitron.io/v1',
    };
    
    if (!this.config.apiKey) {
      logger.warn('No EmailBison API Key provided. Some operations will fail.');
    }
    
    logger.info('EmailBisonClient initialized with API URL: ' + this.config.apiUrl);
  }
  
  /**
   * Get the API URL
   */
  getApiUrl(): string {
    return this.config.apiUrl;
  }
  
  /**
   * Get the API key
   */
  getApiKey(): string {
    return this.config.apiKey;
  }
  
  /**
   * Send a reply to an email
   */
  async sendReply(options: SendReplyOptions): Promise<string> {
    const { emailId, replyContent, userId, signature, ccAddresses, bccAddresses } = options;
    
    try {
      logger.info(`Sending reply to email ${emailId}`);
      
      const response = await axios.post(
        `${this.config.apiUrl}/send`,
        {
          email_id: emailId,
          reply_content: replyContent,
          user_id: userId,
          signature: signature || '',
          cc: ccAddresses || [],
          bcc: bccAddresses || [],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );
      
      logger.info(`Reply sent successfully to email ${emailId}`);
      
      return response.data.message_id;
    } catch (error: any) {
      logger.error(`Error sending reply to email ${emailId}`, { error });
      
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        throw new Error(`Email Bison API error (${status}): ${data.error || data.message || 'Unknown error'}`);
      }
      
      throw new Error(`Failed to send email reply: ${error.message}`);
    }
  }
  
  /**
   * Get an email by ID
   */
  async getEmail(emailId: string): Promise<any> {
    try {
      logger.info(`Fetching email ${emailId} from Email Bison`);
      
      const response = await axios.get(
        `${this.config.apiUrl}/email/${emailId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );
      
      logger.info(`Email ${emailId} fetched successfully`);
      
      return response.data;
    } catch (error: any) {
      logger.error(`Error fetching email ${emailId}`, { error });
      
      if (axios.isAxiosError(error) && error.response) {
        const { status } = error.response;
        
        if (status === 404) {
          throw new Error(`Email ${emailId} not found`);
        }
        
        throw new Error(`Email Bison API error (${status})`);
      }
      
      throw new Error(`Failed to fetch email: ${error.message}`);
    }
  }
  
  /**
   * Send a direct email via Email Bison API
   * This method follows the example format provided in the requirements
   */
  async sendEmail(options: SendEmailOptions): Promise<any> {
    const { to, subject, body, inboxId, cc, bcc } = options;
    
    try {
      logger.info(`Sending email to ${to} from inbox ${inboxId}`);
      
      const payload: Record<string, any> = {
        to,
        subject,
        body,
        inbox_id: inboxId,
      };
      
      // Add optional fields if provided
      if (cc && cc.length > 0) payload.cc = cc;
      if (bcc && bcc.length > 0) payload.bcc = bcc;
      
      const response = await axios.post(
        `${this.config.apiUrl}/send`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );
      
      logger.info(`Email sent successfully to ${to}`, { messageId: response.data.message_id });
      
      return response.data;
    } catch (error: any) {
      logger.error(`Error sending email to ${to}`, { error });
      
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        throw new Error(`Email Bison API error (${status}): ${data.error || data.message || 'Unknown error'}`);
      }
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
  
  /**
   * Get connected inboxes from Email Bison
   */
  async getConnectedInboxes(): Promise<EmailBisonInbox[]> {
    try {
      logger.info('Fetching connected inboxes from Email Bison');
      
      const response = await axios.get(
        `${this.config.apiUrl}/inboxes`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );
      
      logger.info(`Successfully fetched ${response.data.length} inboxes`);
      
      return response.data;
    } catch (error: any) {
      logger.error('Error fetching connected inboxes', { error });
      
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        throw new Error(`Email Bison API error (${status}): ${data.error || data.message || 'Unknown error'}`);
      }
      
      throw new Error(`Failed to fetch connected inboxes: ${error.message}`);
    }
  }
  
  /**
   * Get analytics data from Email Bison
   */
  async getAnalytics(timeRange: string = '30d'): Promise<EmailBisonAnalytics> {
    try {
      logger.info(`Fetching analytics data from Email Bison for time range: ${timeRange}`);
      
      const response = await axios.get(
        `${this.config.apiUrl}/analytics`,
        {
          params: { time_range: timeRange },
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );
      
      logger.info('Successfully fetched analytics data');
      
      return response.data;
    } catch (error: any) {
      logger.error('Error fetching analytics data', { error });
      
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        throw new Error(`Email Bison API error (${status}): ${data.error || data.message || 'Unknown error'}`);
      }
      
      throw new Error(`Failed to fetch analytics data: ${error.message}`);
    }
  }
  
  /**
   * Get new emails for an inbox
   * @param inboxId The ID of the inbox to fetch emails for
   * @returns Array of new emails
   */
  async getNewEmails(inboxId: string): Promise<EmailData[]> {
    try {
      logger.info(`Fetching new emails for inbox ${inboxId}`);
      
      const response = await axios.get(
        `${this.config.apiUrl}/inboxes/${inboxId}/emails/new`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );
      
      logger.info(`Successfully fetched ${response.data.length} new emails for inbox ${inboxId}`);
      
      return response.data;
    } catch (error: any) {
      logger.error(`Error fetching new emails for inbox ${inboxId}`, { error });
      
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        
        if (status === 404) {
          logger.warn(`Inbox ${inboxId} not found`);
          return [];
        }
        
        throw new Error(`Email Bison API error (${status}): ${data.error || data.message || 'Unknown error'}`);
      }
      
      throw new Error(`Failed to fetch new emails: ${error.message}`);
    }
  }
}
