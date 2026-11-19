import { NextResponse } from 'next/server';
import { getAllData } from '@/lib/db';
import { auth } from '@/lib/auth/server';

export async function GET(request: Request) {
  try {
    void request.url;
    const sessionRes = await auth.getSession().catch(() => null);
    const sessionUser = sessionRes?.data?.user;
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await getAllData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
