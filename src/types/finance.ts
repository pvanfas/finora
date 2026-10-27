export type TransactionCategory =
  | 'Food & Dining'
  | 'Entertainment'
  | 'Shopping'
  | 'Transport'
  | 'Utilities & Bills'
  | 'Housing & Rent'
  | 'Healthcare'
  | 'Education'
  | 'Investments'
  | 'Others';

export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';

export interface Transaction {
  id: string;
  name: string;
  category: TransactionCategory;
  amount: number; // Negative for debits/expenses, positive for credits/income
  status: TransactionStatus;
  date: string;
  paymentMethod?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  percentage: number;
  spent: number;
  limit: number;
  color: string;
  bgLight: string;
}

export interface DaySpending {
  day: string; // e.g. '15th', '16th'
  dateLabel: string;
  amount: number;
}

export interface SpendingSegment {
  label: TransactionCategory;
  percentage: number;
  color: string;
  patternId?: string;
  amount: string;
}

export type SortOption = 'date-desc' | 'date-asc' | 'amount-high' | 'amount-low';
