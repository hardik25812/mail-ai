// components/EmailVolumeAreaChart.tsx
"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export type EmailVolumeDataPoint = { date: string; count: number };

interface EmailVolumeAreaChartProps {
  data: EmailVolumeDataPoint[];
}

export function EmailVolumeAreaChart({ data }: EmailVolumeAreaChartProps) {
  // Define a simple chart config for the ChartContainer
  const chartConfig = {
    email: {
      label: "Emails",
      color: "hsl(var(--primary))"
    }
  };

  return (
    <ChartContainer className="h-[240px]" config={chartConfig}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="emailVolumeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }} 
          axisLine={false} 
          tickLine={false}
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          axisLine={false} 
          tickLine={false} 
          width={30} 
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke="hsl(var(--primary))" 
          fillOpacity={1}
          fill="url(#emailVolumeGradient)" 
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
