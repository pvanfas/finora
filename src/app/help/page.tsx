'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { MessageSquare, BookOpen, Mail } from 'lucide-react';
import { Button } from '@/components/ui';

export default function HelpPage() {
  const faqs = [
    { q: 'How does Finora calculate my remaining monthly budget?', a: 'Finora takes your total set monthly limit and continuously deducts completed & pending transactions in real time.' },
    { q: 'Can I connect multiple bank accounts and cards?', a: 'Yes! Navigate to Settings > Linked Accounts to sync checking, credit, and savings accounts with 256-bit bank-grade encryption.' },
    { q: 'What does the diagonal hatched pattern indicate?', a: 'The hatched stripe texture visually shows unspent allowance in your category envelopes and unfilled threshold capacity in trend bars.' },
    { q: 'How do I export my data for tax filing?', a: 'Visit the Reports tab to download CSV or PDF statements sorted by deductible categories.' },
  ];

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
            Help & Customer Support
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            Find answers to common questions or reach out to our dedicated concierge.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {[
            { title: 'Live 24/7 Chat', desc: 'Average response under 2 minutes', icon: MessageSquare, action: 'Start Chat' },
            { title: 'Knowledge Base', desc: 'Browse comprehensive guides and tutorials', icon: BookOpen, action: 'Explore Guides' },
            { title: 'Email Concierge', desc: 'support@finora.finance', icon: Mail, action: 'Send Email' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #ECEEF2',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--primary-accent-light)',
                      color: 'var(--primary-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{item.desc}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  pill={false}
                  style={{ marginTop: '20px' }}
                >
                  {item.action}
                </Button>
              </div>
            );
          })}
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #ECEEF2',
          }}
        >
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
            Frequently Asked Questions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ padding: '16px', backgroundColor: '#FAFAFC', borderRadius: '12px', border: '1px solid #ECEEF2' }}>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#111827' }}>{f.q}</h4>
                <p style={{ fontSize: '13.5px', color: '#4B5563', marginTop: '6px', lineHeight: 1.5 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
