import { NextResponse } from 'next/server';
import { getConsultations } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const list = await getConsultations();

    const excelData = list.map(item => ({
      '접수번호': item.id,
      '신청자명': item.applicantName,
      '연락처': item.phone,
      '세무유형': item.category,
      '제목': item.title,
      '내용': item.content,
      '처리상태': item.status,
      '관리자 메모': item.adminMemo || '',
      '첨부파일 수': item.attachments ? item.attachments.length : 0,
      '신청일시': item.createdAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '세무상담접수내역');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="GTA_Tax_Consultations_${new Date().toISOString().substring(0, 10)}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
