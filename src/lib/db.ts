import dns from 'node:dns';
import { cacheLife, cacheTag } from 'next/cache';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import {
  Transaction,
  DaySpending,
  User,
  TransactionCategory,
  Project,
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

let sqlClient: SqlClient | null = null;
let fallbackSqlClient: SqlClient | null = null;

export function getSql(): SqlClient {
  if (!sqlClient) {
    const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is missing.');
    }
    sqlClient = neon(connectionString) as SqlClient;
  }
  return sqlClient;
}

/** Fallback SQL client with stripped connection parameters for retry attempts */
function getFallbackSql(): SqlClient {
  if (!fallbackSqlClient) {
    const raw = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '';
    const clean = raw.replace(/\?.*$/, ''); // strip query string params that may cause issues
    fallbackSqlClient = neon(clean) as SqlClient;
  }
  return fallbackSqlClient;
}

// Use a concrete alias for the sql client type to avoid generic mismatch
type SqlClient = NeonQueryFunction<false, false>;

/**
 * Wraps a DB operation with one automatic retry using the fallback connection.
 * Catches transient `fetch failed` / network errors from Neon serverless.
 */
async function withRetry<T>(operation: (sql: SqlClient) => Promise<T>): Promise<T> {
  try {
    return await operation(getSql());
  } catch (err) {
    const msg = (err as Error)?.message || String(err);
    if (msg.includes('During prerendering') || (err as { digest?: string })?.digest?.startsWith('NEXT_')) {
      throw err;
    }
    const isNetworkError =
      msg.includes('fetch failed') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('ETIMEDOUT') ||
      msg.includes('NeonDbError: connect');
    if (isNetworkError) {
      console.warn('[DB] Transient connection error, retrying with fallback...', msg);
      return await operation(getFallbackSql());
    }
    throw err;
  }
}

