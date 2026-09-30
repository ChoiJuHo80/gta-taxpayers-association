import { NextRequest, NextResponse } from 'next/server';
import { lookupConsultation } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json({ success: false, message: '연락처와 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    const results = await lookupConsultation(phone, password);
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
