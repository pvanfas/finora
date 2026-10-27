import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import fs from 'fs';
import {
  Transaction,
  BudgetCategory,
  DaySpending,
  User,
} from '@/types';
import {
  DEFAULT_MONTHLY_BUDGET,
  DEFAULT_SAVINGS_GROWTH,
  CURRENCY_SYMBOL,
  INITIAL_TRANSACTIONS,
  INITIAL_TREND,
  INITIAL_BUDGET_PLAN,
} from '@/constants';

export interface AppNotification {
  id: string;
  title: string;
  time: string;
  unread: boolean;
  type: 'warning' | 'info' | 'success';
  text: string;
}

export interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  status: string;
}

export interface DatabaseSchema {
  user: User;
  settings: {
    currencySymbol: string;
    monthlyBudget: number;
    savings: number;
    savingsGrowth: number;
    accentThemeId: string;
  };
  transactions: Transaction[];
  budgetPlan: BudgetCategory[];
  trendData: DaySpending[];
  notifications: AppNotification[];
  subscriptions: Subscription[];
}

const DEFAULT_USER: User = {
  id: 'usr_finora_01',
  name: 'Alex Morgan',
  email: 'alex.morgan@finora.finance',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  role: 'Personal Pro',
};

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'Food & Dining at 76% of budget',
    time: '2 hours ago',
    unread: true,
    type: 'warning',
    text: 'You have spent ₹912 of your ₹1,200 Food & Dining allocation for August.',
  },
  {
    id: '2',
    title: 'Recurring charge processed: Netflix',
    time: 'Yesterday at 9:15 AM',
    unread: true,
    type: 'info',
    text: 'Your subscription of ₹199.00 was authorized and is currently pending clearance.',
  },
  {
    id: '3',
    title: 'Monthly Savings Target Surpassed',
    time: 'Aug 26, 2026',
    unread: false,
    type: 'success',
    text: 'Congratulations! Your savings rate grew +12.4% compared to July.',
  },
];

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-1', name: 'Netflix Premium 4K', category: 'Entertainment', amount: 19.99, date: 'Renews Sep 28', status: 'Active' },
  { id: 'sub-2', name: 'Shopify Store Plan', category: 'Business / Shopping', amount: 39.00, date: 'Renews Sep 27', status: 'Active' },
  { id: 'sub-3', name: 'Spotify Duo', category: 'Entertainment', amount: 14.99, date: 'Renews Sep 15', status: 'Active' },
  { id: 'sub-4', name: 'Gym & Fitness Pass', category: 'Health', amount: 65.00, date: 'Renews Sep 01', status: 'Active' },
  { id: 'sub-5', name: 'iCloud 2TB Storage', category: 'Cloud & Tech', amount: 9.99, date: 'Renews Sep 05', status: 'Active' },
];

const defaultData: DatabaseSchema = {
  user: DEFAULT_USER,
  settings: {
    currencySymbol: CURRENCY_SYMBOL,
    monthlyBudget: DEFAULT_MONTHLY_BUDGET,
    savings: 720,
    savingsGrowth: DEFAULT_SAVINGS_GROWTH,
    accentThemeId: 'orange',
  },
  transactions: INITIAL_TRANSACTIONS,
  budgetPlan: INITIAL_BUDGET_PLAN,
  trendData: INITIAL_TREND,
  notifications: DEFAULT_NOTIFICATIONS,
  subscriptions: DEFAULT_SUBSCRIPTIONS,
};

let dbPromise: ReturnType<typeof JSONFilePreset<DatabaseSchema>> | null = null;

export async function getDb() {
  if (!dbPromise) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'db.json');
    dbPromise = JSONFilePreset<DatabaseSchema>(dbPath, defaultData);
  }

  const db = await dbPromise;
  // Ensure default structure if empty file existed
  if (!db.data || !db.data.transactions) {
    db.data = defaultData;
    await db.write();
  }
  return db;
}
