"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SpendingTrend } from "@/components/dashboard/SpendingTrend";

export default function ExpensesPage() {
  return (
    <DashboardShell>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <SpendingTrend expensesOnly={true} />
        <RecentTransactions expensesOnly={true} />
      </div>
    </DashboardShell>
  );
}
