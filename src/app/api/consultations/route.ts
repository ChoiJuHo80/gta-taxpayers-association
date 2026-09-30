import { NextRequest, NextResponse } from 'next/server';
import { getConsultations, createConsultation, hashPassword } from '@/lib/db';

export async function GET() {
  try {
    const list = await getConsultations();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicantName, phone, category, title, content, password, attachments } = body;

    if (!applicantName || !phone || !title || !content || !password) {
      return NextResponse.json({ success: false, message: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const newConsultation = await createConsultation({
      applicantName,
      phone,
      category: category || '기타 세무상담',
      title,
      content,
      passwordHash: hashPassword(password),
      attachments: attachments || [],
    });

    return NextResponse.json({ success: true, data: newConsultation }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
