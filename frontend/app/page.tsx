"use client";

import { TokenAnalytics } from "@/components/token-analytics";
import { PageHeader } from "@/components/page-header";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-8">
        <PageHeader />
        <TokenAnalytics />
      </div>
    </main>
  );
}