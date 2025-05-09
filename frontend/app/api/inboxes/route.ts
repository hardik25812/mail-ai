import { NextResponse } from 'next/server';

// Mock data for inboxes
const mockInboxes = [
  {
    id: '1',
    name: 'Work Inbox',
    email: 'work@example.com',
    provider: 'gmail',
    connected: true,
    auto_reply_enabled: true,
    office_hours_enabled: true,
    office_hours_start: '09:00',
    office_hours_end: '17:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Personal Inbox',
    email: 'personal@example.com',
    provider: 'outlook',
    connected: true,
    auto_reply_enabled: false,
    office_hours_enabled: false,
    office_hours_start: '09:00',
    office_hours_end: '17:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Support Inbox',
    email: 'support@example.com',
    provider: 'gmail',
    connected: true,
    auto_reply_enabled: true,
    office_hours_enabled: true,
    office_hours_start: '08:00',
    office_hours_end: '20:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(mockInboxes);
}
