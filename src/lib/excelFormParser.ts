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

// Helper: Normalize string (remove non-breaking spaces, trim)
function cleanStr(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val)
    .replace(/\u00a0/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

// Helper: Check if value is a placeholder from template
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
    v === '증빙서류 제출- 주민등록등본 or 가족관계증명서' ||
    v === 'dd.mm.yyyy'
  );
}

// Helper: Parse date from Excel cell (serial number, Date object, or text)
export function parseDate(cellVal: any, cellW?: any): { y: string; m: string; d: string; formatted: string } | null {
  if (!cellVal && !cellW) return null;
  const strW = cleanStr(cellW);
  const strV = cleanStr(cellVal);

  if (isPlaceholder(strW) && isPlaceholder(strV)) return null;

  // 1. Numeric Excel serial date (e.g. 45566 -> 2024-10-01)
  if (typeof cellVal === 'number' && cellVal > 15000 && cellVal < 70000) {
    const jsDate = new Date(Math.round((cellVal - 25569) * 86400 * 1000));
    if (!isNaN(jsDate.getTime())) {
      const y = String(jsDate.getUTCFullYear());
      const m = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
      const d = String(jsDate.getUTCDate()).padStart(2, '0');
      return { y, m, d, formatted: `${y}-${m}-${d}` };
    }
  }

  // 2. Date object
  if (cellVal instanceof Date && !isNaN(cellVal.getTime())) {
    const y = String(cellVal.getFullYear());
    const m = String(cellVal.getMonth() + 1).padStart(2, '0');
    const d = String(cellVal.getDate()).padStart(2, '0');
    return { y, m, d, formatted: `${y}-${m}-${d}` };
  }

  // 3. String date formats
  const candidate = (!isPlaceholder(strW) && strW) || (!isPlaceholder(strV) && strV) || '';
  if (!candidate) return null;

  // YYYY.MM.DD or YYYY-MM-DD or YYYY/MM/DD
  let match = candidate.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (match) {
    return {
      y: match[1],
      m: match[2].padStart(2, '0'),
      d: match[3].padStart(2, '0'),
      formatted: `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`,
    };
  }

  // DD.MM.YYYY or DD-MM-YYYY or DD/MM/YYYY
  match = candidate.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (match) {
    return {
      y: match[3],
      m: match[2].padStart(2, '0'),
      d: match[1].padStart(2, '0'),
      formatted: `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`,
    };
  }

  // Embedded date in text: e.g. "from 2026.10.01"
  match = candidate.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (match) {
    return {
      y: match[1],
      m: match[2].padStart(2, '0'),
      d: match[3].padStart(2, '0'),
      formatted: `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`,
    };
  }

  return null;
}

// Helper: Parse salary amount and detect currency
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

// Helper: Check if cell contains check mark
function isChecked(val: any): boolean {
  if (val === undefined || val === null) return false;
  const s = String(val).trim();
  return /^[vVoOxX■☑✔*✓]$/.test(s) || /^(yes|true|y|checked)$/i.test(s) || /^[vVoOxX■☑✔*✓]\s+/i.test(s);
}

// Get cell value safely
function getCellVal(ws: XLSX.WorkSheet, addr: string): any {
  const cell = ws[addr];
  if (!cell) return null;
  return cell.v !== undefined ? cell.v : cell.w !== undefined ? cell.w : null;
}

function getCellW(ws: XLSX.WorkSheet, addr: string): any {
  const cell = ws[addr];
  if (!cell) return null;
  return cell.w;
}

