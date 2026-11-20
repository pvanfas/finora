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

export const PROJECT_TYPE_OPTIONS = [
  { value: 'corporate', label: 'Corporate', color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' },
  { value: 'govt', label: 'Government', color: '#0369A1', bg: '#F0F9FF', border: '#BAE6FD' },
  { value: 'semi govt', label: 'Semi Government', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  { value: 'startup', label: 'Startup', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
] as const;

export const DEFAULT_TEAM_USERS = [
  { id: '8f3d9dfd-b73d-4d18-a5cf-9fe687c3c0e3', name: 'Admin', email: 'admin@gmail.com', role: 'admin' },
  { id: '81c96730-1d3e-4f31-93b5-a0298d098739', name: 'Anfas PV', email: 'anfaspv.info@gmail.com', role: 'user' },
  { id: '31554c47-08f7-4238-9c39-566e395d88da', name: 'Fahim Ahmed', email: 'pvfahim@gmail.com', role: 'user' },
  { id: '4fe3d2a8-3c5a-4666-b233-2fcc3c458f94', name: 'Fasil Firos', email: 'fasilfiroz@gmail.com', role: 'user' },
  { id: '02ff8a32-8fd3-4290-9e17-a8c6bcc405bc', name: 'Shahbas Ahmed PE', email: 'shahbasahmedpe@gmail.com', role: 'user' },
  { id: 'de7a8760-e214-4d11-b54a-cec02dc859dd', name: 'Shuhaib', email: 'shuhaib@gmail.com', role: 'user' },
];

