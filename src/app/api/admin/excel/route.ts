import { NextRequest, NextResponse } from 'next/server';
import { searchMembers, getReceipts } from '@/lib/db';
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

function formatUnixMonth(val?: string): string {
  if (!val) return '-';
  const num = Number(val);
  if (!isNaN(num) && num > 10000000) {
    const d = new Date((num + 9 * 3600) * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${y}. ${m}`;
  }
  return val;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get('type') || 'members').toLowerCase().trim();
    const query = (searchParams.get('query') || '').trim();
    const field = (searchParams.get('field') || 'name').trim();
    const memberNum = searchParams.get('memberNum') || undefined;
    const idsParam = searchParams.get('ids') || '';
    const selectedIds = idsParam
      ? idsParam.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0)
      : [];

    const nowStr = new Date().toISOString().substring(0, 10);

    // =========================================================================
    // 1. RECEIPTS EXCEL EXPORT
    // =========================================================================
    if (type === 'receipts' || type === 'receipt') {
      const { receipts } = await getReceipts({
        memberNum,
        query,
        field,
        ids: selectedIds.length > 0 ? selectedIds : undefined,
        page: 1,
        limit: 20000,
      });

      const excelData = receipts.map((r, idx) => ({
        'No': idx + 1,
        'ID': r.id,
        '영수증 명칭': r.receipt_title || 'RECEIPT FOR CLASS "B" INCOME TAX (MONTHLY)',
        '관리번호(Management No)': r.management_no || '',
        '회원번호(Member No)': r.member_num || '',
        '성명(Name)': r.name || '',
        '주민/외국인번호': r.resident_no2 || r.resident_no1 || '',
        '귀속연월(Period)': formatUnixMonth(r.taxation_period),
        '발행일자(Issue Date)': formatUnixDate(r.reg_date),
        '국내 기본급': r.local_basicsalary || '',
        '국내 상여': r.local_bonus || '',
        '국내 인정상여': r.local_income || '',
        '국내 계': r.local_totalsalary || '',
        '국외 기본급': r.overseas_basicsalary || '',
        '국외 수당': r.overseas_bonus || '',
        '국외 인정상여': r.overseas_income || '',
        '국외 계': r.overseas_totalsalary || '',
        '총 기본급': r.total_basicsalary || '',
        '총 상여': r.total_bonus || '',
        '총 인정상여': r.total_income || '',
        '합계 계': r.total_totalsalary || '',
        '비과세급여': r.non_taxable_salary || '',
        '총 급여액': r.total_salary || '',
        '산출세액': r.computed_tax || '',
        '세액공제(납세조합)': r.deduction_overseas || '',
        '그밖의 공제': r.deduction_deduction || '',
        '납부 소득세': r.payable_income || '',
        '납부 주민세': r.payable_resident || '',
        '납부 농특세': r.payable_special || '',
        '세무수수료': r.service_fee || '',
        '연말정산수수료': r.yearend_fee || '',
        '사업자등록번호': r.license_no || '',
        '조합명': r.association_name || '',
        '대표자': r.chairman_name || '',
        '발급자': r.reg_name || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Receipt_List');

      const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      let filename = `GTA_Receipt_List_${nowStr}.xlsx`;
      if (selectedIds.length > 0) {
        filename = `GTA_Receipt_Selected_${selectedIds.length}items_${nowStr}.xlsx`;
      } else if (memberNum) {
        filename = `GTA_Receipt_Member_${memberNum}_${nowStr}.xlsx`;
      } else if (query) {
        filename = `GTA_Receipt_Search_${encodeURIComponent(query)}_${nowStr}.xlsx`;
      }

      return new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // =========================================================================
    // 2. MEMBERS EXCEL EXPORT (Default)
    // =========================================================================
    const { members } = await searchMembers({
      query,
      field,
      page: 1,
      limit: 20000,
    });

    const filteredMembers = selectedIds.length > 0
      ? members.filter(m => selectedIds.includes(m.id))
      : members;

    const excelData = filteredMembers.map(m => {
      const cleanRemark = (m.remark || '').replace(/\\r\\n|\\n|\\r/g, ' ').trim();
      return {
        'No': m.seq_no ?? m.id,
        '성명(Name)': m.name || '',
        '외국인/주민등록번호': m.number || '',
        '이메일(Email)': m.email || '',
        '연락처(Telephone)': m.phon || '',
        '체류 및 근무기간': `${formatUnixDate(m.date_from)} ~ ${formatUnixDate(m.date_to)}`,
        '영수증 발급건수': `${m.receipt_count ?? 0}건`,
        '회사명(Company)': m.company || '',
        '근무지/프로젝트': `${m.work_place || ''} ${m.project_name ? `/ ${m.project_name}` : ''}`.trim(),
        '국적(Nationality)': m.nationality || '',
        '주소(Address)': m.address || '',
        '혼인여부': m.married === '2' ? 'Married' : 'Single',
        '배우자유무': m.spouse === '1' ? '유 (소득있음)' : m.spouse === '2' ? '유 (소득없음)' : '무',
        '20세이하자녀수': m.age || '0',
        '기본급(Basic Salary)': m.money_01 || '',
        '해외수당(Allowance)': m.money_02 || '',
        '상여금(Bonus)': m.money_03 || '',
        '총급여(Total)': m.money_04 || '',
        '비고(Remark)': cleanRemark,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Member_List');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    let filename = `GTA_Member_List_${nowStr}.xlsx`;
    if (selectedIds.length > 0) {
      filename = `GTA_Member_Selected_${selectedIds.length}items_${nowStr}.xlsx`;
    } else if (query) {
      filename = `GTA_Member_${field}_${encodeURIComponent(query)}_${nowStr}.xlsx`;
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
