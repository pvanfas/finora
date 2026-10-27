import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    await db.read();
    return NextResponse.json({
      success: true,
      notifications: db.data.notifications,
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

    if (body.markAllRead) {
      db.data.notifications = db.data.notifications.map((n) => ({
        ...n,
        unread: false,
      }));
    } else if (body.id) {
      db.data.notifications = db.data.notifications.map((n) =>
        n.id === body.id ? { ...n, unread: false } : n
      );
    }

    await db.write();

    return NextResponse.json({
      success: true,
      notifications: db.data.notifications,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
