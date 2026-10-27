import crypto from 'crypto';
import { Pool } from 'pg';

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  passwordHash: string;
  memberType: 'individual' | 'corporate';
  bizNo?: string;
  address?: string;
  interest?: string;
  role: 'member' | 'admin';
  createdAt: string;
}

export interface Consultation {
  id: string;
  applicantName: string;
  phone: string;
  category: '양도소득세' | '종합소득세' | '상속/증여세' | '지방세/재산세' | '기타 세무상담' | 'Application Form';
  title: string;
  content: string;
  passwordHash: string;
  status: '접수' | '진행중' | '완료';
  adminMemo?: string;
  attachments?: { name: string; size: number; encryptedPath?: string; data?: string }[];
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  author?: string;
  authorEmail?: string;
  category: '공지' | '세무자료' | 'FAQ' | 'Notice';
  content: string;
  isPinned: boolean;
  isPopup?: boolean;
  popupStartDate?: string;
  popupEndDate?: string;
  views: number;
  createdAt: string;
}

export interface ApplicationMember {
  id: number;
  name: string;
  number: string;
  address: string;
  email: string;
  company: string;
  nationality: string;
  phon: string;
  date_from: string;
  date_to: string;
  married: string;
  age: string;
  spouse: string;
  money_01: string;
  money_02: string;
  money_03: string;
  money_04: string;
  name2: string;
  name3: string;
  date_end: string;
  family_txt: string;
  other_worked: number;
  remark: string;
  seq_no?: number;
  receipt_count?: number;
  work_place?: string;
  project_name?: string;
  worked_before_2004?: string;
}

export interface TaxReceipt {
  id: number;
  receipt_title?: string;
  member_num: string;
  management_no: string;
  license_no: string;
  association_name: string;
  chairman_name: string;
  resident_no1: string;
  address1: string;
  name: string;
  resident_no2: string;
  address2: string;
  taxation_period: string;
  local_name: string;
  local_basicsalary: string;
  local_bonus: string;
  local_income: string;
  local_totalsalary: string;
  overseas_name: string;
  overseas_basicsalary: string;
  overseas_bonus: string;
  overseas_income: string;
  overseas_totalsalary: string;
  total_basicsalary: string;
  total_bonus: string;
  total_income: string;
  total_totalsalary: string;
  total_salary: string;
  computed_tax: string;
  deduction_overseas: string;
  deduction_deduction: string;
  payable_income: string;
  payable_resident: string;
  payable_special: string;
  reg_date: string;
  reg_name: string;
  non_taxable_salary: string;
  service_fee?: string;
  yearend_fee?: string;
}

// Global Store Simulation for Development & Hybrid DB fallback
let usersStore: User[] = [
  {
    id: 'USR-001',
    fullName: '김세광',
    phone: '055-688-2141',
    email: 'admin@gtakorea.org',
    passwordHash: hashPassword('8992'),
    memberType: 'corporate',
    bizNo: '612-80-03137',
    address: '경상남도 거제시 거제대로 3696 #107',
    interest: '법인 및 외국인 세무',
    role: 'admin',
    createdAt: '2026-01-01 09:00',
  }
];

let consultationsStore: Consultation[] = [
  {
    id: 'GTA-2026-001',
    applicantName: '김철수',
    phone: '010-1234-5678',
    category: '양도소득세',
    title: '거제 아파트 양도소득세 감면 대상 여부 문의',
    content: '1가구 보유 상태에서 일시적 2주택 양도세 비과세 요건이 해당되는지 세무 상담 부탁드립니다.',
    passwordHash: hashPassword('1234'),
    status: '완료',
    adminMemo: '비과세 특례 조항 적용 가능 안내 완료.',
    attachments: [{ name: '매매계약서_증빙.pdf', size: 1024500, encryptedPath: 'encrypted/GTA-2026-001_0.enc' }],
    createdAt: '2026-09-10 10:30',
  }
];

let noticesStore: Notice[] = [
  {
    id: 'NOT-001',
    title: '[공지] 2026년 거제시 납세자회 세무 무료 상담의 날 개최 안내',
    category: '공지',
    content: '거제 납세자 회원 여러분을 위한 2026년 하반기 무료 세무 상담의 날이 개최됩니다.',
    isPinned: true,
    views: 342,
    createdAt: '2026-09-01',
  },
  {
    id: 'NOT-002',
    title: '[세무자료] 2026 개정 세법 핵심 요약 및 납세자 안내서',
    category: '세무자료',
    content: '양도소득세 및 종합소득세 개정 주요 사항을 정리한 핵심 자료집입니다.',
    isPinned: false,
    views: 189,
    createdAt: '2026-09-05',
  },
  {
    id: 'NOT-003',
    title: '[FAQ] 세무 상담 신청 후 처리 절차와 기간은 어떻게 되나요?',
    category: 'FAQ',
    content: '접수 완료 후 담당 전문 세무사가 1~2일 이내에 검토하여 유선 및 인터넷으로 답변을 드립니다.',
    isPinned: false,
    views: 512,
    createdAt: '2026-09-12',
  },
];

