"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function TokenTable({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  const mockData = [
    {
      token: "ETH",
      amount: "2.5",
      value: "$4,567.89",
      profit: "+$234.56",
      change: "+5.67%",
    },
    {
      token: "BTC",
      amount: "0.15",
      value: "$8,901.23",
      profit: "-$123.45",
      change: "-2.34%",
    },
    {
      token: "USDT",
      amount: "1000",
      value: "$1,000.00",
      profit: "$0.00",
      change: "0.00%",
    },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Profit/Loss</TableHead>
          <TableHead>24h Change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(data || mockData).map((token: any) => (
          <TableRow key={token.token}>
            <TableCell className="font-medium">{token.token}</TableCell>
            <TableCell>{token.amount}</TableCell>
            <TableCell>{token.value}</TableCell>
            <TableCell className={token.profit.startsWith("+") ? "text-green-500" : "text-red-500"}>
              {token.profit}
            </TableCell>
            <TableCell className={token.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
              {token.change}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}