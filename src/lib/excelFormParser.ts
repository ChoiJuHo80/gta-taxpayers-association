import * as XLSX from 'xlsx';

export interface ParsedApplicationData {
  applicantName?: string;
  nationality?: string;
  alienRegNo?: string;
  address?: string;
  email?: string;
  company?: string;
  workPlace?: string;
  projectName?: string;
  phone?: string;
  dateFromYear?: string;
  dateFromMonth?: string;
  dateFromDay?: string;
  dateToYear?: string;
  dateToMonth?: string;
  dateToDay?: string;
  workedBefore2004?: 'No' | 'Yes';
  maritalStatus?: 'Single' | 'Married';
  spouseName?: string;
  spouseDob?: string;
  spouseIncome?: 'No' | 'Yes';
  childrenCount?: string;
  children?: { name: string; dob: string }[];
  salaryCurrency?: 'USD' | 'EURO' | 'NOK' | 'GBP' | 'DKK' | 'CAD' | 'AUD' | 'SGD' | 'SEK' | 'JPY' | 'KRW';
  salaryBasic?: string;
  salaryAllowance?: string;
  salaryBonus?: string;
  workedOtherCompany?: 'No' | 'Yes';
  remark?: string;
  signature?: string;
}

export interface ParseResult {
  success: boolean;
  fields: ParsedApplicationData;
  filledCount: number;
  detectedSheet: string;
  message: string;
}

