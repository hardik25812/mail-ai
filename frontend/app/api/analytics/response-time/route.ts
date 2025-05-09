import { NextResponse } from 'next/server';

// Mock data for response time statistics
const mockResponseTimeStats = {
  average_minutes: 45,
  improvement_percentage: 22
};

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(mockResponseTimeStats);
}
