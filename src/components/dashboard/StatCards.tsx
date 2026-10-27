'use client';

import React from 'react';
import { CreditCard, ArrowDownRight, Wallet, PiggyBank } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { ProgressBar } from '@/components/ui';
import { formatINR } from '@/lib/formatters';

export function StatCards() {
  const { monthlyBudget, spent, remaining, savings, savingsGrowth } = useDashboard();

  const spentPercent = Math.min(100, Math.round((spent / monthlyBudget) * 100));
  const remainingPercent = Math.min(100, Math.round((remaining / monthlyBudget) * 100));

  const stats = [
    {
      id: 'monthly-budget',
      title: 'Monthly Budget',
      icon: CreditCard,
      value: formatINR(monthlyBudget),
      subtext: `of ${formatINR(monthlyBudget)}`,
      percentage: 100,
      percentageLabel: '100%',
      barColor: 'var(--primary-accent)',
    },
    {
      id: 'spent',
      title: 'Spent',
      icon: ArrowDownRight,
      value: formatINR(spent),
      subtext: `${spentPercent}% of budget`,
      percentage: spentPercent,
      percentageLabel: `${spentPercent}%`,
      barColor: 'var(--primary-accent-muted)',
    },
    {
      id: 'remaining',
      title: 'Remaining',
      icon: Wallet,
      value: formatINR(remaining),
      subtext: `${remainingPercent}% left`,
      percentage: remainingPercent,
      percentageLabel: `${remainingPercent}%`,
      barColor: '#EE6CE7',
    },
    {
      id: 'savings',
      title: 'Savings',
      icon: PiggyBank,
      value: formatINR(savings),
      subtext: `+${savingsGrowth}% from last month`,
      percentage: savingsGrowth,
      percentageLabel: `${savingsGrowth}%`,
      barColor: '#85E0A3',
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
                  color: '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={17} strokeWidth={1.8} />
              </div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#4B5563',
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
                  color: '#111827',
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
