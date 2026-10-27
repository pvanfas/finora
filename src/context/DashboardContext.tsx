'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  BudgetCategory,
  DaySpending,
  AccentTheme,
  SortOption,
} from '@/types';
import {
  CURRENCY_SYMBOL,
  DEFAULT_MONTHLY_BUDGET,
  DEFAULT_SAVINGS_GROWTH,
  INITIAL_TRANSACTIONS,
  INITIAL_TREND,
  INITIAL_BUDGET_PLAN,
  ACCENT_THEMES,
} from '@/constants';
import { formatINR, applyThemeToDOM, persistTheme, getInitialTheme } from '@/lib';

// Re-export for any legacy direct imports
export { ACCENT_THEMES };
export type { Transaction, BudgetCategory, DaySpending, AccentTheme };

interface DashboardContextType {
  // Monetary State
  currencySymbol: string;
  monthlyBudget: number;
  spent: number;
  remaining: number;
  savings: number;
  savingsGrowth: number;
  updateBudget: (newBudget: number) => void;
  formatCurrency: (amount: number, options?: { showSign?: boolean; decimals?: number }) => string;

  // Transactions State
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;

  // Chart & Budget States
  selectedTrendDay: string;
  setSelectedTrendDay: (day: string) => void;
  trendData: DaySpending[];
  budgetPlan: BudgetCategory[];

  // Modals & Theme
  isCustomizeOpen: boolean;
  setIsCustomizeOpen: (open: boolean) => void;
  isAddTransactionOpen: boolean;
  setIsAddTransactionOpen: (open: boolean) => void;
  accentTheme: AccentTheme;
  setAccentTheme: (themeId: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [monthlyBudget, setMonthlyBudget] = useState(DEFAULT_MONTHLY_BUDGET);
  const [savings] = useState(720);
  const [savingsGrowth] = useState(DEFAULT_SAVINGS_GROWTH);

  const [accentTheme, setAccentState] = useState<AccentTheme>(() => getInitialTheme());

  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  const [selectedTrendDay, setSelectedTrendDay] = useState('17th');
  const [trendData] = useState<DaySpending[]>(INITIAL_TREND);
  const [budgetPlan] = useState<BudgetCategory[]>(INITIAL_BUDGET_PLAN);

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  // Sync theme to DOM
  useEffect(() => {
    applyThemeToDOM(accentTheme);
  }, [accentTheme]);

  // Sync data from lowdb backend on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/data')
      .then((res) => res.json())
      .then((res) => {
        if (isMounted && res.success && res.data) {
          if (Array.isArray(res.data.transactions)) {
            setTransactions(res.data.transactions);
          }
          if (typeof res.data.settings?.monthlyBudget === 'number') {
            setMonthlyBudget(res.data.settings.monthlyBudget);
          }
        }
      })
      .catch(() => {
        // Fall back gracefully to local default data
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setAccentTheme = (themeId: string) => {
    const found = ACCENT_THEMES.find((t) => t.id === themeId);
    if (!found) return;

    setAccentState(found);
    applyThemeToDOM(found);
    persistTheme(themeId);
  };

  // Live spent metric derived from completed debits
  const spent = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const remaining = Math.max(0, monthlyBudget - spent);

  const formatCurrency = (amount: number, options?: { showSign?: boolean; decimals?: number }) => {
    return formatINR(amount, options);
  };

  // Filtered and sorted transactions selector
  const filteredTransactions = transactions
    .filter((item) => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.paymentMethod && item.paymentMethod.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount-high':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'amount-low':
          return Math.abs(a.amount) - Math.abs(b.amount);
        case 'date-asc':
          return a.id.localeCompare(b.id);
        case 'date-desc':
        default:
          return b.id.localeCompare(a.id);
      }
    });

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const id = `tx-${Date.now()}`;
    const tx: Transaction = {
      ...newTx,
      id,
      category: newTx.category as Transaction['category'],
    };
    // Optimistic UI update
    setTransactions((prev) => [tx, ...prev]);

    // Persist to lowdb backend
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    }).catch(() => {});
  };

  const updateBudget = (newBudget: number) => {
    setMonthlyBudget(newBudget);

    // Persist to lowdb backend
    fetch('/api/budget', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthlyBudget: newBudget }),
    }).catch(() => {});
  };

  return (
    <DashboardContext.Provider
      value={{
        currencySymbol: CURRENCY_SYMBOL,
        monthlyBudget,
        spent,
        remaining,
        savings,
        savingsGrowth,
        updateBudget,
        formatCurrency,

        transactions,
        filteredTransactions,
        categoryFilter,
        setCategoryFilter,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        addTransaction,

        selectedTrendDay,
        setSelectedTrendDay,
        trendData,
        budgetPlan,

        isCustomizeOpen,
        setIsCustomizeOpen,
        isAddTransactionOpen,
        setIsAddTransactionOpen,
        accentTheme,
        setAccentTheme,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