// Security Hashing helper
export function hashPassword(pwd: string): string {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

// PostgreSQL Pool Connection
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.ocqktsxaqubinnnxulcx:gta7273korea*@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

let pool: Pool | null = null;
if (dbUrl) {
  pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

// Users Database Services
export async function createUser(data: Omit<User, 'id' | 'role' | 'createdAt'>): Promise<User> {
  if (pool) {
    const existing = await findUserByEmail(data.email);
    if (existing) {
      throw new Error('이미 등록된 이메일 주소입니다.');
    }
    const newId = `USR-${Date.now()}`;
    const res = await pool.query(`
      INSERT INTO users (id, full_name, phone, email, password_hash, member_type, biz_no, address, interest, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'member', NOW())
      RETURNING id, full_name as "fullName", phone, email, password_hash as "passwordHash", member_type as "memberType", biz_no as "bizNo", address, interest, role, created_at as "createdAt"
    `, [newId, data.fullName, data.phone, data.email, data.passwordHash, data.memberType, data.bizNo || null, data.address || null, data.interest || null]);
    return res.rows[0];
  }

  const existing = usersStore.find(u => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) {
    throw new Error('이미 등록된 이메일 주소입니다.');
  }
  const newId = `USR-${String(usersStore.length + 1).padStart(3, '0')}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const newUser: User = {
    ...data,
    id: newId,
    role: 'member',
    createdAt: now,
  };
  usersStore.push(newUser);
  return newUser;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  if (pool) {
    const res = await pool.query(`
      SELECT id, full_name as "fullName", phone, email, password_hash as "passwordHash", member_type as "memberType", biz_no as "bizNo", address, interest, role, created_at as "createdAt"
      FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1
    `, [email]);
    return res.rows[0];
  }
  return usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export async function getUsers(): Promise<User[]> {
  if (pool) {
    const res = await pool.query(`
      SELECT id, full_name as "fullName", phone, email, password_hash as "passwordHash", member_type as "memberType", biz_no as "bizNo", address, interest, role, created_at as "createdAt"
      FROM users ORDER BY created_at DESC LIMIT 200
    `);
    return res.rows;
  }
  return usersStore;
}

// =========================================================================
// Legacy & Active Member Services (applicationform table: 5,213+ members)
// =========================================================================
export async function searchMembers(params: {
  query?: string;
  field?: string;
  page?: number;
  limit?: number;
}): Promise<{ members: ApplicationMember[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(20000, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;
  const q = (params.query || '').trim();
  const field = (params.field || 'all').toLowerCase();

  if (pool) {
    if (q) {
      const likeQ = `%${q}%`;
      const cleanQ = `%${q.replace(/-/g, '')}%`;

      let whereClause = `
        name ILIKE $1
        OR number ILIKE $1
        OR REPLACE(number, '-', '') ILIKE $2
        OR company ILIKE $1
        OR phon ILIKE $1
        OR email ILIKE $1
        OR CAST(id AS TEXT) = $3
        OR CAST(seq_no AS TEXT) = $3
      `;
      if (field === 'name') {
        whereClause = `name ILIKE $1 OR name2 ILIKE $1`;
      } else if (field === 'number') {
        whereClause = `number ILIKE $1 OR REPLACE(number, '-', '') ILIKE $2 OR name3 ILIKE $1 OR REPLACE(name3, '-', '') ILIKE $2 OR CAST(seq_no AS TEXT) = $3 OR CAST(id AS TEXT) = $3`;
      } else if (field === 'phone') {
        whereClause = `phon ILIKE $1 OR REPLACE(phon, '-', '') ILIKE $2`;
      }

      const queryParams =
        field === 'name'
          ? [likeQ]
          : field === 'phone'
          ? [likeQ, cleanQ]
          : [likeQ, cleanQ, q];

      const countRes = await pool.query(
        `WITH numbered AS (
           SELECT a.*, ROW_NUMBER() OVER (ORDER BY a.id ASC)::int AS seq_no
           FROM applicationform a
         )
         SELECT COUNT(*) FROM numbered
         WHERE ${whereClause}`,
        queryParams
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const limitIdx = queryParams.length + 1;
      const offsetIdx = queryParams.length + 2;

      const res = await pool.query(
        `WITH numbered AS (
           SELECT a.*, ROW_NUMBER() OVER (ORDER BY a.id ASC)::int AS seq_no
           FROM applicationform a
         ),
         rc AS (
           SELECT member_num, COUNT(*)::int AS cnt
           FROM receipt
           GROUP BY member_num
         )
         SELECT n.*,
                COALESCE(rc.cnt, 0)::int AS receipt_count
         FROM numbered n
         LEFT JOIN rc ON rc.member_num = CAST(n.id AS TEXT)
         WHERE ${whereClause}
         ORDER BY n.id DESC
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        [...queryParams, limit, offset]
      );
      return { members: res.rows, total, page, limit };
    } else {
      const countRes = await pool.query(`SELECT COUNT(*) FROM applicationform`);
      const total = parseInt(countRes.rows[0].count, 10);
      const res = await pool.query(
        `WITH numbered AS (
           SELECT a.*, ROW_NUMBER() OVER (ORDER BY a.id ASC)::int AS seq_no
           FROM applicationform a
         ),
         rc AS (
           SELECT member_num, COUNT(*)::int AS cnt
           FROM receipt
           GROUP BY member_num
         )
         SELECT n.*,
                COALESCE(rc.cnt, 0)::int AS receipt_count
         FROM numbered n
         LEFT JOIN rc ON rc.member_num = CAST(n.id AS TEXT)
         ORDER BY n.id DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return { members: res.rows, total, page, limit };
    }
  }

  return { members: [], total: 0, page, limit };
}

export async function getMemberById(id: number): Promise<ApplicationMember | undefined> {
  if (pool) {
    const res = await pool.query(`SELECT * FROM applicationform WHERE id = $1`, [id]);
    return res.rows[0];
  }
  return undefined;
}

export async function createMember(data: Partial<ApplicationMember>): Promise<ApplicationMember> {
  if (!pool) throw new Error('Database not connected');
  const nowUnix = String(Math.floor(Date.now() / 1000));

  const res = await pool.query(
    `INSERT INTO applicationform (
      name, number, address, email, company, nationality, phon,
      date_from, date_to, married, age, spouse,
      money_01, money_02, money_03, money_04,
      name2, name3, date_end, family_txt, other_worked, remark,
      work_place, project_name, worked_before_2004
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,
      $8,$9,$10,$11,$12,
      $13,$14,$15,$16,
      $17,$18,$19,$20,$21,$22,
      $23,$24,$25
    ) RETURNING *`,
    [
      (data.name || '').toUpperCase(),
      data.number || '',
      data.address || '',
      data.email || '',
      data.company || '',
      data.nationality || '',
      data.phon || '',
      data.date_from || nowUnix,
      data.date_to || nowUnix,
      data.married || '1',
      data.age || '',
      data.spouse || '2',
      data.money_01 || '0',
      data.money_02 || '0',
      data.money_03 || '0',
      data.money_04 || '0',
      data.name2 || (data.name || '').toUpperCase(),
      data.name3 || data.number || '',
      data.date_end || nowUnix,
      data.family_txt || '',
      data.other_worked || 0,
      data.remark || '',
      data.work_place ?? '',
      data.project_name ?? '',
      data.worked_before_2004 ?? ''
    ]
  );
  return res.rows[0];
}

export async function updateMember(id: number, data: Partial<ApplicationMember>): Promise<ApplicationMember | undefined> {
  if (!pool) throw new Error('Database not connected');
  const existing = await getMemberById(id);
  if (!existing) return undefined;

  const res = await pool.query(
    `UPDATE applicationform SET
      name = $1,
      number = $2,
      address = $3,
      email = $4,
      company = $5,
      nationality = $6,
      phon = $7,
      date_from = $8,
      date_to = $9,
      married = $10,
      age = $11,
      spouse = $12,
      money_01 = $13,
      money_02 = $14,
      money_03 = $15,
      money_04 = $16,
      name2 = $17,
      name3 = $18,
      family_txt = $19,
      other_worked = $20,
      remark = $21,
      date_end = $22,
      work_place = $23,
      project_name = $24,
      worked_before_2004 = $25
     WHERE id = $26
     RETURNING *`,
    [
      data.name ?? existing.name,
      data.number ?? existing.number,
      data.address ?? existing.address,
      data.email ?? existing.email,
      data.company ?? existing.company,
      data.nationality ?? existing.nationality,
      data.phon ?? existing.phon,
      data.date_from ?? existing.date_from,
      data.date_to ?? existing.date_to,
      data.married ?? existing.married,
      data.age ?? existing.age,
      data.spouse ?? existing.spouse,
      data.money_01 ?? existing.money_01,
      data.money_02 ?? existing.money_02,
      data.money_03 ?? existing.money_03,
      data.money_04 ?? existing.money_04,
      data.name2 ?? existing.name2,
      data.name3 ?? existing.name3,
      data.family_txt ?? existing.family_txt,
      data.other_worked ?? existing.other_worked,
      data.remark ?? existing.remark,
      data.date_end ?? existing.date_end,
      data.work_place ?? (existing as any).work_place ?? '',
      data.project_name ?? (existing as any).project_name ?? '',
      data.worked_before_2004 ?? (existing as any).worked_before_2004 ?? '',
      id
    ]
  );
  return res.rows[0];
}

export async function deleteMember(id: number): Promise<boolean> {
  if (!pool) return false;
  await pool.query(`DELETE FROM applicationform WHERE id = $1`, [id]);
  return true;
}

// =========================================================================
// Tax Receipt Services (receipt table: 118,902+ receipts)
// =========================================================================
export async function lookupMemberAndReceipts(nameInput: string, regNoInput: string): Promise<{
  member: ApplicationMember | null;
  receipts: TaxReceipt[];
}> {
  if (!pool) return { member: null, receipts: [] };

  const cleanName = nameInput.trim();
  const cleanRegNo = regNoInput.trim().replace(/[-\s]/g, '');

  // 1. Find matching member(s) in applicationform
  const memRes = await pool.query(
    `SELECT * FROM applicationform
     WHERE (
       UPPER(TRIM(name)) = UPPER($1)
       OR UPPER(TRIM(name2)) = UPPER($1)
     )
     AND (
       REPLACE(REPLACE(TRIM(number), '-', ''), ' ', '') = $2
       OR REPLACE(REPLACE(TRIM(name3), '-', ''), ' ', '') = $2
     )
     ORDER BY id DESC`,
    [cleanName, cleanRegNo]
  );

  const memberIds = memRes.rows.map(m => String(m.id));
  const primaryMember: ApplicationMember | null = memRes.rows[0] || null;

  // 2. Find receipts by member_num OR direct name + resident_no2 match
  const receiptOrderClause = `
    (CASE WHEN reg_date ~ '^[0-9]+$' THEN reg_date::bigint ELSE 0 END) DESC,
    (CASE WHEN taxation_period ~ '^[0-9]+$' THEN taxation_period::bigint ELSE 0 END) DESC,
    id DESC
  `;
  let receiptsRes;
  if (memberIds.length > 0) {
    receiptsRes = await pool.query(
      `SELECT * FROM receipt
       WHERE member_num = ANY($1::text[])
          OR (
            UPPER(TRIM(name)) = UPPER($2)
            AND REPLACE(REPLACE(TRIM(resident_no2), '-', ''), ' ', '') = $3
          )
       ORDER BY ${receiptOrderClause}
       LIMIT 300`,
      [memberIds, cleanName, cleanRegNo]
    );
  } else {
    receiptsRes = await pool.query(
      `SELECT * FROM receipt
       WHERE UPPER(TRIM(name)) = UPPER($1)
         AND REPLACE(REPLACE(TRIM(resident_no2), '-', ''), ' ', '') = $2
       ORDER BY ${receiptOrderClause}
       LIMIT 300`,
      [cleanName, cleanRegNo]
    );
  }

  return {
    member: primaryMember,
    receipts: receiptsRes.rows,
  };
}

export async function getReceipts(params: {
  memberNum?: string;
  query?: string;
  field?: string;
  page?: number;
  limit?: number;
  ids?: number[];
}): Promise<{ receipts: TaxReceipt[]; total: number; page: number; limit: number }> {
  if (!pool) return { receipts: [], total: 0, page: 1, limit: 30 };

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(20000, Math.max(1, params.limit || 30));
  const offset = (page - 1) * limit;

  const q = (params.query || '').trim();
  const field = (params.field || 'name').trim().toLowerCase();

  const receiptOrderBy = `
    (CASE WHEN r.reg_date ~ '^[0-9]+$' THEN r.reg_date::bigint ELSE 0 END) DESC,
    (CASE WHEN r.taxation_period ~ '^[0-9]+$' THEN r.taxation_period::bigint ELSE 0 END) DESC,
    r.id DESC
  `;

  if (params.ids && params.ids.length > 0) {
    const res = await pool.query(
      `SELECT r.* FROM receipt r WHERE r.id = ANY($1::int[]) ORDER BY ${receiptOrderBy}`,
      [params.ids]
    );
    return { receipts: res.rows, total: res.rows.length, page: 1, limit: res.rows.length };
  }

  if (params.memberNum && !q) {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM receipt r WHERE r.member_num = $1`,
      [params.memberNum]
    );
    const total = parseInt(countRes.rows[0].count, 10);
    const res = await pool.query(
      `SELECT r.* FROM receipt r WHERE r.member_num = $1 ORDER BY ${receiptOrderBy} LIMIT $2 OFFSET $3`,
      [params.memberNum, limit, offset]
    );
    return { receipts: res.rows, total, page, limit };
  }

  if (q) {
    const likeQ = `%${q}%`;
    const cleanQ = `%${q.replace(/-/g, '')}%`;

    let whereClause = `
      r.name ILIKE $1
      OR r.resident_no2 ILIKE $1
      OR REPLACE(r.resident_no2, '-', '') ILIKE $2
      OR r.overseas_name ILIKE $1
      OR r.management_no ILIKE $1
      OR r.license_no ILIKE $1
      OR r.member_num = $3
    `;
    let queryParams: any[] = [likeQ, cleanQ, q];

    if (field === 'name') {
      whereClause = `r.name ILIKE $1`;
      queryParams = [likeQ];
    } else if (field === 'number' || field === 'resident_no2') {
      whereClause = `(r.resident_no2 ILIKE $1 OR REPLACE(r.resident_no2, '-', '') ILIKE $2)`;
      queryParams = [likeQ, cleanQ];
    } else if (field === 'phone') {
      whereClause = `
        EXISTS (
          SELECT 1 FROM applicationform a
          WHERE (
            CAST(a.id AS TEXT) = r.member_num
            OR (r.resident_no2 <> '' AND REPLACE(a.number, '-', '') = REPLACE(r.resident_no2, '-', ''))
          )
          AND (a.phon ILIKE $1 OR REPLACE(a.phon, '-', '') ILIKE $2)
        )
      `;
      queryParams = [likeQ, cleanQ];
    } else if (field === 'license_no') {
      whereClause = `r.license_no ILIKE $1`;
      queryParams = [likeQ];
    }

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM receipt r WHERE ${whereClause}`,
      queryParams
    );
    const total = parseInt(countRes.rows[0].count, 10);
    const limitIdx = queryParams.length + 1;
    const offsetIdx = queryParams.length + 2;
    const res = await pool.query(
      `SELECT r.* FROM receipt r
       WHERE ${whereClause}
       ORDER BY ${receiptOrderBy}
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      [...queryParams, limit, offset]
    );
    return { receipts: res.rows, total, page, limit };
  }

  const countRes = await pool.query(`SELECT COUNT(*) FROM receipt`);
  const total = parseInt(countRes.rows[0].count, 10);
  const res = await pool.query(
    `SELECT r.* FROM receipt r ORDER BY ${receiptOrderBy} LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return { receipts: res.rows, total, page, limit };
}

export async function createReceipt(data: Partial<TaxReceipt>): Promise<TaxReceipt> {
  if (!pool) throw new Error('Database not connected');
  const nowUnix = String(Math.floor(Date.now() / 1000));

  const res = await pool.query(
    `INSERT INTO receipt (
      member_num, management_no, license_no, association_name, chairman_name,
      resident_no1, address1, name, resident_no2, address2, taxation_period,
      local_name, local_basicsalary, local_bonus, local_income, local_totalsalary,
      overseas_name, overseas_basicsalary, overseas_bonus, overseas_income, overseas_totalsalary,
      total_basicsalary, total_bonus, total_income, total_totalsalary, total_salary,
      computed_tax, deduction_overseas, deduction_deduction,
      payable_income, payable_resident, payable_special,
      reg_date, reg_name, non_taxable_salary, service_fee, yearend_fee, receipt_title
    ) VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,$10,$11,
      $12,$13,$14,$15,$16,
      $17,$18,$19,$20,$21,
      $22,$23,$24,$25,$26,
      $27,$28,$29,
      $30,$31,$32,
      $33,$34,$35,$36,$37,$38
    ) RETURNING *`,
    [
      data.member_num ?? '',
      data.management_no ?? '',
      data.license_no || '612-80-03137',
      data.association_name || 'Geoje Taxpayer Association',
      data.chairman_name || 'kim Se Kwang',
      data.resident_no1 || '710925-*******',
      data.address1 || '#107, 3696 Geoje-daero, Geoje-city gyeongnam Korea',
      (data.name ?? '').toUpperCase(),
      data.resident_no2 ?? '',
      data.address2 ?? '',
      data.taxation_period || nowUnix,
      data.local_name ?? '',
      data.local_basicsalary ?? '',
      data.local_bonus ?? '',
      data.local_income ?? '',
      data.local_totalsalary ?? '',
      data.overseas_name ?? '',
      data.overseas_basicsalary ?? '',
      data.overseas_bonus ?? '',
      data.overseas_income ?? '',
      data.overseas_totalsalary ?? data.total_salary ?? '',
      data.total_basicsalary ?? data.overseas_basicsalary ?? '',
      data.total_bonus ?? data.overseas_bonus ?? '',
      data.total_income ?? data.overseas_income ?? '',
      data.total_totalsalary ?? data.total_salary ?? '',
      data.total_salary ?? '',
      data.computed_tax ?? '',
      data.deduction_overseas ?? '',
      data.deduction_deduction ?? '',
      data.payable_income ?? '',
      data.payable_resident ?? '',
      data.payable_special ?? '',
      data.reg_date || nowUnix,
      data.reg_name ?? (data.name ?? '').toUpperCase(),
      data.non_taxable_salary ?? '',
      data.service_fee ?? '30,000',
      data.yearend_fee ?? '',
      data.receipt_title ?? 'RECEIPT FOR CLASS "B" INCOME TAX (MONTHLY)'
    ]
  );
  return res.rows[0];
}

export async function updateReceipt(id: number, data: Partial<TaxReceipt>): Promise<TaxReceipt | undefined> {
  if (!pool) throw new Error('Database not connected');
  const existingRes = await pool.query(`SELECT * FROM receipt WHERE id = $1`, [id]);
  const ex = existingRes.rows[0];
  if (!ex) return undefined;

  const res = await pool.query(
    `UPDATE receipt SET
      member_num = $1,
      management_no = $2,
      name = $3,
      resident_no2 = $4,
      address2 = $5,
      taxation_period = $6,
      local_name = $7,
      local_basicsalary = $8,
      local_bonus = $9,
      local_income = $10,
      local_totalsalary = $11,
      overseas_name = $12,
      overseas_basicsalary = $13,
      overseas_bonus = $14,
      overseas_income = $15,
      overseas_totalsalary = $16,
      total_basicsalary = $17,
      total_bonus = $18,
      total_income = $19,
      total_totalsalary = $20,
      total_salary = $21,
      computed_tax = $22,
      deduction_overseas = $23,
      deduction_deduction = $24,
      payable_income = $25,
      payable_resident = $26,
      payable_special = $27,
      reg_date = $28,
      reg_name = $29,
      non_taxable_salary = $30,
      license_no = $31,
      association_name = $32,
      chairman_name = $33,
      resident_no1 = $34,
      address1 = $35,
      service_fee = $36,
      yearend_fee = $37,
      receipt_title = $38
     WHERE id = $39
     RETURNING *`,
    [
      data.member_num ?? ex.member_num,
      data.management_no ?? ex.management_no,
      data.name ?? ex.name,
      data.resident_no2 ?? ex.resident_no2,
      data.address2 ?? ex.address2,
      data.taxation_period ?? ex.taxation_period,
      data.local_name ?? ex.local_name,
      data.local_basicsalary ?? ex.local_basicsalary,
      data.local_bonus ?? ex.local_bonus,
      data.local_income ?? ex.local_income,
      data.local_totalsalary ?? ex.local_totalsalary,
      data.overseas_name ?? ex.overseas_name,
      data.overseas_basicsalary ?? ex.overseas_basicsalary,
      data.overseas_bonus ?? ex.overseas_bonus,
      data.overseas_income ?? ex.overseas_income,
      data.overseas_totalsalary ?? ex.overseas_totalsalary,
      data.total_basicsalary ?? ex.total_basicsalary,
      data.total_bonus ?? ex.total_bonus,
      data.total_income ?? ex.total_income,
      data.total_totalsalary ?? ex.total_totalsalary,
      data.total_salary ?? ex.total_salary,
      data.computed_tax ?? ex.computed_tax,
      data.deduction_overseas ?? ex.deduction_overseas,
      data.deduction_deduction ?? ex.deduction_deduction,
      data.payable_income ?? ex.payable_income,
      data.payable_resident ?? ex.payable_resident,
      data.payable_special ?? ex.payable_special,
      data.reg_date ?? ex.reg_date,
      data.reg_name ?? ex.reg_name,
      data.non_taxable_salary ?? ex.non_taxable_salary,
      data.license_no ?? ex.license_no,
      data.association_name ?? ex.association_name,
      data.chairman_name ?? ex.chairman_name,
      data.resident_no1 ?? ex.resident_no1,
      data.address1 ?? ex.address1,
      data.service_fee ?? ex.service_fee ?? '30,000',
      data.yearend_fee ?? ex.yearend_fee ?? '',
      data.receipt_title ?? ex.receipt_title ?? 'RECEIPT FOR CLASS "B" INCOME TAX (MONTHLY)',
      id
    ]
  );
  return res.rows[0];
}

export async function deleteReceipt(id: number): Promise<boolean> {
  if (!pool) return false;
  await pool.query(`DELETE FROM receipt WHERE id = $1`, [id]);
  return true;
}

// Consultation Services
export async function purgeOldConsultations(months: number = 6): Promise<number> {
  if (pool) {
    try {
      const res = await pool.query(
        `DELETE FROM consultations WHERE created_at < NOW() - ($1 || ' months')::INTERVAL`,
        [months]
      );
      if (res.rowCount && res.rowCount > 0) {
        console.log(`[db] Auto-purged ${res.rowCount} consultation records older than ${months} months`);
      }
      return res.rowCount || 0;
    } catch (e) {
      console.error('Failed to purge old consultations:', e);
      return 0;
    }
  }
  return 0;
}

export async function getConsultations(): Promise<Consultation[]> {
  if (pool) {
    // Automatically purge inquiries older than 6 months
    await purgeOldConsultations(6);

    const res = await pool.query(`
      SELECT id, applicant_name as "applicantName", phone, category, title, content, password_hash as "passwordHash", status, admin_memo as "adminMemo", attachments, created_at as "createdAt"
      FROM consultations ORDER BY created_at DESC LIMIT 300
    `);
    return res.rows;
  }
  return consultationsStore;
}

export async function getConsultationById(id: string): Promise<Consultation | undefined> {
  if (pool) {
    const res = await pool.query(`
      SELECT id, applicant_name as "applicantName", phone, category, title, content, password_hash as "passwordHash", status, admin_memo as "adminMemo", attachments, created_at as "createdAt"
      FROM consultations WHERE id = $1
    `, [id]);
    return res.rows[0];
  }
  return consultationsStore.find(c => c.id === id);
}

export async function lookupConsultation(phone: string, rawPwd: string): Promise<Consultation[]> {
  const hash = hashPassword(rawPwd);
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (pool) {
    const res = await pool.query(`
      SELECT id, applicant_name as "applicantName", phone, category, title, content, password_hash as "passwordHash", status, admin_memo as "adminMemo", attachments, created_at as "createdAt"
      FROM consultations WHERE REPLACE(phone, '-', '') = $1 AND password_hash = $2
    `, [cleanPhone, hash]);
    return res.rows;
  }
  return consultationsStore.filter(c => c.phone.replace(/[^0-9]/g, '') === cleanPhone && c.passwordHash === hash);
}

export async function createConsultation(data: Omit<Consultation, 'id' | 'status' | 'createdAt'>): Promise<Consultation> {
  if (pool) {
    // Automatically purge old records over 6 months on new inquiry
    await purgeOldConsultations(6);

    const newId = `GTA-2026-${Date.now().toString().slice(-4)}`;
    const res = await pool.query(`
      INSERT INTO consultations (id, applicant_name, phone, category, title, content, password_hash, status, attachments, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, '접수', $8, NOW())
      RETURNING id, applicant_name as "applicantName", phone, category, title, content, password_hash as "passwordHash", status, attachments, created_at as "createdAt"
    `, [newId, data.applicantName, data.phone, data.category, data.title, data.content, data.passwordHash, JSON.stringify(data.attachments || [])]);
    return res.rows[0];
  }
  const newId = `GTA-2026-${String(consultationsStore.length + 1).padStart(3, '0')}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const newConsultation: Consultation = {
    ...data,
    id: newId,
    status: '접수',
    createdAt: now,
  };
  consultationsStore.unshift(newConsultation);
  return newConsultation;
}

