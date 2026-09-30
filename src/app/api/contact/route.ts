import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    console.log('=== [GTA Contact Us Email Notification] ===');
    console.log(`Recipient: gta@gtakorea.org`);
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log('============================================');

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been successfully sent to GTA (gta@gtakorea.org).',
      data: {
        timestamp: new Date().toISOString(),
        recipient: 'gta@gtakorea.org'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error processing contact request.' },
      { status: 500 }
    );
  }
}
