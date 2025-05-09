import { NextResponse } from 'next/server';

// Mock data for email statistics
const mockEmailStats = {
  total: 1250,
  received: 850,
  sent: 400,
  auto_replied: 125,
  growth_percentage: 15
};

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(mockEmailStats);
}