export async function updateConsultationStatus(id: string, status: '접수' | '진행중' | '완료', adminMemo?: string): Promise<Consultation | undefined> {
  if (pool) {
    const res = await pool.query(`
      UPDATE consultations SET status = $1, admin_memo = $2 WHERE id = $3
      RETURNING id, applicant_name as "applicantName", phone, category, title, content, password_hash as "passwordHash", status, admin_memo as "adminMemo", attachments, created_at as "createdAt"
    `, [status, adminMemo || null, id]);
    return res.rows[0];
  }
  const item = consultationsStore.find(c => c.id === id);
  if (item) {
    item.status = status;
    if (adminMemo !== undefined) {
      item.adminMemo = adminMemo;
    }
  }
  return item;
}

export async function deleteConsultation(id: string): Promise<boolean> {
  if (pool) {
    await pool.query(`DELETE FROM consultations WHERE id = $1`, [id]);
    return true;
  }
  const idx = consultationsStore.findIndex(c => c.id === id);
  if (idx !== -1) {
    consultationsStore.splice(idx, 1);
    return true;
  }
  return false;
}

export async function getNotices(): Promise<Notice[]> {
  if (pool) {
    const res = await pool.query(`
      SELECT id, title, author, author_email as "authorEmail", category, content, 
             is_pinned as "isPinned", is_popup as "isPopup",
             TO_CHAR(popup_start_date, 'YYYY-MM-DD') as "popupStartDate",
             TO_CHAR(popup_end_date, 'YYYY-MM-DD') as "popupEndDate",
             views, created_at as "createdAt"
      FROM notices ORDER BY is_pinned DESC, created_at DESC
    `);
    if (res.rows.length > 0) return res.rows;
  }
  return noticesStore;
}

