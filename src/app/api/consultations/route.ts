import { NextRequest, NextResponse } from 'next/server';
import { getConsultations, createConsultation, createMember, hashPassword } from '@/lib/db';

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
    const {
      applicantName,
      phone,
      category,
      title,
      content,
      password,
      attachments,
      memberData,
    } = body;

    if (!applicantName || !phone || !title || !content) {
      return NextResponse.json({ success: false, message: 'Required fields are missing.' }, { status: 400 });
    }

    // If submitted from Application Form with memberData, also register into applicationform table
    let createdMember = null;
    if (memberData) {
      try {
        createdMember = await createMember(memberData);
      } catch (e) {
        console.error('Error creating applicationform member:', e);
      }
    }

    const newConsultation = await createConsultation({
      applicantName,
      phone,
      category: category || '기타 세무상담',
      title,
      content,
      passwordHash: hashPassword(password || '8992'),
      attachments: attachments || [],
    });

    return NextResponse.json(
      { success: true, data: newConsultation, member: createdMember },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
