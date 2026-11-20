import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/db';
import { auth } from '@/lib/auth/server';

export async function GET(request: Request) {
  try {
    void request.url;
    const sessionRes = await auth.getSession().catch(() => null);
    if (!sessionRes?.data?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const users = await getAllUsers();
    return NextResponse.json({ success: true, count: users.length, users });
  } catch (error) {
    if ((error as { digest?: string })?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
