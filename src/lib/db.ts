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
  category: '양도소득세' | '종합소득세' | '상속/증여세' | '지방세/재산세' | '기타 세무상담';
  title: string;
  content: string;
  passwordHash: string;
  status: '접수' | '진행중' | '완료';
  adminMemo?: string;
  attachments?: { name: string; size: number; encryptedPath: string }[];
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
  views: number;
  createdAt: string;
}

// Global Store Simulation for Development & Hybrid DB fallback
let usersStore: User[] = [
  {
    id: 'USR-001',
    fullName: '최주호',
    phone: '055-688-2141',
    email: 'admin@gtakorea.org',
    passwordHash: hashPassword('9999'),
    memberType: 'corporate',
    bizNo: '612-82-00000',
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
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
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
      FROM users ORDER BY created_at DESC LIMIT 100
    `);
    return res.rows;
  }
  return usersStore;
}

// Consultation Services
export async function getConsultations(): Promise<Consultation[]> {
  if (pool) {
    const res = await pool.query(`
      SELECT id, applicant_name as "applicantName", phone, category, title, content, password_hash as "passwordHash", status, admin_memo as "adminMemo", created_at as "createdAt"
      FROM consultations ORDER BY created_at DESC LIMIT 100
    `);
    return res.rows;
  }
  return consultationsStore;
}

export async function getConsultationById(id: string): Promise<Consultation | undefined> {
  if (pool) {
    const res = await pool.query(`
      SELECT id, applicant_name as "applicantName", phone, category, title, content, password_hash as "passwordHash", status, admin_memo as "adminMemo", created_at as "createdAt"
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
      SELECT id, applicant_name as "applicantName", phone, category, title, content, password_hash as "passwordHash", status, admin_memo as "adminMemo", created_at as "createdAt"
      FROM consultations WHERE REPLACE(phone, '-', '') = $1 AND password_hash = $2
    `, [cleanPhone, hash]);
    return res.rows;
  }
  return consultationsStore.filter(c => c.phone.replace(/[^0-9]/g, '') === cleanPhone && c.passwordHash === hash);
}

export async function createConsultation(data: Omit<Consultation, 'id' | 'status' | 'createdAt'>): Promise<Consultation> {
  if (pool) {
    const newId = `GTA-2026-${Date.now().toString().slice(-4)}`;
    const res = await pool.query(`
      INSERT INTO consultations (id, applicant_name, phone, category, title, content, password_hash, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, '접수', NOW())
      RETURNING id, applicant_name as "applicantName", phone, category, title, content, password_hash as "passwordHash", status, created_at as "createdAt"
    `, [newId, data.applicantName, data.phone, data.category, data.title, data.content, data.passwordHash]);
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
      RETURNING id, applicant_name as "applicantName", phone, category, title, content, password_hash as "passwordHash", status, admin_memo as "adminMemo", created_at as "createdAt"
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

export async function getNotices(): Promise<Notice[]> {
  if (pool) {
    const res = await pool.query(`
      SELECT id, title, author, author_email as "authorEmail", category, content, is_pinned as "isPinned", views, created_at as "createdAt"
      FROM notices ORDER BY is_pinned DESC, created_at DESC
    `);
    if (res.rows.length > 0) return res.rows;
  }
  return noticesStore;
}

export async function getNoticeById(id: string): Promise<Notice | undefined> {
  if (pool) {
    await pool.query(`UPDATE notices SET views = views + 1 WHERE id = $1`, [id]);
    const res = await pool.query(`
      SELECT id, title, author, author_email as "authorEmail", category, content, is_pinned as "isPinned", views, created_at as "createdAt"
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
      INSERT INTO notices (id, title, author, author_email, category, content, is_pinned, views, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, NOW())
      RETURNING id, title, author, author_email as "authorEmail", category, content, is_pinned as "isPinned", views, created_at as "createdAt"
    `, [newId, data.title, data.author || 'GTA', data.authorEmail || 'gta@gtakorea.org', data.category, data.content, data.isPinned]);
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