function cleanStr(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val)
    .replace(/\u00a0/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

function isPlaceholder(val: string): boolean {
  const v = val.toLowerCase().trim();
  return (
    v === 'dd.mm.yyyy' ||
    v === 'dd' ||
    v === 'mm' ||
    v === 'yyyy' ||
    v === '(from)' ||
    v === '~(to)' ||
    v === '(' ||
    v === ')' ||
    v === 'or' ||
    v === '(project name)' ||
    v === '(ex : hanwha ocean ,shi ,hhi ,stx ,....)' ||
    v === 'a copy of your marriage certificate is required.' ||
    v === 'send us the certificate to prove your relationship.' ||
    v === '※ family stays in korea : only a copy of alien registration card is necessary.' ||
    v === '증빙서류 제출- 주민등록등본 or 가족관계증명서'
  );
}

export function parseDate(cellVal: any, cellW?: any): { y: string; m: string; d: string; formatted: string } | null {
  if (!cellVal && !cellW) return null;
  const strW = cleanStr(cellW);
  const strV = cleanStr(cellVal);

  if (isPlaceholder(strW) && isPlaceholder(strV)) return null;

  // Numeric Excel serial date (e.g. 45566 -> 2024-10-01)
  if (typeof cellVal === 'number' && cellVal > 15000 && cellVal < 70000) {
    const jsDate = new Date(Math.round((cellVal - 25569) * 86400 * 1000));
    if (!isNaN(jsDate.getTime())) {
      const y = String(jsDate.getUTCFullYear());
      const m = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
      const d = String(jsDate.getUTCDate()).padStart(2, '0');
      return { y, m, d, formatted: `${y}-${m}-${d}` };
    }
  }

  // Date object
  if (cellVal instanceof Date && !isNaN(cellVal.getTime())) {
    const y = String(cellVal.getFullYear());
    const m = String(cellVal.getMonth() + 1).padStart(2, '0');
    const d = String(cellVal.getDate()).padStart(2, '0');
    return { y, m, d, formatted: `${y}-${m}-${d}` };
  }

  const candidate = (!isPlaceholder(strW) && strW) || (!isPlaceholder(strV) && strV) || '';
  if (!candidate) return null;

  // YYYY.MM.DD
  let match = candidate.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (match) {
    return {
      y: match[1],
      m: match[2].padStart(2, '0'),
      d: match[3].padStart(2, '0'),
      formatted: `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`,
    };
  }

  // DD.MM.YYYY
  match = candidate.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (match) {
    return {
      y: match[3],
      m: match[2].padStart(2, '0'),
      d: match[1].padStart(2, '0'),
      formatted: `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`,
    };
  }

  return null;
}

export function parseSalary(cellVal: any): { amount: string; currency?: ParsedApplicationData['salaryCurrency'] } | null {
  if (cellVal === undefined || cellVal === null || cellVal === '') return null;
  const str = cleanStr(cellVal);
  if (!str) return null;

  let currency: ParsedApplicationData['salaryCurrency'] | undefined = undefined;
  if (/(\$|USD)/i.test(str)) currency = 'USD';
  else if (/(€|EUR|EURO)/i.test(str)) currency = 'EURO';
  else if (/(₩|KRW|원)/i.test(str)) currency = 'KRW';
  else if (/(NOK|\bkr\b)/i.test(str)) currency = 'NOK';
  else if (/(£|GBP)/i.test(str)) currency = 'GBP';
  else if (/DKK/i.test(str)) currency = 'DKK';
  else if (/CAD/i.test(str)) currency = 'CAD';
  else if (/AUD/i.test(str)) currency = 'AUD';
  else if (/SGD/i.test(str)) currency = 'SGD';
  else if (/SEK/i.test(str)) currency = 'SEK';
  else if (/(¥|JPY)/i.test(str)) currency = 'JPY';

  const numClean = str.replace(/[^0-9.]/g, '');
  if (!numClean || isNaN(Number(numClean))) return null;

  return { amount: numClean, currency };
}

function findSectionStarts(ws: XLSX.WorkSheet, maxRow: number): { row: number; isKor: boolean }[] {
  const starts: { row: number; isKor: boolean }[] = [];
  for (let r = 1; r <= maxRow; r++) {
    for (let c = 0; c < 28; c++) {
      const col = XLSX.utils.encode_col(c);
      const cell = ws[`${col}${r}`];
      if (cell) {
        const txt = cleanStr(cell.w || cell.v);
        if (/^1\.\s*(Applicant'?s?\s*name|성함)/i.test(txt)) {
          starts.push({ row: r, isKor: /성함/i.test(txt) });
          break;
        }
      }
    }
  }
  return starts.length > 0 ? starts : [{ row: 6, isKor: false }];
}

function extractFromRange(ws: XLSX.WorkSheet, startRow: number, endRow: number): { fields: ParsedApplicationData; score: number } {
  const fields: ParsedApplicationData = {};
  let score = 0;

  for (let r = startRow; r <= endRow; r++) {
    const rowCells: { col: string; cIdx: number; val: any; w: any }[] = [];
    for (let c = 0; c < 28; c++) {
      const col = XLSX.utils.encode_col(c);
      const addr = `${col}${r}`;
      const cell = ws[addr];
      if (cell && (cell.v !== undefined || cell.w !== undefined)) {
        const val = cleanStr(cell.v);
        const w = cleanStr(cell.w);
        if (val || w) {
          rowCells.push({ col, cIdx: c, val: cell.v, w: cell.w });
        }
      }
    }
    if (rowCells.length === 0) continue;

    const fullRowText = rowCells.map(c => cleanStr(c.w || c.val)).join(' ');

    // 1. Applicant Name & Nationality
    if (!fields.applicantName && /Applicant'?s?\s*name|성함/i.test(fullRowText)) {
      const natIdx = rowCells.findIndex(c => /Nationality|국적/i.test(cleanStr(c.val || c.w)));
      const nameCells = natIdx > 0 ? rowCells.slice(1, natIdx) : rowCells.slice(1);
      const nameCand = nameCells.find(c => cleanStr(c.val || c.w) && !isPlaceholder(cleanStr(c.val || c.w)));
      if (nameCand) {
        fields.applicantName = cleanStr(nameCand.val || nameCand.w).toUpperCase();
        if (!fields.signature) fields.signature = cleanStr(nameCand.val || nameCand.w);
        score++;
      }
      if (natIdx > 0 && !fields.nationality) {
        const natCand = rowCells.slice(natIdx + 1).find(c => cleanStr(c.val || c.w) && !isPlaceholder(cleanStr(c.val || c.w)));
        if (natCand) {
          fields.nationality = cleanStr(natCand.val || natCand.w);
          score++;
        }
      }
    }

    // 2. Alien Reg No / 주민등록번호
    if (!fields.alienRegNo && /Alien Registration Number|주민등록번호|외국인등록번호/i.test(fullRowText)) {
      const valCand = rowCells.slice(1).find(c => cleanStr(c.val || c.w) && !isPlaceholder(cleanStr(c.val || c.w)));
      if (valCand) {
        fields.alienRegNo = cleanStr(valCand.val || valCand.w).replace(/\s+/g, '-');
        score++;
      }
    }

    // 3. Address
    if (!fields.address && /Address|주소/i.test(fullRowText) && !/e-mail/i.test(fullRowText)) {
      const valCand = rowCells.slice(1).find(c => cleanStr(c.val || c.w) && !isPlaceholder(cleanStr(c.val || c.w)));
      if (valCand) {
        fields.address = cleanStr(valCand.val || valCand.w);
        score++;
      }
    }

    // 3.5 Email
    if (!fields.email && /e-mail|이메일/i.test(fullRowText)) {
      const valCand = rowCells.slice(1).find(c => cleanStr(c.val || c.w) && !isPlaceholder(cleanStr(c.val || c.w)));
      if (valCand) {
        fields.email = cleanStr(valCand.val || valCand.w);
        score++;
      }
    }

    // 4. Company
    if (!fields.company && /Company|회사명/i.test(fullRowText) && !/worked for other/i.test(fullRowText)) {
      const valCand = rowCells.slice(1).find(c => cleanStr(c.val || c.w) && !isPlaceholder(cleanStr(c.val || c.w)));
      if (valCand) {
        fields.company = cleanStr(valCand.val || valCand.w);
        score++;
      }
    }

    // 5. Work place & Project Name
    if (/Work place/i.test(fullRowText)) {
      const projIdx = rowCells.findIndex(c => /Project Name/i.test(cleanStr(c.val || c.w)));
      const wpCells = projIdx > 0 ? rowCells.slice(1, projIdx) : rowCells.slice(1);
      const wpCand = wpCells.find(c => cleanStr(c.val || c.w) && !isPlaceholder(cleanStr(c.val || c.w)));
      if (wpCand && !fields.workPlace) {
        fields.workPlace = cleanStr(wpCand.val || wpCand.w);
        score++;
      }
      if (projIdx > 0 && !fields.projectName) {
        const projCand = rowCells.slice(projIdx + 1).find(c => cleanStr(c.val || c.w) && !isPlaceholder(cleanStr(c.val || c.w)));
        if (projCand) {
          fields.projectName = cleanStr(projCand.val || projCand.w);
          score++;
        }
      }
    }

    // 6. Telephone & Mobile
    if (!fields.phone && /Telephone|Mobile|연락처/i.test(fullRowText)) {
      const valCand = rowCells.slice(1).find(c => cleanStr(c.val || c.w) && !isPlaceholder(cleanStr(c.val || c.w)));
      if (valCand) {
        let p = cleanStr(valCand.val || valCand.w);
        const digits = p.replace(/[^0-9]/g, '');
        if (digits.length === 11 && digits.startsWith('010')) {
          p = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
        } else if (digits.length === 10 && digits.startsWith('01')) {
          p = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
        fields.phone = p;
        score++;
      }
    }

    // 7. Stay & Work dates
    if (/Date of Stay|근무계약기간/i.test(fullRowText)) {
      const datesFound: { y: string; m: string; d: string }[] = [];
      for (const cell of rowCells) {
        const parsed = parseDate(cell.val, cell.w);
        if (parsed) datesFound.push(parsed);
      }
      if (datesFound.length >= 2) {
        fields.dateFromYear = datesFound[0].y;
        fields.dateFromMonth = datesFound[0].m;
        fields.dateFromDay = datesFound[0].d;
        fields.dateToYear = datesFound[1].y;
        fields.dateToMonth = datesFound[1].m;
        fields.dateToDay = datesFound[1].d;
        score += 2;
      }
    }

    // 8. Spouse
    if (/Spouse’?s?\s*Name|배우자\s*이름/i.test(fullRowText)) {
      const spIdx = rowCells.findIndex(c => /Spouse|배우자/i.test(cleanStr(c.val || c.w)));
      const dobIdx = rowCells.findIndex(c => /Date of Birth|생년월일/i.test(cleanStr(c.val || c.w)));
      if (spIdx >= 0) {
        const nameCells = dobIdx > spIdx ? rowCells.slice(spIdx + 1, dobIdx) : rowCells.slice(spIdx + 1);
        const nameCand = nameCells.find(c => cleanStr(c.val || c.w) && !isPlaceholder(cleanStr(c.val || c.w)));
        if (nameCand) {
          fields.spouseName = cleanStr(nameCand.val || nameCand.w);
          fields.maritalStatus = 'Married';
          score++;
        }
      }
      if (dobIdx >= 0) {
        const dobCand = rowCells.slice(dobIdx + 1).find(c => parseDate(c.val, c.w) !== null);
        if (dobCand) {
          const p = parseDate(dobCand.val, dobCand.w);
          if (p) {
            fields.spouseDob = p.formatted;
            fields.maritalStatus = 'Married';
            score++;
          }
        }
      }
    }

    // Children: scan lines around Child's Name
    if (r >= startRow + 16 && r <= startRow + 24) {
      if (!/Child's Name|자녀 이름|Date of Birth/i.test(fullRowText)) {
        const nonEmp = rowCells.filter(c => cleanStr(c.val || c.w) && !isPlaceholder(cleanStr(c.val || c.w)));
        if (nonEmp.length >= 2) {
          const cName = cleanStr(nonEmp[0].val || nonEmp[0].w);
          const cDob = parseDate(nonEmp[1].val, nonEmp[1].w);
          if (cName && cDob) {
            if (!fields.children) fields.children = [];
            fields.children.push({ name: cName, dob: cDob.formatted });
            fields.childrenCount = String(fields.children.length);
            score++;
          }
        }
      }
    }

    // 9. Salaries
    if (!fields.salaryBasic && /Basic Salary|기본급/i.test(fullRowText)) {
      const cand = rowCells.slice(1).find(c => parseSalary(c.val || c.w));
      if (cand) {
        const sal = parseSalary(cand.val || cand.w);
        if (sal) {
          fields.salaryBasic = sal.amount;
          if (sal.currency) fields.salaryCurrency = sal.currency;
          score++;
        }
      }
    }
    if (!fields.salaryAllowance && /Overseas allowance|해외수당/i.test(fullRowText)) {
      const cand = rowCells.slice(1).find(c => parseSalary(c.val || c.w));
      if (cand) {
        const sal = parseSalary(cand.val || cand.w);
        if (sal) {
          fields.salaryAllowance = sal.amount;
          if (!fields.salaryCurrency && sal.currency) fields.salaryCurrency = sal.currency;
          score++;
        }
      }
    }
    if (!fields.salaryBonus && /Bonus|상여금/i.test(fullRowText)) {
      const cand = rowCells.slice(1).find(c => parseSalary(c.val || c.w));
      if (cand) {
        const sal = parseSalary(cand.val || cand.w);
        if (sal) {
          fields.salaryBonus = sal.amount;
          if (!fields.salaryCurrency && sal.currency) fields.salaryCurrency = sal.currency;
          score++;
        }
      }
    }

    // Signature
    if (/Applicant's Signature/i.test(fullRowText)) {
      const sigIdx = rowCells.findIndex(c => /Applicant's Signature/i.test(cleanStr(c.val || c.w)));
      if (sigIdx >= 0) {
        const sigCand = rowCells.slice(sigIdx + 1).find(c => cleanStr(c.val || c.w) && !isPlaceholder(cleanStr(c.val || c.w)));
        if (sigCand) {
          fields.signature = cleanStr(sigCand.val || sigCand.w);
          score++;
        }
      }
    }

    // Signature Date fallback to stay start date if stay date was not entered
    if (/Date\s*[:：]/i.test(fullRowText)) {
      const dtIdx = rowCells.findIndex(c => /Date\s*[:：]/i.test(cleanStr(c.val || c.w)));
      if (dtIdx >= 0 && !fields.dateFromYear) {
        const dtCand = rowCells.slice(dtIdx + 1).find(c => parseDate(c.val, c.w) !== null);
        if (dtCand) {
          const d = parseDate(dtCand.val, dtCand.w);
          if (d) {
            fields.dateFromYear = d.y;
            fields.dateFromMonth = d.m;
            fields.dateFromDay = d.d;
            score++;
          }
        }
      }
    }
  }

  return { fields, score };
}

/**
 * Main parser entry point:
 * Handles:
 * 1. Native multi-sheet Excel (.xlsx, .xls)
 * 2. Single-sheet CSV/text where multiple sections are concatenated vertically
 * Evaluates all sheets and sections, picking the one with the highest score.
 */
export function parseApplicationExcel(fileBuffer: ArrayBuffer | Uint8Array): ParseResult {
  try {
    const wb = XLSX.read(fileBuffer, { type: 'array', cellDates: true });
    if (!wb.SheetNames || wb.SheetNames.length === 0) {
      return { success: false, fields: {}, filledCount: 0, detectedSheet: '', message: '엑셀 시트가 비어 있습니다.' };
    }

    let bestSheetName = wb.SheetNames[0];
    let bestScore = -1;
    let bestFields: ParsedApplicationData = {};

    for (const sName of wb.SheetNames) {
      const ws = wb.Sheets[sName];
      if (!ws || !ws['!ref']) continue;

      const range = XLSX.utils.decode_range(ws['!ref']);
      const maxRow = range.e.r + 1;

      // Find all potential section starts (e.g. Row 6, Row 43, Row 82 in combined CSVs)
      const sectionStarts = findSectionStarts(ws, maxRow);

      for (let i = 0; i < sectionStarts.length; i++) {
        const s = sectionStarts[i];
        const nextStart = sectionStarts[i + 1] ? sectionStarts[i + 1].row - 1 : maxRow;
        const { fields, score } = extractFromRange(ws, s.row, nextStart);

        if (score > bestScore) {
          bestScore = score;
          bestSheetName = sName;
          bestFields = fields;
        }
      }
    }

    const filledCount = Object.keys(bestFields).filter(k => {
      const val = (bestFields as any)[k];
      return val !== undefined && val !== '' && (Array.isArray(val) ? val.length > 0 : true);
    }).length;

    if (filledCount === 0) {
      return {
        success: false,
        fields: {},
        filledCount: 0,
        detectedSheet: bestSheetName,
        message: '작성된 신청서 데이터를 찾지 못했습니다. 파일 내용이 비어있는지 확인해 주세요.',
      };
    }

    return {
      success: true,
      fields: bestFields,
      filledCount,
      detectedSheet: bestSheetName,
      message: `${filledCount}개 항목이 성공적으로 자동 추출되었습니다.`,
    };
  } catch (err: any) {
    return {
      success: false,
      fields: {},
      filledCount: 0,
      detectedSheet: '',
      message: `파일 파싱 실패: ${err.message || '파일을 읽을 수 없습니다.'}`,
    };
  }
}
