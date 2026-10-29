import { NextResponse } from 'next/server';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from '@/lib/db';

/** Safely parse JSON body — returns null on malformed input instead of throwing */
async function safeJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const transactions = await getTransactions();
    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error('GET /api/transactions error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to fetch transactions' },
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

    const title = (body.title as string) || (body.name as string);
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Transaction name/title is required' },
        { status: 400 }
      );
    }

    const rawAmount = body.amount;
    const amount = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount));
    if (isNaN(amount)) {
      return NextResponse.json(
        { success: false, error: 'Transaction amount must be a valid number' },
        { status: 400 }
      );
    }

    const newTx = await addTransaction({
      name: title,
      title,
      category: (body.category as string) || 'Others',
      date: (body.transactionDate as string) || (body.date as string) || 'Today',
      transactionDate: (body.transactionDate as string) || (body.date as string) || 'Today',
      amount,
      account: body.account as string | undefined,
      paymentMethod: (body.paymentMethod as string) || 'Bank Transfer',
      remarks: body.remarks !== undefined ? (body.remarks as string) : undefined,
    });

    return NextResponse.json({ success: true, transaction: newTx });
  } catch (error) {
    console.error('POST /api/transactions error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing JSON body' },
        { status: 400 }
      );
    }

    const { id, ...updates } = body;
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Transaction id is required and must be a string' },
        { status: 400 }
      );
    }

    // Coerce amount if provided
    if (updates.amount !== undefined) {
      const parsed = typeof updates.amount === 'number' ? updates.amount : parseFloat(String(updates.amount));
      if (isNaN(parsed)) {
        return NextResponse.json(
          { success: false, error: 'Amount must be a valid number' },
          { status: 400 }
        );
      }
      updates.amount = parsed;
    }

    const updated = await updateTransaction(id, updates as Parameters<typeof updateTransaction>[1]);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Transaction with id "${id}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error) {
    console.error('PUT /api/transactions error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Accept id from query string or JSON body
    const { searchParams } = new URL(request.url);
    let id: string | null = searchParams.get('id');

    if (!id) {
      const body = await safeJson(request);
      id = (body?.id as string) || null;
    }

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Transaction id is required' },
        { status: 400 }
      );
    }

    await deleteTransaction(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('DELETE /api/transactions error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
