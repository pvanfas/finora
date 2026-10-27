import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Transaction } from '@/types';

export async function GET() {
  try {
    const db = await getDb();
    await db.read();
    return NextResponse.json({ success: true, transactions: db.data.transactions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDb();
    await db.read();

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: body.name || 'Expense',
      category: body.category || 'Others',
      date: body.date || 'Today',
      amount: typeof body.amount === 'number' ? body.amount : parseFloat(body.amount) || 0,
      status: body.status || 'Completed',
      paymentMethod: body.paymentMethod || 'Debit Card',
    };

    // Prepend to top of transactions
    db.data.transactions.unshift(newTx);
    await db.write();

    return NextResponse.json({ success: true, transaction: newTx });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Transaction id is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    await db.read();
    db.data.transactions = db.data.transactions.filter((t) => t.id !== id);
    await db.write();

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
