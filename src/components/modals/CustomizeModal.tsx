'use client';

import React, { useState } from 'react';
import { Check, DollarSign, Layout, Palette, Sparkles } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { ACCENT_THEMES } from '@/constants/theme';
import { Modal, Button } from '@/components/ui';

export function CustomizeModal() {
  const {
    isCustomizeOpen,
    setIsCustomizeOpen,
    monthlyBudget,
    updateBudget,
    accentTheme,
    setAccentTheme,
    currencySymbol,
  } = useDashboard();

  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [activeTab, setActiveTab] = useState<'budget' | 'widgets' | 'appearance'>('budget');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      updateBudget(val);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsCustomizeOpen(false);
      }, 700);
    }
  };

  return (
    <Modal
      isOpen={isCustomizeOpen}
      onClose={() => setIsCustomizeOpen(false)}
      title="Customize Dashboard"
      description="Tailor your dashboard view, accent theme & budget targets"
      maxWidth="520px"
    >
      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          padding: '12px 24px',
          gap: '8px',
          borderBottom: '1px solid #F3F4F6',
          backgroundColor: '#FAFAFC',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'budget' as const, label: 'Budget & Goals', icon: DollarSign },
          { id: 'appearance' as const, label: 'Theme & Accent', icon: Palette },
          { id: 'widgets' as const, label: 'Cards & Layout', icon: Layout },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 600,
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--primary-accent)' : '#6B7280',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                border: isActive ? '1px solid var(--primary-accent)' : '1px solid transparent',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body Content */}
      <div style={{ padding: '24px' }}>
        {activeTab === 'budget' && (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Monthly Budget Target ({currencySymbol})
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '12px',
                    color: '#9CA3AF',
                    fontWeight: 700,
                    fontSize: '15px',
                  }}
                >
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 34px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '15px',
                    color: '#111827',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                  placeholder="4500"
                  required
                />
              </div>
              <p style={{ fontSize: '12px', color: '#8A92A6', marginTop: '6px' }}>
                Adjusting this updates your stat cards, progress meters, and spending thresholds automatically.
              </p>
            </div>

            {/* Quick presets */}
            <div style={{ marginBottom: '24px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6B7280',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Quick presets:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[3000, 4500, 6000, 8000].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setBudgetInput(preset.toString())}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor:
                        budgetInput === preset.toString()
                          ? 'var(--primary-accent-light)'
                          : '#F3F4F6',
                      color:
                        budgetInput === preset.toString()
                          ? 'var(--primary-accent)'
                          : '#4B5563',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      border:
                        budgetInput === preset.toString()
                          ? '1px solid var(--primary-accent)'
                          : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {currencySymbol}
                    {preset.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCustomizeOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {savedSuccess ? (
                  <>
                    <Check size={16} /> Saved!
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'appearance' && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#111827' }}>
                  Primary Accent Theme
                </h4>
                <p style={{ fontSize: '12.5px', color: '#6B7280' }}>
                  Choose a primary accent to dynamically re-theme buttons, charts, badges & logos.
                </p>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: 'var(--primary-accent)',
                  backgroundColor: 'var(--primary-accent-light)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                <Sparkles size={12} /> Active
              </div>
            </div>

            {/* Theme Color Palettes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '10px',
                marginBottom: '24px',
              }}
            >
              {ACCENT_THEMES.map((theme) => {
                const isSelected = accentTheme.id === theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setAccentTheme(theme.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 10px',
                      borderRadius: '14px',
                      border: isSelected ? `2px solid ${theme.primary}` : '1px solid #ECEEF2',
                      backgroundColor: isSelected ? theme.light : '#FAFAFC',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: theme.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 10px ${theme.border}`,
                      }}
                    >
                      {isSelected && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                    </div>

                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? theme.primary : '#374151',
                        textAlign: 'center',
                      }}
                    >
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Preview Box */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                backgroundColor: '#FAFAFC',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#8A92A6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                }}
              >
                Live Theme Preview
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <Button size="sm" variant="primary">
                  Primary Action
                </Button>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--primary-accent-light)',
                    color: 'var(--primary-accent)',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  Active Pill
                </span>
                <div
                  style={{
                    width: '40px',
                    height: '6px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--primary-accent)',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsCustomizeOpen(false)}
              >
                Apply & Close
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'widgets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { title: 'Stat Overview Cards', desc: 'Monthly Budget, Spent, Remaining, Savings' },
              { title: 'Spending Trend Chart', desc: 'Interactive daily spending bars and guideline' },
              { title: 'Spending Breakdown Gauge', desc: 'Semi-circular gauge of expenses by category' },
              { title: 'Recent Transactions List', desc: 'Filterable table with status badges' },
              { title: 'My Budget Plan Progress', desc: 'Category-specific budgets and progress bars' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#FAFAFC',
                  border: '1px solid #ECEEF2',
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.desc}</div>
                </div>
                <div
                  style={{
                    width: '42px',
                    height: '24px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--primary-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      transform: 'translateX(18px)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
