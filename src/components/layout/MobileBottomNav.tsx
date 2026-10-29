'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  FileText,
  Plus,
  Minus,
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

interface MobileBottomNavProps {
  onOpenMobileMenu?: () => void;
}

export function MobileBottomNav({}: MobileBottomNavProps) {
  const pathname = usePathname();
  const { openAddTransaction } = useDashboard();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Expenses', href: '/expenses', icon: ShoppingCart },
    { label: 'Incomes', href: '/incomes', icon: TrendingUp },
    { label: 'Reports', href: '/reports', icon: FileText },
  ];

  return (
    <nav className="mobile-app-bottom-nav" aria-label="Mobile Navigation">
      {/* Quick Cash In / Cash Out Action Strip */}
      <div className="mobile-nav-quick-actions">
        <button
          type="button"
          className="mobile-quick-cash-btn cash-in"
          onClick={() => openAddTransaction('income')}
          aria-label="Quick Cash In"
        >
          <div className="quick-btn-icon-wrapper in-icon">
            <Plus size={15} strokeWidth={2.5} />
          </div>
          <span>Cash In</span>
        </button>

        <button
          type="button"
          className="mobile-quick-cash-btn cash-out"
          onClick={() => openAddTransaction('expense')}
          aria-label="Quick Cash Out"
        >
          <div className="quick-btn-icon-wrapper out-icon">
            <Minus size={15} strokeWidth={2.5} />
          </div>
          <span>Cash Out</span>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="mobile-nav-tabs">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-tab-item ${isActive ? 'active' : ''}`}
            >
              <div className="mobile-tab-icon-box">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  color={isActive ? 'var(--primary-accent)' : '#6B7280'}
                />
              </div>
              <span className="mobile-tab-label">{item.label}</span>
              {isActive && <div className="mobile-tab-active-indicator" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
