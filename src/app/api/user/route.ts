import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    await db.read();
    return NextResponse.json({
      success: true,
      user: db.data.user,
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

    db.data.user = {
      ...db.data.user,
      ...body,
    };

    await db.write();

    return NextResponse.json({
      success: true,
      user: db.data.user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