// Extract data from a specific sheet
function extractSheetData(ws: XLSX.WorkSheet, sheetName: string): { fields: ParsedApplicationData; score: number } {
  const fields: ParsedApplicationData = {};
  const isKor = /KOR|한국어|한글/i.test(sheetName);
  let score = 0;

  // 1. Direct Coordinate Mapping based on official template structure
  if (isKor) {
    // --- KOR Sheet Direct Coordinates ---
    // 1. 성함: E6
    const nameVal = cleanStr(getCellVal(ws, 'E6'));
    if (nameVal && !isPlaceholder(nameVal)) {
      fields.applicantName = nameVal.toUpperCase();
      fields.signature = nameVal;
      score++;
    }
    // 국적: V6
    const natVal = cleanStr(getCellVal(ws, 'V6'));
    if (natVal && !isPlaceholder(natVal)) {
      fields.nationality = natVal;
      score++;
    }
    // 2. 주민등록번호: G7
    const rrnVal = cleanStr(getCellVal(ws, 'G7'));
    if (rrnVal && !isPlaceholder(rrnVal)) {
      fields.alienRegNo = rrnVal;
      score++;
    }
    // 3. 주소: E8
    const addrVal = cleanStr(getCellVal(ws, 'E8'));
    if (addrVal && !isPlaceholder(addrVal)) {
      fields.address = addrVal;
      score++;
    }
    // 이메일: E9
    const emailVal = cleanStr(getCellVal(ws, 'E9'));
    if (emailVal && !isPlaceholder(emailVal)) {
      fields.email = emailVal;
      score++;
    }
    // 4. 회사명: F10
    const compVal = cleanStr(getCellVal(ws, 'F10'));
    if (compVal && !isPlaceholder(compVal)) {
      fields.company = compVal;
      score++;
    }
    // 5. Work place: F11, Project Name: R11
    const wpVal = cleanStr(getCellVal(ws, 'F11'));
    if (wpVal && !isPlaceholder(wpVal)) {
      fields.workPlace = wpVal;
      score++;
    }
    const projVal = cleanStr(getCellVal(ws, 'R11'));
    if (projVal && !isPlaceholder(projVal)) {
      fields.projectName = projVal;
      score++;
    }
    // 6. 연락처: K13
    const phoneVal = cleanStr(getCellVal(ws, 'K13'));
    if (phoneVal && !isPlaceholder(phoneVal)) {
      fields.phone = phoneVal;
      score++;
    }
    // 7. 근무계약기간: K14 (from), T14 (to)
    const dFrom = parseDate(getCellVal(ws, 'K14'), getCellW(ws, 'K14'));
    if (dFrom) {
      fields.dateFromYear = dFrom.y;
      fields.dateFromMonth = dFrom.m;
      fields.dateFromDay = dFrom.d;
      score++;
    }
    const dTo = parseDate(getCellVal(ws, 'T14'), getCellW(ws, 'T14'));
    if (dTo) {
      fields.dateToYear = dTo.y;
      fields.dateToMonth = dTo.m;
      fields.dateToDay = dTo.d;
      score++;
    }
    // 8. 공제항목: 미혼 B16, 기혼 B17 / A17
    if (isChecked(getCellVal(ws, 'A17')) || isChecked(getCellVal(ws, 'B17')) || /기혼/i.test(cleanStr(getCellVal(ws, 'B17')))) {
      if (isChecked(getCellVal(ws, 'A17')) || isChecked(getCellVal(ws, 'B17'))) {
        fields.maritalStatus = 'Married';
        score++;
      }
    }
    if (isChecked(getCellVal(ws, 'A16')) || isChecked(getCellVal(ws, 'B16'))) {
      fields.maritalStatus = 'Single';
      score++;
    }
    // 배우자 이름: G18, 생년월일: S18
    const spName = cleanStr(getCellVal(ws, 'G18'));
    if (spName && !isPlaceholder(spName)) {
      fields.spouseName = spName;
      fields.maritalStatus = 'Married';
      score++;
    }
    const spDob = parseDate(getCellVal(ws, 'S18'), getCellW(ws, 'S18'));
    if (spDob) {
      fields.spouseDob = spDob.formatted;
      fields.maritalStatus = 'Married';
      score++;
    }
    // 자녀 정보: Row 22, 23, 24 (D=이름, N=생년월일)
    const childrenList: { name: string; dob: string }[] = [];
    for (const r of [22, 23, 24]) {
      const cName = cleanStr(getCellVal(ws, `D${r}`));
      const cDob = parseDate(getCellVal(ws, `N${r}`), getCellW(ws, `N${r}`));
      if (cName && !isPlaceholder(cName)) {
        childrenList.push({ name: cName, dob: cDob ? cDob.formatted : cleanStr(getCellVal(ws, `N${r}`)) });
        score++;
      }
    }
    if (childrenList.length > 0) {
      fields.childrenCount = String(childrenList.length);
      fields.children = childrenList;
    }
    // 9. 급여: R27 (기본급), R28 (해외수당), R29 (상여금)
    const salBasic = parseSalary(getCellVal(ws, 'R27'));
    if (salBasic) {
      fields.salaryBasic = salBasic.amount;
      if (salBasic.currency) fields.salaryCurrency = salBasic.currency;
      score++;
    }
    const salAllow = parseSalary(getCellVal(ws, 'R28'));
    if (salAllow) {
      fields.salaryAllowance = salAllow.amount;
      if (!fields.salaryCurrency && salAllow.currency) fields.salaryCurrency = salAllow.currency;
      score++;
    }
    const salBonus = parseSalary(getCellVal(ws, 'R29'));
    if (salBonus) {
      fields.salaryBonus = salBonus.amount;
      if (!fields.salaryCurrency && salBonus.currency) fields.salaryCurrency = salBonus.currency;
      score++;
    }
    // 서명: Q34
    const sigVal = cleanStr(getCellVal(ws, 'Q34'));
    if (sigVal && !isPlaceholder(sigVal)) {
      fields.signature = sigVal;
      score++;
    }
  } else {
    // --- ENG / Sheet1 Direct Coordinates ---
    // 1. 성함: H6 (ENG)
    const nameVal = cleanStr(getCellVal(ws, 'H6'));
    if (nameVal && !isPlaceholder(nameVal)) {
      fields.applicantName = nameVal.toUpperCase();
      fields.signature = nameVal;
      score++;
    }
    // 국적: V6 (ENG)
    const natVal = cleanStr(getCellVal(ws, 'V6'));
    if (natVal && !isPlaceholder(natVal)) {
      fields.nationality = natVal;
      score++;
    }
    // 2. 외국인등록번호: J7
    const rrnVal = cleanStr(getCellVal(ws, 'J7'));
    if (rrnVal && !isPlaceholder(rrnVal)) {
      fields.alienRegNo = rrnVal;
      score++;
    }
    // 3. 주소: E8
    const addrVal = cleanStr(getCellVal(ws, 'E8'));
    if (addrVal && !isPlaceholder(addrVal)) {
      fields.address = addrVal;
      score++;
    }
    // 이메일: E9
    const emailVal = cleanStr(getCellVal(ws, 'E9'));
    if (emailVal && !isPlaceholder(emailVal)) {
      fields.email = emailVal;
      score++;
    }
    // 4. 회사명: F10
    const compVal = cleanStr(getCellVal(ws, 'F10'));
    if (compVal && !isPlaceholder(compVal)) {
      fields.company = compVal;
      score++;
    }
    // 5. Work place: F11, Project Name: R11
    const wpVal = cleanStr(getCellVal(ws, 'F11'));
    if (wpVal && !isPlaceholder(wpVal)) {
      fields.workPlace = wpVal;
      score++;
    }
    const projVal = cleanStr(getCellVal(ws, 'R11'));
    if (projVal && !isPlaceholder(projVal)) {
      fields.projectName = projVal;
      score++;
    }
    // 6. Telephone: K13, Mobile: K14
    const telVal = cleanStr(getCellVal(ws, 'K13'));
    const mobVal = cleanStr(getCellVal(ws, 'K14'));
    let phoneVal = mobVal && !isPlaceholder(mobVal) ? mobVal : telVal && !isPlaceholder(telVal) ? telVal : '';
    if (phoneVal) {
      // Normalize Korean mobile: e.g. 010-25794682 or 01025794682 -> 010-2579-4682
      const digits = phoneVal.replace(/[^0-9]/g, '');
      if (digits.length === 11 && digits.startsWith('010')) {
        phoneVal = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
      } else if (digits.length === 10 && digits.startsWith('01')) {
        phoneVal = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      fields.phone = phoneVal;
      score++;
    }
    // 7. Date of Stay & Work: K15 (from), T15 (to)
    const dFrom = parseDate(getCellVal(ws, 'K15'), getCellW(ws, 'K15'));
    if (dFrom) {
      fields.dateFromYear = dFrom.y;
      fields.dateFromMonth = dFrom.m;
      fields.dateFromDay = dFrom.d;
      score++;
    }
    const dTo = parseDate(getCellVal(ws, 'T15'), getCellW(ws, 'T15'));
    if (dTo) {
      fields.dateToYear = dTo.y;
      fields.dateToMonth = dTo.m;
      fields.dateToDay = dTo.d;
      score++;
    }
    // Fallback: If stay dates are empty, check application signature date at Q39 / P39
    if (!fields.dateFromYear) {
      const sigDate = parseDate(getCellVal(ws, 'Q39'), getCellW(ws, 'Q39')) || parseDate(getCellVal(ws, 'P39'), getCellW(ws, 'P39'));
      if (sigDate) {
        fields.dateFromYear = sigDate.y;
        fields.dateFromMonth = sigDate.m;
        fields.dateFromDay = sigDate.d;
        score++;
      }
    }
    // 2004 이전 근무 여부: Row 16
    const b2004Val = cleanStr(getCellVal(ws, 'S16')) || cleanStr(getCellVal(ws, 'V16'));
    if (isChecked(b2004Val) || /yes/i.test(b2004Val)) {
      fields.workedBefore2004 = 'Yes';
    }
    // 8. Exemption: Single B18, Married B19 / A19
    if (isChecked(getCellVal(ws, 'A19')) || isChecked(getCellVal(ws, 'B19')) || /married/i.test(cleanStr(getCellVal(ws, 'B19')))) {
      if (isChecked(getCellVal(ws, 'A19')) || isChecked(getCellVal(ws, 'B19'))) {
        fields.maritalStatus = 'Married';
        score++;
      }
    }
    if (isChecked(getCellVal(ws, 'A18')) || isChecked(getCellVal(ws, 'B18'))) {
      fields.maritalStatus = 'Single';
      score++;
    }
    // 배우자 이름: G20, 생년월일: S20
    const spName = cleanStr(getCellVal(ws, 'G20'));
    if (spName && !isPlaceholder(spName)) {
      fields.spouseName = spName;
      fields.maritalStatus = 'Married';
      score++;
    }
    const spDob = parseDate(getCellVal(ws, 'S20'), getCellW(ws, 'S20'));
    if (spDob) {
      fields.spouseDob = spDob.formatted;
      fields.maritalStatus = 'Married';
      score++;
    }
    // 배우자 소득 유무: Row 21 (R21 or U21 or X21)
    const spIncVal = cleanStr(getCellVal(ws, 'S21')) || cleanStr(getCellVal(ws, 'V21')) || cleanStr(getCellVal(ws, 'R21'));
    if (/yes/i.test(spIncVal) || isChecked(spIncVal)) {
      fields.spouseIncome = 'Yes';
    }
    // 자녀 정보: Row 24, 25, 26 (D=이름, N=생년월일)
    const childrenList: { name: string; dob: string }[] = [];
    for (const r of [24, 25, 26]) {
      const cName = cleanStr(getCellVal(ws, `D${r}`));
      const cDob = parseDate(getCellVal(ws, `N${r}`), getCellW(ws, `N${r}`));
      if (cName && !isPlaceholder(cName)) {
        childrenList.push({ name: cName, dob: cDob ? cDob.formatted : cleanStr(getCellVal(ws, `N${r}`)) });
        score++;
      }
    }
    if (childrenList.length > 0) {
      fields.childrenCount = String(childrenList.length);
      fields.children = childrenList;
    }
    // 9. 급여: R29 (기본급), R30 (해외수당), R31 (상여금)
    const salBasic = parseSalary(getCellVal(ws, 'R29'));
    if (salBasic) {
      fields.salaryBasic = salBasic.amount;
      if (salBasic.currency) fields.salaryCurrency = salBasic.currency;
      score++;
    }
    const salAllow = parseSalary(getCellVal(ws, 'R30'));
    if (salAllow) {
      fields.salaryAllowance = salAllow.amount;
      if (!fields.salaryCurrency && salAllow.currency) fields.salaryCurrency = salAllow.currency;
      score++;
    }
    const salBonus = parseSalary(getCellVal(ws, 'R31'));
    if (salBonus) {
      fields.salaryBonus = salBonus.amount;
      if (!fields.salaryCurrency && salBonus.currency) fields.salaryCurrency = salBonus.currency;
      score++;
    }
    // 서명: Q38 (ENG) or P38
    const sigVal = cleanStr(getCellVal(ws, 'Q38'));
    if (sigVal && !isPlaceholder(sigVal)) {
      fields.signature = sigVal;
      score++;
    }
  }

  // 2. Comprehensive Row Scan (Fallback & Enhancement)
  // Scan all rows from 5 to 45 to catch any items entered in non-standard cells or inline
  for (let r = 5; r <= 42; r++) {
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

    // (A) Check if label cell contains the value inline (e.g. "1.Applicant's name: JOHN SMITH")
    const labelCell = rowCells[0];
    const labelText = cleanStr(labelCell.w || labelCell.val);

    // Name inline check
    if (!fields.applicantName && /(?:Applicant'?s?\s*name|성함)\s*[:：]\s*(.+)/i.test(labelText)) {
      const m = labelText.match(/(?:Applicant'?s?\s*name|성함)\s*[:：]\s*(.+)/i);
      if (m && m[1].trim() && !isPlaceholder(m[1].trim())) {
        fields.applicantName = m[1].trim().toUpperCase();
        if (!fields.signature) fields.signature = fields.applicantName;
        score++;
      }
    }

    // Alien Reg No inline check
    if (!fields.alienRegNo && /(?:Alien Registration Number|주민등록번호|외국인등록번호)\s*[:：]\s*(.+)/i.test(labelText)) {
      const m = labelText.match(/(?:Alien Registration Number|주민등록번호|외국인등록번호)\s*[:：]\s*(\d{6}[-\s]?[1-8]\d{6})/i);
      if (m && m[1].trim()) {
        fields.alienRegNo = m[1].trim().replace(/\s+/g, '-');
        score++;
      }
    }

    // Address inline check
    if (!fields.address && /3\.\s*Address\s*[:：]\s*(.+)/i.test(labelText)) {
      const m = labelText.match(/3\.\s*Address\s*[:：]\s*(.+)/i);
      if (m && m[1].trim() && !isPlaceholder(m[1].trim())) {
        fields.address = m[1].trim();
        score++;
      }
    }

    // Email inline check
    if (!fields.email && /\(e-mail\)\s*[:：]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i.test(labelText)) {
      const m = labelText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
      if (m) {
        fields.email = m[1];
        score++;
      }
    }

    // Company inline check
    if (!fields.company && /4\.\s*(?:Company|회사명)\s*[:：]\s*(.+)/i.test(labelText)) {
      const m = labelText.match(/4\.\s*(?:Company|회사명)\s*[:：]\s*(.+)/i);
      if (m && m[1].trim() && !isPlaceholder(m[1].trim())) {
        fields.company = m[1].trim();
        score++;
      }
    }

    // (B) Row-based label and value matching across multiple cells
    // 1. Applicant Name & Nationality
    if (!fields.applicantName && /Applicant'?s?\s*name|성함/i.test(fullRowText)) {
      const nameCandidate = rowCells.find(
        c => c.cIdx > 0 && cleanStr(c.val) && !isPlaceholder(cleanStr(c.val)) && !/nationality/i.test(cleanStr(c.val))
      );
      if (nameCandidate) {
        fields.applicantName = cleanStr(nameCandidate.val).toUpperCase();
        if (!fields.signature) fields.signature = fields.applicantName;
        score++;
      }
    }
    if (!fields.nationality && /Nationality|국적/i.test(fullRowText)) {
      const natIdx = rowCells.findIndex(c => /Nationality|국적/i.test(cleanStr(c.val)));
      if (natIdx >= 0) {
        const natCandidate = rowCells.slice(natIdx + 1).find(c => cleanStr(c.val) && !isPlaceholder(cleanStr(c.val)));
        if (natCandidate) {
          fields.nationality = cleanStr(natCandidate.val);
          score++;
        }
      }
    }

    // 2. Alien Reg No
    if (!fields.alienRegNo && /Alien Registration Number|주민등록번호|외국인등록번호/i.test(fullRowText)) {
      const rrnCandidate = rowCells.find(c => {
        const str = cleanStr(c.val || c.w);
        return /\b\d{6}[-\s]?[1-8]\d{6}\b/.test(str);
      });
      if (rrnCandidate) {
        const m = cleanStr(rrnCandidate.val || rrnCandidate.w).match(/\b(\d{6}[-\s]?[1-8]\d{6})\b/);
        if (m) {
          fields.alienRegNo = m[1].replace(/\s+/g, '-');
          score++;
        }
      } else {
        const valCandidate = rowCells.find(
          c => c.cIdx > 2 && cleanStr(c.val) && !isPlaceholder(cleanStr(c.val)) && !/Alien|주민|등록/i.test(cleanStr(c.val))
        );
        if (valCandidate) {
          fields.alienRegNo = cleanStr(valCandidate.val);
          score++;
        }
      }
    }

    // 3. Address
    if (!fields.address && /Address|주소/i.test(fullRowText) && !/e-mail/i.test(fullRowText)) {
      const addrCandidate = rowCells.find(
        c => c.cIdx > 1 && cleanStr(c.val) && !isPlaceholder(cleanStr(c.val)) && !/Address|주소/i.test(cleanStr(c.val))
      );
      if (addrCandidate) {
        fields.address = cleanStr(addrCandidate.val);
        score++;
      }
    }

    // 3.5 Email
    if (!fields.email && /e-mail|이메일/i.test(fullRowText)) {
      const emailCandidate = rowCells.find(c => /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(cleanStr(c.val)));
      if (emailCandidate) {
        const m = cleanStr(emailCandidate.val).match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (m) {
          fields.email = m[1];
          score++;
        }
      }
    }

    // 4. Company
    if (!fields.company && /Company|회사명/i.test(fullRowText) && !/worked for other/i.test(fullRowText)) {
      const compCandidate = rowCells.find(
        c => c.cIdx > 1 && cleanStr(c.val) && !isPlaceholder(cleanStr(c.val)) && !/Company|회사명/i.test(cleanStr(c.val))
      );
      if (compCandidate) {
        fields.company = cleanStr(compCandidate.val);
        score++;
      }
    }

    // 5. Work place & Project Name
    if (/Work place/i.test(fullRowText)) {
      const wpCandidate = rowCells.find(
        c => c.cIdx > 1 && cleanStr(c.val) && !isPlaceholder(cleanStr(c.val)) && !/Work place|Project/i.test(cleanStr(c.val))
      );
      if (wpCandidate && !fields.workPlace) {
        fields.workPlace = cleanStr(wpCandidate.val);
        score++;
      }
      const projIdx = rowCells.findIndex(c => /Project Name/i.test(cleanStr(c.val)));
      if (projIdx >= 0 && !fields.projectName) {
        const projCandidate = rowCells.slice(projIdx + 1).find(c => cleanStr(c.val) && !isPlaceholder(cleanStr(c.val)));
        if (projCandidate) {
          fields.projectName = cleanStr(projCandidate.val);
          score++;
        }
      }
    }

    // 6. Telephone & Mobile
    if (!fields.phone && /Telephone|Mobile|연락처/i.test(fullRowText)) {
      const phoneCandidate = rowCells.find(c => {
        const s = cleanStr(c.val || c.w);
        return /\b(01[016789][-\s]?\d{3,4}[-\s]?\d{4}|\+?\d{2,3}[-\s]?\d{2,4}[-\s]?\d{4})\b/.test(s);
      });
      if (phoneCandidate) {
        const m = cleanStr(phoneCandidate.val || phoneCandidate.w).match(
          /\b(01[016789][-\s]?\d{3,4}[-\s]?\d{4}|\+?\d{2,3}[-\s]?\d{2,4}[-\s]?\d{4})\b/
        );
        if (m) {
          fields.phone = m[1].replace(/\s+/g, '-');
          score++;
        }
      }
    }

    // 7. Date of Stay & Work
    if ((!fields.dateFromYear || !fields.dateToYear) && /Date of Stay|근무계약기간/i.test(fullRowText)) {
      const datesFound: { y: string; m: string; d: string }[] = [];
      for (const cell of rowCells) {
        const parsed = parseDate(cell.val, cell.w);
        if (parsed) datesFound.push(parsed);
      }
      if (datesFound.length >= 2) {
        if (!fields.dateFromYear) {
          fields.dateFromYear = datesFound[0].y;
          fields.dateFromMonth = datesFound[0].m;
          fields.dateFromDay = datesFound[0].d;
          score++;
        }
        if (!fields.dateToYear) {
          fields.dateToYear = datesFound[1].y;
          fields.dateToMonth = datesFound[1].m;
          fields.dateToDay = datesFound[1].d;
          score++;
        }
      }
    }

    // 8. Marital Status & Spouse
    if (/Spouse’?s?\s*Name|배우자\s*이름/i.test(fullRowText)) {
      const spIdx = rowCells.findIndex(c => /Spouse|배우자/i.test(cleanStr(c.val)));
      const dobIdx = rowCells.findIndex(c => /Date of Birth|생년월일/i.test(cleanStr(c.val)));
      if (spIdx >= 0) {
        const nameCells = dobIdx > spIdx ? rowCells.slice(spIdx + 1, dobIdx) : rowCells.slice(spIdx + 1);
        const nameCand = nameCells.find(c => cleanStr(c.val) && !isPlaceholder(cleanStr(c.val)));
        if (nameCand && !fields.spouseName) {
          fields.spouseName = cleanStr(nameCand.val);
          fields.maritalStatus = 'Married';
          score++;
        }
      }
      if (dobIdx >= 0 && !fields.spouseDob) {
        const dobCand = rowCells.slice(dobIdx + 1).find(c => {
          return parseDate(c.val, c.w) !== null;
        });
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

    // 9. Class B Salary scan
    if (!fields.salaryBasic && /Basic Salary|기본급/i.test(fullRowText)) {
      const cand = rowCells.find(c => c.cIdx > 1 && parseSalary(c.val));
      if (cand) {
        const sal = parseSalary(cand.val);
        if (sal) {
          fields.salaryBasic = sal.amount;
          if (sal.currency) fields.salaryCurrency = sal.currency;
          score++;
        }
      }
    }
    if (!fields.salaryAllowance && /Overseas allowance|해외수당/i.test(fullRowText)) {
      const cand = rowCells.find(c => c.cIdx > 1 && parseSalary(c.val));
      if (cand) {
        const sal = parseSalary(cand.val);
        if (sal) {
          fields.salaryAllowance = sal.amount;
          if (!fields.salaryCurrency && sal.currency) fields.salaryCurrency = sal.currency;
          score++;
        }
      }
    }
    if (!fields.salaryBonus && /Bonus|상여금/i.test(fullRowText)) {
      const cand = rowCells.find(c => c.cIdx > 1 && parseSalary(c.val));
      if (cand) {
        const sal = parseSalary(cand.val);
        if (sal) {
          fields.salaryBonus = sal.amount;
          if (!fields.salaryCurrency && sal.currency) fields.salaryCurrency = sal.currency;
          score++;
        }
      }
    }
  }

  return { fields, score };
}

/**
 * Main parser entry point:
 * Reads workbook, evaluates all sheets (ENG, KOR, Sheet1, etc.),
 * and selects the sheet with the most extracted information.
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

    // Analyze each sheet
    for (const sName of wb.SheetNames) {
      const ws = wb.Sheets[sName];
      if (!ws) continue;
      const { fields, score } = extractSheetData(ws, sName);

      // Prioritize sheets with actual user-entered data
      if (score > bestScore) {
        bestScore = score;
        bestSheetName = sName;
        bestFields = fields;
      }
    }

    // Count non-empty fields in final result
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
        message: '엑셀 파일에서 작성된 신청서 데이터를 찾지 못했습니다. 파일 내용이 비어있거나 서식이 다른지 확인해 주세요.',
      };
    }

    return {
      success: true,
      fields: bestFields,
      filledCount,
      detectedSheet: bestSheetName,
      message: `시트 [${bestSheetName}]에서 ${filledCount}개 항목이 성공적으로 자동 추출되었습니다.`,
    };
  } catch (err: any) {
    return {
      success: false,
      fields: {},
      filledCount: 0,
      detectedSheet: '',
      message: `엑셀 파싱 실패: ${err.message || '파일을 읽을 수 없습니다.'}`,
    };
  }
}
