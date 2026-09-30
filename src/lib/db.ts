import crypto from 'crypto';

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
  category: '공지' | '세무자료' | 'FAQ';
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
  },
  {
    id: 'GTA-2026-002',
    applicantName: '이영희',
    phone: '010-9876-5432',
    category: '상속/증여세',
    title: '토지 사전 증여 관련 공제 한도 문의',
    content: '직계존속으로부터 증여받을 경우 증여세 면제 한도액 증빙 서류 안내 요청합니다.',
    passwordHash: hashPassword('5678'),
    status: '진행중',
    adminMemo: '담당 세무사 서류 검토 중.',
    attachments: [{ name: '토지대장.pdf', size: 2048100, encryptedPath: 'encrypted/GTA-2026-002_0.enc' }],
    createdAt: '2026-09-15 14:20',
  },
  {
    id: 'GTA-2026-003',
    applicantName: '박민수',
    phone: '010-5555-7777',
    category: '종합소득세',
    title: '개인사업자 세무조정 및 신고 접수',
    content: '거제지역 소상공인 세무 감면 혜택을 적용하여 신고 진행 가능한지 문의합니다.',
    passwordHash: hashPassword('0000'),
    status: '접수',
    attachments: [],
    createdAt: '2026-09-18 09:15',
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

// Users Database Services
export async function createUser(data: Omit<User, 'id' | 'role' | 'createdAt'>): Promise<User> {
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
  return usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export async function getUsers(): Promise<User[]> {
  return usersStore;
}

// Consultation Services
export async function getConsultations(): Promise<Consultation[]> {
  return consultationsStore;
}

export async function getConsultationById(id: string): Promise<Consultation | undefined> {
  return consultationsStore.find(c => c.id === id);
}

export async function lookupConsultation(phone: string, rawPwd: string): Promise<Consultation[]> {
  const hash = hashPassword(rawPwd);
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return consultationsStore.filter(c => c.phone.replace(/[^0-9]/g, '') === cleanPhone && c.passwordHash === hash);
}

export async function createConsultation(data: Omit<Consultation, 'id' | 'status' | 'createdAt'>): Promise<Consultation> {
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
  return noticesStore;
}
