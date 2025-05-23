// components/ResponseRateGauge.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ResponseRateGaugeProps {
  rate: number; // Percentage, e.g., 85 for 85%
  avgTime?: number; // Average response time in minutes, optional
}

export function ResponseRateGauge({ rate, avgTime }: ResponseRateGaugeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Rate</CardTitle>
        {avgTime !== undefined && (
          <CardDescription>
            Avg. Response Time: {avgTime} min
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="text-5xl font-bold text-primary">{rate.toFixed(1)}%</div>
        {/* Placeholder for a visual gauge component */}
      </CardContent>
    </Card>
  );
}
