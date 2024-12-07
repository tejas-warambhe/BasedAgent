import { LineChart, Wallet } from "lucide-react";

export function PageHeader() {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <LineChart className="h-8 w-8" />
          Senti Agent
        </h1>
        <p className="text-muted-foreground">
          Snipe sentimental signals from the web3 jungle as well as whale activities
        </p>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Wallet className="h-5 w-5" />
        <span className="font-medium">Connected Wallet: 0x1234...5678</span>
      </div>
    </div>
  );
}