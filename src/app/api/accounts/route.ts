import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import {
  getExpenseAccounts,
  getIncomeAccounts,
  getChartOfAccounts,
  createExpenseAccount,
  createIncomeAccount,
  updateExpenseAccount,
  deleteExpenseAccount,
  updateIncomeAccount,
  deleteIncomeAccount,
} from '@/lib/db';
import { auth } from '@/lib/auth/server';

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
    const sessionRes = await auth.getSession().catch(() => null);
    if (!sessionRes?.data?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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
      try { revalidateTag('dashboard', 'seconds'); } catch {}
      return NextResponse.json({ success: true, account });
    } else {
      const account = await createExpenseAccount({ type, code, name });
      try { revalidateTag('dashboard', 'seconds'); } catch {}
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

export async function PUT(request: Request) {
  try {
    const sessionRes = await auth.getSession().catch(() => null);
    if (!sessionRes?.data?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing JSON body' },
        { status: 400 }
      );
    }

    const { id, category, type, code, name } = body as {
      id?: number | string;
      category?: string;
      type?: string;
      code?: string;
      name?: string;
    };

    const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
    if (isNaN(numId) || numId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid account id is required' },
        { status: 400 }
      );
    }

    if (category === 'INCOME') {
      const updated = await updateIncomeAccount(numId, { type, code, name });
      if (!updated) {
        return NextResponse.json(
          { success: false, error: `Income account #${numId} not found` },
          { status: 404 }
        );
      }
      try { revalidateTag('dashboard', 'seconds'); } catch {}
      return NextResponse.json({ success: true, account: updated });
    } else {
      const updated = await updateExpenseAccount(numId, { type, code, name });
      if (!updated) {
        return NextResponse.json(
          { success: false, error: `Expense account #${numId} not found` },
          { status: 404 }
        );
      }
      try { revalidateTag('dashboard', 'seconds'); } catch {}
      return NextResponse.json({ success: true, account: updated });
    }
  } catch (error) {
    console.error('PUT /api/accounts error:', error);
    const msg = (error as Error).message || '';
    const isDuplicate = msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists');
    return NextResponse.json(
      {
        success: false,
        error: isDuplicate
          ? 'An account with this code already exists'
          : (msg || 'Failed to update account'),
      },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionRes = await auth.getSession().catch(() => null);
    if (!sessionRes?.data?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let idParam = searchParams.get('id');
    let categoryParam = searchParams.get('category');

    if (!idParam) {
      const body = await safeJson(request);
      idParam = body?.id !== undefined ? String(body.id) : null;
      if (!categoryParam && body?.category) {
        categoryParam = String(body.category);
      }
    }

    const numId = parseInt(String(idParam), 10);
    if (isNaN(numId) || numId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid account id is required' },
        { status: 400 }
      );
    }

    try { revalidateTag('dashboard', 'seconds'); } catch {}
    if (categoryParam?.toUpperCase() === 'INCOME') {
      await deleteIncomeAccount(numId);
      return NextResponse.json({ success: true, deletedId: numId, category: 'INCOME' });
    } else {
      await deleteExpenseAccount(numId);
      return NextResponse.json({ success: true, deletedId: numId, category: 'EXPENSE' });
    }
  } catch (error) {
    console.error('DELETE /api/accounts error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
