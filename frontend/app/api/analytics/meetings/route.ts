import { NextResponse } from 'next/server';

// Mock data for meeting statistics
const mockMeetingStats = {
  booked: 28,
  completed: 22,
  cancelled: 6,
  growth_percentage: 10
};

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(mockMeetingStats);
}
