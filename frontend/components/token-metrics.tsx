import { ArrowUpRight, ArrowDownRight, Coins, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
}

function MetricCard({ title, value, change, icon, trend }: MetricCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              {trend === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function TokenMetrics({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <MetricCard
        title="Total Portfolio Value"
        value="$124,567.89"
        change="+12.34%"
        trend="up"
        icon={<Wallet className="h-6 w-6 text-primary" />}
      />
      <MetricCard
        title="Total Profit/Loss"
        value="$15,678.90"
        change="+8.45%"
        trend="up"
        icon={<Coins className="h-6 w-6 text-primary" />}
      />
      <MetricCard
        title="24h Change"
        value="$1,234.56"
        change="-2.34%"
        trend="down"
        icon={<ArrowUpRight className="h-6 w-6 text-primary" />}
      />
    </div>
  );
}