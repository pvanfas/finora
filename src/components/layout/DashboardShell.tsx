'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { CustomizeModal } from '../modals/CustomizeModal';
import { AddTransactionModal } from '../modals/AddTransactionModal';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F6F7FA',
        color: '#111827',
      }}
    >
      {/* Sidebar */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Pane */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowX: 'hidden',
        }}
      >
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main
          style={{
            flex: 1,
            padding: '8px 32px 36px 32px',
            maxWidth: '1600px',
            width: '100%',
            margin: '0 auto',
          }}
          className="main-content-container"
        >
          {children}
        </main>
      </div>

      {/* Modals */}
      <CustomizeModal />
      <AddTransactionModal />

      {/* Mobile App Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
