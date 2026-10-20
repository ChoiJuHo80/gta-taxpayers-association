import { NextRequest, NextResponse } from 'next/server';
import { searchMembers } from '@/lib/db';
import * as XLSX from 'xlsx';

function formatUnixDate(val?: string): string {
  if (!val) return '-';
  const num = Number(val);
  if (!isNaN(num) && num > 10000000) {
    const d = new Date((num + 9 * 3600) * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return val;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('query') || '').trim();
    const field = (searchParams.get('field') || 'name').trim();

    const { members } = await searchMembers({
      query,
      field,
      page: 1,
      limit: 20000,
    });

    const excelData = members.map(m => {
      const cleanRemark = (m.remark || '').replace(/\\r\\n|\\n|\\r/g, ' ').trim();
      return {
        'no': m.seq_no ?? m.id,
        'name': m.name || '',
        'number': m.number || '',
        'email': m.email || '',
        'remark': cleanRemark,
        'Telephone': m.phon || '',
        'Date of Stay & Work': `${formatUnixDate(m.date_from)} ~ ${formatUnixDate(m.date_to)}`,
        'Receipts': `${m.receipt_count ?? 0}건`,
        'Company': m.company || '',
        'Nationality': m.nationality || '',
        'Address': m.address || '',
        'Marital Status': m.married === '2' ? 'Married' : 'Single',
        'Basic Salary': m.money_01 || '',
        'Overseas Allowance': m.money_02 || '',
        'Bonus': m.money_03 || '',
        'Total Income': m.money_04 || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Member_List');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const suffix = query ? `_${field}_${encodeURIComponent(query)}` : '';

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="GTA_Member_List${suffix}_${new Date().toISOString().substring(0, 10)}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