export async function getUser(emailOrId?: string): Promise<User> {
  let rows;
  if (emailOrId) {
    rows = await withRetry((sql) => sql`
      SELECT id, name, email, image AS avatar, role
      FROM neon_auth.user
      WHERE id = ${emailOrId} OR email = ${emailOrId}
      LIMIT 1;
    `);
  } else {
    rows = await withRetry((sql) => sql`
      SELECT id, name, email, image AS avatar, role
      FROM neon_auth.user
      ORDER BY "createdAt" ASC
      LIMIT 1;
    `);
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
  const isAdmin = row.role === 'admin' || row.email === 'admin@gmail.com';
  return {
    id: row.id,
    name: row.name || 'User',
    email: row.email,
    avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    role: isAdmin ? 'admin' : (row.role === 'user' ? 'Personal Pro' : (row.role || 'Personal Pro')),
  };
}

export async function updateUser(data: Partial<User> & { id?: string; email?: string }): Promise<User> {
  const current = await getUser(data.id || data.email);
  const updated: User = {
    ...current,
    ...data,
  };

  const avatar = updated.avatar || null;
  const role = updated.role || 'user';

  if (updated.id) {
    await withRetry((sql) => sql`
      UPDATE neon_auth.user
      SET name = ${updated.name},
          email = ${updated.email},
          image = ${avatar},
          role = ${role},
          "updatedAt" = NOW()
      WHERE id = ${updated.id};
    `);
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
    SELECT id, title, category, amount, transaction_date, account, payment_method, remarks, is_approved, project_id, project_name
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
    is_approved: r.is_approved !== null && r.is_approved !== undefined ? Boolean(r.is_approved) : false,
    projectId: r.project_id !== null && r.project_id !== undefined ? Number(r.project_id) : undefined,
    projectName: r.project_name || undefined,
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
  is_approved?: boolean;
  projectId?: number | null;
  projectName?: string | null;
}): Promise<Transaction> {
  const id = tx.id || `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const title = tx.title || tx.name || 'Expense';
  const transactionDate = tx.transactionDate || tx.date || 'Today';
  const category = (tx.category as TransactionCategory) || 'Others';
  const amount = Number(tx.amount) || 0;
  const account = tx.account || null;
  const paymentMethod = tx.paymentMethod || 'Bank Transfer';
  const remarks = tx.remarks || null;
  const isApproved = tx.is_approved !== undefined ? Boolean(tx.is_approved) : false;
  const projectId = tx.projectId !== undefined && tx.projectId !== null ? Number(tx.projectId) : null;
  const projectName = tx.projectName ? String(tx.projectName).trim() : null;

  await withRetry((sql) => sql`
    INSERT INTO transactions (id, title, category, amount, transaction_date, account, payment_method, remarks, is_approved, project_id, project_name, created_at)
    VALUES (${id}, ${title}, ${category}, ${amount}, ${transactionDate}, ${account}, ${paymentMethod}, ${remarks}, ${isApproved}, ${projectId}, ${projectName}, NOW());
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
    is_approved: isApproved,
    projectId: projectId || undefined,
    projectName: projectName || undefined,
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
    is_approved?: boolean;
    projectId?: number | null;
    projectName?: string | null;
  }
): Promise<Transaction | null> {
  const title = tx.title ?? tx.name ?? null;
  const transactionDate = tx.transactionDate ?? tx.date ?? null;
  const isApproved = tx.is_approved !== undefined ? Boolean(tx.is_approved) : null;
  const hasProjectId = tx.projectId !== undefined;
  const projectId = tx.projectId !== undefined && tx.projectId !== null ? Number(tx.projectId) : null;
  const hasProjectName = tx.projectName !== undefined;
  const projectName = tx.projectName !== undefined && tx.projectName !== null ? String(tx.projectName).trim() : null;

  const rows = await withRetry((sql) => sql`
    UPDATE transactions
    SET
      title = COALESCE(${title}, title),
      category = COALESCE(${tx.category ?? null}, category),
      amount = COALESCE(${tx.amount !== undefined ? Number(tx.amount) : null}, amount),
      transaction_date = COALESCE(${transactionDate}, transaction_date),
      account = COALESCE(${tx.account ?? null}, account),
      payment_method = COALESCE(${tx.paymentMethod ?? null}, payment_method),
      remarks = COALESCE(${tx.remarks ?? null}, remarks),
      is_approved = COALESCE(${isApproved}, is_approved),
      project_id = ${hasProjectId ? projectId : sql`project_id`},
      project_name = ${hasProjectName ? projectName : sql`project_name`}
    WHERE id = ${id}
    RETURNING id, title, category, amount, transaction_date, account, payment_method, remarks, is_approved, project_id, project_name;
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
    is_approved: r.is_approved !== null && r.is_approved !== undefined ? Boolean(r.is_approved) : false,
    projectId: r.project_id !== null && r.project_id !== undefined ? Number(r.project_id) : undefined,
    projectName: r.project_name || undefined,
  };
}

function formatOrdinalDay(dateLabel: string): string {
  const digits = dateLabel.replace(/[^\d]/g, '');
  const dayNum = parseInt(digits, 10);
  if (isNaN(dayNum)) return dateLabel;
  if (dayNum >= 11 && dayNum <= 13) return `${dayNum}th`;
  switch (dayNum % 10) {
    case 1:
      return `${dayNum}st`;
    case 2:
      return `${dayNum}nd`;
    case 3:
      return `${dayNum}rd`;
    default:
      return `${dayNum}th`;
  }
}

export async function getTrendData(): Promise<DaySpending[]> {
  // Compute trend from real transactions
  const txs = await withRetry((sql) => sql`
    SELECT transaction_date, amount FROM transactions WHERE amount < 0
  `);
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
    const day = formatOrdinalDay(dateLabel);
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

export async function updateExpenseAccount(
  id: number,
  data: { type?: string; code?: string; name?: string }
): Promise<AccountRecord | null> {
  const currentRows = await withRetry((sql) => sql`SELECT id, type, code, name FROM expense_accounts WHERE id = ${id}`);
  if (currentRows.length === 0) return null;
  const current = currentRows[0];

  const type = data.type || current.type;
  const code = data.code || current.code;
  const name = data.name || current.name;
  const accountLabel = `${code} - ${name}`;

  const rows = await withRetry((sql) => sql`
    UPDATE expense_accounts
    SET type = ${type}, code = ${code}, name = ${name}, account_label = ${accountLabel}
    WHERE id = ${id}
    RETURNING id, type, code, name, account_label;
  `);

  if (rows.length === 0) return null;
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

export async function deleteExpenseAccount(id: number): Promise<boolean> {
  await withRetry((sql) => sql`DELETE FROM expense_accounts WHERE id = ${id}`);
  return true;
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

export async function updateIncomeAccount(
  id: number,
  data: { type?: string; code?: string; name?: string }
): Promise<AccountRecord | null> {
  const currentRows = await withRetry((sql) => sql`SELECT id, type, code, name FROM income_accounts WHERE id = ${id}`);
  if (currentRows.length === 0) return null;
  const current = currentRows[0];

  const type = data.type || current.type;
  const code = data.code || current.code;
  const name = data.name || current.name;
  const accountLabel = `${code} - ${name}`;

  const rows = await withRetry((sql) => sql`
    UPDATE income_accounts
    SET type = ${type}, code = ${code}, name = ${name}, account_label = ${accountLabel}
    WHERE id = ${id}
    RETURNING id, type, code, name, account_label;
  `);

  if (rows.length === 0) return null;
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

export async function deleteIncomeAccount(id: number): Promise<boolean> {
  await withRetry((sql) => sql`DELETE FROM income_accounts WHERE id = ${id}`);
  return true;
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
  projects?: Project[];
}

export async function getInitialDashboardData(): Promise<InitialDashboardData> {
  'use cache';
  cacheLife('seconds');
  cacheTag('dashboard');
  try {
    const [data, expenseAccounts, incomeAccounts, projects] = await Promise.all([
      getAllData(),
      getExpenseAccounts().catch(() => []),
      getIncomeAccounts().catch(() => []),
      getProjects().catch(() => []),
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
      projects: projects || [],
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
      projects: [],
    };
  }
}

/**
 * Projects CRUD operations
 */
async function ensureProjectsTable() {
  await withRetry((sql) => sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

export async function getProjects(): Promise<Project[]> {
  try {
    const rows = await withRetry((sql) => sql`
      SELECT id, name, created_at, updated_at
      FROM projects
      ORDER BY id DESC;
    `);

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
    }));
  } catch (err) {
    const msg = (err as Error)?.message || String(err);
    if (msg.includes('relation "projects" does not exist') || (err as { code?: string })?.code === '42P01') {
      await ensureProjectsTable();
      return [];
    }
    throw err;
  }
}

export async function createProject(data: { name: string }): Promise<Project> {
  const trimmed = data.name.trim();
  try {
    const rows = await withRetry((sql) => sql`
      INSERT INTO projects (name, created_at, updated_at)
      VALUES (${trimmed}, NOW(), NOW())
      RETURNING id, name, created_at, updated_at;
    `);
    const r = rows[0];
    return {
      id: r.id,
      name: r.name,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
    };
  } catch (err) {
    const msg = (err as Error)?.message || String(err);
    if (msg.includes('relation "projects" does not exist') || (err as { code?: string })?.code === '42P01') {
      await ensureProjectsTable();
      const rows = await withRetry((sql) => sql`
        INSERT INTO projects (name, created_at, updated_at)
        VALUES (${trimmed}, NOW(), NOW())
        RETURNING id, name, created_at, updated_at;
      `);
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      };
    }
    throw err;
  }
}

export async function updateProject(id: number, data: { name: string }): Promise<Project | null> {
  const trimmed = data.name.trim();
  const rows = await withRetry((sql) => sql`
    UPDATE projects
    SET name = ${trimmed}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, name, created_at, updated_at;
  `);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}

export async function deleteProject(id: number): Promise<boolean> {
  await withRetry((sql) => sql`DELETE FROM projects WHERE id = ${id};`);
  return true;
}


