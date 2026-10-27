'use client';

import React, { useState } from 'react';
import { Search, LayoutGrid, Menu, Plus, X } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { searchQuery, setSearchQuery, setIsCustomizeOpen, setIsAddTransactionOpen } = useDashboard();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 32px',
        backgroundColor: 'transparent',
        gap: '20px',
        width: '100%',
      }}
      className="main-header"
    >
      {/* Left: Mobile hamburger & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, maxWidth: '440px' }}>
        <button
          onClick={onOpenMobileMenu}
          className="mobile-hamburger-btn"
          style={{
            display: 'none',
            padding: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #ECEEF2',
            borderRadius: '12px',
            color: '#111827',
            cursor: 'pointer',
          }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Search input matching the mockup */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '16px',
              color: isSearchFocused ? 'var(--primary-accent)' : '#9CA3AF',
              transition: 'color 0.15s ease',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              width: '100%',
              padding: '12px 18px 12px 46px',
              backgroundColor: '#FFFFFF',
              border: isSearchFocused ? '1px solid var(--primary-accent)' : '1px solid #E5E7EB',
              borderRadius: '9999px',
              fontSize: '14px',
              color: '#111827',
              boxShadow: isSearchFocused ? '0 0 0 3px var(--primary-accent-border)' : '0 1px 3px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.2s ease',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '14px',
                color: '#9CA3AF',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Right Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button
          variant="primary"
          onClick={() => setIsAddTransactionOpen(true)}
          leftIcon={<Plus size={16} strokeWidth={2.5} />}
        >
          <span className="btn-text">Add Expense</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => setIsCustomizeOpen(true)}
          leftIcon={<LayoutGrid size={16} strokeWidth={2} />}
        >
          <span>Customize</span>
        </Button>
      </div>
    </header>
  );
}
