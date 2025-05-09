import { NextResponse } from 'next/server';

// Mock data for analytics
const mockAnalyticsData = {
  emailStats: {
    total: 1250,
    received: 850,
    sent: 400,
    auto_replied: 125,
    growth_percentage: 15
  },
  responseTimeStats: {
    average_minutes: 45,
    improvement_percentage: 22
  },
  meetingStats: {
    booked: 28,
    completed: 22,
    cancelled: 6,
    growth_percentage: 10
  }
};

export async function POST() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return NextResponse.json(mockAnalyticsData);
}
