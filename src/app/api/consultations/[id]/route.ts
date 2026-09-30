import { NextRequest, NextResponse } from 'next/server';
import { updateConsultationStatus } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, adminMemo } = body;

    const updated = await updateConsultationStatus(id, status, adminMemo);
    if (!updated) {
      return NextResponse.json({ success: false, message: '상담 내역을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
