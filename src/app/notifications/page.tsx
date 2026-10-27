'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui';
import { AlertTriangle, CheckCircle, Info, Check } from 'lucide-react';

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      title: 'Food & Dining at 76% of budget',
      time: '2 hours ago',
      unread: true,
      type: 'warning',
      text: 'You have spent ₹912 of your ₹1,200 Food & Dining allocation for August.',
    },
    {
      id: '2',
      title: 'Recurring charge processed: Netflix',
      time: 'Yesterday at 9:15 AM',
      unread: true,
      type: 'info',
      text: 'Your subscription of ₹199.00 was authorized and is currently pending clearance.',
    },
    {
      id: '3',
      title: 'Monthly Savings Target Surpassed',
      time: 'Aug 26, 2026',
      unread: false,
      type: 'success',
      text: 'Congratulations! Your savings rate grew +12.4% compared to July.',
    },
  ]);

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, unread: false })));
  };

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Notifications & Alerts
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
              Real-time activity logs, budget threshold triggers, and payment confirmations.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            leftIcon={<Check size={14} />}
          >
            Mark all as read
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px 24px',
                border: item.unread ? '1px solid var(--primary-accent)' : '1px solid #ECEEF2',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: item.type === 'warning' ? 'var(--primary-accent-light)' : item.type === 'success' ? '#ECFDF5' : '#F3F4F6',
                  color: item.type === 'warning' ? 'var(--primary-accent)' : item.type === 'success' ? '#10B981' : '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {item.type === 'warning' ? <AlertTriangle size={18} /> : item.type === 'success' ? <CheckCircle size={18} /> : <Info size={18} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{item.title}</h3>
                  <span style={{ fontSize: '12px', color: '#8A92A6' }}>{item.time}</span>
                </div>
                <p style={{ fontSize: '13.5px', color: '#4B5563', marginTop: '4px', lineHeight: 1.5 }}>
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
