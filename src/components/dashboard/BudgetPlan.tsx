'use client';

import React from 'react';
import {
  Utensils,
  Car,
  ShoppingCart,
  Play,
  Package,
  Home,
  Zap,
  HeartPulse,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { ProgressBar } from '@/components/ui';

export function BudgetPlan() {
  const { budgetPlan } = useDashboard();

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Food & Dining':
        return { icon: Utensils, color: 'var(--primary-accent)', bg: 'var(--primary-accent-light)' };
      case 'Transport':
        return { icon: Car, color: '#10B981', bg: '#ECFDF5' };
      case 'Shopping':
        return { icon: ShoppingCart, color: '#EE6CE7', bg: '#FDF2FD' };
      case 'Entertainment':
        return { icon: Play, color: '#F59E0B', bg: '#FEF3C7' };
      case 'Utilities & Bills':
        return { icon: Zap, color: '#0284C7', bg: '#F0F9FF' };
      case 'Housing & Rent':
        return { icon: Home, color: '#8B5CF6', bg: '#F5F3FF' };
      case 'Healthcare':
        return { icon: HeartPulse, color: '#F43F5E', bg: '#FFF1F2' };
      case 'Investments':
        return { icon: TrendingUp, color: '#10B981', bg: '#ECFDF5' };
      case 'Education':
        return { icon: GraduationCap, color: '#6366F1', bg: '#EEF2FF' };
      case 'Others':
      default:
        return { icon: Package, color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  return (
    <div className="budget-plan-card">
      {/* Header */}
      <div className="card-header-responsive">
        <div>
          <h2
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: '#111827',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            My Budget Plan
          </h2>
          <p style={{ fontSize: '13.5px', color: '#6B7280' }}>
            Plan your budget and stay on track with your spending.
          </p>
        </div>
      </div>

      {/* Categories List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          flex: 1,
          maxHeight: '440px',
          overflowY: 'auto',
          paddingRight: '6px',
        }}
        className="custom-scrollbar"
      >
        {budgetPlan.map((item) => {
          const { icon: Icon, color, bg } = getCategoryIcon(item.name);

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                width: '100%',
              }}
            >
              {/* Circular Icon Badge */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} strokeWidth={2} style={{ color }} />
              </div>

              {/* Progress and Label Area */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '7px',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111827',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#111827',
                      flexShrink: 0,
                    }}
                  >
                    {item.percentage}%
                  </span>
                </div>

                {/* Progress bar using reusable component */}
                <ProgressBar
                  value={item.percentage}
                  color={item.color}
                  height={6}
                  useHatchedTrack={true}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
