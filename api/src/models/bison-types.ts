/**
 * TypeScript interfaces for Email Bison API
 */

export interface EmailBisonInbox {
  id: string;
  email: string;
  name: string;
  workspace_id: string;
  provider: string;
  status: 'active' | 'inactive' | 'pending';
  unread_count: number;
  total_count: number;
  last_sync_time: string;
  created_at: string;
  updated_at: string;
}

export interface EmailBisonWorkspace {
  id: string;
  name: string;
  owner_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  member_count: number;
  inbox_count: number;
}

export interface EmailBisonApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface EmailBisonPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  success: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}
