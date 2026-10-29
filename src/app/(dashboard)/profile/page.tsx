'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import { Button, Badge } from '@/components/ui';
import { LogOut, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [prevUserName, setPrevUserName] = useState(user?.name);
  const [saved, setSaved] = useState(false);

  if (user?.name !== prevUserName) {
    setPrevUserName(user?.name);
    setName(user?.name || '');
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
            User Profile & Account
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            Manage identity verification, personal information, and credentials.
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
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }} suppressHydrationWarning>{user?.name || 'User Profile'}</h2>
                <Badge variant="completed">Verified</Badge>
              </div>
              <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }} suppressHydrationWarning>{user?.email || ''}</p>
              <div style={{ fontSize: '12.5px', color: '#8A92A6', marginTop: '6px' }}>
                Tier: <strong style={{ color: 'var(--primary-accent)' }}>{user?.role || 'Personal Pro'}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
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

        {/* Personal Information Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px 28px',
              border: '1px solid #ECEEF2',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              Personal Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    color: '#111827',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                    fontSize: '14px',
                    color: '#6B7280',
                    cursor: 'not-allowed',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save size={16} />}
            >
              {saved ? 'Changes Saved!' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
