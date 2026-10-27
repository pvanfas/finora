'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SpendingTrend } from '@/components/dashboard/SpendingTrend';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';

export default function ExpensesPage() {
  const { setIsAddTransactionOpen } = useDashboard();

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Expenses & Transactions
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
              Detailed ledger of all debits, merchant payments, and categorized spending.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsAddTransactionOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            Log Expense
          </Button>
        </div>

        <SpendingTrend />
        <RecentTransactions />
      </div>
    </DashboardShell>
  );
}
