/**
 * OpenAI API wrapper
 * Handles communication with OpenAI's API for generating AI email replies
 */

import axios from 'axios';
import { createLogger } from './logger';

const logger = createLogger('openai');

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class OpenAIClient {
  private config: OpenAIConfig;
  
  constructor(config: Partial<OpenAIConfig> = {}) {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: config.model || 'gpt-4',
      maxTokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.7,
    };
    
    if (!this.config.apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }
  }
  
  /**
   * Generate a completion using OpenAI's Chat Completions API
   */
  async generateCompletion(messages: ChatMessage[]): Promise<OpenAIResponse> {
    try {
      logger.info(`Generating completion with model ${this.config.model}`);
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );
      
      logger.info(`Completion generated successfully`);
      
      return {
        text: response.data.choices[0].message.content,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
      };
    } catch (error: any) {
      logger.error('Error generating OpenAI completion', { error });
      
      // Enhanced error handling for various OpenAI API errors
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        
        if (status === 429) {
          throw new Error('OpenAI rate limit exceeded. Try again later.');
        } else if (status === 400 && data.error?.code === 'context_length_exceeded') {
          throw new Error('The prompt is too long for the model.');
        } else if (status === 401) {
          throw new Error('Invalid OpenAI API key. Check your credentials.');
        } else {
          throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
        }
      }
      
      throw new Error(`Failed to generate OpenAI completion: ${error.message}`);
    }
  }
  
  /**
   * Generate an email reply using the provided prompt
   */
  async generateEmailReply(prompt: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an AI assistant that helps draft email replies. Be concise, professional, and address the sender\'s questions directly.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];
    
    const completion = await this.generateCompletion(messages);
    return completion.text;
  }
  
  /**
   * Generate a summary of an email for Slack notifications
   */
  async generateEmailSummary(prompt: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'Summarize the email content in a single concise sentence. Keep it under 15 words.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];
    
    const completion = await this.generateCompletion(messages);
    return completion.text;
  }
}
