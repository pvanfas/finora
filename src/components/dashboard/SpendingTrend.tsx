"use client";

import React, { useState, useRef, useMemo } from "react";
import { ChevronDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatAxisK, formatINR } from "@/lib/formatters";

interface MonthData {
  key: string; // e.g. '2026-04'
  monthLabel: string; // e.g. 'Apr 26'
  fullLabel: string; // e.g. 'April 2026'
  year: number;
  monthIndex: number;
  income: number;
  expense: number;
  net: number;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_ABBR_MAP: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function buildBezierPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = points[i - 1] || current;
    const nextNext = points[i + 2] || next;

    const cp1x = current.x + (next.x - prev.x) / 6;
    const cp1y = current.y + (next.y - prev.y) / 6;
    const cp2x = next.x - (nextNext.x - current.x) / 6;
    const cp2y = next.y - (nextNext.y - current.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }
  return path;
}

function buildAreaPath(
  points: { x: number; y: number }[],
  baseY: number,
): string {
  if (points.length === 0) return "";
  const linePath = buildBezierPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath} L ${last.x.toFixed(1)} ${baseY.toFixed(1)} L ${first.x.toFixed(1)} ${baseY.toFixed(1)} Z`;
}

interface SpendingTrendProps {
  expensesOnly?: boolean;
  incomesOnly?: boolean;
}

export function SpendingTrend({
  expensesOnly = false,
  incomesOnly = false,
}: SpendingTrendProps) {
  const { transactions } = useDashboard();
  const [timeRange, setTimeRange] = useState<
    "Last 6 Months" | "Last 12 Months" | "Year 2026" | "All Months"
  >("Last 6 Months");
  const [showRangeMenu, setShowRangeMenu] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setShowRangeMenu(false), showRangeMenu);

  // 1. Group all authentic transactions by month chronologically
  const allMonthlyData = useMemo(() => {
    const monthMap = new Map<
      string,
      { income: number; expense: number; year: number; monthIndex: number }
    >();

    for (const t of transactions) {
      let mIdx = -1;
      let yr = 2026;

      if (t.date.startsWith("Today")) {
        mIdx = 9; // October (0-indexed)
        yr = 2026;
      } else {
        const parts = t.date.split(",");
        if (parts.length >= 2) {
          yr = parseInt(parts[1].trim(), 10) || 2026;
          const mAbbr = parts[0].trim().split(" ")[0];
          if (MONTH_ABBR_MAP[mAbbr] !== undefined) {
            mIdx = MONTH_ABBR_MAP[mAbbr];
          }
        }
      }

      if (mIdx >= 0) {
        const key = `${yr}-${String(mIdx + 1).padStart(2, "0")}`;
        const existing = monthMap.get(key) || {
          income: 0,
          expense: 0,
          year: yr,
          monthIndex: mIdx,
        };

        if (t.amount > 0) {
          existing.income += t.amount;
        } else {
          existing.expense += Math.abs(t.amount);
        }
        monthMap.set(key, existing);
      }
    }

    // Sort chronologically ascending
    const sortedKeys = Array.from(monthMap.keys()).sort();
    return sortedKeys.map((key) => {
      const item = monthMap.get(key)!;
      const mShort = MONTH_SHORT[item.monthIndex];
      const yrShort = String(item.year).slice(-2);
      return {
        key,
        monthLabel: `${mShort} '${yrShort}`,
        fullLabel: `${MONTH_NAMES[item.monthIndex]} ${item.year}`,
        year: item.year,
        monthIndex: item.monthIndex,
        income: item.income,
        expense: item.expense,
        net: item.income - item.expense,
      };
    });
  }, [transactions]);

  // 2. Filter months based on selected time range
  const filteredMonths: MonthData[] = useMemo(() => {
    if (allMonthlyData.length === 0) return [];

    switch (timeRange) {
      case "Last 6 Months":
        return allMonthlyData.slice(-6);
      case "Last 12 Months":
        return allMonthlyData.slice(-12);
      case "Year 2026": {
        const in2026 = allMonthlyData.filter((m) => m.year === 2026);
        return in2026.length > 0 ? in2026 : allMonthlyData.slice(-6);
      }
      case "All Months":
      default:
        return allMonthlyData;
    }
  }, [allMonthlyData, timeRange]);

  // Aggregate totals for the displayed period
  const totalPeriodIncome = filteredMonths.reduce(
    (acc, m) => acc + m.income,
    0,
  );
  const totalPeriodExpense = filteredMonths.reduce(
    (acc, m) => acc + m.expense,
    0,
  );
  const totalPeriodNet = totalPeriodIncome - totalPeriodExpense;

  // SVG Chart Geometry - High-res proportional viewport to prevent zoomed appearance
  const svgWidth = 1000;
  const svgHeight = 260;
  const paddingLeft = 52;
  const paddingRight = 24;
  const paddingTop = 18;
  const paddingBottom = 28;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const baseY = paddingTop + chartHeight;

  // Maximum value for dynamic scaling with safe buffer
  const maxVal = useMemo(() => {
    const highest = filteredMonths.reduce((max, m) => {
      let compare = Math.max(m.income, m.expense);
      if (expensesOnly) compare = m.expense;
      if (incomesOnly) compare = m.income;
      return Math.max(max, compare);
    }, 0);

    if (highest <= 0) return 50000;
    // Round up nicely to 25k or 50k
    const buffer = highest * 1.18;
    const step = buffer > 200000 ? 50000 : 25000;
    return Math.ceil(buffer / step) * step;
  }, [filteredMonths, expensesOnly, incomesOnly]);

  // Compute (x, y) coordinates for each month
  const dataPoints = useMemo(() => {
    const count = filteredMonths.length;
    if (count === 0) return { incomePoints: [], expensePoints: [], coords: [] };

    const coords: { x: number; month: MonthData }[] = [];
    const incomePoints: { x: number; y: number }[] = [];
    const expensePoints: { x: number; y: number }[] = [];

    const xStep = count > 1 ? chartWidth / (count - 1) : chartWidth / 2;

    filteredMonths.forEach((m, idx) => {
      const x =
        count > 1 ? paddingLeft + idx * xStep : paddingLeft + chartWidth / 2;

      // Invert Y so highest value is at paddingTop
      const incomeY = baseY - (m.income / maxVal) * chartHeight;
      const expenseY = baseY - (m.expense / maxVal) * chartHeight;

      coords.push({ x, month: m });
      incomePoints.push({
        x,
        y: Math.max(paddingTop, Math.min(baseY, incomeY)),
      });
      expensePoints.push({
        x,
        y: Math.max(paddingTop, Math.min(baseY, expenseY)),
      });
    });

    return { incomePoints, expensePoints, coords };
  }, [
    filteredMonths,
    chartWidth,
    chartHeight,
    paddingLeft,
    paddingTop,
    baseY,
    maxVal,
  ]);

  // Paths
  const incomeLinePath = useMemo(
    () => buildBezierPath(dataPoints.incomePoints),
    [dataPoints.incomePoints],
  );
  const incomeAreaPath = useMemo(
    () => buildAreaPath(dataPoints.incomePoints, baseY),
    [dataPoints.incomePoints, baseY],
  );

  const expenseLinePath = useMemo(
    () => buildBezierPath(dataPoints.expensePoints),
    [dataPoints.expensePoints],
  );
  const expenseAreaPath = useMemo(
    () => buildAreaPath(dataPoints.expensePoints, baseY),
    [dataPoints.expensePoints, baseY],
  );

  // Grid steps (4 equal segments)
  const gridSteps = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

  // Currently active / hovered month
  const activeMonthIndex =
    hoveredIndex !== null &&
    hoveredIndex >= 0 &&
    hoveredIndex < filteredMonths.length
      ? hoveredIndex
      : filteredMonths.length > 0
        ? filteredMonths.length - 1
        : null;

  const activeMonth =
    activeMonthIndex !== null ? filteredMonths[activeMonthIndex] : null;
  const activePoint =
    activeMonthIndex !== null && dataPoints.coords[activeMonthIndex]
      ? dataPoints.coords[activeMonthIndex]
      : null;

  return (
    <div
      className="dashboard-card spending-trend-card"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #ECEEF2",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
        position: "relative",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "14px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "#111827",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {incomesOnly
                ? "Monthly Income Trend"
                : expensesOnly
                  ? "Monthly Expense Trend"
                  : "Cash Flow Trend"}
            </h2>
          </div>
          <p
            style={{
              fontSize: "12.5px",
              color: "#6B7280",
              marginTop: "2px",
              margin: 0,
            }}
          >
            {incomesOnly
              ? "Monthly operational inflows, revenue, and capital contributions over time"
              : expensesOnly
                ? "Monthly operational debits and outflows over time"
                : "Monthly cash flow: Income vs. Expenses"}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Timeframe dropdown */}
          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              onClick={() => setShowRangeMenu(!showRangeMenu)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#F9FAFB",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#374151",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F3F4F6")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#F9FAFB")
              }
            >
              <span>{timeRange}</span>
              <ChevronDown size={14} style={{ color: "#9CA3AF" }} />
            </button>

            {showRangeMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: "6px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "10px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                  border: "1px solid #ECEEF2",
                  padding: "4px",
                  minWidth: "150px",
                  zIndex: 30,
                }}
              >
                {(
                  [
                    "Last 6 Months",
                    "Last 12 Months",
                    "Year 2026",
                    "All Months",
                  ] as const
                ).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setTimeRange(r);
                      setShowRangeMenu(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor:
                        timeRange === r ? "#F3F4F6" : "transparent",
                      color: timeRange === r ? "#111827" : "#4B5563",
                      fontSize: "12.5px",
                      fontWeight: timeRange === r ? 600 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend & Period Summary Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "12px",
          padding: "8px 12px",
          backgroundColor: "#F9FAFC",
          borderRadius: "10px",
          border: "1px solid #F1F3F5",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* Income Legend */}
          {!expensesOnly && (
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)",
                }}
              />
              <span
                style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}
              >
                Income:
              </span>
              <span
                style={{ fontSize: "13px", color: "#10B981", fontWeight: 700 }}
              >
                {formatINR(totalPeriodIncome)}
              </span>
            </div>
          )}

          {/* Expense Legend */}
          {!incomesOnly && (
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#DC2626",
                  boxShadow: "0 0 0 2px rgba(220, 38, 38, 0.2)",
                }}
              />
              <span
                style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}
              >
                Expense:
              </span>
              <span
                style={{ fontSize: "13px", color: "#DC2626", fontWeight: 700 }}
              >
                {formatINR(totalPeriodExpense)}
              </span>
            </div>
          )}

          {/* Net Flow */}
          {!expensesOnly && !incomesOnly && (
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span
                style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}
              >
                Net Flow:
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: totalPeriodNet >= 0 ? "#10B981" : "#DC2626",
                }}
              >
                {formatINR(totalPeriodNet, { showSign: true })}
              </span>
            </div>
          )}
        </div>

        {/* Active Month Detail Badge */}
        {activeMonth && (
          <div style={{ fontSize: "12px", color: "#4B5563", fontWeight: 600 }}>
            {activeMonth.fullLabel}:
            {!expensesOnly && (
              <span style={{ color: "#10B981", marginLeft: "6px" }}>
                +{formatINR(activeMonth.income)}
              </span>
            )}
            {!incomesOnly && (
              <span style={{ color: "#DC2626", marginLeft: "6px" }}>
                -{formatINR(activeMonth.expense)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* SVG Line Chart */}
      <div
        className="spending-trend-chart-container"
        style={{ position: "relative", width: "100%" }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="spending-trend-svg"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Income Green Area Gradient */}
            <linearGradient id="incomeAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>

            {/* Expense Red Area Gradient */}
            <linearGradient
              id="expenseAreaGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.0" />
            </linearGradient>

            {/* Drop shadow for line points */}
            <filter
              id="pointShadow"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="2"
                floodOpacity="0.15"
              />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {gridSteps.map((val, idx) => {
            const y = baseY - (val / maxVal) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#F3F4F6"
                  strokeWidth="0.8"
                  strokeDasharray={idx === 0 ? "none" : "4 4"}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#9CA3AF"
                  fontSize="9.5"
                  fontWeight="500"
                >
                  {formatAxisK(val)}
                </text>
              </g>
            );
          })}

          {/* Income Area & Line */}
          {!expensesOnly && incomeAreaPath && (
            <path d={incomeAreaPath} fill="url(#incomeAreaGradient)" />
          )}
          {!expensesOnly && incomeLinePath && (
            <path
              d={incomeLinePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Expense Area & Line */}
          {!incomesOnly && expenseAreaPath && (
            <path d={expenseAreaPath} fill="url(#expenseAreaGradient)" />
          )}
          {!incomesOnly && expenseLinePath && (
            <path
              d={expenseLinePath}
              fill="none"
              stroke="#DC2626"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Vertical guideline & data markers for Active / Hovered Month */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={baseY}
                stroke="#D1D5DB"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* Data Points on Lines */}
          {dataPoints.coords.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            const incPt = dataPoints.incomePoints[idx];
            const expPt = dataPoints.expensePoints[idx];

            return (
              <g key={idx}>
                {/* Income point */}
                {!expensesOnly && incPt && (
                  <circle
                    cx={incPt.x}
                    cy={incPt.y}
                    r={isHovered ? 4.5 : 3}
                    fill="#FFFFFF"
                    stroke="#10B981"
                    strokeWidth={isHovered ? 2.5 : 1.8}
                    filter="url(#pointShadow)"
                    style={{ transition: "all 0.15s ease" }}
                  />
                )}

                {/* Expense point */}
                {!incomesOnly && expPt && (
                  <circle
                    cx={expPt.x}
                    cy={expPt.y}
                    r={isHovered ? 4.5 : 3}
                    fill="#FFFFFF"
                    stroke="#DC2626"
                    strokeWidth={isHovered ? 2.5 : 1.8}
                    filter="url(#pointShadow)"
                    style={{ transition: "all 0.15s ease" }}
                  />
                )}

                {/* X-Axis Month Label */}
                <text
                  x={pt.x}
                  y={baseY + 18}
                  textAnchor="middle"
                  fill={isHovered ? "#111827" : "#6B7280"}
                  fontSize="10"
                  fontWeight={isHovered ? "600" : "500"}
                  style={{ transition: "fill 0.15s ease" }}
                >
                  {pt.month.monthLabel}
                </text>

                {/* Invisible hover capture rect across the full vertical column */}
                <rect
                  x={pt.x - chartWidth / (dataPoints.coords.length * 2)}
                  y={0}
                  width={chartWidth / dataPoints.coords.length}
                  height={svgHeight}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activePoint && activeMonth && hoveredIndex !== null && (
          <div
            style={{
              position: "absolute",
              left: `${(activePoint.x / svgWidth) * 100}%`,
              top: "10px",
              transform:
                activePoint.x > svgWidth * 0.7
                  ? "translateX(-105%)"
                  : activePoint.x < svgWidth * 0.3
                    ? "translateX(5%)"
                    : "translateX(-50%)",
              backgroundColor: "#111827",
              color: "#FFFFFF",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "12px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
              pointerEvents: "none",
              zIndex: 20,
              minWidth: "175px",
              border: "1px solid #374151",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "13px",
                marginBottom: "6px",
                color: "#F9FAFB",
              }}
            >
              {activeMonth.fullLabel}
            </div>

            {!expensesOnly && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: !incomesOnly ? "4px" : "0",
                }}
              >
                <span
                  style={{
                    color: "#9CA3AF",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <ArrowDownRight size={13} color="#10B981" /> Income:
                </span>
                <span style={{ color: "#10B981", fontWeight: 700 }}>
                  +{formatINR(activeMonth.income)}
                </span>
              </div>
            )}

            {!incomesOnly && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: !expensesOnly && !incomesOnly ? "6px" : "0",
                }}
              >
                <span
                  style={{
                    color: "#9CA3AF",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <ArrowUpRight size={13} color="#DC2626" /> Expense:
                </span>
                <span style={{ color: "#DC2626", fontWeight: 700 }}>
                  -{formatINR(activeMonth.expense)}
                </span>
              </div>
            )}

            {!expensesOnly && !incomesOnly && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  paddingTop: "6px",
                  borderTop: "1px solid #374151",
                }}
              >
                <span style={{ color: "#E5E7EB", fontWeight: 500 }}>
                  Net Flow:
                </span>
                <span
                  style={{
                    color: activeMonth.net >= 0 ? "#10B981" : "#DC2626",
                    fontWeight: 700,
                  }}
                >
                  {formatINR(activeMonth.net, { showSign: true })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
