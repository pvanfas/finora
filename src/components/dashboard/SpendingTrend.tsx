'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { useClickOutside } from '@/hooks/useClickOutside';
import { formatAxisK, formatINR } from '@/lib/formatters';

export function SpendingTrend() {
  const { trendData, selectedTrendDay, setSelectedTrendDay } = useDashboard();
  const [timeframe, setTimeframe] = useState('This month');
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setShowTimeframeMenu(false), showTimeframeMenu);

  const maxY = 8000;
  const targetThreshold = 7000; // guideline around 7k

  const currentActiveDay = trendData.find((d) => d.day === selectedTrendDay) || trendData[3];

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px 28px',
        border: '1px solid #ECEEF2',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '410px',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}
      >
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
            Spending Trend
          </h2>
          <p style={{ fontSize: '13.5px', color: '#6B7280' }}>
            Track how your spending changes over time.
          </p>
        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTimeframeMenu((prev) => !prev)}
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
              <span>{timeframe}</span>
              <ChevronDown size={14} color="#6B7280" />
            </button>

            {showTimeframeMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #ECEEF2',
                  padding: '6px',
                  zIndex: 20,
                  minWidth: '130px',
                }}
              >
                {['This month', 'Last month', 'This year'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setTimeframe(opt);
                      setShowTimeframeMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: timeframe === opt ? 'var(--primary-accent)' : '#374151',
                      backgroundColor:
                        timeframe === opt ? 'var(--primary-accent-light)' : 'transparent',
                      fontWeight: timeframe === opt ? 600 : 400,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          position: 'relative',
          paddingBottom: '8px',
        }}
      >
        {/* Y-Axis Labels */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingRight: '16px',
            fontSize: '12px',
            color: '#8A92A6',
            fontWeight: 500,
            height: '240px',
            userSelect: 'none',
          }}
        >
          <span>{formatAxisK(8000)}</span>
          <span>{formatAxisK(6000)}</span>
          <span>{formatAxisK(4000)}</span>
          <span>{formatAxisK(2000)}</span>
          <span>{formatAxisK(0)}</span>
        </div>

        {/* Bars Container */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            height: '240px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            paddingLeft: '8px',
            paddingRight: '8px',
          }}
        >
          {/* Dashed guideline across at ~7k */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${100 - (targetThreshold / maxY) * 100}%`,
              borderTop: '1.5px dashed var(--primary-accent)',
              opacity: 0.85,
              pointerEvents: 'none',
              zIndex: 1,
              transition: 'border-color 0.3s ease',
            }}
          />

          {/* Guideline Dot on Active Day */}
          <div
            style={{
              position: 'absolute',
              top: `${100 - (currentActiveDay.amount / maxY) * 100}%`,
              left: `calc(${(trendData.findIndex((d) => d.day === currentActiveDay.day) + 0.5) * (100 / trendData.length)}%)`,
              transform: 'translate(-50%, -50%)',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '2px solid var(--primary-accent)',
              zIndex: 5,
              pointerEvents: 'none',
              boxShadow: '0 0 0 3px var(--primary-accent-border)',
              transition: 'all 0.3s ease',
            }}
          />

          {/* Days & Bars */}
          {trendData.map((item) => {
            const isSelected = item.day === selectedTrendDay;
            const barHeightPercent = (item.amount / maxY) * 100;

            return (
              <div
                key={item.day}
                onClick={() => setSelectedTrendDay(item.day)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  cursor: 'pointer',
                  position: 'relative',
                  flex: 1,
                  maxWidth: '52px',
                  margin: '0 4px',
                }}
              >
                {/* Floating tooltip pill for selected item */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: `${100 - barHeightPercent}%`,
                      transform: 'translateY(-100%)',
                      backgroundColor: 'var(--primary-accent)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                      marginBottom: '8px',
                      boxShadow: '0 4px 10px var(--primary-accent-border)',
                      transition: 'background-color 0.3s ease',
                    }}
                    className="animate-fade-in"
                  >
                    {formatINR(item.amount)}
                  </div>
                )}

                {/* The Bar */}
                <div
                  style={{
                    width: '100%',
                    height: `${barHeightPercent}%`,
                    borderRadius: '12px',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    ...(isSelected
                      ? {
                          backgroundColor: 'var(--primary-accent)',
                          boxShadow: 'var(--primary-accent-glow)',
                        }
                      : {
                          background:
                            'repeating-linear-gradient(-45deg, #ECEEF3, #ECEEF3 3px, #F4F5F8 3px, #F4F5F8 6px)',
                        }),
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.opacity = '0.8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                />

                {/* Date Label under Bar */}
                <div style={{ marginTop: '14px', height: '26px', display: 'flex', alignItems: 'center' }}>
                  {isSelected ? (
                    <span
                      style={{
                        backgroundColor: 'var(--primary-accent)',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        transition: 'background-color 0.3s ease',
                      }}
                    >
                      {item.day}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#8A92A6',
                      }}
                    >
                      {item.day}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
