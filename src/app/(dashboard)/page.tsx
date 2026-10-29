'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { StatCards } from '@/components/dashboard/StatCards';
import { SpendingTrend } from '@/components/dashboard/SpendingTrend';
import { SpendingBreakdown } from '@/components/dashboard/SpendingBreakdown';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Row 1: Stat Overview Cards */}
        <StatCards />

        {/* Row 2: Charts Row (Spending Trend + Spending Breakdown) */}
        <div className="middle-charts-grid">
          <SpendingTrend />
          <SpendingBreakdown />
        </div>

        {/* Row 3: Recent Transactions */}
        <div>
          <RecentTransactions />
        </div>
      </div>
    </DashboardShell>
  );
}
