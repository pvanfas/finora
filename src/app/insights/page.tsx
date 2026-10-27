'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { SpendingTrend } from '@/components/dashboard/SpendingTrend';
import { SpendingBreakdown } from '@/components/dashboard/SpendingBreakdown';
import { Sparkles } from 'lucide-react';

export default function InsightsPage() {
  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="page-header-responsive">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Financial Insights & Predictive AI
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
              Algorithmic patterns, merchant analysis, and projected month-end balance.
            </p>
          </div>
        </div>

        {/* AI Highlight Banner */}
        <div className="insights-ai-banner">
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Sparkles size={16} /> Intelligent Forecast
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px', marginBottom: '6px' }}>
              You are on pace to save ₹720 this month
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.92, lineHeight: 1.5 }}>
              Keeping weekend discretionary dining below ₹1,800 will preserve your surplus and increase your emergency fund milestone by 2 weeks.
            </p>
          </div>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#FFFFFF',
              color: 'var(--primary-accent)',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '13.5px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              flexShrink: 0,
            }}
          >
            Apply Savings Rule
          </button>
        </div>

        <div className="middle-charts-grid responsive-two-col-grid">
          <SpendingTrend />
          <SpendingBreakdown />
        </div>
      </div>
    </DashboardShell>
  );
}
