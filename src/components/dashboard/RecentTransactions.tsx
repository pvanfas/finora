'use client';

import React, { useState, useRef } from 'react';
import { SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { Badge } from '@/components/ui';
import { useClickOutside } from '@/hooks/useClickOutside';
import { formatINR } from '@/lib/formatters';
import { CATEGORIES, STATUSES } from '@/constants/finance';
import { SortOption } from '@/types/finance';

export function RecentTransactions() {
  const {
    filteredTransactions,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
  } = useDashboard();

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filterMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Click-outside handlers to auto-close menus
  useClickOutside(filterMenuRef, () => setShowFilterMenu(false), showFilterMenu);
  useClickOutside(sortMenuRef, () => setShowSortMenu(false), showSortMenu);

  const isFilterActive = categoryFilter !== 'All' || statusFilter !== 'All';

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: 'date-desc', label: 'Date: Newest first' },
    { id: 'date-asc', label: 'Date: Oldest first' },
    { id: 'amount-high', label: 'Amount: Highest first' },
    { id: 'amount-low', label: 'Amount: Lowest first' },
  ];

  return (
    <div className="recent-transactions-card">
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
            Recent Transaction
          </h2>
          <p style={{ fontSize: '13.5px', color: '#6B7280' }}>
            Review your latest financial activities.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="card-header-actions">
          {/* Filter Dropdown Container */}
          <div ref={filterMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowFilterMenu((prev) => !prev);
                setShowSortMenu(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '9999px',
                backgroundColor: isFilterActive ? 'var(--primary-accent-light)' : '#FFFFFF',
                border: isFilterActive ? '1px solid var(--primary-accent)' : '1px solid #E5E7EB',
                fontSize: '13px',
                fontWeight: 500,
                color: isFilterActive ? 'var(--primary-accent)' : '#374151',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
              {isFilterActive && (
                <span
                  style={{
                    backgroundColor: 'var(--primary-accent)',
                    borderRadius: '50%',
                    width: '6px',
                    height: '6px',
                  }}
                />
              )}
            </button>

            {/* Filter Menu Dropdown */}
            {showFilterMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #ECEEF2',
                  padding: '14px',
                  zIndex: 30,
                  minWidth: '220px',
                }}
                className="animate-slide-down"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#111827',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Category
                  </span>
                  {isFilterActive && (
                    <button
                      onClick={() => {
                        setCategoryFilter('All');
                        setStatusFilter('All');
                      }}
                      style={{
                        fontSize: '11.5px',
                        color: 'var(--primary-accent)',
                        fontWeight: 600,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '12px' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: categoryFilter === cat ? 'var(--primary-accent)' : '#374151',
                        backgroundColor:
                          categoryFilter === cat ? 'var(--primary-accent-light)' : 'transparent',
                        fontWeight: categoryFilter === cat ? 600 : 400,
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{cat}</span>
                      {categoryFilter === cat && <Check size={14} color="var(--primary-accent)" />}
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#111827',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '8px',
                    borderTop: '1px solid #F3F4F6',
                    paddingTop: '8px',
                  }}
                >
                  Status
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {STATUSES.map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: statusFilter === st ? 'var(--primary-accent)' : '#374151',
                        backgroundColor:
                          statusFilter === st ? 'var(--primary-accent-light)' : 'transparent',
                        fontWeight: statusFilter === st ? 600 : 400,
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{st}</span>
                      {statusFilter === st && <Check size={14} color="var(--primary-accent)" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort By Dropdown Container */}
          <div ref={sortMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowSortMenu((prev) => !prev);
                setShowFilterMenu(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '9999px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              <ArrowUpDown size={14} />
              <span>Sort</span>
            </button>

            {showSortMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #ECEEF2',
                  padding: '8px',
                  zIndex: 30,
                  minWidth: '170px',
                }}
                className="animate-slide-down"
              >
                {sortOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSortBy(s.id);
                      setShowSortMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: sortBy === s.id ? 'var(--primary-accent)' : '#374151',
                      backgroundColor:
                        sortBy === s.id ? 'var(--primary-accent-light)' : 'transparent',
                      fontWeight: sortBy === s.id ? 600 : 400,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop / Tablet View: Classic Table (Screens > 680px) */}
      <div className="desktop-transaction-table" style={{ flex: 1 }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#FAFAFC', borderRadius: '8px' }}>
              <th
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#6B7280',
                  borderTopLeftRadius: '8px',
                  borderBottomLeftRadius: '8px',
                }}
              >
                Transaction
              </th>
              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>
                Category
              </th>
              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>
                Date
              </th>
              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>
                Amount
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#6B7280',
                  textAlign: 'right',
                  borderTopRightRadius: '8px',
                  borderBottomRightRadius: '8px',
                }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: '36px 16px',
                    textAlign: 'center',
                    color: '#8A92A6',
                    fontSize: '14px',
                  }}
                >
                  No transactions match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid #F3F4F6',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FBFBFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {tx.name}
                  </td>
                  <td style={{ padding: '16px', fontSize: '13.5px', color: '#4B5563' }}>
                    {tx.category}
                  </td>
                  <td style={{ padding: '16px', fontSize: '13.5px', color: '#6B7280' }}>
                    {tx.date}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {formatINR(tx.amount, { showSign: true, decimals: 2 })}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <Badge
                      variant={
                        tx.status === 'Completed'
                          ? 'completed'
                          : tx.status === 'Pending'
                          ? 'pending'
                          : 'failed'
                      }
                    >
                      {tx.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View: High-Fidelity Transaction Cards (Screens <= 680px) */}
      <div className="mobile-transaction-list">
        {filteredTransactions.length === 0 ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: '#8A92A6', fontSize: '13.5px' }}>
            No transactions match the selected criteria.
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div key={tx.id} className="mobile-tx-item">
              <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#111827',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tx.name}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    marginTop: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{tx.category}</span>
                  <span>&bull;</span>
                  <span>{tx.date}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#111827' }}>
                  {formatINR(tx.amount, { showSign: true, decimals: 2 })}
                </div>
                <div style={{ marginTop: '4px' }}>
                  <Badge
                    variant={
                      tx.status === 'Completed'
                        ? 'completed'
                        : tx.status === 'Pending'
                        ? 'pending'
                        : 'failed'
                    }
                  >
                    {tx.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
