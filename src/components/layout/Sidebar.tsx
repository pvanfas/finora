'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  X,
} from 'lucide-react';
import { FinoraLogo } from '../common/FinoraLogo';
import { useAuth } from '@/context/AuthContext';
import { MAIN_NAV_ITEMS, BOTTOM_NAV_ITEMS } from '@/constants/navigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 90,
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #ECEEF2',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '28px 20px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
          zIndex: 100,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`sidebar-container ${isOpen ? 'sidebar-open' : ''}`}
      >
        <div>
          {/* Header & Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '36px',
              paddingLeft: '8px',
            }}
          >
            <FinoraLogo size="md" />

            {/* Mobile close button */}
            <button
              onClick={onClose}
              style={{
                display: 'none',
                color: '#6B7280',
                padding: '6px',
                borderRadius: '8px',
              }}
              className="mobile-close-btn"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isExpenseNav = item.href === '/expenses';
              const isIncomeNav = item.href === '/incomes';

              const activeColor = isExpenseNav
                ? '#DC2626'
                : isIncomeNav
                ? '#10B981'
                : '#111827';

              const activeBg = isExpenseNav
                ? '#FEF2F2'
                : isIncomeNav
                ? '#ECFDF5'
                : '#ECEEF2';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '11px 16px',
                    borderRadius: '9999px',
                    color: isActive ? activeColor : '#5E6676',
                    backgroundColor: isActive ? activeBg : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '14.5px',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = isExpenseNav ? '#FEF2F2' : isIncomeNav ? '#ECFDF5' : '#F6F7FA';
                      e.currentTarget.style.color = isExpenseNav ? '#DC2626' : isIncomeNav ? '#10B981' : '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#5E6676';
                    }
                  }}
                >
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{
                      color: isActive ? activeColor : '#737C8D',
                      flexShrink: 0,
                    }}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderRadius: '9999px',
                  color: isActive ? '#111827' : '#5E6676',
                  backgroundColor: isActive ? '#ECEEF2' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '14.5px',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F6F7FA';
                    e.currentTarget.style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#5E6676';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{
                      color: isActive ? '#111827' : '#737C8D',
                      flexShrink: 0,
                    }}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      backgroundColor: 'var(--primary-accent)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* User Profile Mini Bar / Logout */}
          {user ? (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 12px',
                borderRadius: '12px',
                backgroundColor: '#FAFAFC',
                border: '1px solid #ECEEF2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#111827',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {user.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8A92A6' }}>{user.role}</div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                style={{
                  color: '#9CA3AF',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                marginTop: '12px',
                padding: '10px 16px',
                borderRadius: '9999px',
                backgroundColor: 'var(--primary-accent)',
                color: '#FFFFFF',
                textAlign: 'center',
                fontSize: '13.5px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'block',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