export async function getActivePopupNotices(): Promise<Notice[]> {
  if (pool) {
    const res = await pool.query(`
      SELECT id, title, author, author_email as "authorEmail", category, content, 
             is_pinned as "isPinned", is_popup as "isPopup",
             TO_CHAR(popup_start_date, 'YYYY-MM-DD') as "popupStartDate",
             TO_CHAR(popup_end_date, 'YYYY-MM-DD') as "popupEndDate",
             views, created_at as "createdAt"
      FROM notices 
      WHERE is_popup = true 
        AND (popup_start_date IS NULL OR popup_start_date <= CURRENT_DATE)
        AND (popup_end_date IS NULL OR popup_end_date >= CURRENT_DATE)
      ORDER BY is_pinned DESC, created_at DESC
    `);
    return res.rows;
  }
  const today = new Date().toISOString().slice(0, 10);
  return noticesStore.filter(n => 
    n.isPopup && 
    (!n.popupStartDate || n.popupStartDate <= today) && 
    (!n.popupEndDate || n.popupEndDate >= today)
  );
}

export async function getNoticeById(id: string): Promise<Notice | undefined> {
  if (pool) {
    await pool.query(`UPDATE notices SET views = views + 1 WHERE id = $1`, [id]);
    const res = await pool.query(`
      SELECT id, title, author, author_email as "authorEmail", category, content, 
             is_pinned as "isPinned", is_popup as "isPopup",
             TO_CHAR(popup_start_date, 'YYYY-MM-DD') as "popupStartDate",
             TO_CHAR(popup_end_date, 'YYYY-MM-DD') as "popupEndDate",
             views, created_at as "createdAt"
      FROM notices WHERE id = $1
    `, [id]);
    if (res.rows.length > 0) return res.rows[0];
  }
  const notice = noticesStore.find(n => n.id === id);
  if (notice) notice.views += 1;
  return notice;
}

