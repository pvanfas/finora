'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { BudgetPlan } from '@/components/dashboard/BudgetPlan';
import { StatCards } from '@/components/dashboard/StatCards';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui';
import { Sliders } from 'lucide-react';

export default function BudgetPage() {
  const { setIsCustomizeOpen } = useDashboard();

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Budget Management
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
              Configure spending limits, track category envelopes, and optimize monthly cash flow.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsCustomizeOpen(true)}
            leftIcon={<Sliders size={16} />}
          >
            Adjust Budget Limits
          </Button>
        </div>

        <StatCards />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '20px' }}>
          <BudgetPlan />

          {/* Budget Insights Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px 28px',
              border: '1px solid #ECEEF2',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                Budget Health & Advice
              </h3>
              <p style={{ fontSize: '13.5px', color: '#6B7280', marginBottom: '20px' }}>
                Automated recommendations based on this month’s pace.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '14px', backgroundColor: 'var(--primary-accent-light)', borderRadius: '12px', borderLeft: '4px solid var(--primary-accent)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Food & Dining Warning</div>
                  <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '4px' }}>
                    You have reached 76% of your dining budget with 12 days remaining this month.
                  </div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#ECFDF5', borderRadius: '12px', borderLeft: '4px solid #10B981' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Savings Goal on Track</div>
                  <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '4px' }}>
                    Savings are up +12.4% over last month. You have met your monthly surplus projection.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F3F4F6', fontSize: '13px', color: '#8A92A6' }}>
              Updated real-time synced with bank feeds.
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
