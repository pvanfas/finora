import dns from 'node:dns';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import {
  Transaction,
  DaySpending,
  User,
  TransactionCategory,
} from '@/types';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore in non-Node environments
}

export interface AppNotification {
  id: string;
  title: string;
  time: string;
  unread: boolean;
  type: 'warning' | 'info' | 'success';
  text: string;
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
  trendData: DaySpending[];
  notifications: AppNotification[];
}

export function getSql() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }
  return neon(connectionString);
}

/** Fallback SQL client with stripped connection parameters for retry attempts */
function getFallbackSql() {
  const raw = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '';
  const clean = raw.replace(/\?.*$/, ''); // strip query string params that may cause issues
  return neon(clean);
}

// Use a concrete alias for the sql client type to avoid generic mismatch
type SqlClient = NeonQueryFunction<false, false>;

/**
 * Wraps a DB operation with one automatic retry using the fallback connection.
 * Catches transient `fetch failed` / network errors from Neon serverless.
 */
async function withRetry<T>(operation: (sql: SqlClient) => Promise<T>): Promise<T> {
  try {
    return await operation(getSql() as SqlClient);
  } catch (err) {
    const msg = (err as Error)?.message || String(err);
    const isNetworkError = msg.includes('fetch failed') || msg.includes('connect') || msg.includes('ECONNREFUSED') || msg.includes('timeout');
    if (isNetworkError) {
      console.warn('[DB] Transient connection error, retrying with fallback...', msg);
      return await operation(getFallbackSql() as SqlClient);
    }
    throw err;
  }
}

export async function getUser(emailOrId?: string): Promise<User> {
  const sql = getSql();
  let rows;
  if (emailOrId) {
    rows = await sql`
      SELECT id, name, email, image AS avatar, role
      FROM neon_auth.user
      WHERE id = ${emailOrId} OR email = ${emailOrId}
      LIMIT 1;
    `;
  } else {
    rows = await sql`
      SELECT id, name, email, image AS avatar, role
      FROM neon_auth.user
      ORDER BY "createdAt" ASC
      LIMIT 1;
    `;
  }

  if (rows.length === 0) {
    return {
      id: 'usr_default',
      name: 'User',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      role: 'Personal Pro',
    };
  }

  const row = rows[0];
  return {
    id: row.id,
    name: row.name || 'User',
    email: row.email,
    avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    role: row.role === 'user' ? 'Personal Pro' : (row.role || 'Personal Pro'),
  };
}

export async function updateUser(data: Partial<User> & { id?: string; email?: string }): Promise<User> {
  const sql = getSql();
  const current = await getUser(data.id || data.email);
  const updated: User = {
    ...current,
    ...data,
  };

  const avatar = updated.avatar || null;
  const role = updated.role || 'user';

  if (updated.id) {
    await sql`
      UPDATE neon_auth.user
      SET name = ${updated.name},
          email = ${updated.email},
          image = ${avatar},
          role = ${role},
          "updatedAt" = NOW()
      WHERE id = ${updated.id};
    `;
  }

  return updated;
}


export async function getSettings() {
  return {
    currencySymbol: '₹',
    monthlyBudget: 4500,
    savings: 720,
    savingsGrowth: 12.4,
    accentThemeId: 'orange',
  };
}

export async function getTransactions(): Promise<Transaction[]> {
  const rows = await withRetry((sql) => sql`
    SELECT id, title, category, amount, transaction_date, account, payment_method, remarks
    FROM transactions
    ORDER BY created_at DESC;
  `);

  return rows.map((r) => ({
    id: r.id,
    name: r.title,
    title: r.title,
    category: r.category as TransactionCategory,
    amount: Number(r.amount),
    date: r.transaction_date,
    transactionDate: r.transaction_date,
    account: r.account || undefined,
    paymentMethod: r.payment_method || 'Bank Transfer',
    remarks: r.remarks || undefined,
  }));
}

