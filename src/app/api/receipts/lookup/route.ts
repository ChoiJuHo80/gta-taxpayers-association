import { NextRequest, NextResponse } from 'next/server';
import { lookupMemberAndReceipts } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, registrationNumber } = body;

    if (!name || !registrationNumber) {
      return NextResponse.json(
        { success: false, message: 'Please enter both Name and Registration Number.' },
        { status: 400 }
      );
    }

    const result = await lookupMemberAndReceipts(name, registrationNumber);
    return NextResponse.json({
      success: true,
      member: result.member,
      receipts: result.receipts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
