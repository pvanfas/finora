import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    await db.read();
    return NextResponse.json({
      success: true,
      monthlyBudget: db.data.settings.monthlyBudget,
      budgetPlan: db.data.budgetPlan,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = await getDb();
    await db.read();

    if (typeof body.monthlyBudget === 'number') {
      db.data.settings.monthlyBudget = body.monthlyBudget;
    }

    if (Array.isArray(body.budgetPlan)) {
      db.data.budgetPlan = body.budgetPlan;
    }

    await db.write();

    return NextResponse.json({
      success: true,
      monthlyBudget: db.data.settings.monthlyBudget,
      budgetPlan: db.data.budgetPlan,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
