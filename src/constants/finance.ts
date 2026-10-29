import { Transaction, BudgetCategory, DaySpending } from '@/types/finance';

export const CURRENCY_SYMBOL = '₹';

export const DEFAULT_MONTHLY_BUDGET = 4500;
export const DEFAULT_SAVINGS_GROWTH = 12.4;

export const CATEGORIES = [
  'All',
  'OPEX',
  'CAPEX',
  'PROJECT',
  'CONTRIBUTION',
] as const;

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_TREND: DaySpending[] = [];

export const INITIAL_BUDGET_PLAN: BudgetCategory[] = [];
