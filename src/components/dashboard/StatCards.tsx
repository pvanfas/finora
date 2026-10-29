'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { ProgressBar } from '@/components/ui';
import { formatINR } from '@/lib/formatters';

export function StatCards() {
  const { transactions } = useDashboard();

  // Compute live aggregates from authentic database transactions
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const incomeTxCount = transactions.filter((t) => t.amount > 0).length;
  const expenseTxCount = transactions.filter((t) => t.amount < 0).length;

  const projectRevenue = transactions
    .filter((t) => t.category === 'PROJECT' && t.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const isPositiveBalance = netBalance >= 0;
  const projectPct = totalIncome > 0 ? Math.round((projectRevenue / totalIncome) * 100) : 0;
  const expenseRatio = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 100;
  const balancePct = totalIncome > 0 ? Math.min(100, Math.round((Math.abs(netBalance) / totalIncome) * 100)) : 0;

  const stats = [
    {
      id: 'total-income',
      title: 'Total Income',
      icon: ArrowDownRight,
      value: formatINR(totalIncome),
      subtext: `${incomeTxCount} credits logged`,
      percentage: 100,
      percentageLabel: '100%',
      barColor: '#10B981',
    },
    {
      id: 'total-expenses',
      title: 'Total Expenses',
      icon: ArrowUpRight,
      value: formatINR(totalExpense),
      subtext: `${expenseTxCount} debits logged`,
      percentage: expenseRatio,
      percentageLabel: `${expenseRatio}%`,
      barColor: '#DC2626',
    },
    {
      id: 'balance',
      title: 'Balance',
      icon: isPositiveBalance ? ArrowDownRight : ArrowUpRight,
      value: formatINR(netBalance, { showSign: true }),
      subtext: isPositiveBalance ? 'Net surplus reserve' : 'Net cash deficit',
      percentage: balancePct,
      percentageLabel: `${balancePct}%`,
      barColor: isPositiveBalance ? '#10B981' : '#DC2626',
    },
    {
      id: 'project-revenue',
      title: 'Project Revenue',
      icon: Wallet,
      value: formatINR(projectRevenue),
      subtext: `${projectPct}% service revenue`,
      percentage: projectPct,
      percentageLabel: `${projectPct}%`,
      barColor: '#EE6CE7',
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '22px 24px',
              border: '1px solid #ECEEF2',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '138px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            className="stat-card"
          >
            {/* Header: Icon + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  color: stat.barColor || '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={17} strokeWidth={2} />
              </div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: stat.id === 'balance' ? stat.barColor : stat.id === 'total-expenses' ? '#DC2626' : stat.id === 'total-income' ? '#10B981' : '#4B5563',
                  letterSpacing: '-0.01em',
                }}
              >
                {stat.title}
              </span>
            </div>

            {/* Value + Subtext */}
            <div
              style={{
                marginTop: '14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: '#111827',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 400, color: '#6B7280' }}>
                {stat.subtext}
              </span>
            </div>

            {/* Progress Bar + Percentage Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <ProgressBar
                  value={stat.percentage}
                  color={stat.barColor}
                  height={6}
                  useHatchedTrack={true}
                />
              </div>

              <span
                style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: stat.id === 'balance' ? stat.barColor : stat.id === 'total-expenses' ? '#DC2626' : stat.id === 'total-income' ? '#10B981' : '#111827',
                  minWidth: '38px',
                  textAlign: 'right',
                }}
              >
                {stat.percentageLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
