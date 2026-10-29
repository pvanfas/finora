"use client";

import React, { useState, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatINR, parseTxDate } from "@/lib/formatters";
import { SortOption, Transaction } from "@/types/finance";
import { TransactionDetailModal } from "@/components/modals/TransactionDetailModal";

interface RecentTransactionsProps {
  expensesOnly?: boolean;
  incomesOnly?: boolean;
}

export function RecentTransactions({
  expensesOnly,
  incomesOnly,
}: RecentTransactionsProps) {
  const pathname = usePathname();
  const isExpensePage = expensesOnly ?? pathname === "/expenses";
  const isIncomePage = incomesOnly ?? pathname === "/incomes";
  const pageThemeColor = isExpensePage ? '#DC2626' : isIncomePage ? '#10B981' : 'var(--primary-accent)';
  const pageThemeLight = isExpensePage ? '#FEF2F2' : isIncomePage ? '#ECFDF5' : 'var(--primary-accent-light)';


  const {
    transactions,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
  } = useDashboard();

  const [typeFilter, setTypeFilter] = useState<"All" | "income" | "expense">("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const pageSize = 20;

  const filterMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(
    filterMenuRef,
    () => setShowFilterMenu(false),
    showFilterMenu,
  );
  useClickOutside(sortMenuRef, () => setShowSortMenu(false), showSortMenu);

  // Reset filters when navigating routes so categories from other pages don't get stuck
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setCategoryFilter("All");
    setTypeFilter("All");
    setCurrentPage(1);
  }

  // Available categories depending on context
  const availableCategories = isIncomePage
    ? (["All", "CONTRIBUTION", "PROJECT"] as const)
    : isExpensePage
      ? (["All", "OPEX", "CAPEX", "PROJECT"] as const)
      : (["All", "OPEX", "CAPEX", "PROJECT", "CONTRIBUTION"] as const);

  const isFilterActive = categoryFilter !== "All" || typeFilter !== "All";

  // Filter and sort transactions
  const processedTransactions = useMemo(() => {
    return transactions
      .filter((item) => {
        // Filter by page type
        if (isExpensePage && item.amount >= 0) return false;
        if (isIncomePage && item.amount <= 0) return false;

        // Filter by transaction type on homepage / mixed view
        if (!isExpensePage && !isIncomePage) {
          if (typeFilter === "income" && item.amount <= 0) return false;
          if (typeFilter === "expense" && item.amount >= 0) return false;
        }

        // Filter by category
        if (categoryFilter !== "All" && item.category !== categoryFilter)
          return false;

        // Filter by search query (safe check across all fields)
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase().trim();
          const cleanAmountQuery = query.replace(/[^\d.]/g, "");

          const nameMatch = Boolean(
            (item.name && item.name.toLowerCase().includes(query)) ||
            (item.title && item.title.toLowerCase().includes(query))
          );
          const categoryMatch = Boolean(
            item.category && item.category.toLowerCase().includes(query)
          );
          const accountMatch = Boolean(
            item.account && item.account.toLowerCase().includes(query)
          );
          const paymentMethodMatch = Boolean(
            item.paymentMethod && item.paymentMethod.toLowerCase().includes(query)
          );
          const dateMatch = Boolean(
            (item.date && item.date.toLowerCase().includes(query)) ||
            (item.transactionDate && item.transactionDate.toLowerCase().includes(query))
          );
          const idMatch = Boolean(
            item.id && item.id.toLowerCase().includes(query)
          );
          const remarksMatch = Boolean(
            item.remarks && item.remarks.toLowerCase().includes(query)
          );
          const amountMatch = Boolean(
            cleanAmountQuery !== "" &&
            String(Math.abs(item.amount)).includes(cleanAmountQuery)
          );

          return (
            nameMatch ||
            categoryMatch ||
            accountMatch ||
            paymentMethodMatch ||
            dateMatch ||
            idMatch ||
            remarksMatch ||
            amountMatch
          );
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "amount-high":
            return Math.abs(b.amount) - Math.abs(a.amount);
          case "amount-low":
            return Math.abs(a.amount) - Math.abs(b.amount);
          case "date-asc": {
            const timeA = parseTxDate(a.date);
            const timeB = parseTxDate(b.date);
            if (timeA !== timeB) return timeA - timeB;
            return a.id.localeCompare(b.id);
          }
          case "date-desc":
          default: {
            const timeA = parseTxDate(a.date);
            const timeB = parseTxDate(b.date);
            if (timeB !== timeA) return timeB - timeA;
            return b.id.localeCompare(a.id);
          }
        }
      });
  }, [
    transactions,
    isExpensePage,
    isIncomePage,
    typeFilter,
    categoryFilter,
    searchQuery,
    sortBy,
  ]);

  // Reset page when filters change
  const filterKey = `${categoryFilter}-${typeFilter}-${searchQuery}-${sortBy}-${isExpensePage}-${isIncomePage}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
  }

  // Pagination calculation
  const totalItems = processedTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentTransactions = processedTransactions.slice(startIndex, endIndex);

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: "date-desc", label: "Date: Newest first" },
    { id: "date-asc", label: "Date: Oldest first" },
    { id: "amount-high", label: "Amount: Highest first" },
    { id: "amount-low", label: "Amount: Lowest first" },
  ];

  // Red icon for expense, green icon for income
  const renderTransactionIcon = (tx: Transaction) => {
    const isExpense = isExpensePage ? true : isIncomePage ? false : tx.amount < 0;

    if (isExpense) {
      return (
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            backgroundColor: "rgb(254, 242, 242)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgb(220, 38, 38)",
            flexShrink: 0,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-arrow-up-right"
            aria-hidden="true"
          >
            <path d="M7 7h10v10"></path>
            <path d="M7 17 17 7"></path>
          </svg>
        </div>
      );
    }

    return (
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          backgroundColor: "rgb(236, 253, 245)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgb(22, 163, 74)",
          flexShrink: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-arrow-down-right"
          aria-hidden="true"
        >
          <path d="m7 7 10 10"></path>
          <path d="M17 7v10H7"></path>
        </svg>
      </div>
    );
  };

  return (
    <div
      className="recent-transactions-card"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <div className="card-header-responsive">
        <div>
          <h2
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.02em",
              marginBottom: "4px",
            }}
          >
            {isIncomePage
              ? "Recent Income Transactions"
              : isExpensePage
                ? "Recent Expense Transactions"
                : "Recent Transactions"}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <p style={{ fontSize: "13.5px", color: "#6B7280", margin: 0 }}>
              {searchQuery.trim() !== ""
                ? `Showing ${totalItems} results matching "${searchQuery}".`
                : isIncomePage
                  ? `Review your partner capital contributions and project revenue credits (${totalItems} total).`
                  : isExpensePage
                    ? `Review your recent expense debits (${totalItems} total).`
                    : `Review all recent income credits and expense debits (${totalItems} total).`}
            </p>
            {searchQuery.trim() !== "" && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  backgroundColor: "#FEF3C7",
                  color: "#92400E",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  border: "1px solid #FDE68A",
                  cursor: "pointer",
                }}
              >
                <span>Clear search</span>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="card-header-actions">
          {/* Quick Segmented Type Filter on Homepage / Mixed view */}
          {!isExpensePage && !isIncomePage && (
            <div
              style={{
                display: "inline-flex",
                backgroundColor: "#F3F4F6",
                borderRadius: "9999px",
                padding: "3px",
                gap: "2px",
              }}
            >
              <button
                onClick={() => setTypeFilter("All")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  fontSize: "12.5px",
                  fontWeight: typeFilter === "All" ? 700 : 500,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: typeFilter === "All" ? "#FFFFFF" : "transparent",
                  color: typeFilter === "All" ? "#111827" : "#6B7280",
                  boxShadow: typeFilter === "All" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter("income")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  fontSize: "12.5px",
                  fontWeight: typeFilter === "income" ? 700 : 500,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: typeFilter === "income" ? "#ECFDF5" : "transparent",
                  color: typeFilter === "income" ? "#16A34A" : "#6B7280",
                  boxShadow: typeFilter === "income" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                Incomes
              </button>
              <button
                onClick={() => setTypeFilter("expense")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  fontSize: "12.5px",
                  fontWeight: typeFilter === "expense" ? 700 : 500,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: typeFilter === "expense" ? "#FEF2F2" : "transparent",
                  color: typeFilter === "expense" ? "#DC2626" : "#6B7280",
                  boxShadow: typeFilter === "expense" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                Expenses
              </button>
            </div>
          )}

          {/* Filter Dropdown Container */}
          <div ref={filterMenuRef} style={{ position: "relative" }}>
            <button
              onClick={() => {
                setShowFilterMenu((prev) => !prev);
                setShowSortMenu(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                borderRadius: "9999px",
                backgroundColor: isFilterActive ? pageThemeLight : "#FFFFFF",
                border: isFilterActive ? `1px solid ${pageThemeColor}` : "1px solid #E5E7EB",
                fontSize: "13px",
                fontWeight: 500,
                color: isFilterActive ? pageThemeColor : "#374151",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
              {isFilterActive && (
                <span
                  style={{
                    backgroundColor: pageThemeColor, borderRadius: "50%", width: "6px", height: "6px",
                  }}
                />
              )}
            </button>

            {/* Filter Menu Dropdown */}
            {showFilterMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "115%",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "14px",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
                  border: "1px solid #ECEEF2",
                  padding: "14px",
                  zIndex: 30,
                  minWidth: "220px",
                }}
                className="animate-slide-down"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#111827",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Category
                  </span>
                  {isFilterActive && (
                    <button
                      onClick={() => {
                        setCategoryFilter("All");
                        setTypeFilter("All");
                      }}
                      style={{
                        fontSize: "11.5px",
                        color: "var(--primary-accent)",
                        fontWeight: 600,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    marginBottom: "12px",
                  }}
                >
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color:
                          categoryFilter === cat ? pageThemeColor : "#374151",
                        backgroundColor:
                          categoryFilter === cat ? pageThemeLight : "transparent",
                        fontWeight: categoryFilter === cat ? 600 : 400,
                        textAlign: "left",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <span>{cat}</span>
                      {categoryFilter === cat && (
                        <Check size={14} color={pageThemeColor} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort By Dropdown Container */}
          <div ref={sortMenuRef} style={{ position: "relative" }}>
            <button
              onClick={() => {
                setShowSortMenu((prev) => !prev);
                setShowFilterMenu(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                borderRadius: "9999px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
                cursor: "pointer",
              }}
            >
              <ArrowUpDown size={14} />
              <span>Sort</span>
            </button>

            {showSortMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "115%",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "14px",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
                  border: "1px solid #ECEEF2",
                  padding: "8px",
                  zIndex: 30,
                  minWidth: "170px",
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
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color:
                        sortBy === s.id ? pageThemeColor : "#374151",
                      backgroundColor:
                        sortBy === s.id ? pageThemeLight : "transparent",
                      fontWeight: sortBy === s.id ? 600 : 400,
                      border: "none",
                      cursor: "pointer",
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
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#FAFAFC", borderRadius: "8px" }}>
              <th
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#6B7280",
                  borderTopLeftRadius: "8px",
                  borderBottomLeftRadius: "8px",
                }}
              >
                Transaction
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#6B7280",
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#6B7280",
                  width: isIncomePage ? "20%" : "18%",
                  minWidth: isIncomePage ? "160px" : "140px",
                  whiteSpace: "nowrap",
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#6B7280",
                }}
              >
                Remarks
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#6B7280",
                  textAlign: "right",
                  width: "16%",
                  minWidth: "150px",
                  whiteSpace: "nowrap",
                  borderTopRightRadius: "8px",
                  borderBottomRightRadius: "8px",
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "36px 16px",
                    textAlign: "center",
                    color: "#8A92A6",
                    fontSize: "14px",
                  }}
                >
                  {searchQuery.trim() !== "" ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <div>No transactions found matching &ldquo;{searchQuery}&rdquo;.</div>
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          backgroundColor: "#F3F4F6",
                          border: "1px solid #D1D5DB",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "#374151",
                          cursor: "pointer",
                        }}
                      >
                        Clear Search
                      </button>
                    </div>
                  ) : (
                    "No transactions match the selected criteria."
                  )}
                </td>
              </tr>
            ) : (
              currentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  style={{
                    borderBottom: "1px solid #F3F4F6",
                    transition: "background-color 0.15s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F9FAFB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Click to view details"
                >
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {renderTransactionIcon(tx)}
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827" }}>
                          {tx.name}
                        </div>
                        {tx.account ? (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#8A92A6",
                              fontWeight: 400,
                              marginTop: "2px",
                            }}
                          >
                            {tx.account} &bull; {tx.paymentMethod || 'Bank Transfer'}
                          </div>
                        ) : tx.paymentMethod ? (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#8A92A6",
                              fontWeight: 400,
                              marginTop: "2px",
                            }}
                          >
                            {tx.paymentMethod}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "13.5px",
                      color: "#4B5563",
                    }}
                  >
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        backgroundColor: tx.amount < 0 ? "#FEF2F2" : "#ECFDF5",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: tx.amount < 0 ? "#DC2626" : "#16A34A",
                        border: tx.amount < 0 ? "1px solid #FEE2E2" : "1px solid #D1FAE5",
                      }}
                    >
                      {tx.category}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "13.5px",
                      color: "#6B7280",
                      width: isIncomePage ? "20%" : "18%",
                      minWidth: isIncomePage ? "160px" : "140px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tx.date}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "13px",
                      color: tx.remarks ? "#4B5563" : "#9CA3AF",
                      maxWidth: "220px",
                    }}
                  >
                    {tx.remarks ? (
                      <span
                        style={{
                          display: "inline-block",
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={tx.remarks}
                      >
                        {tx.remarks}
                      </span>
                    ) : (
                      <span style={{ color: "#D1D5DB" }}>—</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "14px",
                      fontWeight: 700,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      color: tx.amount > 0 ? "#16A34A" : "#DC2626",
                    }}
                  >
                    {formatINR(tx.amount, { showSign: true, decimals: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View: High-Fidelity Transaction Cards (Screens <= 680px) */}
      <div className="mobile-transaction-list">
        {currentTransactions.length === 0 ? (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "#8A92A6",
              fontSize: "13.5px",
            }}
          >
            {searchQuery.trim() !== "" ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <div>No transactions found matching &ldquo;{searchQuery}&rdquo;.</div>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    backgroundColor: "#F3F4F6",
                    border: "1px solid #D1D5DB",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              "No transactions match the selected criteria."
            )}
          </div>
        ) : (
          currentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="mobile-tx-item"
              onClick={() => setSelectedTransaction(tx)}
              style={{ cursor: "pointer" }}
              title="Click to view details"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flex: 1,
                  minWidth: 0,
                  paddingRight: "12px",
                }}
              >
                {renderTransactionIcon(tx)}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#111827",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tx.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6B7280",
                      marginTop: "3px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ color: tx.amount < 0 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>{tx.category}</span>
                    <span>&bull;</span>
                    <span>{tx.date}</span>
                  </div>
                  {tx.remarks && (
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "#9CA3AF",
                        marginTop: "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={tx.remarks}
                    >
                      {tx.remarks}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: "14.5px",
                    fontWeight: 700,
                    color: tx.amount > 0 ? "#16A34A" : "#DC2626",
                  }}
                >
                  {formatINR(tx.amount, { showSign: true, decimals: 2 })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div
          className="pagination-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            paddingTop: "18px",
            marginTop: "12px",
            borderTop: "1px solid #F3F4F6",
          }}
        >
          <div className="pagination-info" style={{ fontSize: "13px", color: "#6B7280" }}>
            Showing{" "}
            <span style={{ fontWeight: 600, color: "#111827" }}>
              {totalItems > 0 ? startIndex + 1 : 0}
            </span>{" "}
            to{" "}
            <span style={{ fontWeight: 600, color: "#111827" }}>
              {endIndex}
            </span>{" "}
            of{" "}
            <span style={{ fontWeight: 600, color: "#111827" }}>
              {totalItems}
            </span>{" "}
            transactions
          </div>

          <div className="pagination-controls" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              className="pagination-nav-btn pagination-prev-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                backgroundColor: currentPage === 1 ? "#F9FAFB" : "#FFFFFF",
                color: currentPage === 1 ? "#9CA3AF" : "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <ChevronLeft size={15} />
              <span>Prev</span>
            </button>

            {/* Desktop Numbered Page Buttons */}
            <div className="pagination-numbers-desktop" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (currentPage <= 4) {
                    pages.push(1, 2, 3, 4, 5, "...", totalPages);
                  } else if (currentPage >= totalPages - 3) {
                    pages.push(
                      1,
                      "...",
                      totalPages - 4,
                      totalPages - 3,
                      totalPages - 2,
                      totalPages - 1,
                      totalPages,
                    );
                  } else {
                    pages.push(
                      1,
                      "...",
                      currentPage - 1,
                      currentPage,
                      currentPage + 1,
                      "...",
                      totalPages,
                    );
                  }
                }

                return pages.map((page, idx) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        style={{
                          padding: "0 4px",
                          color: "#9CA3AF",
                          fontSize: "13px",
                          userSelect: "none",
                        }}
                      >
                        ...
                      </span>
                    );
                  }

                  const pageNum = Number(page);
                  const isActive = currentPage === pageNum;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        minWidth: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: isActive ? `1px solid ${pageThemeColor}` : "1px solid #E5E7EB",
                        backgroundColor: isActive ? pageThemeColor : "#FFFFFF",
                        color: isActive ? "#FFFFFF" : "#374151",
                        fontSize: "13px",
                        fontWeight: isActive ? 700 : 500,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                });
              })()}
            </div>

            {/* Mobile Compact Page Indicator */}
            <div className="pagination-mobile-indicator">
              <span>
                Page <strong style={{ color: "#111827" }}>{currentPage}</strong> of{" "}
                <strong style={{ color: "#111827" }}>{totalPages}</strong>
              </span>
            </div>

            <button
              className="pagination-nav-btn pagination-next-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                backgroundColor:
                  currentPage === totalPages ? "#F9FAFB" : "#FFFFFF",
                color: currentPage === totalPages ? "#9CA3AF" : "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Transaction Detail & Edit Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
