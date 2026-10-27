import { Transaction, BudgetCategory, DaySpending } from '@/types/finance';

export const CURRENCY_SYMBOL = '₹';

export const DEFAULT_MONTHLY_BUDGET = 4500;
export const DEFAULT_SAVINGS_GROWTH = 12.4;

export const CATEGORIES = [
  'All',
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Others',
] as const;

export const STATUSES = ['All', 'Completed', 'Pending'] as const;

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    name: 'Gourmet Kitchen & Lounge',
    category: 'Food & Dining',
    amount: -450.0,
    status: 'Completed',
    date: 'Today, 2:30 PM',
    paymentMethod: 'Credit Card (••4892)',
  },
  {
    id: 'tx-2',
    name: 'Netflix 4K Premium',
    category: 'Entertainment',
    amount: -199.0,
    status: 'Pending',
    date: 'Yesterday, 9:15 AM',
    paymentMethod: 'Subscription Debit',
  },
  {
    id: 'tx-3',
    name: 'Apple Store Downtown',
    category: 'Shopping',
    amount: -1280.0,
    status: 'Completed',
    date: 'Aug 24, 2026',
    paymentMethod: 'Apple Pay',
  },
  {
    id: 'tx-4',
    name: 'Metro Line Rapid Pass',
    category: 'Transport',
    amount: -85.0,
    status: 'Completed',
    date: 'Aug 23, 2026',
    paymentMethod: 'Transit Card',
  },
  {
    id: 'tx-5',
    name: 'Whole Foods Market Organic',
    category: 'Food & Dining',
    amount: -326.5,
    status: 'Completed',
    date: 'Aug 21, 2026',
    paymentMethod: 'Debit Card (••1024)',
  },
  {
    id: 'tx-6',
    name: 'Amazon Prime Essentials',
    category: 'Shopping',
    amount: -499.0,
    status: 'Completed',
    date: 'Aug 20, 2026',
    paymentMethod: 'UPI Direct',
  },
];

export const INITIAL_TREND: DaySpending[] = [
  { day: '15th', dateLabel: 'Aug 15', amount: 3200 },
  { day: '16th', dateLabel: 'Aug 16', amount: 4800 },
  { day: '17th', dateLabel: 'Aug 17', amount: 7452 }, // highlighted active bar
  { day: '18th', dateLabel: 'Aug 18', amount: 5100 },
  { day: '19th', dateLabel: 'Aug 19', amount: 3900 },
  { day: '20th', dateLabel: 'Aug 20', amount: 6200 },
  { day: '21st', dateLabel: 'Aug 21', amount: 4600 },
];

export const INITIAL_BUDGET_PLAN: BudgetCategory[] = [
  {
    id: 'bp-1',
    name: 'Food & Dining',
    percentage: 76,
    spent: 912,
    limit: 1200,
    color: 'var(--primary-accent)',
    bgLight: 'var(--primary-accent-light)',
  },
  {
    id: 'bp-2',
    name: 'Transport',
    percentage: 40,
    spent: 320,
    limit: 800,
    color: '#85E0A3',
    bgLight: '#ECFDF5',
  },
  {
    id: 'bp-3',
    name: 'Shopping',
    percentage: 55,
    spent: 550,
    limit: 1000,
    color: '#EE6CE7',
    bgLight: '#FDF2FD',
  },
  {
    id: 'bp-4',
    name: 'Entertainment',
    percentage: 35,
    spent: 210,
    limit: 600,
    color: '#F59E0B',
    bgLight: '#FEF3C7',
  },
  {
    id: 'bp-5',
    name: 'Utilities & Bills',
    percentage: 66,
    spent: 1450,
    limit: 2200,
    color: '#0284C7',
    bgLight: '#F0F9FF',
  },
  {
    id: 'bp-6',
    name: 'Housing & Rent',
    percentage: 93,
    spent: 14000,
    limit: 15000,
    color: '#8B5CF6',
    bgLight: '#F5F3FF',
  },
  {
    id: 'bp-7',
    name: 'Healthcare',
    percentage: 43,
    spent: 650,
    limit: 1500,
    color: '#F43F5E',
    bgLight: '#FFF1F2',
  },
  {
    id: 'bp-8',
    name: 'Investments',
    percentage: 84,
    spent: 4200,
    limit: 5000,
    color: '#10B981',
    bgLight: '#ECFDF5',
  },
  {
    id: 'bp-9',
    name: 'Education',
    percentage: 55,
    spent: 1100,
    limit: 2000,
    color: '#6366F1',
    bgLight: '#EEF2FF',
  },
  {
    id: 'bp-10',
    name: 'Others',
    percentage: 30,
    spent: 150,
    limit: 500,
    color: '#9CA3AF',
    bgLight: '#F3F4F6',
  },
];
