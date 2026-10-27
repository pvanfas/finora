'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Plus, Plane, Shield, Home, Car } from 'lucide-react';
import { Button, ProgressBar } from '@/components/ui';
import { formatINR } from '@/lib/formatters';

export default function GoalsPage() {
  const goals = [
    { title: 'Emergency Fund', icon: Shield, current: 8500, target: 10000, color: 'var(--primary-accent)', bg: 'var(--primary-accent-light)' },
    { title: 'Tokyo Autumn Vacation', icon: Plane, current: 3200, target: 4500, color: '#EE6CE7', bg: '#FDF2FD' },
    { title: 'New Electric Vehicle', icon: Car, current: 15400, target: 35000, color: '#85E0A3', bg: '#ECFDF5' },
    { title: 'House Down Payment', icon: Home, current: 48000, target: 80000, color: '#F59E0B', bg: '#FEF3C7' },
  ];

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Financial Goals
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
              Define milestone targets, track automated monthly savings, and achieve financial independence.
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
          >
            New Goal
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {goals.map((g, idx) => {
            const Icon = g.icon;
            const pct = Math.round((g.current / g.target) * 100);

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #ECEEF2',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: g.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} style={{ color: g.color }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{g.title}</h3>
                    <span style={{ fontSize: '12.5px', color: '#6B7280' }}>
                      Target: {formatINR(g.target)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                    {formatINR(g.current)}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: g.color }}>
                    {pct}%
                  </span>
                </div>

                <ProgressBar
                  value={pct}
                  color={g.color}
                  height={8}
                  useHatchedTrack={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
