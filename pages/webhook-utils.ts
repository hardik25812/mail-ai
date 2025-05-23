/**
 * Webhook utility wrapper for the test page
 * This file helps resolve module resolution issues with Next.js
 */

import { useWebhooks as originalUseWebhooks } from '../frontend/lib/hooks/useWebhooks';

// Re-export the hook with consistent error handling
export const useWebhooks = originalUseWebhooks;

// Export other webhook-related helpers if needed
export const getWebhookUrl = (baseUrl: string): string => {
  return `${baseUrl}/api/email-bison-webhook`;
};
