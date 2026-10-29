'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  BudgetCategory,
  DaySpending,
  AccentTheme,
  SortOption,
  AccountOption,
  TransactionCategory,
} from '@/types';
import {
  CURRENCY_SYMBOL,
  DEFAULT_MONTHLY_BUDGET,
  DEFAULT_SAVINGS_GROWTH,
  ACCENT_THEMES,
} from '@/constants';
import { formatINR, parseTxDate, applyThemeToDOM, persistTheme, getInitialTheme } from '@/lib';

// Re-export for any legacy direct imports
export { ACCENT_THEMES };
export type { Transaction, BudgetCategory, DaySpending, AccentTheme };

export interface InitialDashboardData {
  transactions: Transaction[];
  trendData: DaySpending[];
  settings?: {
    monthlyBudget?: number;
    savings?: number;
    savingsGrowth?: number;
    currencySymbol?: string;
    accentThemeId?: string;
  };
  expenseAccounts?: {
    id: number;
    type: string;
    code: string;
    name: string;
    accountLabel?: string;
  }[];
  incomeAccounts?: {
    id: number;
    type: string;
    code: string;
    name: string;
    accountLabel?: string;
  }[];
}

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
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;

  // Chart & Budget States
  selectedTrendDay: string;
  setSelectedTrendDay: (day: string) => void;
  trendData: DaySpending[];
  budgetPlan: BudgetCategory[];

  // Accounts State (Stored in DB only)
  expenseAccounts: AccountOption[];
  incomeAccounts: AccountOption[];
  refreshAccounts: () => Promise<void>;

  // Modals & Theme
  isCustomizeOpen: boolean;
  setIsCustomizeOpen: (open: boolean) => void;
  isAddTransactionOpen: boolean;
  setIsAddTransactionOpen: (open: boolean) => void;
  addTransactionType: 'expense' | 'income';
  setAddTransactionType: (type: 'expense' | 'income') => void;
  openAddTransaction: (type?: 'expense' | 'income') => void;
  accentTheme: AccentTheme;
  setAccentTheme: (themeId: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: InitialDashboardData | null;
}) {
  const [monthlyBudget, setMonthlyBudget] = useState(
    () => initialData?.settings?.monthlyBudget ?? DEFAULT_MONTHLY_BUDGET
  );
  const [savings] = useState(720);
  const [savingsGrowth] = useState(DEFAULT_SAVINGS_GROWTH);

  const [accentTheme, setAccentState] = useState<AccentTheme>(() => getInitialTheme());

  const [transactions, setTransactions] = useState<Transaction[]>(() => initialData?.transactions || []);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  const [selectedTrendDay, setSelectedTrendDay] = useState('');
  const [trendData, setTrendData] = useState<DaySpending[]>(() => initialData?.trendData || []);
  const [budgetPlan] = useState<BudgetCategory[]>([]);

  // Accounts pre-fetched via RSC or loaded dynamically from DB
  const [expenseAccounts, setExpenseAccounts] = useState<AccountOption[]>(() =>
    initialData?.expenseAccounts
      ? initialData.expenseAccounts.map((a) => ({
          id: a.id,
          type: a.type,
          code: a.code,
          name: a.name,
          accountLabel: a.accountLabel || `${a.code} - ${a.name}`,
          category: a.type as TransactionCategory,
        }))
      : []
  );
  const [incomeAccounts, setIncomeAccounts] = useState<AccountOption[]>(() =>
    initialData?.incomeAccounts
      ? initialData.incomeAccounts.map((a) => ({
          id: a.id,
          type: a.type,
          code: a.code,
          name: a.name,
          accountLabel: a.accountLabel || `${a.code} - ${a.name}`,
          category: (a.type === 'CONTRIBUTION' ? 'CONTRIBUTION' : 'PROJECT') as TransactionCategory,
        }))
      : []
  );

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [addTransactionType, setAddTransactionType] = useState<'expense' | 'income'>('expense');

  interface ApiAccountItem {
    id: number;
    type: string;
    code: string;
    name: string;
    accountLabel?: string;
  }

  const refreshAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        console.warn('[DashboardContext] refreshAccounts failed:', errData?.error || `HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.expenseAccounts)) {
          setExpenseAccounts(
            data.expenseAccounts.map((a: ApiAccountItem) => ({
              id: a.id,
              type: a.type,
              code: a.code,
              name: a.name,
              accountLabel: a.accountLabel || `${a.code} - ${a.name}`,
              category: a.type as TransactionCategory,
            }))
          );
        }
        if (Array.isArray(data.incomeAccounts)) {
          setIncomeAccounts(
            data.incomeAccounts.map((a: ApiAccountItem) => ({
              id: a.id,
              type: a.type,
              code: a.code,
              name: a.name,
              accountLabel: a.accountLabel || `${a.code} - ${a.name}`,
              category: (a.type === 'CONTRIBUTION' ? 'CONTRIBUTION' : 'PROJECT') as TransactionCategory,
            }))
          );
        }
      }
    } catch (err) {
      console.warn('[DashboardContext] refreshAccounts network error:', err);
    }
  };

  const openAddTransaction = (type: 'expense' | 'income' = 'expense') => {
    setAddTransactionType(type);
    setIsAddTransactionOpen(true);
  };

  // Sync theme to DOM
  useEffect(() => {
    applyThemeToDOM(accentTheme);
  }, [accentTheme]);

  // Sync data from backend on mount (skips if already populated by RSC)
  useEffect(() => {
    if (initialData && initialData.transactions.length > 0) {
      return;
    }

    let isMounted = true;

    async function loadInitialData() {
      try {
        const [dataRes, accountsRes] = await Promise.all([
          fetch('/api/data').then((r) => r.json()),
          fetch('/api/accounts').then((r) => r.json()),
        ]);

        if (!isMounted) return;

        if (dataRes.success && dataRes.data) {
          if (Array.isArray(dataRes.data.transactions)) {
            setTransactions(dataRes.data.transactions);
          }
          if (Array.isArray(dataRes.data.trendData)) {
            setTrendData(dataRes.data.trendData);
          }
          if (typeof dataRes.data.settings?.monthlyBudget === 'number') {
            setMonthlyBudget(dataRes.data.settings.monthlyBudget);
          }
        }

        if (accountsRes.success) {
          if (Array.isArray(accountsRes.expenseAccounts)) {
            setExpenseAccounts(
              accountsRes.expenseAccounts.map((a: ApiAccountItem) => ({
                id: a.id,
                type: a.type,
                code: a.code,
                name: a.name,
                accountLabel: a.accountLabel || `${a.code} - ${a.name}`,
                category: a.type as TransactionCategory,
              }))
            );
          }
          if (Array.isArray(accountsRes.incomeAccounts)) {
            setIncomeAccounts(
              accountsRes.incomeAccounts.map((a: ApiAccountItem) => ({
                id: a.id,
                type: a.type,
                code: a.code,
                name: a.name,
                accountLabel: a.accountLabel || `${a.code} - ${a.name}`,
                category: (a.type === 'CONTRIBUTION' ? 'CONTRIBUTION' : 'PROJECT') as TransactionCategory,
              }))
            );
          }
        }
      } catch {
        // Fail-safe
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [initialData]);

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
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const cleanAmountQuery = query.replace(/[^\d.]/g, '');

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
        const amountMatch = Boolean(
          cleanAmountQuery !== '' &&
          String(Math.abs(item.amount)).includes(cleanAmountQuery)
        );

        return (
          nameMatch ||
          categoryMatch ||
          accountMatch ||
          paymentMethodMatch ||
          dateMatch ||
          idMatch ||
          amountMatch
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
        case 'date-asc': {
          const timeA = parseTxDate(a.date);
          const timeB = parseTxDate(b.date);
          if (timeA !== timeB) return timeA - timeB;
          return a.id.localeCompare(b.id);
        }
        case 'date-desc':
        default: {
          const timeA = parseTxDate(a.date);
          const timeB = parseTxDate(b.date);
          if (timeB !== timeA) return timeB - timeA;
          return b.id.localeCompare(a.id);
        }
      }
    });

  // Optimistic transaction addition with server ID reconciliation & error rollback
  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTx: Transaction = {
      ...newTx,
      id: tempId,
      category: newTx.category as Transaction['category'],
    };

    // 1. Optimistic UI update: prepend to list immediately
    setTransactions((prev) => [optimisticTx, ...prev]);

    // 2. Optimistic trend update if expense
    if (optimisticTx.amount < 0) {
      setTrendData((prev) => {
        if (prev.length === 0) return prev;
        const lastIdx = prev.length - 1;
        const updated = [...prev];
        updated[lastIdx] = {
          ...updated[lastIdx],
          amount: updated[lastIdx].amount + Math.abs(optimisticTx.amount),
        };
        return updated;
      });
    }

    // 3. Persist and reconcile server ID or rollback on error
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(optimisticTx),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || `Failed to save transaction (${res.status})`);
        }
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Save failed');
        if (json.transaction) {
          // Reconcile optimistic temp ID with database-persisted transaction
          setTransactions((prev) =>
            prev.map((t) => (t.id === tempId ? json.transaction : t))
          );
        }
      })
      .catch((err) => {
        console.error('Optimistic addTransaction failed, rolling back:', err);
        setTransactions((prev) => prev.filter((t) => t.id !== tempId));
      });
  };

  // Optimistic transaction deletion with rollback on error
  const deleteTransaction = async (id: string): Promise<boolean> => {
    const targetTx = transactions.find((t) => t.id === id);
    if (!targetTx) return false;

    // Optimistic UI removal
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    // If it is an unsaved optimistic record, remove immediately without server roundtrip
    if (id.startsWith('temp-')) {
      return true;
    }

    try {
      const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to delete transaction (${res.status})`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Delete failed');
      return true;
    } catch (err) {
      console.error('Optimistic deleteTransaction failed, rolling back:', err);
      // Rollback
      setTransactions((prev) => [targetTx, ...prev]);
      return false;
    }
  };

  // Optimistic transaction update with rollback on error
  const updateTransaction = async (
    id: string,
    updates: Partial<Transaction>
  ): Promise<boolean> => {
    const originalTx = transactions.find((t) => t.id === id);
    if (!originalTx) return false;

    const updatedTx: Transaction = {
      ...originalTx,
      ...updates,
      id,
    };

    // 1. Optimistic state update
    setTransactions((prev) => prev.map((t) => (t.id === id ? updatedTx : t)));

    try {
      const res = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Failed to update transaction (${res.status})`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Update failed');
      return true;
    } catch (err) {
      console.error('Optimistic updateTransaction failed, rolling back:', err);
      // Rollback
      setTransactions((prev) => prev.map((t) => (t.id === id ? originalTx : t)));
      return false;
    }
  };

  const updateBudget = (newBudget: number) => {
    setMonthlyBudget(newBudget);
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
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        addTransaction,
        updateTransaction,
        deleteTransaction,

        selectedTrendDay,
        setSelectedTrendDay,
        trendData,
        budgetPlan,

        expenseAccounts,
        incomeAccounts,
        refreshAccounts,

        isCustomizeOpen,
        setIsCustomizeOpen,
        isAddTransactionOpen,
        setIsAddTransactionOpen,
        addTransactionType,
        setAddTransactionType,
        openAddTransaction,
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