export async function createNotice(data: Omit<Notice, 'id' | 'views' | 'createdAt'>): Promise<Notice> {
  const newId = `NOT-${Date.now()}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  if (pool) {
    const res = await pool.query(`
      INSERT INTO notices (id, title, author, author_email, category, content, is_pinned, is_popup, popup_start_date, popup_end_date, views, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, NOW())
      RETURNING id, title, author, author_email as "authorEmail", category, content, 
                is_pinned as "isPinned", is_popup as "isPopup",
                TO_CHAR(popup_start_date, 'YYYY-MM-DD') as "popupStartDate",
                TO_CHAR(popup_end_date, 'YYYY-MM-DD') as "popupEndDate",
                views, created_at as "createdAt"
    `, [
      newId, 
      data.title, 
      data.author || 'GTA', 
      data.authorEmail || 'gta@gtakorea.org', 
      data.category, 
      data.content, 
      !!data.isPinned,
      !!data.isPopup,
      data.popupStartDate || null,
      data.popupEndDate || null
    ]);
    return res.rows[0];
  }
  const newNotice: Notice = {
    ...data,
    id: newId,
    views: 0,
    createdAt: now,
  };
  noticesStore.unshift(newNotice);
  return newNotice;
}

export async function updateNoticePopup(
  id: string, 
  isPopup: boolean, 
  popupStartDate?: string, 
  popupEndDate?: string
): Promise<Notice | undefined> {
  if (pool) {
    const res = await pool.query(`
      UPDATE notices 
      SET is_popup = $1, 
          popup_start_date = $2, 
          popup_end_date = $3 
      WHERE id = $4
      RETURNING id, title, author, author_email as "authorEmail", category, content, 
                is_pinned as "isPinned", is_popup as "isPopup",
                TO_CHAR(popup_start_date, 'YYYY-MM-DD') as "popupStartDate",
                TO_CHAR(popup_end_date, 'YYYY-MM-DD') as "popupEndDate",
                views, created_at as "createdAt"
    `, [isPopup, popupStartDate || null, popupEndDate || null, id]);
    return res.rows[0];
  }
  const notice = noticesStore.find(n => n.id === id);
  if (notice) {
    notice.isPopup = isPopup;
    notice.popupStartDate = popupStartDate;
    notice.popupEndDate = popupEndDate;
  }
  return notice;
}

export async function deleteNotice(id: string): Promise<boolean> {
  if (pool) {
    await pool.query(`DELETE FROM notices WHERE id = $1`, [id]);
    return true;
  }
  const idx = noticesStore.findIndex(n => n.id === id);
  if (idx !== -1) {
    noticesStore.splice(idx, 1);
    return true;
  }
  return false;
}
