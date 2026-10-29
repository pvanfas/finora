"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { IncomeTrend } from "@/components/dashboard/IncomeTrend";

export default function IncomesPage() {
  return (
    <DashboardShell>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <IncomeTrend />
        <RecentTransactions incomesOnly={true} />
      </div>
    </DashboardShell>
  );
}
