import { NextResponse } from 'next/server';
import { getAllData } from '@/lib/db';

export async function GET() {
  try {
    const data = await getAllData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
