"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfitLossChart({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  const mockData = [
    { date: "Jan", value: 4000 },
    { date: "Feb", value: 3000 },
    { date: "Mar", value: 5000 },
    { date: "Apr", value: 4500 },
    { date: "May", value: 6000 },
    { date: "Jun", value: 5500 },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data || mockData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}