export async function addTransaction(tx: {
  id?: string;
  name?: string;
  title?: string;
  category: string;
  amount: number;
  date?: string;
  transactionDate?: string;
  account?: string;
  paymentMethod?: string;
  remarks?: string;
}): Promise<Transaction> {
  const id = tx.id || `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const title = tx.title || tx.name || 'Expense';
  const transactionDate = tx.transactionDate || tx.date || 'Today';
  const category = (tx.category as TransactionCategory) || 'Others';
  const amount = Number(tx.amount) || 0;
  const account = tx.account || null;
  const paymentMethod = tx.paymentMethod || 'Bank Transfer';
  const remarks = tx.remarks || null;

  await withRetry((sql) => sql`
    INSERT INTO transactions (id, title, category, amount, transaction_date, account, payment_method, remarks, created_at)
    VALUES (${id}, ${title}, ${category}, ${amount}, ${transactionDate}, ${account}, ${paymentMethod}, ${remarks}, NOW());
  `);

  return {
    id,
    name: title,
    title,
    category,
    amount,
    date: transactionDate,
    transactionDate,
    account: account || undefined,
    paymentMethod,
    remarks: remarks || undefined,
  };
}

export async function deleteTransaction(id: string): Promise<boolean> {
  await withRetry((sql) => sql`DELETE FROM transactions WHERE id = ${id};`);
  return true;
}

export async function updateTransaction(
  id: string,
  tx: {
    name?: string;
    title?: string;
    category?: string;
    amount?: number;
    date?: string;
    transactionDate?: string;
    account?: string;
    paymentMethod?: string;
    remarks?: string;
  }
): Promise<Transaction | null> {
  const title = tx.title ?? tx.name ?? null;
  const transactionDate = tx.transactionDate ?? tx.date ?? null;

  const rows = await withRetry((sql) => sql`
    UPDATE transactions
    SET
      title = COALESCE(${title}, title),
      category = COALESCE(${tx.category ?? null}, category),
      amount = COALESCE(${tx.amount !== undefined ? Number(tx.amount) : null}, amount),
      transaction_date = COALESCE(${transactionDate}, transaction_date),
      account = COALESCE(${tx.account ?? null}, account),
      payment_method = COALESCE(${tx.paymentMethod ?? null}, payment_method),
      remarks = COALESCE(${tx.remarks ?? null}, remarks)
    WHERE id = ${id}
    RETURNING id, title, category, amount, transaction_date, account, payment_method, remarks;
  `);

  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.title,
    title: r.title,
    category: r.category as TransactionCategory,
    amount: Number(r.amount),
    date: r.transaction_date,
    transactionDate: r.transaction_date,
    account: r.account || undefined,
    paymentMethod: r.payment_method || 'Bank Transfer',
    remarks: r.remarks || undefined,
  };
}

export async function getTrendData(): Promise<DaySpending[]> {
  const sql = getSql();
  // Compute trend from real transactions
  const txs = await sql`
    SELECT transaction_date, amount FROM transactions WHERE amount < 0
  `;
  const dayMap = new Map<string, number>();
  for (const t of txs) {
    let label = t.transaction_date;
    if (label.startsWith('Today')) {
      label = 'Oct 28';
    } else {
      // e.g. "Oct 27, 2026" -> "Oct 27"
      label = label.split(',')[0].trim();
    }
    const current = dayMap.get(label) || 0;
    dayMap.set(label, current + Math.abs(Number(t.amount)));
  }

  const result: DaySpending[] = [];
  const entries = Array.from(dayMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [dateLabel, amount] of entries) {
    const day = dateLabel.replace(/[^\d]/g, '') + 'th';
    result.push({ day, dateLabel, amount });
  }

  return result.length > 0 ? result : [
    { day: '21st', dateLabel: 'Oct 21', amount: 11200 },
    { day: '23rd', dateLabel: 'Oct 23', amount: 23500 },
    { day: '24th', dateLabel: 'Oct 24', amount: 18000 },
    { day: '25th', dateLabel: 'Oct 25', amount: 19300 },
    { day: '26th', dateLabel: 'Oct 26', amount: 15800 },
    { day: '27th', dateLabel: 'Oct 27', amount: 52400 },
    { day: '28th', dateLabel: 'Oct 28', amount: 4900 },
  ];
}

export async function getNotifications(): Promise<AppNotification[]> {
  const rows = await withRetry((sql) => sql`
    SELECT id, title, time, unread, type, text
    FROM notifications
    ORDER BY created_at DESC;
  `);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    time: r.time,
    unread: Boolean(r.unread),
    type: r.type as 'warning' | 'info' | 'success',
    text: r.text,
  }));
}

export async function updateNotifications(params: {
  id?: string;
  markAllRead?: boolean;
}): Promise<AppNotification[]> {
  if (params.markAllRead) {
    await withRetry((sql) => sql`UPDATE notifications SET unread = false;`);
  } else if (params.id) {
    await withRetry((sql) => sql`UPDATE notifications SET unread = false WHERE id = ${params.id};`);
  }
  return getNotifications();
}

export async function getAllData(): Promise<DatabaseSchema> {
  const [user, settings, transactions, notifications] = await Promise.all([
    getUser(),
    getSettings(),
    getTransactions(),
    getNotifications(),
  ]);

  const trendData = await getTrendData();

  return {
    user,
    settings,
    transactions,
    trendData,
    notifications,
  };
}

export interface AccountRecord {
  id: number;
  type: string;
  code: string;
  name: string;
  accountLabel: string;
  category?: 'EXPENSE' | 'INCOME';
}

export async function getExpenseAccounts(): Promise<AccountRecord[]> {
  const rows = await withRetry((sql) => sql`
    SELECT id, type, code, name, account_label
    FROM expense_accounts
    ORDER BY code ASC;
  `);
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    code: r.code,
    name: r.name,
    accountLabel: r.account_label,
    category: 'EXPENSE' as const,
  }));
}

export async function getIncomeAccounts(): Promise<AccountRecord[]> {
  const rows = await withRetry((sql) => sql`
    SELECT id, type, code, name, account_label
    FROM income_accounts
    ORDER BY code ASC;
  `);
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    code: r.code,
    name: r.name,
    accountLabel: r.account_label,
    category: 'INCOME' as const,
  }));
}

export async function getChartOfAccounts(): Promise<AccountRecord[]> {
  const rows = await withRetry((sql) => sql`
    SELECT id, category, type, code, name, account_label
    FROM chart_of_accounts
    ORDER BY category DESC, code ASC;
  `);
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    code: r.code,
    name: r.name,
    accountLabel: r.account_label,
    category: r.category as 'EXPENSE' | 'INCOME',
  }));
}

export async function createExpenseAccount(data: { type: string; code: string; name: string }): Promise<AccountRecord> {
  const accountLabel = `${data.code} - ${data.name}`;
  const rows = await withRetry((sql) => sql`
    INSERT INTO expense_accounts (type, code, name, account_label)
    VALUES (${data.type}, ${data.code}, ${data.name}, ${accountLabel})
    RETURNING id, type, code, name, account_label;
  `);
  const r = rows[0];
  return {
    id: r.id,
    type: r.type,
    code: r.code,
    name: r.name,
    accountLabel: r.account_label,
    category: 'EXPENSE',
  };
}

export async function createIncomeAccount(data: { type: string; code: string; name: string }): Promise<AccountRecord> {
  const accountLabel = `${data.code} - ${data.name}`;
  const rows = await withRetry((sql) => sql`
    INSERT INTO income_accounts (type, code, name, account_label)
    VALUES (${data.type}, ${data.code}, ${data.name}, ${accountLabel})
    RETURNING id, type, code, name, account_label;
  `);
  const r = rows[0];
  return {
    id: r.id,
    type: r.type,
    code: r.code,
    name: r.name,
    accountLabel: r.account_label,
    category: 'INCOME',
  };
}

/**
 * Backward compatibility wrapper for existing getDb() callers
 */
export async function getDb() {
  const data = await getAllData();
  return {
    data,
    read: async () => {
      const refreshed = await getAllData();
      Object.assign(data, refreshed);
    },
    write: async () => {
      // noop - mutations go through typed helper functions
    },
  };
}

export interface InitialDashboardData {
  transactions: Transaction[];
  trendData: DaySpending[];
  settings: {
    monthlyBudget: number;
    savings: number;
    savingsGrowth: number;
    currencySymbol: string;
    accentThemeId: string;
  };
  expenseAccounts: AccountRecord[];
  incomeAccounts: AccountRecord[];
}

export async function getInitialDashboardData(): Promise<InitialDashboardData> {
  'use cache';
  try {
    const [data, expenseAccounts, incomeAccounts] = await Promise.all([
      getAllData(),
      getExpenseAccounts().catch(() => []),
      getIncomeAccounts().catch(() => []),
    ]);

    return {
      transactions: data.transactions || [],
      trendData: data.trendData || [],
      settings: data.settings || {
        monthlyBudget: 150000,
        savings: 24500,
        savingsGrowth: 12.5,
        currencySymbol: '₹',
        accentThemeId: 'obsidian',
      },
      expenseAccounts: expenseAccounts || [],
      incomeAccounts: incomeAccounts || [],
    };
  } catch (err) {
    console.warn('RSC pre-fetch fallback active:', (err as Error)?.message || err);
    return {
      transactions: [],
      trendData: [],
      settings: {
        monthlyBudget: 150000,
        savings: 24500,
        savingsGrowth: 12.5,
        currencySymbol: '₹',
        accentThemeId: 'obsidian',
      },
      expenseAccounts: [],
      incomeAccounts: [],
    };
  }
}

