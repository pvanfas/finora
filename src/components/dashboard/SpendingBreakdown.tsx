'use client';

import React, { useState, useRef, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { useClickOutside } from '@/hooks/useClickOutside';
import { formatINR } from '@/lib/formatters';

interface Segment {
  label: string;
  percentage: number;
  color: string;
  patternId?: string;
  amount: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_ABBRS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

export function SpendingBreakdown() {
  const { transactions } = useDashboard();
  const [timeframe, setTimeframe] = useState('All time');
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setShowTimeframeMenu(false), showTimeframeMenu);

  // Dynamically compute all unique <Month Year> options from expense transactions
  const timeframeOptions = useMemo(() => {
    const set = new Set<string>();

    for (const t of transactions) {
      if (t.amount < 0) {
        if (t.date.startsWith('Today')) {
          set.add('October 2026');
        } else {
          const parts = t.date.split(',');
          if (parts.length >= 2) {
            const y = parts[1].trim();
            const mAbbr = parts[0].trim().split(' ')[0];
            if (MONTH_ABBRS[mAbbr] !== undefined) {
              set.add(`${MONTH_NAMES[MONTH_ABBRS[mAbbr]]} ${y}`);
            }
          }
        }
      }
    }

    const sortedMonths = Array.from(set).sort((a, b) => {
      const [ma, ya] = a.split(' ');
      const [mb, yb] = b.split(' ');
      if (ya !== yb) return parseInt(yb, 10) - parseInt(ya, 10);
      return MONTH_NAMES.indexOf(mb) - MONTH_NAMES.indexOf(ma);
    });

    return ['All time', ...sortedMonths];
  }, [transactions]);

  const { segments, totalSpent } = useMemo(() => {
    const expenses = transactions.filter((t) => t.amount < 0);

    const filtered = expenses.filter((t) => {
      if (timeframe === 'All time') return true;
      if (t.date.startsWith('Today')) {
        return timeframe === 'October 2026';
      }
      const parts = t.date.split(',');
      if (parts.length >= 2) {
        const y = parts[1].trim();
        const mAbbr = parts[0].trim().split(' ')[0];
        if (MONTH_ABBRS[mAbbr] !== undefined) {
          const mFull = MONTH_NAMES[MONTH_ABBRS[mAbbr]];
          return `${mFull} ${y}` === timeframe;
        }
      }
      return false;
    });

    let opex = 0;
    let capex = 0;
    let project = 0;

    for (const t of filtered) {
      const amt = Math.abs(t.amount);
      if (t.category === 'OPEX') opex += amt;
      else if (t.category === 'CAPEX') capex += amt;
      else if (t.category === 'PROJECT') project += amt;
    }

    const total = opex + capex + project;
    const safeTotal = total || 1;
    const opexPct = total > 0 ? Math.round((opex / safeTotal) * 100) : 0;
    const capexPct = total > 0 ? Math.round((capex / safeTotal) * 100) : 0;
    const projPct = total > 0 ? Math.max(0, 100 - opexPct - capexPct) : 0;

    const list: Segment[] = [
      { label: 'OPEX', percentage: opexPct, color: 'var(--primary-accent)', amount: formatINR(opex) },
      { label: 'CAPEX', percentage: capexPct, color: '#85E0A3', amount: formatINR(capex) },
      { label: 'PROJECT', percentage: projPct, color: '#EE6CE7', amount: formatINR(project) },
    ];

    return { segments: list, totalSpent: total };
  }, [transactions, timeframe]);

  // SVG Gauge calculations
  const cx = 150;
  const cy = 135;
  const radius = 105;
  const strokeWidth = 28;
  const gapDeg = 3.5;

  const activeSegments = segments.filter((s) => s.percentage > 0);
  const isSingleSegment = activeSegments.length === 1;

  let currentAngle = 180;
  const arcPaths: (typeof segments[number] & { pathD: string; startAngle: number; endAngle: number })[] = [];

  for (const seg of segments) {
    if (seg.percentage <= 0) {
      arcPaths.push({
        ...seg,
        pathD: '',
        startAngle: 0,
        endAngle: 0,
      });
      continue;
    }

    const gap = isSingleSegment ? 0 : gapDeg;
    const sweep = (seg.percentage / 100) * 180 - gap;
    const startAngle = currentAngle + gap / 2;
    const endAngle = startAngle + sweep;
    currentAngle = startAngle + sweep + gap / 2;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = (cx + radius * Math.cos(startRad)).toFixed(2);
    const y1 = (cy + radius * Math.sin(startRad)).toFixed(2);
    const x2 = (cx + radius * Math.cos(endRad)).toFixed(2);
    const y2 = (cy + radius * Math.sin(endRad)).toFixed(2);

    const largeArcFlag = sweep > 180 ? 1 : 0;
    const pathD = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

    arcPaths.push({
      ...seg,
      pathD,
      startAngle,
      endAngle,
    });
  }

  return (
    <div
      className="dashboard-card spending-breakdown-card"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #ECEEF2',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
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
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #ECEEF2',
                  padding: '6px',
                  zIndex: 25,
                  minWidth: '170px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
                className="custom-scrollbar animate-slide-down"
              >
                {timeframeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setTimeframe(opt);
                      setHoveredSegment(null);
                      setShowTimeframeMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: timeframe === opt ? '#DC2626' : '#374151',
                      backgroundColor: timeframe === opt ? '#FEF2F2' : 'transparent',
                      fontWeight: timeframe === opt ? 700 : 500,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{opt}</span>
                    {opt === timeframeOptions[0] && (
                      <span style={{ fontSize: '10px', backgroundColor: '#FEF2F2', color: '#DC2626', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        All
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart & Legend Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          width: '100%',
        }}
      >
        {/* Semi-circular gauge chart */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginTop: '4px',
            marginBottom: '6px',
          }}
        >
          <svg
            viewBox="0 0 300 160"
            style={{
              width: '100%',
              maxWidth: '300px',
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
              if (!arc.pathD) return null;
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
                fontSize: hoveredSegment ? '30px' : '26px',
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {hoveredSegment
                ? `${segments.find((s) => s.label === hoveredSegment)?.percentage}%`
                : formatINR(totalSpent)}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#6B7280',
                fontWeight: 500,
                marginTop: '4px',
              }}
            >
              {hoveredSegment
                ? `${hoveredSegment}: ${segments.find((s) => s.label === hoveredSegment)?.amount}`
                : 'Total Spent'}
            </div>
          </div>
        </div>

        {/* Legend below the gauge */}
        <div
          className="spending-breakdown-legend"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            width: '100%',
            marginTop: '10px',
          }}
        >
          {segments.map((seg) => (
            <div
              key={seg.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredSegment(seg.label)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: seg.color,
                  }}
                />
                <span style={{ color: '#4B5563', fontWeight: 500 }}>{seg.label}</span>
              </div>
              <span style={{ color: '#111827', fontWeight: 600 }}>({seg.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
}
