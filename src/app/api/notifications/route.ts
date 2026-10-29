import { NextResponse } from 'next/server';
import { getNotifications, updateNotifications } from '@/lib/db';

async function safeJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const notifications = await getNotifications();
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to fetch notifications' },
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

    if (!body.markAllRead && !body.id) {
      return NextResponse.json(
        { success: false, error: 'Either markAllRead or id is required' },
        { status: 400 }
      );
    }

    const notifications = await updateNotifications({
      id: body.id as string | undefined,
      markAllRead: body.markAllRead as boolean | undefined,
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('PUT /api/notifications error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
