import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || searchParams.get('type') || 'xlsx').toLowerCase();

    if (format === 'pdf') {
      const filePath = path.join(process.cwd(), 'public', '2026_GTA_Application_form.pdf');
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'PDF file not found' }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="2026_GTA_Application_form.pdf"',
        },
      });
    }

    // Default: Excel (.xlsx)
    const filePath = path.join(process.cwd(), 'public', '2026_GTA_Application_form.xlsx');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Excel file not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="2026_GTA_Application_form.xlsx"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
