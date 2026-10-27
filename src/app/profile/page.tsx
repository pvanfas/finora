'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import { Button, Badge } from '@/components/ui';
import { CreditCard, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
            User Profile & Security
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            Manage identity verification, linked payment methods, and account security.
          </p>
        </div>

        {/* Profile Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #ECEEF2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user?.name || 'User'}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary-accent-light)',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{user?.name || 'Alex Morgan'}</h2>
                <Badge variant="completed">Verified</Badge>
              </div>
              <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>{user?.email || 'alex.morgan@finora.finance'}</p>
              <div style={{ fontSize: '12.5px', color: '#8A92A6', marginTop: '6px' }}>
                Tier: <strong style={{ color: 'var(--primary-accent)' }}>{user?.role || 'Personal Pro'}</strong> &bull; Member since Aug 2024
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/settings">
              <Button variant="secondary" size="sm">
                Edit Profile
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut size={14} />}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Linked Accounts */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px 28px',
            border: '1px solid #ECEEF2',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
            Connected Bank Accounts & Cards
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { bank: 'Chase Premier Checking', number: '•••• 4892', status: 'Primary', balance: '₹12,450.00' },
              { bank: 'Apple Card Mastercard', number: '•••• 1024', status: 'Active', balance: '₹2,840.00 Spent' },
              { bank: 'Vanguard High-Yield Savings', number: '•••• 9931', status: 'Active', balance: '₹34,920.00' },
            ].map((acc, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  backgroundColor: '#FAFAFC',
                  border: '1px solid #ECEEF2',
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
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{acc.bank}</div>
                    <div style={{ fontSize: '12px', color: '#8A92A6' }}>{acc.number}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{acc.balance}</div>
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>{acc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
