'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { SpendingBreakdown } from '@/components/dashboard/SpendingBreakdown';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ReportsPage() {
  const reports = [
    { title: 'Monthly Expense Statement - August 2026', size: '1.4 MB', date: 'Generated Aug 31, 2026' },
    { title: 'Quarterly Cash Flow Summary - Q2 2026', size: '2.8 MB', date: 'Generated Jun 30, 2026' },
    { title: 'Tax Deductible Expenses Report - 2025/26', size: '4.1 MB', date: 'Generated Apr 15, 2026' },
    { title: 'Annual Financial Overview - 2025', size: '5.2 MB', date: 'Generated Jan 02, 2026' },
  ];

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Financial Reports & Statements
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
              Download official statements, audited summaries, and categorized expense audits.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '20px' }}>
          {/* Reports List */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px 28px',
              border: '1px solid #ECEEF2',
            }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              Available Statements
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reports.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid #ECEEF2',
                    backgroundColor: '#FAFAFC',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--primary-accent-light)',
                        color: 'var(--primary-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{r.title}</div>
                      <div style={{ fontSize: '12px', color: '#8A92A6', marginTop: '2px' }}>
                        {r.date} &bull; {r.size}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    pill={false}
                    leftIcon={<Download size={14} />}
                  >
                    PDF
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <SpendingBreakdown />
        </div>
      </div>
    </DashboardShell>
  );
}
