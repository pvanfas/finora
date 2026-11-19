import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/db';
import { auth } from '@/lib/auth/server';

async function safeJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    void request.url;
    const sessionRes = await auth.getSession().catch(() => null);
    if (!sessionRes?.data?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await getProjects();
    return NextResponse.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const sessionRes = await auth.getSession().catch(() => null);
    if (!sessionRes?.data?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing JSON body' },
        { status: 400 }
      );
    }

    const { name } = body as { name?: string };

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    const project = await createProject({ name: name.trim() });
    try {
      revalidateTag('dashboard', 'seconds');
    } catch {}
    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const sessionRes = await auth.getSession().catch(() => null);
    if (!sessionRes?.data?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await safeJson(request);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing JSON body' },
        { status: 400 }
      );
    }

    const { id, name } = body as { id?: number | string; name?: string };

    const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
    if (isNaN(numId) || numId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid project id is required' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    const updated = await updateProject(numId, { name: name.trim() });
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Project #${numId} not found` },
        { status: 404 }
      );
    }

    try {
      revalidateTag('dashboard', 'seconds');
    } catch {}

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error('PUT /api/projects error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionRes = await auth.getSession().catch(() => null);
    if (!sessionRes?.data?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let idParam = searchParams.get('id');

    if (!idParam) {
      const body = await safeJson(request);
      idParam = body?.id !== undefined ? String(body.id) : null;
    }

    const numId = parseInt(String(idParam), 10);
    if (isNaN(numId) || numId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid project id is required' },
        { status: 400 }
      );
    }

    await deleteProject(numId);
    try {
      revalidateTag('dashboard', 'seconds');
    } catch {}
    return NextResponse.json({ success: true, deletedId: numId });
  } catch (error) {
    console.error('DELETE /api/projects error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to delete project' },
      { status: 500 }
    );
  }
}
