// components/CategoryDonutChart.tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart"; // Assuming this exists

export type CategoryDataPoint = {
  name: string;
  count: number;
  color: string; // Hex color code, e.g., "#FF6384"
};

interface CategoryDonutChartProps {
  data: CategoryDataPoint[];
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center text-muted-foreground p-4">No category data to display.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Tooltip content={<ChartTooltipContent />} />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconSize={10}
          wrapperStyle={{ fontSize: '12px' }}
        />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          innerRadius={50} // This makes it a donut chart
          fill="#8884d8"
          dataKey="count"
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
