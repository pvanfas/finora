import { NextResponse } from 'next/server';
import {
  getExpenseAccounts,
  getIncomeAccounts,
  getChartOfAccounts,
  createExpenseAccount,
  createIncomeAccount,
} from '@/lib/db';

async function safeJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'expense' | 'income' | all

    if (type === 'expense') {
      const expenseAccounts = await getExpenseAccounts();
      return NextResponse.json({ success: true, count: expenseAccounts.length, data: expenseAccounts });
    }

    if (type === 'income') {
      const incomeAccounts = await getIncomeAccounts();
      return NextResponse.json({ success: true, count: incomeAccounts.length, data: incomeAccounts });
    }

    const [expenseAccounts, incomeAccounts, chartOfAccounts] = await Promise.all([
      getExpenseAccounts(),
      getIncomeAccounts(),
      getChartOfAccounts(),
    ]);

    return NextResponse.json({
      success: true,
      total: chartOfAccounts.length,
      expenseAccounts,
      incomeAccounts,
      chartOfAccounts,
    });
  } catch (error) {
    console.error('GET /api/accounts error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing JSON body' },
        { status: 400 }
      );
    }

    const { category, type, code, name } = body as Record<string, string>;

    if (!type?.trim() || !code?.trim() || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'type, code, and name are required and cannot be empty' },
        { status: 400 }
      );
    }

    if (category === 'INCOME') {
      const account = await createIncomeAccount({ type, code, name });
      return NextResponse.json({ success: true, account });
    } else {
      const account = await createExpenseAccount({ type, code, name });
      return NextResponse.json({ success: true, account });
    }
  } catch (error) {
    console.error('POST /api/accounts error:', error);
    // Surface duplicate key errors meaningfully
    const msg = (error as Error).message || '';
    const isDuplicate = msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists');
    return NextResponse.json(
      {
        success: false,
        error: isDuplicate
          ? 'An account with this code already exists'
          : (msg || 'Failed to create account'),
      },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}
