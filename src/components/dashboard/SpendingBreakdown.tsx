'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { useClickOutside } from '@/hooks/useClickOutside';

interface Segment {
  label: string;
  percentage: number;
  color: string;
  patternId?: string;
  amount: string;
}

export function SpendingBreakdown() {
  const { currencySymbol } = useDashboard();
  const [timeframe, setTimeframe] = useState('This month');
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setShowTimeframeMenu(false), showTimeframeMenu);

  const segments: Segment[] = [
    { label: 'Food & Dining', percentage: 45, color: 'var(--primary-accent)', amount: `${currencySymbol}1,278` },
    { label: 'Transport', percentage: 25, color: '#85E0A3', amount: `${currencySymbol}710` },
    { label: 'Shopping', percentage: 10, color: '#EE6CE7', amount: `${currencySymbol}284` },
    { label: 'Others', percentage: 20, color: '#D1D5DB', patternId: 'hatch-pattern', amount: `${currencySymbol}568` },
  ];

  // SVG Gauge calculations
  const cx = 150;
  const cy = 135;
  const radius = 105;
  const strokeWidth = 28;
  const gapDeg = 3.5;

  let currentAngle = 180;

  const arcPaths = segments.map((seg) => {
    const sweep = (seg.percentage / 100) * 180 - gapDeg;
    const startAngle = currentAngle + gapDeg / 2;
    const endAngle = startAngle + sweep;
    currentAngle = startAngle + sweep + gapDeg / 2;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = (cx + radius * Math.cos(startRad)).toFixed(2);
    const y1 = (cy + radius * Math.sin(startRad)).toFixed(2);
    const x2 = (cx + radius * Math.cos(endRad)).toFixed(2);
    const y2 = (cy + radius * Math.sin(endRad)).toFixed(2);

    const largeArcFlag = sweep > 180 ? 1 : 0;
    const pathD = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

    return {
      ...seg,
      pathD,
      startAngle,
      endAngle,
    };
  });

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
          marginBottom: '16px',
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
            Spending Breakdown
          </h2>
          <p style={{ fontSize: '13.5px', color: '#6B7280' }}>See where your money goes.</p>
        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTimeframeMenu(!showTimeframeMenu)}
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
                {['This month', 'Last month', 'All time'].map((opt) => (
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
                      backgroundColor: timeframe === opt ? 'var(--primary-accent-light)' : 'transparent',
                      fontWeight: timeframe === opt ? 600 : 400,
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

      {/* Semi-circular gauge chart */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '10px',
          marginBottom: '20px',
        }}
      >
        <svg
          viewBox="0 0 300 160"
          style={{
            width: '100%',
            maxWidth: '310px',
            overflow: 'visible',
          }}
        >
          <defs>
            <pattern
              id="gauge-hatch-pattern"
              width="8"
              height="8"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="8" stroke="#D1D5DB" strokeWidth="3" />
              <line x1="4" y1="0" x2="4" y2="8" stroke="#FFFFFF" strokeWidth="5" />
            </pattern>
          </defs>

          {arcPaths.map((arc) => {
            const isHovered = hoveredSegment === arc.label;
            const strokeColor = arc.patternId ? 'url(#gauge-hatch-pattern)' : arc.color;

            return (
              <path
                key={arc.label}
                d={arc.pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeLinecap="round"
                style={{
                  cursor: 'pointer',
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease, stroke 0.3s ease',
                  opacity: hoveredSegment && !isHovered ? 0.6 : 1,
                }}
                onMouseEnter={() => setHoveredSegment(arc.label)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {hoveredSegment
              ? `${segments.find((s) => s.label === hoveredSegment)?.percentage}%`
              : '100%'}
          </div>
          <div
            style={{
              fontSize: '13.5px',
              color: '#6B7280',
              fontWeight: 500,
              marginTop: '4px',
            }}
          >
            {hoveredSegment ? hoveredSegment : 'Total'}
          </div>
        </div>
      </div>

      {/* Legend below the gauge */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px 24px',
          marginTop: 'auto',
          paddingTop: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13.5px',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setHoveredSegment('Food & Dining')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-accent)',
                transition: 'background-color 0.3s ease',
              }}
            />
            <span style={{ color: '#4B5563', fontWeight: 500 }}>Food & Dining</span>
          </div>
          <span style={{ color: '#111827', fontWeight: 600 }}>(45%)</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13.5px',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setHoveredSegment('Shopping')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#EE6CE7',
              }}
            />
            <span style={{ color: '#4B5563', fontWeight: 500 }}>Shopping</span>
          </div>
          <span style={{ color: '#111827', fontWeight: 600 }}>(10%)</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13.5px',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setHoveredSegment('Transport')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#85E0A3',
              }}
            />
            <span style={{ color: '#4B5563', fontWeight: 500 }}>Transport</span>
          </div>
          <span style={{ color: '#111827', fontWeight: 600 }}>(25%)</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13.5px',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setHoveredSegment('Others')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#D1D5DB',
              }}
            />
            <span style={{ color: '#4B5563', fontWeight: 500 }}>Others</span>
          </div>
          <span style={{ color: '#111827', fontWeight: 600 }}>(20%)</span>
        </div>
      </div>
    </div>
  );
}
