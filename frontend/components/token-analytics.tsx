"use client";

import { Card } from "@/components/ui/card";
import { TokenMetrics } from "@/components/token-metrics";
import { ProfitLossChart } from "@/components/profit-loss-chart";
import { TokenTable } from "@/components/token-table";
import { useTokenData } from "@/hooks/use-token-data";

export function TokenAnalytics() {
  const { data, isLoading } = useTokenData();

  return (
    <div className="space-y-6">
      <TokenMetrics data={data} isLoading={isLoading} />
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Profit/Loss Over Time</h2>
          {/* <ProfitLossChart data={data?.chartData} isLoading={isLoading} /> */}
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Token Holdings</h2>
          {/* <TokenTable data={data?.tokens} isLoading={isLoading} /> */}
        </Card>
      </div>
    </div>
  );
}