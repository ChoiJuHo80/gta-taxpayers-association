import { NextResponse } from 'next/server';
import { createUser, hashPassword } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, email, password, memberType, bizNo, address, interest } = body;

    if (!fullName || !phone || !email || !password) {
      return NextResponse.json(
        { success: false, message: '성명, 휴대폰 번호, 이메일 및 비밀번호는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: '비밀번호는 최소 8자리 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    const newUser = await createUser({
      fullName,
      phone,
      email,
      passwordHash: hashedPassword,
      memberType: memberType || 'individual',
      bizNo: bizNo || '',
      address: address || '',
      interest: interest || '',
    });

    return NextResponse.json({
      success: true,
      message: '회원가입이 성공적으로 완료되었습니다.',
      data: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        memberType: newUser.memberType,
        createdAt: newUser.createdAt,
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
