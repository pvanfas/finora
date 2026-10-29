export type TransactionCategory =
  | 'OPEX'
  | 'CAPEX'
  | 'PROJECT'
  | 'CONTRIBUTION';


export interface AccountOption {
  id?: number;
  type: string;
  code: string;
  name: string;
  accountLabel?: string;
  category: TransactionCategory;
}

export interface Transaction {
  id: string;
  name: string;
  title?: string;
  category: TransactionCategory;
  amount: number; // Negative for debits/expenses, positive for credits/income
  date: string;
  transactionDate?: string;
  account?: string;
  paymentMethod?: string;
  remarks?: string;
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
