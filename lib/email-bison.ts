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

export class EmailBisonClient {
  private config: EmailBisonConfig;
  
  constructor(config: Partial<EmailBisonConfig> = {}) {
    this.config = {
      apiKey: process.env.EMAIL_BISON_API_KEY || '',
      apiUrl: process.env.EMAIL_BISON_API_URL || 'https://api.emailbison.com/v1',
    };
    
    if (!this.config.apiKey) {
      throw new Error('EMAIL_BISON_API_KEY is required');
    }
    
    logger.info('EmailBisonClient initialized with API URL: ' + this.config.apiUrl);
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
}
