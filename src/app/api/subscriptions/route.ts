import { NextResponse } from 'next/server';
import { getDb, Subscription } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    await db.read();
    return NextResponse.json({
      success: true,
      subscriptions: db.data.subscriptions,
    });
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

    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      name: body.name || 'Subscription',
      category: body.category || 'General',
      amount: typeof body.amount === 'number' ? body.amount : parseFloat(body.amount) || 0,
      date: body.date || 'Renews next month',
      status: body.status || 'Active',
    };

    db.data.subscriptions.push(newSub);
    await db.write();

    return NextResponse.json({ success: true, subscription: newSub });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
