'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Calendar, Plus } from 'lucide-react';
import { Button, Badge } from '@/components/ui';

export default function RecurringPage() {
  const subscriptions = [
    { name: 'Netflix Premium 4K', category: 'Entertainment', amount: 19.99, date: 'Renews Sep 28', status: 'Active' },
    { name: 'Shopify Store Plan', category: 'Business / Shopping', amount: 39.00, date: 'Renews Sep 27', status: 'Active' },
    { name: 'Spotify Duo', category: 'Entertainment', amount: 14.99, date: 'Renews Sep 15', status: 'Active' },
    { name: 'Gym & Fitness Pass', category: 'Health', amount: 65.00, date: 'Renews Sep 01', status: 'Active' },
    { name: 'iCloud 2TB Storage', category: 'Cloud & Tech', amount: 9.99, date: 'Renews Sep 05', status: 'Active' },
  ];

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Recurring Subscriptions & Bills
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
              Monitor and cancel active recurring charges to avoid unexpected billing.
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
          >
            Add Subscription
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {subscriptions.map((sub, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #ECEEF2',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{sub.name}</h3>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>{sub.category}</span>
                </div>
                <Badge variant="completed">{sub.status}</Badge>
              </div>

              <div style={{ margin: '20px 0', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{sub.amount.toFixed(2)}</span>
                <span style={{ fontSize: '13px', color: '#8A92A6' }}>/ month</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: '12.5px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> {sub.date}
                </span>
                <button style={{ fontSize: '12.5px', color: '#EF4444', fontWeight: 600 }}>Manage</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
