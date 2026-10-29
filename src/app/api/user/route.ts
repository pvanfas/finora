import { NextResponse } from 'next/server';
import { getUser, updateUser } from '@/lib/db';

async function safeJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const user = await getUser();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to fetch user' },
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

    const user = await updateUser(body as Parameters<typeof updateUser>[0]);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('PUT /api/user error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
