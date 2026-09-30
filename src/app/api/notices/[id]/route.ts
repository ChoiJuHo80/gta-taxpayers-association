import { NextResponse } from 'next/server';
import { getNoticeById, deleteNotice } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const notice = await getNoticeById(id);
    if (!notice) {
      return NextResponse.json({ success: false, error: 'Notice not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: notice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await deleteNotice(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
