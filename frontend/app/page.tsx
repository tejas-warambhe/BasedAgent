"use client";

import { TokenAnalytics } from "@/components/token-analytics";
import { PageHeader } from "@/components/page-header";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useRouter } from "next/navigation";


export default function Home() {
  const route = useRouter();
  return (
    <main className="min-h-screen bg-background p-6">

      <AuroraBackground>
      <div className="container mx-auto space-y-8">
        <PageHeader />
        <TokenAnalytics />
        <div className="text-center">
          <button className="btn-primary" 
            onClick={() => {
              route.push('https://t.me/based_trade_bot')
            }}
          >

            <span onClick={() => {
              route.push('https://t.me/based_trade_bot')
            }}>Start Sniping!</span>
          </button>
        </div>
      </div>
      </AuroraBackground>
    </main>
  );
}
