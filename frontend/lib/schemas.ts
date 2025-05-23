// lib/schemas.ts
import { z } from 'zod';

// Schema for individual email statistics by day
export const EmailByDaySchema = z.object({
  day: z.string(),
  count: z.number(),
});

// Schema for response time by hour
export const ResponseTimeByHourSchema = z.object({
  hour: z.string(),
  time: z.number(),
});

// Schema for email categories
export const CategorySchema = z.object({
  name: z.string(),
  count: z.number(),
  color: z.string(),
});

// Schema for top contacts
export const TopContactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  count: z.number(),
});

// Main schema for an Inbox, based on API response structure
export const InboxSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  name: z.string().optional().nullable(), // Making name optional as seen in some components
  email: z.string().email(),
  provider: z.string().optional().nullable(),
  status: z.string().optional().nullable(), // e.g., 'active', 'disconnected'
  last_synced_at: z.string().datetime().optional().nullable(),
  created_at: z.string().datetime().optional().nullable(),
  updated_at: z.string().datetime().optional().nullable(),
  user_id: z.string().optional().nullable(),
  workspace_id: z.string().optional().nullable(),

  // Statistics fields (assuming these come from the API directly for each inbox)
  total_count: z.number().optional().default(0),
  unread_count: z.number().optional().default(0),
  sent_count: z.number().optional().default(0),
  archived_count: z.number().optional().default(0),
  response_rate: z.number().optional().default(0), // Percentage
  avg_response_time: z.number().optional().default(0), // In minutes or seconds
  meetings_scheduled: z.number().optional().default(0),
  auto_replies: z.number().optional().default(0),

  // Optional detailed stats (if not part of the main /inboxes endpoint, adjust as needed)
  emails_by_day: z.array(EmailByDaySchema).optional().default([]),
  response_time_by_hour: z.array(ResponseTimeByHourSchema).optional().default([]),
  categories: z.array(CategorySchema).optional().default([]),
  top_contacts: z.array(TopContactSchema).optional().default([]),
});

export type Inbox = z.infer<typeof InboxSchema>;

// Schema for the API response when fetching all inboxes
// Match the exact API response structure from the backend
export const InboxesApiResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.array(InboxSchema),
  meta: z.record(z.any()).optional(),
  links: z.record(z.any()).optional()
});

// Example of a more specific analytics data schema (can be expanded)
export const EmailVolumeStatsSchema = z.object({
  date: z.string(), // or z.date()
  count: z.number(),
});

export type EmailVolumeStats = z.infer<typeof EmailVolumeStatsSchema>;
