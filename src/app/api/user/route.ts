import { NextResponse } from 'next/server';
import { getUser, updateUser } from '@/lib/db';
import { auth } from '@/lib/auth/server';

async function safeJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const sessionRes = await auth.getSession().catch(() => null);
    const sessionUser = sessionRes?.data?.user;
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUser(sessionUser.id || sessionUser.email);
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
    const sessionRes = await auth.getSession().catch(() => null);
    const sessionUser = sessionRes?.data?.user;
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing JSON body' },
        { status: 400 }
      );
    }

    const { name, avatar, role } = body as {
      name?: string;
      avatar?: string;
      role?: string;
    };

    const payload: { name?: string; avatar?: string; role?: string } = {};
    if (typeof name === 'string' && name.trim()) {
      payload.name = name.trim();
    }
    if (typeof avatar === 'string' && avatar.trim()) {
      payload.avatar = avatar.trim();
    }

    // Role cannot be self-modified by regular users
    const callerIsAdmin =
      sessionUser.email === 'admin@gmail.com' ||
      (sessionUser as { role?: string }).role === 'admin';
    if (callerIsAdmin && typeof role === 'string' && role.trim()) {
      payload.role = role.trim();
    }

    const user = await updateUser({
      ...payload,
      id: sessionUser.id,
      email: sessionUser.email,
    });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('PUT /api/user error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
