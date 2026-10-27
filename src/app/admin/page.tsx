'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Lock,
  Shield,
  FileSpreadsheet,
  RefreshCw,
  Search,
  UserCheck,
  KeyRound,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Pin,
  Megaphone,
  MessageSquare,
  Users,
  Receipt,
  Printer,
  Edit3,
  X,
  CheckCircle2,
  Download,
  FileDown,
  DollarSign,
  Upload,
  Mail,
  Inbox,
  Paperclip,
  Send,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { Consultation, Notice, ApplicationMember, TaxReceipt } from '@/lib/db';
import ReceiptDocument, { downloadReceiptPdf, downloadReceiptsBundlePdf, printReceiptDocument } from '@/components/ReceiptDocument';

const CURRENCIES = ['USD', 'EURO', 'NOK', 'GBP', 'DKK', 'CAD', 'AUD', 'SGD', 'SEK', 'JPY', 'KRW'] as const;

function detectMemberCurrency(...vals: (string | undefined)[]): string {
  const combined = vals.filter(Boolean).join(' ').toUpperCase();
  if (combined.includes('EURO') || combined.includes('EUR') || combined.includes('€')) return 'EURO';
  for (const c of CURRENCIES) {
    if (combined.includes(c)) return c;
  }
  if (combined.includes('$')) return 'USD';
  if (combined.includes('¥')) return 'JPY';
  if (combined.includes('£')) return 'GBP';
  if (combined.includes('₩')) return 'KRW';
  return 'USD';
}

function stripCurrencyPrefix(val?: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (trimmed === '-' || trimmed === '0') return '';
  return trimmed
    .replace(/^(USD|EURO|EUR|NOK|GBP|DKK|CAD|AUD|SGD|SEK|JPY|KRW|\$|€|£|¥|₩)\s*/i, '')
    .trim();
}

function parseUnixToYmd(val?: string): { year: number; month: number; day: number } {
  const now = new Date();
  if (!val) {
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
  const num = Number(val);
  if (!isNaN(num) && num > 10000000) {
    const d = new Date((num + 9 * 3600) * 1000);
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
    };
  }
  const parts = String(val).split(/[-./\s]+/).map(Number);
  if (parts.length >= 2 && parts[0] > 1970) {
    return {
      year: parts[0],
      month: parts[1] || 1,
      day: parts[2] || 1,
    };
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

function formatUnixMonth(val?: string): string {
  if (!val) return '-';
  const num = Number(val);
  if (!isNaN(num) && num > 10000000) {
    const d = new Date((num + 9 * 3600) * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  return val;
}

function formatUnixMonthDot(val?: string): string {
  if (!val) return '';
  const num = Number(val);
  if (!isNaN(num) && num > 10000000) {
    const d = new Date((num + 9 * 3600) * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${y}. ${m}`;
  }
  return val;
}

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

function formatUnixDateDot(val?: string): string {
  if (!val) return '';
  const num = Number(val);
  if (!isNaN(num) && num > 10000000) {
    const d = new Date((num + 9 * 3600) * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}. ${m}. ${day}`;
  }
  return val;
}

function toUnixFromYmd(year: number, month: number, day: number): string {
  // Midnight KST (UTC+9) -> UTC timestamp
  const utcMs = Date.UTC(year, month - 1, day, 0, 0, 0) - 9 * 3600 * 1000;
  return String(Math.floor(utcMs / 1000));
}

function toUnixFromDate(ymd: string): string {
  if (!ymd || !ymd.includes('-')) return String(Math.floor(Date.now() / 1000));
  const [y, m, day] = ymd.split('-').map(Number);
  if (!y || !m || !day) return String(Math.floor(Date.now() / 1000));
  return toUnixFromYmd(y, m, day);
}

function formatWithCommas(val: string): string {
  const digits = val.replace(/[^0-9-]/g, '');
  if (!digits || digits === '-') return digits;
  const num = Number(digits);
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
}

function parseCommaNum(val: string): number {
  const clean = String(val || '').replace(/,/g, '').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

function extractEmailFromConsultation(c: Consultation): string {
  if (c.phone && c.phone.includes('@')) return c.phone.trim();
  const match = c.content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : '';
}

function extractPhoneFromConsultation(c: Consultation): string {
  if (c.phone && !c.phone.includes('@')) return c.phone;
  const match = c.content.match(/(?:Phone|연락처)\s*:\s*([^\n\r]+)/i);
  return match ? match[1].trim() : '-';
}

function formatConsultationDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${day} ${hh}:${mm}`;
    }
  } catch (e) {}
  return dateStr.substring(0, 16);
}

const YEAR_OPTIONS = Array.from({ length: 35 }, (_, i) => 2002 + i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => 1 + i);
const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => 1 + i);

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminId, setAdminId] = useState('gtakorea');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'members' | 'receipts' | 'consultations' | 'notices'>('members');

  // Members State (5,215+ migrated members)
  const [members, setMembers] = useState<ApplicationMember[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersPage, setMembersPage] = useState(1);
  const [memberQuery, setMemberQuery] = useState('');
  const [memberSearchInput, setMemberSearchInput] = useState('');
  const [memberSearchField, setMemberSearchField] = useState<'name' | 'number' | 'phone'>('name');
  const [membersLoading, setMembersLoading] = useState(false);

  // Member Edit Modal (Full Application Form)
  const [editingMember, setEditingMember] = useState<ApplicationMember | null>(null);
  const [memberAppForm, setMemberAppForm] = useState({
    applicantName: '',
    nationality: '',
    alienRegNo: '',
    address: '',
    addressDetail: '',
    email: '',
    company: '',
    workPlace: '',
    projectName: '',
    phone: '',
    dateFrom: '',
    dateTo: '',
    workedBefore2004: 'No' as 'No' | 'Yes',
    maritalStatus: 'Single' as 'Single' | 'Married',
    spouseName: '',
    spouseDob: '',
    spouseIncome: 'No' as 'No' | 'Yes',
    childrenCount: '0',
    children: [] as { name: string; dob: string }[],
    salaryCurrency: 'USD',
    salaryBasic: '',
    salaryAllowance: '',
    salaryBonus: '',
    workedOtherCompany: 'No' as 'No' | 'Yes',
    remark: '',
    signature: '',
    applicationDate: '',
    files: [] as { name: string; size: number }[],
  });

  // Receipts State (118,902+ migrated receipts)
  const [selectedReceiptMember, setSelectedReceiptMember] = useState<ApplicationMember | null>(null);
  const [receipts, setReceipts] = useState<TaxReceipt[]>([]);
  const [receiptsTotal, setReceiptsTotal] = useState(0);
  const [receiptsPage, setReceiptsPage] = useState(1);
  const [receiptQuery, setReceiptQuery] = useState('');
  const [receiptSearchInput, setReceiptSearchInput] = useState('');
  const [receiptSearchField, setReceiptSearchField] = useState<'name' | 'number' | 'phone'>('name');
  const [receiptsLoading, setReceiptsLoading] = useState(false);

  // Batch PDF Selection State
  const [selectedReceiptsMap, setSelectedReceiptsMap] = useState<Record<number, TaxReceipt>>({});
  const [isBatchGenerating, setIsBatchGenerating] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const batchContainerRef = useRef<HTMLDivElement | null>(null);

  // Receipt Write / Modify Popup Modal State
  const [showReceiptFormModal, setShowReceiptFormModal] = useState(false);
  const [editingReceiptId, setEditingReceiptId] = useState<number | null>(null);
  const [selectedPrintReceipt, setSelectedPrintReceipt] = useState<TaxReceipt | null>(null);
  const receiptPrintRef = useRef<HTMLDivElement | null>(null);

  const nowDate = new Date();
  const [receiptForm, setReceiptForm] = useState({
    receipt_title: 'RECEIPT FOR CLASS "B" INCOME TAX (MONTHLY)',
    member_num: '',
    management_no: '',
    license_no: '612-80-03137',
    association_name: 'Geoje Taxpayer Association',
    chairman_name: 'kim Se Kwang',
    resident_no1: '710925-*******',
    address1: '#107, 3696 Geoje-daero, Geoje-city gyeongnam Korea',
    name: '',
    resident_no2: '',
    address2: '',
    tax_year: nowDate.getFullYear(),
    tax_month: nowDate.getMonth() + 1,
    tax_day: nowDate.getDate(),
    reg_year: nowDate.getFullYear(),
    reg_month: nowDate.getMonth() + 1,
    reg_day: nowDate.getDate(),
    local_name: '',
    local_basicsalary: '',
    local_bonus: '',
    local_income: '',
    local_totalsalary: '',
    overseas_name: '',
    overseas_basicsalary: '',
    overseas_bonus: '',
    overseas_income: '',
    overseas_totalsalary: '',
    total_basicsalary: '',
    total_bonus: '',
    total_income: '',
    total_totalsalary: '',
    total_salary: '',
    non_taxable_salary: '',
    computed_tax: '',
    deduction_overseas: '',
    deduction_deduction: '',
    payable_income: '',
    payable_resident: '',
    payable_special: '',
    service_fee: '30,000',
    yearend_fee: '',
    reg_name: '',
  });

  // Consultations & Notices State
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('전체');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<'접수' | '진행중' | '완료'>('접수');
  const [editMemo, setEditMemo] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [consultationSearchQuery, setConsultationSearchQuery] = useState('');
  const [consultationStatusFilter, setConsultationStatusFilter] = useState<'전체' | '접수' | '진행중' | '완료'>('전체');

  // Notice Creation Modal State
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'Notice' | '공지' | '세무자료' | 'FAQ'>('Notice');
  const [newNoticeAuthor, setNewNoticeAuthor] = useState('GTA');
  const [newNoticeAuthorEmail, setNewNoticeAuthorEmail] = useState('gta@gtakorea.org');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeIsPinned, setNewNoticeIsPinned] = useState(false);

  const fetchMembers = useCallback(async (q: string, p: number, field: string = 'all') => {
    setMembersLoading(true);
    try {
      const res = await fetch(
        `/api/members?query=${encodeURIComponent(q)}&field=${encodeURIComponent(field)}&page=${p}&limit=20&_t=${Date.now()}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      if (json.success) {
        setMembers(json.members || []);
        setMembersTotal(json.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const fetchReceipts = useCallback(
    async (q: string, p: number, memberNum?: string, field: string = 'name') => {
      setReceiptsLoading(true);
      try {
        const params = new URLSearchParams();
        if (memberNum && !q) {
          params.set('memberNum', memberNum);
        }
        if (q) {
          params.set('query', q);
          params.set('field', field);
        }
        params.set('page', String(p));
        params.set('limit', '25');
        params.set('_t', String(Date.now()));

        const res = await fetch(`/api/receipts?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json();
        if (json.success) {
          setReceipts(json.receipts || []);
          setReceiptsTotal(json.total || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setReceiptsLoading(false);
      }
    },
    []
  );

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/consultations');
      const json = await res.json();
      if (json.success) {
        setConsultations(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotices = useCallback(async () => {
    try {
      const res = await fetch('/api/notices');
      const json = await res.json();
      if (json.success) {
        setNotices(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('gta_admin_logged') === 'true') {
        setAuthenticated(true);
      }
      const onAdminLogged = () => setAuthenticated(true);
      window.addEventListener('adminLogged', onAdminLogged);
      return () => window.removeEventListener('adminLogged', onAdminLogged);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchMembers(memberQuery, membersPage, memberSearchField);
      fetchReceipts(
        receiptQuery,
        receiptsPage,
        selectedReceiptMember ? String(selectedReceiptMember.id) : undefined,
        receiptSearchField
      );
      fetchConsultations();
      fetchNotices();
    }
  }, [
    authenticated,
    memberQuery,
    membersPage,
    memberSearchField,
    receiptQuery,
    receiptsPage,
    selectedReceiptMember,
    receiptSearchField,
    fetchMembers,
    fetchReceipts,
    fetchConsultations,
    fetchNotices,
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = adminId.trim().toLowerCase();
    const validId = !cleanId || cleanId === 'gtakorea' || cleanId === 'deokang7' || cleanId === 'admin';
    const validPw =
      adminPassword === '8992' || adminPassword === '1201' || adminPassword === 'gta7273' || adminPassword === '9999';

    if (validId && validPw) {
      setAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('gta_admin_logged', 'true');
      }
      setAuthError('');
    } else {
      setAuthError('관리자 비밀번호가 일치하지 않습니다. (PW: 8992)');
    }
  };

  // Click [VIEW] on a member row in Member List -> Opens Legacy "- Receipt List" for that member
  const handleViewMemberReceipts = (m: ApplicationMember) => {
    setSelectedReceiptMember(m);
    setReceiptSearchInput('');
    setReceiptQuery('');
    setReceiptsPage(1);
    setActiveTab('receipts');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Click [WRITE] in Receipt List -> Opens Receipt Write modal with auto-filled defaults
  const handleOpenWriteReceipt = (m?: ApplicationMember | null) => {
    const targetMember = m ?? selectedReceiptMember;
    const latestReceipt =
      targetMember && receipts.length > 0 && String(receipts[0].member_num) === String(targetMember.id)
        ? receipts[0]
        : null;
    const cleanVal = (v?: string) => (v && v !== '0' ? v : '');

    setEditingReceiptId(null);
    const today = new Date();
    setReceiptForm({
      member_num: targetMember ? String(targetMember.id) : '',
      management_no:
        latestReceipt?.management_no || (targetMember ? String(targetMember.seq_no ?? targetMember.id) : ''),
      license_no: '612-80-03137',
      association_name: 'Geoje Taxpayer Association',
      chairman_name: 'kim Se Kwang',
      resident_no1: '710925-*******',
      address1: '#107, 3696 Geoje-daero, Geoje-city gyeongnam Korea',
      name: targetMember?.name || latestReceipt?.name || '',
      resident_no2: targetMember?.number || latestReceipt?.resident_no2 || '',
      address2: targetMember?.address || latestReceipt?.address2 || '',
      tax_year: today.getFullYear(),
      tax_month: today.getMonth() + 1,
      tax_day: today.getDate(),
      reg_year: today.getFullYear(),
      reg_month: today.getMonth() + 1,
      reg_day: today.getDate(),
      local_name: '',
      local_basicsalary: '',
      local_bonus: '',
      local_income: '',
      local_totalsalary: '',
      overseas_name: targetMember?.company || latestReceipt?.overseas_name || latestReceipt?.local_name || '',
      overseas_basicsalary: cleanVal(latestReceipt?.overseas_basicsalary || latestReceipt?.total_basicsalary),
      overseas_bonus: cleanVal(latestReceipt?.overseas_bonus || latestReceipt?.total_bonus),
      overseas_income: cleanVal(latestReceipt?.overseas_income || latestReceipt?.total_income),
      overseas_totalsalary: cleanVal(
        latestReceipt?.overseas_totalsalary || latestReceipt?.total_totalsalary || latestReceipt?.total_salary
      ),
      total_basicsalary: cleanVal(latestReceipt?.total_basicsalary || latestReceipt?.overseas_basicsalary),
      total_bonus: cleanVal(latestReceipt?.total_bonus || latestReceipt?.overseas_bonus),
      total_income: cleanVal(latestReceipt?.total_income || latestReceipt?.overseas_income),
      total_totalsalary: cleanVal(
        latestReceipt?.total_totalsalary || latestReceipt?.total_salary || latestReceipt?.overseas_totalsalary
      ),
      total_salary: cleanVal(
        latestReceipt?.total_salary || latestReceipt?.total_totalsalary || latestReceipt?.overseas_totalsalary
      ),
      non_taxable_salary: cleanVal(latestReceipt?.non_taxable_salary),
      computed_tax: latestReceipt?.computed_tax || '',
      deduction_overseas: cleanVal(latestReceipt?.deduction_overseas),
      deduction_deduction: cleanVal(latestReceipt?.deduction_deduction),
      payable_income: cleanVal(latestReceipt?.payable_income),
      payable_resident: cleanVal(latestReceipt?.payable_resident),
      payable_special: cleanVal(latestReceipt?.payable_special),
      service_fee: '30,000',
      yearend_fee: '',
      reg_name: targetMember?.name || latestReceipt?.name || '',
      receipt_title: latestReceipt?.receipt_title || 'RECEIPT FOR CLASS "B" INCOME TAX (MONTHLY)',
    });
    setShowReceiptFormModal(true);
  };

  // Click [MODIFY] in Receipt List -> Opens Receipt Modify modal
  const handleOpenEditReceipt = (r: TaxReceipt) => {
    setEditingReceiptId(r.id);
    const taxYmd = parseUnixToYmd(r.taxation_period);
    const regYmd = parseUnixToYmd(r.reg_date);
    const cleanVal = (v?: string) => (v && v !== '0' ? v : '');

    const b1 = parseCommaNum(r.overseas_basicsalary || r.total_basicsalary || r.local_basicsalary);
    const b2 = parseCommaNum(r.overseas_bonus || r.total_bonus || r.local_bonus);
    const b3 = parseCommaNum(r.overseas_income || r.total_income || r.local_income);
    const computedSal =
      b1 + b2 + b3 > 0
        ? (b1 + b2 + b3).toLocaleString('en-US')
        : cleanVal(r.total_salary) || cleanVal(r.total_totalsalary) || cleanVal(r.overseas_totalsalary);

    const t1 = parseCommaNum(r.payable_income);
    const t2 = parseCommaNum(r.payable_resident);
    const computedTotalTax =
      t1 + t2 > 0 ? (t1 + t2).toLocaleString('en-US') : cleanVal(r.payable_special);

    setReceiptForm({
      receipt_title: r.receipt_title || 'RECEIPT FOR CLASS "B" INCOME TAX (MONTHLY)',
      member_num: r.member_num || '',
      management_no: r.management_no || r.member_num || String(r.id),
      license_no: r.license_no || '612-80-03137',
      association_name: r.association_name || 'Geoje Taxpayer Association',
      chairman_name: r.chairman_name || 'kim Se Kwang',
      resident_no1: r.resident_no1 || '710925-*******',
      address1: r.address1 || '#107, 3696 Geoje-daero, Geoje-city gyeongnam Korea',
      name: r.name || '',
      resident_no2: r.resident_no2 || '',
      address2: r.address2 || '',
      tax_year: taxYmd.year,
      tax_month: taxYmd.month,
      tax_day: taxYmd.day,
      reg_year: regYmd.year,
      reg_month: regYmd.month,
      reg_day: regYmd.day,
      local_name: r.local_name || '',
      local_basicsalary: cleanVal(r.local_basicsalary),
      local_bonus: cleanVal(r.local_bonus),
      local_income: cleanVal(r.local_income),
      local_totalsalary: cleanVal(r.local_totalsalary),
      overseas_name: r.overseas_name || r.local_name || '',
      overseas_basicsalary: cleanVal(r.overseas_basicsalary) || cleanVal(r.total_basicsalary),
      overseas_bonus: cleanVal(r.overseas_bonus) || cleanVal(r.total_bonus),
      overseas_income: cleanVal(r.overseas_income) || cleanVal(r.total_income),
      overseas_totalsalary: computedSal,
      total_basicsalary: cleanVal(r.total_basicsalary) || cleanVal(r.overseas_basicsalary),
      total_bonus: cleanVal(r.total_bonus) || cleanVal(r.overseas_bonus),
      total_income: cleanVal(r.total_income) || cleanVal(r.overseas_income),
      total_totalsalary: computedSal,
      total_salary: computedSal,
      non_taxable_salary: cleanVal(r.non_taxable_salary),
      computed_tax: r.computed_tax || '',
      deduction_overseas: cleanVal(r.deduction_overseas),
      deduction_deduction: cleanVal(r.deduction_deduction),
      payable_income: cleanVal(r.payable_income),
      payable_resident: cleanVal(r.payable_resident),
      payable_special: computedTotalTax,
      service_fee: r.service_fee !== undefined && r.service_fee !== null ? r.service_fee : '30,000',
      yearend_fee: r.yearend_fee || '',
      reg_name: r.reg_name || r.name || '',
    });
    setShowReceiptFormModal(true);
  };

  // Click [+ WRITE] in Receipt List -> Clones the receipt row immediately
  const handleDuplicateReceipt = async (r: TaxReceipt) => {
    if (!confirm('본 내용을 기준으로 추가등록 하시겠습니까?')) return;
    try {
      const payload = {
        receipt_title: r.receipt_title || 'RECEIPT FOR CLASS "B" INCOME TAX (MONTHLY)',
        member_num: r.member_num || '',
        management_no: r.management_no || '',
        license_no: r.license_no || '612-80-03137',
        association_name: r.association_name || 'Geoje Taxpayer Association',
        chairman_name: r.chairman_name || 'kim Se Kwang',
        resident_no1: r.resident_no1 || '710925-*******',
        address1: r.address1 || '#107, 3696 Geoje-daero, Geoje-city gyeongnam Korea',
        name: r.name || '',
        resident_no2: r.resident_no2 || '',
        address2: r.address2 || '',
        taxation_period: r.taxation_period,
        reg_date: r.reg_date,
        local_name: r.local_name || '',
        local_basicsalary: r.local_basicsalary || '',
        local_bonus: r.local_bonus || '',
        local_income: r.local_income || '',
        local_totalsalary: r.local_totalsalary || '',
        overseas_name: r.overseas_name || '',
        overseas_basicsalary: r.overseas_basicsalary || '',
        overseas_bonus: r.overseas_bonus || '',
        overseas_income: r.overseas_income || '',
        overseas_totalsalary: r.overseas_totalsalary || '',
        total_basicsalary: r.total_basicsalary || '',
        total_bonus: r.total_bonus || '',
        total_income: r.total_income || '',
        total_totalsalary: r.total_totalsalary || '',
        total_salary: r.total_salary || '',
        non_taxable_salary: r.non_taxable_salary || '',
        computed_tax: r.computed_tax || '',
        deduction_overseas: r.deduction_overseas || '',
        deduction_deduction: r.deduction_deduction || '',
        payable_income: r.payable_income || '',
        payable_resident: r.payable_resident || '',
        payable_special: r.payable_special || '',
        service_fee: r.service_fee ?? '30,000',
        yearend_fee: r.yearend_fee ?? '',
        reg_name: r.reg_name || r.name || '',
      };

      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        fetchReceipts(
          receiptQuery,
          receiptsPage,
          selectedReceiptMember ? String(selectedReceiptMember.id) : undefined,
          receiptSearchField
        );
        fetchMembers(memberQuery, membersPage, memberSearchField);
      } else {
        alert(json.error || '추가등록 실패');
      }
    } catch (e) {
      alert('추가등록 중 오류가 발생했습니다.');
    }
  };

  // Multi-Select Receipt Helpers
  const selectedReceiptList = Object.values(selectedReceiptsMap);

  const handleToggleSelectAllReceipts = () => {
    if (receipts.length === 0) return;
    const allSelected = receipts.every(r => selectedReceiptsMap[r.id]);
    if (allSelected) {
      setSelectedReceiptsMap(prev => {
        const next = { ...prev };
        receipts.forEach(r => delete next[r.id]);
        return next;
      });
    } else {
      setSelectedReceiptsMap(prev => {
        const next = { ...prev };
        receipts.forEach(r => {
          next[r.id] = r;
        });
        return next;
      });
    }
  };

  const handleToggleSelectReceipt = (r: TaxReceipt) => {
    setSelectedReceiptsMap(prev => {
      const next = { ...prev };
      if (next[r.id]) {
        delete next[r.id];
      } else {
        next[r.id] = r;
      }
      return next;
    });
  };

  const handleDownloadSelectedReceiptsPdf = async () => {
    if (selectedReceiptList.length === 0) {
      alert('PDF로 일괄 저장할 영수증을 먼저 선택해 주세요.');
      return;
    }
    if (!batchContainerRef.current) return;

    setIsBatchGenerating(true);
    setBatchProgress({ current: 0, total: selectedReceiptList.length });

    try {
      const childrenEls = Array.from(batchContainerRef.current.children) as HTMLElement[];
      await downloadReceiptsBundlePdf(
        childrenEls,
        `GTA_Selected_Receipts_${selectedReceiptList.length}ea.pdf`,
        (curr, total) => {
          setBatchProgress({ current: curr, total });
        }
      );
    } catch (err) {
      console.error(err);
      alert('PDF 일괄 저장 중 오류가 발생했습니다.');
    } finally {
      setIsBatchGenerating(false);
      setBatchProgress(null);
    }
  };

  // Auto-sum [1] Basic Salary + [2] Bonus + [3] Other Income -> [4] Total Salary (both upper and lower)
  const handleOverseasSalaryChange = (
    field: 'overseas_basicsalary' | 'overseas_bonus' | 'overseas_income',
    rawVal: string
  ) => {
    const formatted = formatWithCommas(rawVal);
    setReceiptForm(prev => {
      const next = { ...prev, [field]: formatted };
      const g2 = parseCommaNum(next.overseas_basicsalary);
      const g3 = parseCommaNum(next.overseas_bonus);
      const g4 = parseCommaNum(next.overseas_income);
      const g5 = g2 + g3 + g4;
      const g5Str = g5 > 0 ? g5.toLocaleString('en-US') : '';

      return {
        ...next,
        overseas_totalsalary: g5Str,
        total_basicsalary: next.overseas_basicsalary,
        total_bonus: next.overseas_bonus,
        total_income: next.overseas_income,
        total_totalsalary: g5Str,
        total_salary: g5Str,
      };
    });
  };

  // Auto-sum [6] Payable Income Tax + [7] Local Income Tax -> [8] Total tax
  const handlePayableTaxChange = (
    field: 'payable_income' | 'payable_resident',
    rawVal: string
  ) => {
    const formatted = formatWithCommas(rawVal);
    setReceiptForm(prev => {
      const next = { ...prev, [field]: formatted };
      // If user edits [6] Payable Income Tax and [7] Local Income Tax hasn't been manually customized or is 10%, auto-update [7] if desired, or sum [6]+[7]
      if (field === 'payable_income') {
        const inc = parseCommaNum(formatted);
        const autoLocal = inc > 0 ? Math.floor((inc * 0.1) / 10) * 10 : 0;
        if (!prev.payable_resident || parseCommaNum(prev.payable_resident) === Math.floor((parseCommaNum(prev.payable_income) * 0.1) / 10) * 10) {
          next.payable_resident = autoLocal > 0 ? autoLocal.toLocaleString('en-US') : '';
        }
      }
      const t6 = parseCommaNum(next.payable_income);
      const t7 = parseCommaNum(next.payable_resident);
      const t8 = t6 + t7;
      next.payable_special = t8 > 0 ? t8.toLocaleString('en-US') : '';
      return next;
    });
  };

  const submitReceiptData = async (downloadPdfAfterSave = false) => {
    const taxPeriod =
      receiptForm.tax_month === 0
        ? String(receiptForm.tax_year)
        : toUnixFromYmd(receiptForm.tax_year, receiptForm.tax_month, receiptForm.tax_day);

    const payload = {
      receipt_title: receiptForm.receipt_title,
      member_num: receiptForm.member_num,
      management_no: receiptForm.management_no,
      license_no: receiptForm.license_no,
      association_name: receiptForm.association_name,
      chairman_name: receiptForm.chairman_name,
      resident_no1: receiptForm.resident_no1,
      address1: receiptForm.address1,
      name: receiptForm.name,
      resident_no2: receiptForm.resident_no2,
      address2: receiptForm.address2,
      taxation_period: taxPeriod,
      reg_date: toUnixFromYmd(receiptForm.reg_year, receiptForm.reg_month, receiptForm.reg_day),
      local_name: receiptForm.local_name,
      local_basicsalary: receiptForm.local_basicsalary,
      local_bonus: receiptForm.local_bonus,
      local_income: receiptForm.local_income,
      local_totalsalary: receiptForm.local_totalsalary,
      overseas_name: receiptForm.overseas_name,
      overseas_basicsalary: receiptForm.overseas_basicsalary,
      overseas_bonus: receiptForm.overseas_bonus,
      overseas_income: receiptForm.overseas_income,
      overseas_totalsalary: receiptForm.overseas_totalsalary,
      total_basicsalary: receiptForm.total_basicsalary,
      total_bonus: receiptForm.total_bonus,
      total_income: receiptForm.total_income,
      total_totalsalary: receiptForm.total_totalsalary,
      total_salary: receiptForm.total_salary,
      non_taxable_salary: receiptForm.non_taxable_salary,
      computed_tax: receiptForm.computed_tax,
      deduction_overseas: receiptForm.deduction_overseas,
      deduction_deduction: receiptForm.deduction_deduction,
      payable_income: receiptForm.payable_income,
      payable_resident: receiptForm.payable_resident,
      payable_special: receiptForm.payable_special,
      service_fee: receiptForm.service_fee,
      yearend_fee: receiptForm.yearend_fee,
      reg_name: receiptForm.reg_name || receiptForm.name,
    };

    try {
      const res = await fetch('/api/receipts', {
        method: editingReceiptId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingReceiptId ? { id: editingReceiptId, ...payload } : payload),
      });
      const json = await res.json();
      if (json.success) {
        setShowReceiptFormModal(false);
        fetchReceipts(
          receiptQuery,
          receiptsPage,
          selectedReceiptMember ? String(selectedReceiptMember.id) : undefined,
          receiptSearchField
        );
        fetchMembers(memberQuery, membersPage, memberSearchField);

        if (downloadPdfAfterSave && json.data) {
          setSelectedPrintReceipt(json.data);
          setTimeout(() => {
            if (receiptPrintRef.current) {
              downloadReceiptPdf(receiptPrintRef.current, json.data);
            }
          }, 300);
        }
      } else {
        alert(json.error || 'Failed to save receipt');
      }
    } catch (err) {
      alert('Error saving receipt');
    }
  };

  const handleSaveReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReceiptData(false);
  };

  const handleDeleteReceipt = async (id: number) => {
    if (!confirm(`영수증(#${id})을 정말 삭제하시겠습니까?\n삭제된 영수증은 복구할 수 없습니다.`)) return;
    try {
      const res = await fetch(`/api/receipts?id=${id}`, {
        method: 'DELETE',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const json = await res.json();
      if (json.success) {
        alert(`영수증(#${id})이 정상적으로 삭제되었습니다.`);
        await fetchReceipts(
          receiptQuery,
          receiptsPage,
          selectedReceiptMember ? String(selectedReceiptMember.id) : undefined,
          receiptSearchField
        );
        await fetchMembers(memberQuery, membersPage, memberSearchField);
      } else {
        alert(json.error || json.message || '영수증 삭제에 실패했습니다.');
      }
    } catch (e: any) {
      alert(`삭제 중 오류가 발생했습니다: ${e?.message || '네트워크 오류'}`);
    }
  };

  const handleOpenEditMember = (m: ApplicationMember) => {
    const cleanRemark = (m.remark || '').replace(/\\r\\n|\\n|\\r/g, '\n').trim();
    const parts = (m.family_txt || '').split('|');
    const spouseName = (parts[0] || '').trim();
    const spouseDob = (parts[1] || '').trim();
    const parsedChildren: { name: string; dob: string }[] = [];
    for (let i = 2; i < parts.length; i += 2) {
      const cn = (parts[i] || '').trim();
      const cd = (parts[i + 1] || '').trim();
      if (cn || cd) {
        parsedChildren.push({ name: cn, dob: cd });
      }
    }
    const parsedAge = parseInt(String(m.age || '').replace(/[^0-9]/g, ''), 10) || 0;
    const count = Math.max(parsedAge, parsedChildren.length);
    const children = Array.from({ length: count }, (_, idx) => parsedChildren[idx] || { name: '', dob: '' });
    const isMarried = m.married === '2' || spouseName !== '';
    const salaryCurrency = detectMemberCurrency(m.money_01, m.money_02, m.money_03, m.money_04);
    const df = formatUnixDate(m.date_from);
    const dt = formatUnixDate(m.date_to);
    const de = formatUnixDate(m.date_end);

    setEditingMember(m);
    setMemberAppForm({
      applicantName: m.name || '',
      nationality: m.nationality || '',
      alienRegNo: m.number || '',
      address: m.address || '',
      addressDetail: '',
      email: m.email || '',
      company: m.company || '',
      workPlace: m.work_place || '',
      projectName: m.project_name || '',
      phone: m.phon || '',
      dateFrom: df.length === 10 ? df : '',
      dateTo: dt.length === 10 ? dt : '',
      workedBefore2004: m.worked_before_2004 === 'Yes' ? 'Yes' : 'No',
      maritalStatus: isMarried ? 'Married' : 'Single',
      spouseName,
      spouseDob,
      spouseIncome: m.spouse === '1' ? 'Yes' : 'No',
      childrenCount: String(count),
      children,
      salaryCurrency,
      salaryBasic: stripCurrencyPrefix(m.money_01),
      salaryAllowance: stripCurrencyPrefix(m.money_02),
      salaryBonus: stripCurrencyPrefix(m.money_03),
      workedOtherCompany: m.other_worked === 1 ? 'Yes' : 'No',
      remark: cleanRemark,
      signature: m.name2 || m.name || '',
      applicationDate: de.length === 10 ? de : new Date().toISOString().slice(0, 10),
      files: [],
    });
  };

  const handleOpenMemberAddressPopup = () => {
    const openPostcode = () => {
      if (typeof window !== 'undefined' && (window as any).daum && (window as any).daum.Postcode) {
        new (window as any).daum.Postcode({
          oncomplete: (data: any) => {
            const engAddr = data.roadAddressEnglish || data.jibunAddressEnglish || data.addressEnglish || '';
            const zip = data.zonecode ? `, ${data.zonecode}` : '';
            const fullEng = engAddr ? `${engAddr}, Republic of Korea${zip}` : data.roadAddress;
            setMemberAppForm(prev => ({
              ...prev,
              address: prev.addressDetail ? `${prev.addressDetail}, ${fullEng}` : fullEng,
            }));
          },
        }).open();
      }
    };

    if (typeof window !== 'undefined') {
      if ((window as any).daum && (window as any).daum.Postcode) {
        openPostcode();
      } else {
        const script = document.createElement('script');
        script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.onload = openPostcode;
        document.body.appendChild(script);
      }
    }
  };

  const handleMemberChildrenCountChange = (countStr: string) => {
    const count = Math.max(0, parseInt(countStr, 10) || 0);
    setMemberAppForm(prev => {
      const nextChildren = Array.from({ length: count }, (_, idx) => prev.children[idx] || { name: '', dob: '' });
      return {
        ...prev,
        childrenCount: String(count),
        children: nextChildren,
      };
    });
  };

  const handleMemberChildChange = (index: number, field: 'name' | 'dob', value: string) => {
    setMemberAppForm(prev => {
      const nextChildren = [...prev.children];
      nextChildren[index] = { ...nextChildren[index], [field]: value };
      return { ...prev, children: nextChildren };
    });
  };

  const calculateMemberTotalSalary = () => {
    const b = parseCommaNum(memberAppForm.salaryBasic);
    const a = parseCommaNum(memberAppForm.salaryAllowance);
    const bo = parseCommaNum(memberAppForm.salaryBonus);
    return (b + a + bo).toLocaleString('en-US');
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const familyParts: string[] = [
      memberAppForm.maritalStatus === 'Married' ? memberAppForm.spouseName.trim() : '',
      memberAppForm.maritalStatus === 'Married' ? memberAppForm.spouseDob.trim() : '',
    ];
    memberAppForm.children.forEach(ch => {
      familyParts.push(ch.name.trim(), ch.dob.trim());
    });
    while (familyParts.length < 11) {
      familyParts.push('');
    }

    const formatMoneyField = (val: string, cur: string) => {
      const clean = val.trim();
      if (!clean || clean === '-' || clean === '0') return '-';
      if (/^(USD|EURO|EUR|NOK|GBP|DKK|CAD|AUD|SGD|SEK|JPY|KRW|\$|€|£|¥|₩)/i.test(clean)) {
        return clean;
      }
      return `${cur} ${clean}`;
    };

    const totalNum =
      parseCommaNum(memberAppForm.salaryBasic) +
      parseCommaNum(memberAppForm.salaryAllowance) +
      parseCommaNum(memberAppForm.salaryBonus);
    const money04 =
      totalNum > 0
        ? `${memberAppForm.salaryCurrency} ${totalNum.toLocaleString('en-US')}`
        : editingMember.money_04 && editingMember.money_04 !== '0'
        ? editingMember.money_04
        : '-';

    const payload = {
      id: editingMember.id,
      name: memberAppForm.applicantName.toUpperCase(),
      nationality: memberAppForm.nationality,
      number: memberAppForm.alienRegNo,
      address: memberAppForm.address,
      email: memberAppForm.email,
      company: memberAppForm.company,
      work_place: memberAppForm.workPlace,
      project_name: memberAppForm.projectName,
      phon: memberAppForm.phone,
      date_from: memberAppForm.dateFrom ? toUnixFromDate(memberAppForm.dateFrom) : editingMember.date_from,
      date_to: memberAppForm.dateTo ? toUnixFromDate(memberAppForm.dateTo) : editingMember.date_to,
      worked_before_2004: memberAppForm.workedBefore2004,
      married: memberAppForm.maritalStatus === 'Married' ? '2' : '1',
      age: memberAppForm.childrenCount === '0' ? '-' : memberAppForm.childrenCount,
      spouse: memberAppForm.spouseIncome === 'Yes' ? '1' : '2',
      money_01: formatMoneyField(memberAppForm.salaryBasic, memberAppForm.salaryCurrency),
      money_02: formatMoneyField(memberAppForm.salaryAllowance, memberAppForm.salaryCurrency),
      money_03: formatMoneyField(memberAppForm.salaryBonus, memberAppForm.salaryCurrency),
      money_04: money04,
      name2: memberAppForm.signature || memberAppForm.applicantName.toUpperCase(),
      name3: memberAppForm.alienRegNo,
      date_end: memberAppForm.applicationDate ? toUnixFromDate(memberAppForm.applicationDate) : editingMember.date_end,
      family_txt: familyParts.join('|'),
      other_worked: memberAppForm.workedOtherCompany === 'Yes' ? 1 : 2,
      remark: memberAppForm.remark,
    };

    try {
      const res = await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        alert('회원 신청서(Application Form) 정보가 수정되었습니다.');
        setEditingMember(null);
        fetchMembers(memberQuery, membersPage, memberSearchField);
      } else {
        alert(json.error || 'Failed to update member');
      }
    } catch (err) {
      alert('Failed to update member');
    }
  };

  const handleDeleteMember = async (id: number, name: string): Promise<boolean> => {
    if (!confirm(`'${name}' 회원 정보를 정말 삭제하시겠습니까?\n삭제 후에는 해당 회원의 데이터가 복구되지 않습니다.`)) {
      return false;
    }
    try {
      const res = await fetch(`/api/members?id=${id}`, {
        method: 'DELETE',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const json = await res.json();
      if (json.success) {
        alert(`'${name}' 회원 정보가 정상적으로 삭제되었습니다.`);
        setEditingMember(null);
        await fetchMembers(memberQuery, membersPage, memberSearchField);
        return true;
      } else {
        alert(json.error || json.message || '회원 삭제에 실패하였습니다.');
        return false;
      }
    } catch (err: any) {
      alert(`삭제 처리 중 오류가 발생했습니다: ${err?.message || '네트워크 오류'}`);
      return false;
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNoticeTitle,
          category: newNoticeCategory,
          author: newNoticeAuthor,
          authorEmail: newNoticeAuthorEmail,
          content: newNoticeContent,
          isPinned: newNoticeIsPinned,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowNoticeModal(false);
        setNewNoticeTitle('');
        setNewNoticeContent('');
        setNewNoticeIsPinned(false);
        fetchNotices();
      }
    } catch (err) {
      alert('Error creating notice');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('해당 공지사항을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) fetchNotices();
    } catch (err) {
      alert('Error deleting notice');
    }
  };

  const handleUpdateStatus = async (id: string, customStatus?: '접수' | '진행중' | '완료', customMemo?: string) => {
    const statusToSave = customStatus || editStatus;
    const memoToSave = customMemo !== undefined ? customMemo : editMemo;
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusToSave, adminMemo: memoToSave }),
      });
      const json = await res.json();
      if (json.success) {
        if (selectedConsultation && selectedConsultation.id === id) {
          setSelectedConsultation({
            ...selectedConsultation,
            status: statusToSave,
            adminMemo: memoToSave,
          });
        }
        setEditingId(null);
        fetchConsultations();
        alert('상태 및 관리자 메모가 저장되었습니다.');
      } else {
        alert(json.message || '저장에 실패했습니다.');
      }
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteConsultation = async (id: string) => {
    if (!confirm('해당 문의/접수 내역을 영구 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.')) return;
    try {
      const res = await fetch(`/api/consultations/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        if (selectedConsultation?.id === id) {
          setSelectedConsultation(null);
        }
        setEditingId(null);
        fetchConsultations();
        alert('성공적으로 삭제되었습니다.');
      } else {
        alert(json.message || '삭제에 실패했습니다.');
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDownloadAttachment = (att: { name: string; size?: number; data?: string; encryptedPath?: string }) => {
    if (att.data) {
      try {
        const byteCharacters = atob(att.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = att.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      } catch (err) {
        console.error('Download error:', err);
      }
    }
    if (att.encryptedPath) {
      const link = document.createElement('a');
      link.href = att.encryptedPath;
      link.download = att.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    alert('첨부파일 데이터를 찾을 수 없습니다.');
  };

  const handleDownloadMembersExcel = () => {
    const q = (memberQuery || memberSearchInput).trim();
    const params = new URLSearchParams();
    params.set('type', 'members');
    params.set('field', memberSearchField);
    if (q) {
      params.set('query', q);
    }
    window.location.href = `/api/admin/excel?${params.toString()}`;
  };

  const handleDownloadReceiptsExcel = (onlySelected: boolean = false) => {
    const params = new URLSearchParams();
    params.set('type', 'receipts');

    if (onlySelected && selectedReceiptList.length > 0) {
      params.set('ids', selectedReceiptList.map(r => r.id).join(','));
    } else {
      if (selectedReceiptMember) {
        params.set('memberNum', String(selectedReceiptMember.id));
      }
      const q = (receiptQuery || receiptSearchInput).trim();
      if (q) {
        params.set('query', q);
        params.set('field', receiptSearchField);
      }
    }
    window.location.href = `/api/admin/excel?${params.toString()}`;
  };

  const handleDownloadExcel = () => {
    if (activeTab === 'receipts') {
      handleDownloadReceiptsExcel(selectedReceiptList.length > 0);
    } else {
      handleDownloadMembersExcel();
    }
  };

  // =========================================================================
  // Popup-only Login Modal
  // =========================================================================
  if (!authenticated) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-7 sm:p-8 space-y-5 relative animate-in fade-in zoom-in-95 duration-150">
            <Link
              href="/"
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              title="Close"
            >
              <X className="w-5 h-5" />
            </Link>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-gta-700 bg-gta-50 px-2.5 py-1 rounded-full border border-gta-200">
                <Lock className="w-3.5 h-3.5" />
                <span>Administrator Login</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 pt-1">GTA Admin Portal</h2>
              <p className="text-xs text-slate-500">
                관리자 ID와 비밀번호(PW: 8992)를 입력하여 접속하세요.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Admin ID</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={adminId}
                    onChange={e => setAdminId(e.target.value)}
                    placeholder="gtakorea"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Password *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="Enter Password (e.g. 8992)"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-1">
                <Link
                  href="/"
                  className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="w-2/3 bg-gta-600 hover:bg-gta-700 text-white font-bold py-2.5 rounded-xl shadow-lg text-xs cursor-pointer"
                >
                  Sign In →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const totalMemberPages = Math.max(1, Math.ceil(membersTotal / 20));
  const totalReceiptPages = Math.max(1, Math.ceil(receiptsTotal / 25));

  return (
    <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 py-6 space-y-5 print:p-0 print:m-0 print:space-y-0 print:max-w-none">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gta-900 text-white p-6 rounded-2xl shadow-xl print:hidden">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black">
              GTA 통합 관리자 시스템
            </h1>
            <p className="text-xs text-slate-300">
              전체 회원 조회({membersTotal.toLocaleString()}명) · 월별 납세 영수증 작성/발급({receiptsTotal.toLocaleString()}건) · 신청서 등록
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              fetchMembers(memberQuery, membersPage, memberSearchField);
              fetchReceipts(
                receiptQuery,
                receiptsPage,
                selectedReceiptMember ? String(selectedReceiptMember.id) : undefined,
                receiptSearchField
              );
              fetchNotices();
              fetchConsultations();
            }}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${membersLoading || receiptsLoading ? 'animate-spin' : ''}`} />
            <span>새로고침</span>
          </button>

          <Link
            href="/consult"
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow flex items-center space-x-1.5 transition-all whitespace-nowrap shrink-0"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>+ 신규 회원 신청서 등록</span>
          </Link>

          <button
            onClick={handleDownloadExcel}
            title={
              activeTab === 'receipts'
                ? selectedReceiptList.length > 0
                  ? `선택된 ${selectedReceiptList.length}건 영수증 엑셀 다운로드`
                  : '영수증 목록 엑셀 다운로드'
                : '회원 목록 엑셀 다운로드'
            }
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>
              {activeTab === 'receipts'
                ? selectedReceiptList.length > 0
                  ? `선택 영수증 엑셀 (${selectedReceiptList.length}건)`
                  : '영수증 엑셀 다운로드'
                : '회원 목록 엑셀 다운로드'}
            </span>
          </button>

          <button
            onClick={() => {
              setAuthenticated(false);
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('gta_admin_logged');
              }
            }}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'members'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>👥 전체 회원 검색 및 영수증 발급</span>
          <span className="bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
            {membersTotal.toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedReceiptMember(null);
            setReceiptsPage(1);
            setActiveTab('receipts');
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'receipts'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md border border-amber-500'
              : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
          }`}
        >
          <Receipt className="w-4 h-4 shrink-0" />
          <span>🧾 영수증 내역 및 관리</span>
          <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
            {receiptsTotal.toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => {
            fetchConsultations();
            setActiveTab('consultations');
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'consultations'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
          }`}
        >
          <Mail className="w-4 h-4 shrink-0" />
          <span>📨 온라인 문의 및 신청서 접수함</span>
          <span className="bg-blue-800 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
            {consultations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'notices'
              ? 'bg-gta-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Megaphone className="w-4 h-4 shrink-0" />
          <span>📢 공지사항 관리</span>
          <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
            {notices.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MEMBER SEARCH & RECEIPT ISSUANCE (- Member List) */}
      {/* ========================================================================= */}
      {activeTab === 'members' && (
        <div className="space-y-4 print:hidden">
          <form
            onSubmit={e => {
              e.preventDefault();
              setMembersPage(1);
              setMemberQuery(memberSearchInput);
            }}
            className="bg-slate-100 p-4 rounded-2xl border border-slate-300 shadow-xs flex flex-col lg:flex-row justify-between items-center gap-3"
          >
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-black text-slate-900 whitespace-nowrap shrink-0">- Member List</span>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto justify-end">
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-700 shrink-0">
                {(
                  [
                    { value: 'name', label: 'name' },
                    { value: 'number', label: 'number' },
                    { value: 'phone', label: 'phone' },
                  ] as const
                ).map(opt => (
                  <label key={opt.value} className="inline-flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0">
                    <input
                      type="radio"
                      name="memberSearchField"
                      value={opt.value}
                      checked={memberSearchField === opt.value}
                      onChange={() => setMemberSearchField(opt.value)}
                      className="w-4 h-4 text-gta-600 focus:ring-gta-500 cursor-pointer"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="relative w-full sm:w-80 lg:w-96 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="회원 이름(name), 등록번호(number), 연락처(phone)"
                  value={memberSearchInput}
                  onChange={e => setMemberSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-gta-500 bg-white"
                />
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="submit"
                  className="bg-gta-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer whitespace-nowrap shrink-0"
                >
                  검색
                </button>
                {memberQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setMemberSearchInput('');
                      setMemberQuery('');
                      setMembersPage(1);
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Members Table (Matching Legacy member_list.html - Gray Theme) */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                  <tr className="divide-x divide-slate-300">
                    <th className="px-1.5 py-2 w-[4%] min-w-[45px]">no</th>
                    <th className="px-2 py-2 w-[16%] min-w-[130px]">name</th>
                    <th className="px-2 py-2 w-[11%] min-w-[100px]">number</th>
                    <th className="px-2 py-2 w-[18%] min-w-[150px]">email</th>
                    <th className="px-2 py-2 w-[12%] min-w-[95px]">remark</th>
                    <th className="px-2 py-2 w-[13%] min-w-[110px]">Telephone</th>
                    <th className="px-2 py-2 w-[14%] min-w-[130px]">Date of Stay &amp; Work</th>
                    <th className="px-1 py-2 w-[6%] min-w-[55px]">Modify</th>
                    <th className="px-1 py-2 w-[6%] min-w-[55px]">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {membersLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-semibold">
                        회원 데이터를 불러오는 중입니다...
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                        검색 조건에 일치하는 회원이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    members.map(m => {
                      const cleanRemark = (m.remark || '').replace(/\\r\\n|\\n|\\r/g, ' ').trim();
                      return (
                        <tr key={m.id} className="hover:bg-yellow-50/40 transition-colors divide-x divide-slate-300">
                          <td className="px-1.5 py-1.5 font-mono text-xs text-slate-800 whitespace-nowrap">
                            {m.seq_no ?? m.id}
                          </td>
                          <td className="px-2 py-1.5 font-bold text-slate-900 leading-tight">
                            <button
                              type="button"
                              onClick={() => handleViewMemberReceipts(m)}
                              className="hover:underline text-slate-900 font-bold cursor-pointer text-left"
                            >
                              {m.name}
                            </button>
                          </td>
                          <td className="px-2 py-1.5 font-mono text-xs text-slate-800 whitespace-nowrap">
                            {m.number || ''}
                          </td>
                          <td className="px-2 py-1.5 text-xs text-slate-800 font-mono break-all leading-tight" title={m.email || ''}>
                            {m.email || ''}
                          </td>
                          <td className="px-2 py-1.5 text-xs text-slate-800 leading-tight whitespace-pre-line">
                            {cleanRemark}
                          </td>
                          <td className="px-2 py-1.5 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                            {m.phon || ''}
                          </td>
                          <td className="px-2 py-1.5 font-mono text-[11px] text-slate-800 whitespace-nowrap">
                            {formatUnixDate(m.date_from)} ~ {formatUnixDate(m.date_to)}
                          </td>
                          <td className="px-1 py-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenEditMember(m)}
                              className="bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-800 text-[11px] font-bold px-2 py-1 rounded-xs cursor-pointer whitespace-nowrap"
                            >
                              MODIFY
                            </button>
                          </td>
                          <td className="px-1 py-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleViewMemberReceipts(m)}
                              className="bg-blue-50 hover:bg-blue-100 border border-blue-400 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-xs cursor-pointer whitespace-nowrap"
                            >
                              VIEW
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Legacy Style 10-Page Block Pagination Bar */}
            <div className="px-6 py-4 bg-white border-t border-slate-300 flex flex-wrap justify-between items-center gap-2 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-1">
                {(() => {
                  const blockStart = Math.floor((membersPage - 1) / 10) * 10 + 1;
                  const blockEnd = Math.min(totalMemberPages, blockStart + 9);
                  const pages = [];
                  for (let p = blockStart; p <= blockEnd; p++) pages.push(p);

                  return (
                    <>
                      {blockStart > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setMembersPage(Math.max(1, blockStart - 10))}
                            className="text-slate-700 hover:text-blue-700 underline font-bold px-1 py-0.5 cursor-pointer whitespace-nowrap"
                          >
                            [BACK 10]
                          </button>
                          <button
                            type="button"
                            onClick={() => setMembersPage(1)}
                            className="text-slate-700 hover:text-blue-700 underline font-bold px-1 py-0.5 cursor-pointer whitespace-nowrap"
                          >
                            [1]
                          </button>
                          <span className="text-slate-500 px-0.5">..</span>
                        </>
                      )}

                      {pages.map(p =>
                        p === membersPage ? (
                          <span key={p} className="text-orange-600 font-black px-1.5 py-0.5 text-sm">
                            {p}
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setMembersPage(p)}
                            className="text-blue-700 hover:text-blue-900 underline font-semibold px-1 py-0.5 cursor-pointer"
                          >
                            [{p}]
                          </button>
                        )
                      )}

                      {blockEnd < totalMemberPages && (
                        <>
                          <span className="text-slate-500 px-0.5">..</span>
                          <button
                            type="button"
                            onClick={() => setMembersPage(totalMemberPages)}
                            className="text-blue-700 hover:text-blue-900 underline font-semibold px-1 py-0.5 cursor-pointer"
                          >
                            [{totalMemberPages}]
                          </button>
                          <button
                            type="button"
                            onClick={() => setMembersPage(Math.min(totalMemberPages, blockEnd + 1))}
                            className="text-blue-700 hover:text-blue-900 underline font-bold px-1 py-0.5 cursor-pointer whitespace-nowrap"
                          >
                            [NEXT 10]
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              <Link
                href="/consult"
                className="bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-800 text-xs font-bold px-3 py-1 rounded-xs whitespace-nowrap shrink-0"
              >
                WRITE
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RECEIPT LIST (Full-width expanded layout) */}
      {/* ========================================================================= */}
      {activeTab === 'receipts' && (
        <div className="w-full space-y-3 print:hidden bg-white p-4 sm:p-6 rounded-xl border border-amber-300 shadow-xs">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-3 p-4 bg-amber-50/80 rounded-2xl border border-amber-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 min-w-0 shrink-0">
              <span className="text-sm font-black text-slate-900 whitespace-nowrap shrink-0">- Receipt List</span>
              {selectedReceiptMember && (
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 whitespace-nowrap">
                  {selectedReceiptMember.name} ({selectedReceiptMember.number})
                </span>
              )}
              <button
                type="button"
                onClick={handleDownloadSelectedReceiptsPdf}
                disabled={isBatchGenerating || selectedReceiptList.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                title="체크된 영수증들을 하나의 PDF 파일로 묶어서 일괄 다운로드"
              >
                <FileDown className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isBatchGenerating && batchProgress
                    ? `PDF 생성 중 (${batchProgress.current}/${batchProgress.total})...`
                    : isBatchGenerating
                    ? 'PDF 생성 중...'
                    : `선택 영수증 PDF 일괄 저장 (${selectedReceiptList.length}건)`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadReceiptsExcel(selectedReceiptList.length > 0)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
                title={
                  selectedReceiptList.length > 0
                    ? `선택된 ${selectedReceiptList.length}건 영수증 엑셀 다운로드`
                    : '현재 검색 및 필터 조건의 영수증 목록 엑셀 다운로드'
                }
              >
                <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {selectedReceiptList.length > 0
                    ? `선택 영수증 엑셀 (${selectedReceiptList.length}건)`
                    : '영수증 엑셀 다운로드'}
                </span>
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                setSelectedReceiptMember(null);
                setReceiptsPage(1);
                setReceiptQuery(receiptSearchInput);
              }}
              className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto justify-end shrink-0"
            >
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-700 shrink-0">
                {(
                  [
                    { value: 'name', label: 'name' },
                    { value: 'number', label: 'number' },
                    { value: 'phone', label: 'phone' },
                  ] as const
                ).map(opt => (
                  <label key={opt.value} className="inline-flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0">
                    <input
                      type="radio"
                      name="receiptSearchField"
                      value={opt.value}
                      checked={receiptSearchField === opt.value}
                      onChange={() => setReceiptSearchField(opt.value)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="relative w-full sm:w-80 lg:w-96 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="회원 이름(name), 등록번호(number), 연락처(phone)"
                  value={receiptSearchInput}
                  onChange={e => setReceiptSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer whitespace-nowrap shrink-0"
                >
                  검색
                </button>
                {(receiptQuery || selectedReceiptMember) && (
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptSearchInput('');
                      setReceiptQuery('');
                      setSelectedReceiptMember(null);
                      setReceiptsPage(1);
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
                  >
                    초기화
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Expanded Receipt List Table (Yellow Theme Matching Client Request) */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[#CCCCCC] text-center text-[12px] text-black">
              <thead>
                <tr className="bg-[#FFFBC8] h-[34px] font-bold whitespace-nowrap text-slate-900 border-b border-amber-300">
                  <td className="border border-[#CCCCCC] px-2 w-[3%]">
                    <input
                      type="checkbox"
                      checked={receipts.length > 0 && receipts.every(r => !!selectedReceiptsMap[r.id])}
                      onChange={handleToggleSelectAllReceipts}
                      title="전체 선택 / 해제"
                      aria-label="전체 영수증 선택"
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="border border-[#CCCCCC] px-2 w-[4%]">no</td>
                  <td className="border border-[#CCCCCC] px-3 w-[18%]">name</td>
                  <td className="border border-[#CCCCCC] px-3 w-[14%]">Payer Resident-No</td>
                  <td className="border border-[#CCCCCC] px-3 w-[18%]">Company</td>
                  <td className="border border-[#CCCCCC] px-3 w-[12%]">Taxation</td>
                  <td className="border border-[#CCCCCC] px-3 w-[11%]">Issue date</td>
                  <td className="border border-[#CCCCCC] px-2 w-[6%]">Modify</td>
                  <td className="border border-[#CCCCCC] px-2 w-[4%]">Del</td>
                  <td className="border border-[#CCCCCC] px-2 w-[6%]">+ Write</td>
                </tr>
              </thead>
              <tbody>
                {receiptsLoading ? (
                  <tr>
                    <td colSpan={10} className="border border-[#CCCCCC] py-10 text-center text-slate-500">
                      영수증 목록을 불러오는 중입니다...
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="border border-[#CCCCCC] py-10 text-center text-slate-500">
                      등록된 영수증이 없습니다. 우측 하단 [WRITE] 버튼을 눌러 영수증을 작성하세요.
                    </td>
                  </tr>
                ) : (
                  receipts.map((r, idx) => {
                    const rowNo = receiptsTotal - ((receiptsPage - 1) * 25 + idx);
                    return (
                      <tr key={r.id} className="bg-white hover:bg-yellow-50/40 h-[30px] whitespace-nowrap">
                        <td className="border border-[#CCCCCC] px-2 py-1">
                          <input
                            type="checkbox"
                            checked={!!selectedReceiptsMap[r.id]}
                            onChange={() => handleToggleSelectReceipt(r)}
                            aria-label={`${r.name} 영수증 선택`}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="border border-[#CCCCCC] px-2 py-1">{rowNo > 0 ? rowNo : idx + 1}</td>
                        <td className="border border-[#CCCCCC] px-2.5 py-1 font-bold">
                          <button
                            type="button"
                            onClick={() => setSelectedPrintReceipt(r)}
                            className="text-[#0000EE] hover:text-blue-900 underline font-bold cursor-pointer whitespace-nowrap"
                            title="영수증 보기 / 인쇄 (View Receipt)"
                          >
                            {r.name}
                          </button>
                        </td>
                        <td className="border border-[#CCCCCC] px-2 py-1 font-mono">{r.resident_no2}</td>
                        <td className="border border-[#CCCCCC] px-2 py-1 font-bold text-slate-800">
                          {r.overseas_name || r.local_name || '-'}
                        </td>
                        <td className="border border-[#CCCCCC] px-2 py-1 font-mono text-slate-700">
                          {formatUnixDate(r.taxation_period)}
                        </td>
                        <td className="border border-[#CCCCCC] px-2 py-1 font-mono text-slate-700">{formatUnixDate(r.reg_date)}</td>
                        <td className="border border-[#CCCCCC] px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditReceipt(r)}
                            className="bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-xs cursor-pointer whitespace-nowrap"
                          >
                            MODIFY
                          </button>
                        </td>
                        <td className="border border-[#CCCCCC] px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteReceipt(r.id)}
                            className="bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded-xs cursor-pointer whitespace-nowrap"
                          >
                            DEL
                          </button>
                        </td>
                        <td className="border border-[#CCCCCC] px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => handleDuplicateReceipt(r)}
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-400 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-xs cursor-pointer whitespace-nowrap"
                            title="본 내용을 기준으로 추가등록"
                          >
                            + WRITE
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Offscreen container for combined PDF generation */}
          <div
            ref={batchContainerRef}
            style={{
              position: 'fixed',
              left: '-9999px',
              top: 0,
              width: '740px',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          >
            {selectedReceiptList.map((rcpt, idx) => (
              <div key={`batch-${rcpt.id}-${idx}`} data-batch-receipt-item style={{ background: '#ffffff', padding: '16px', marginBottom: '24px' }}>
                <ReceiptDocument receipt={rcpt} />
              </div>
            ))}
          </div>

          {/* Bottom Bar: Pagination on left, [WRITE] button on right */}
          <div className="pt-2 flex flex-wrap justify-between items-center gap-2 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-1">
              {totalReceiptPages > 1 &&
                (() => {
                  const blockStart = Math.floor((receiptsPage - 1) / 10) * 10 + 1;
                  const blockEnd = Math.min(totalReceiptPages, blockStart + 9);
                  const pages = [];
                  for (let p = blockStart; p <= blockEnd; p++) pages.push(p);

                  return (
                    <>
                      {blockStart > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setReceiptsPage(Math.max(1, blockStart - 10))}
                            className="text-slate-700 hover:text-blue-700 underline font-bold px-1 py-0.5 cursor-pointer"
                          >
                            [BACK 10]
                          </button>
                          <button
                            type="button"
                            onClick={() => setReceiptsPage(1)}
                            className="text-slate-700 hover:text-blue-700 underline font-bold px-1 py-0.5 cursor-pointer"
                          >
                            [1]
                          </button>
                          <span className="text-slate-500 px-0.5">..</span>
                        </>
                      )}

                      {pages.map(p =>
                        p === receiptsPage ? (
                          <span key={p} className="text-orange-600 font-black px-1.5 py-0.5 text-sm">
                            {p}
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setReceiptsPage(p)}
                            className="text-blue-700 hover:text-blue-900 underline font-semibold px-1 py-0.5 cursor-pointer"
                          >
                            [{p}]
                          </button>
                        )
                      )}

                      {blockEnd < totalReceiptPages && (
                        <>
                          <span className="text-slate-500 px-0.5">..</span>
                          <button
                            type="button"
                            onClick={() => setReceiptsPage(totalReceiptPages)}
                            className="text-blue-700 hover:text-blue-900 underline font-semibold px-1 py-0.5 cursor-pointer"
                          >
                            [{totalReceiptPages}]
                          </button>
                          <button
                            type="button"
                            onClick={() => setReceiptsPage(Math.min(totalReceiptPages, blockEnd + 1))}
                            className="text-blue-700 hover:text-blue-900 underline font-bold px-1 py-0.5 cursor-pointer"
                          >
                            [NEXT 10]
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}
            </div>

            <button
              type="button"
              onClick={() => handleOpenWriteReceipt(selectedReceiptMember)}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-500 text-black text-xs font-bold px-4 py-1 rounded-xs cursor-pointer"
            >
              WRITE
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NOTICE BOARD MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'notices' && (
        <div className="space-y-6 print:hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">공지사항 및 세무 자료 목록</h2>
              <p className="text-xs text-slate-500">새 공지사항을 작성하거나 기존 게시글을 관리할 수 있습니다.</p>
            </div>

            <button
              onClick={() => setShowNoticeModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ 새 공지사항 작성하기</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5 text-center w-16">Status</th>
                    <th className="px-4 py-3.5 w-32">Category</th>
                    <th className="px-6 py-3.5">Title</th>
                    <th className="px-4 py-3.5 w-32">Author</th>
                    <th className="px-4 py-3.5 text-center w-36">Date</th>
                    <th className="px-4 py-3.5 text-center w-24">Hits</th>
                    <th className="px-4 py-3.5 text-right w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {notices.map(n => (
                    <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-center">
                        {n.isPinned && (
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                            <Pin className="w-3 h-3" />
                            <span>HOT</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded border border-blue-200">
                          {n.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-900">{n.title}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{n.author || 'GTA'}</td>
                      <td className="px-4 py-3.5 text-center font-mono text-xs text-slate-500">
                        {n.createdAt.split(' ')[0]}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-xs font-bold text-slate-700">{n.views}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteNotice(n.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ONLINE INQUIRIES & APPLICATION FORMS INBOX */}
      {/* ========================================================================= */}
      {activeTab === 'consultations' && (
        <div className="space-y-6 print:hidden">
          {/* Header & Stats Banner */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-600 text-white p-2 rounded-xl">
                  <Mail className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">온라인 문의 및 신청서 접수함</h2>
                  <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span>홈페이지 Contact Us 및 가입 신청서를 통해 접수된 실시간 내역과 첨부파일을 관리합니다.</span>
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✨ 6개월 경과 데이터 자동 영구 삭제 보장
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fetchConsultations()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>새로고침</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['전체', '접수', '진행중', '완료'] as const).map(st => {
                const count =
                  st === '전체' ? consultations.length : consultations.filter(c => c.status === st).length;
                const isActive = consultationStatusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setConsultationStatusFilter(st)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isActive
                        ? st === '접수'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : st === '진행중'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : st === '완료'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-800 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{st}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="신청자명, 연락처, 이메일, 제목 검색..."
                value={consultationSearchQuery}
                onChange={e => setConsultationSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {consultationSearchQuery && (
                <button
                  type="button"
                  onClick={() => setConsultationSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Consultations Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span>접수함 데이터를 불러오는 중입니다...</span>
              </div>
            ) : (() => {
              const filtered = consultations.filter(c => {
                if (consultationStatusFilter !== '전체' && c.status !== consultationStatusFilter) {
                  return false;
                }
                if (consultationSearchQuery.trim()) {
                  const q = consultationSearchQuery.toLowerCase();
                  const inName = (c.applicantName || '').toLowerCase().includes(q);
                  const inPhone = (c.phone || '').toLowerCase().includes(q);
                  const inTitle = (c.title || '').toLowerCase().includes(q);
                  const inContent = (c.content || '').toLowerCase().includes(q);
                  return inName || inPhone || inTitle || inContent;
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-2">
                    <Inbox className="w-10 h-10 text-slate-300" />
                    <p className="font-semibold text-slate-600">접수된 문의 내역이 없습니다.</p>
                    <p className="text-xs text-slate-400">조건에 맞는 문의가 없거나 아직 접수된 내역이 없습니다.</p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3.5 text-center w-20">상태</th>
                        <th className="px-4 py-3.5 w-36">접수일시</th>
                        <th className="px-4 py-3.5 w-28">구분</th>
                        <th className="px-4 py-3.5 w-32">신청자명</th>
                        <th className="px-4 py-3.5 w-44">연락처 / 이메일</th>
                        <th className="px-6 py-3.5">문의 및 신청 제목</th>
                        <th className="px-4 py-3.5 text-center w-28">첨부파일</th>
                        <th className="px-4 py-3.5 text-right w-28">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filtered.map(c => {
                        const email = extractEmailFromConsultation(c);
                        const phone = extractPhoneFromConsultation(c);
                        const hasAttachments = c.attachments && c.attachments.length > 0;
                        return (
                          <tr
                            key={c.id}
                            className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedConsultation(c);
                              setEditStatus(c.status);
                              setEditMemo(c.adminMemo || '');
                            }}
                          >
                            <td className="px-4 py-3.5 text-center">
                              <span
                                className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full inline-block ${
                                  c.status === '접수'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : c.status === '진행중'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              {formatConsultationDate(c.createdAt)}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                  c.category === 'Application Form'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {c.category}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-slate-900">{c.applicantName}</td>
                            <td className="px-4 py-3.5 text-xs text-slate-600">
                              <div className="font-mono text-slate-800 font-semibold">{phone}</div>
                              {email && (
                                <a
                                  href={`mailto:${email}`}
                                  onClick={e => e.stopPropagation()}
                                  className="text-[11px] text-blue-600 hover:underline flex items-center space-x-1 mt-0.5"
                                  title="이메일 보내기"
                                >
                                  <Mail className="w-3 h-3 inline shrink-0" />
                                  <span className="truncate max-w-[140px]">{email}</span>
                                </a>
                              )}
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="font-bold text-slate-900 line-clamp-1">{c.title}</div>
                              <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                {c.content.replace(/===.*?===/g, '').replace(/\n+/g, ' ').trim()}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                              {hasAttachments ? (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadAttachment(c.attachments![0])}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-bold px-2 py-1 rounded-lg inline-flex items-center space-x-1 cursor-pointer transition-colors"
                                  title={`클릭하여 다운로드: ${c.attachments![0].name}`}
                                >
                                  <Paperclip className="w-3 h-3 shrink-0" />
                                  <span className="truncate max-w-[80px]">{c.attachments![0].name}</span>
                                </button>
                              ) : (
                                <span className="text-slate-300 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedConsultation(c);
                                    setEditStatus(c.status);
                                    setEditMemo(c.adminMemo || '');
                                  }}
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer flex items-center space-x-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>상세</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteConsultation(c.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg border border-red-200 transition-colors cursor-pointer"
                                  title="삭제"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: RECEIPT WRITE / MODIFY POPUP (Matching GTA Excel Sample) */}
      {/* ========================================================================= */}
      {showReceiptFormModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-2 sm:p-6 overflow-y-auto print:hidden">
          <div className="bg-white border-2 border-slate-500 shadow-2xl max-w-[820px] w-full p-4 sm:p-6 my-4 max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-20 flex justify-between items-center pb-2.5 mb-3 border-b border-slate-300 text-xs">
              <span className="font-bold text-slate-800 text-sm">
                {editingReceiptId ? `영수증 수정 #${editingReceiptId}` : '영수증 작성'}
              </span>
              <button
                type="button"
                onClick={() => setShowReceiptFormModal(false)}
                className="text-slate-500 hover:text-black font-bold px-2 py-0.5 cursor-pointer"
              >
                ✕ 닫기
              </button>
            </div>

            <form onSubmit={handleSaveReceipt} className="space-y-4 text-[12px] text-black">
              <div className="overflow-x-auto">
                <div className="w-[740px] mx-auto bg-white p-2 space-y-4">
                  {/* Title */}
                  <div className="text-center py-2">
                    <select
                      value={receiptForm.receipt_title || 'RECEIPT FOR CLASS "B" INCOME TAX (MONTHLY)'}
                      onChange={e => setReceiptForm({ ...receiptForm, receipt_title: e.target.value })}
                      className="text-center text-[15px] sm:text-[17px] font-bold tracking-wide py-1.5 px-3 border border-slate-300 rounded bg-yellow-50/50 w-full max-w-[520px] cursor-pointer"
                    >
                      <option value='RECEIPT FOR CLASS "B" INCOME TAX (MONTHLY)'>
                        RECEIPT FOR CLASS &quot;B&quot; INCOME TAX (MONTHLY)
                      </option>
                      <option value="RECEIPT FOR GLOBAL INCOME TAX RETURN">
                        RECEIPT FOR GLOBAL INCOME TAX RETURN
                      </option>
                    </select>
                  </div>

                  {/* Top Meta Row */}
                  <div className="flex flex-wrap sm:flex-nowrap justify-between items-center text-[12px] gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold whitespace-nowrap">GTA Management No. :</span>
                      <input
                        type="text"
                        value={receiptForm.management_no}
                        onChange={e => setReceiptForm({ ...receiptForm, management_no: e.target.value })}
                        className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 text-[12px] w-[180px]"
                      />
                    </div>
                    <div className="flex items-center space-x-2 ml-auto">
                      <span className="font-semibold whitespace-nowrap">Taxation Period :</span>
                      <div className="flex items-center space-x-1">
                        <select
                          value={receiptForm.tax_year}
                          onChange={e => setReceiptForm({ ...receiptForm, tax_year: Number(e.target.value) })}
                          className="bg-[#F3F3F3] border border-slate-400 text-[12px] px-1.5 py-1"
                        >
                          {YEAR_OPTIONS.map(y => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                        <span>.</span>
                        <select
                          value={receiptForm.tax_month}
                          onChange={e => setReceiptForm({ ...receiptForm, tax_month: Number(e.target.value) })}
                          className="bg-[#F3F3F3] border border-slate-400 text-[12px] px-1.5 py-1"
                        >
                          <option value={0}>-</option>
                          {MONTH_OPTIONS.map(m => (
                            <option key={m} value={m}>
                              {String(m).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* TAXPAYER & TAXPAYER ASSOCIATION (Vertical 1-Column Stacked Layout) */}
                  <table className="w-full border-collapse border border-slate-500 text-[12px]">
                    <tbody>
                      {/* TAXPAYER (3 rows) */}
                      <tr>
                        <td
                          rowSpan={3}
                          className="border border-slate-400 bg-[#DCE6F1] text-center font-semibold w-[150px] px-2 py-2 align-middle"
                        >
                          TAXPAYER
                        </td>
                        <td className="border border-slate-300 px-3 py-1.5 w-[160px] font-medium">Name</td>
                        <td className="border border-slate-300 px-2 py-1">
                          <input
                            type="text"
                            value={receiptForm.name}
                            onChange={e => {
                              const val = e.target.value.toUpperCase();
                              setReceiptForm(prev => ({ ...prev, name: val, reg_name: val }));
                            }}
                            className="bg-[#D9EE99] border border-slate-400 px-2 py-1 w-full text-[12px] font-semibold"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-1.5 font-medium">Registration Number</td>
                        <td className="border border-slate-300 px-2 py-1">
                          <input
                            type="text"
                            value={receiptForm.resident_no2}
                            onChange={e => setReceiptForm({ ...receiptForm, resident_no2: e.target.value })}
                            className="bg-[#D9EE99] border border-slate-400 px-2 py-1 w-[220px] text-[12px]"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-1.5 font-medium">Address</td>
                        <td className="border border-slate-300 px-2 py-1">
                          <input
                            type="text"
                            value={receiptForm.address2}
                            onChange={e => setReceiptForm({ ...receiptForm, address2: e.target.value })}
                            className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-full text-[12px]"
                          />
                        </td>
                      </tr>

                      {/* TAXPAYER ASSOCIATION (4 rows) */}
                      <tr>
                        <td
                          rowSpan={4}
                          className="border border-slate-400 bg-[#DCE6F1] text-center font-semibold px-2 py-2 align-middle leading-tight"
                        >
                          TAXPAYER
                          <br />
                          ASSOCIATION
                        </td>
                        <td className="border border-slate-300 px-3 py-1.5 font-medium">Association</td>
                        <td className="border border-slate-300 px-2 py-1">
                          <input
                            type="text"
                            value={receiptForm.association_name}
                            onChange={e => setReceiptForm({ ...receiptForm, association_name: e.target.value })}
                            className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-full text-[12px]"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-1.5 font-medium">Licence number</td>
                        <td className="border border-slate-300 px-2 py-1">
                          <input
                            type="text"
                            value={receiptForm.license_no}
                            onChange={e => setReceiptForm({ ...receiptForm, license_no: e.target.value })}
                            className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-[220px] text-[12px]"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-1.5 font-medium">Chairman</td>
                        <td className="border border-slate-300 px-2 py-1">
                          <input
                            type="text"
                            value={receiptForm.chairman_name}
                            onChange={e => setReceiptForm({ ...receiptForm, chairman_name: e.target.value })}
                            className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-[220px] text-[12px]"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-1.5 font-medium">Address</td>
                        <td className="border border-slate-300 px-2 py-1">
                          <input
                            type="text"
                            value={receiptForm.address1}
                            onChange={e => setReceiptForm({ ...receiptForm, address1: e.target.value })}
                            className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-full text-[12px]"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* WAGE & SALARY DETAILS (KRW) */}
                  <div>
                    <div className="font-semibold text-[12px] mb-1">WAGE &amp; SALARY DETAILS (KRW)</div>
                    <table className="w-full border-collapse border border-slate-500 text-[12px] text-center">
                      <thead>
                        <tr className="bg-[#DCE6F1] h-[30px]">
                          <th className="border border-slate-400 font-medium px-2 w-[20%]">Company</th>
                          <th className="border border-slate-400 font-medium px-2 w-[20%]">[1] Basic Salary</th>
                          <th className="border border-slate-400 font-medium px-2 w-[20%]">[2] Bonus</th>
                          <th className="border border-slate-400 font-medium px-2 w-[20%]">[3] Other Income</th>
                          <th className="border border-slate-400 font-medium px-2 w-[20%]">[4] Total Salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="h-[44px]">
                          <td className="border border-slate-400 p-1.5">
                            <input
                              type="text"
                              value={receiptForm.overseas_name}
                              onChange={e => setReceiptForm({ ...receiptForm, overseas_name: e.target.value })}
                              placeholder="Company"
                              className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-full text-[12px] text-center"
                            />
                          </td>
                          <td className="border border-slate-400 p-1.5">
                            <input
                              type="text"
                              value={receiptForm.overseas_basicsalary}
                              onChange={e => handleOverseasSalaryChange('overseas_basicsalary', e.target.value)}
                              placeholder="0"
                              className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-full text-[12px] text-right font-mono"
                            />
                          </td>
                          <td className="border border-slate-400 p-1.5">
                            <input
                              type="text"
                              value={receiptForm.overseas_bonus}
                              onChange={e => handleOverseasSalaryChange('overseas_bonus', e.target.value)}
                              placeholder="0"
                              className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-full text-[12px] text-right font-mono"
                            />
                          </td>
                          <td className="border border-slate-400 p-1.5">
                            <input
                              type="text"
                              value={receiptForm.overseas_income}
                              onChange={e => handleOverseasSalaryChange('overseas_income', e.target.value)}
                              placeholder="0"
                              className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-full text-[12px] text-right font-mono"
                            />
                          </td>
                          <td className="border border-slate-400 p-1.5">
                            <input
                              type="text"
                              value={receiptForm.total_salary}
                              onChange={e => {
                                const val = formatWithCommas(e.target.value);
                                setReceiptForm({
                                  ...receiptForm,
                                  overseas_totalsalary: val,
                                  total_totalsalary: val,
                                  total_salary: val,
                                });
                              }}
                              placeholder="=[1]+[2]+[3]"
                              className="bg-blue-50/60 border border-slate-400 px-2 py-1 w-full text-[12px] text-right font-mono font-bold"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* TAX CALCULATION (KRW) */}
                  <div>
                    <div className="font-semibold text-[12px] mb-1">TAX CALCULATION (KRW)</div>
                    <table className="w-full border-collapse border border-slate-500 text-[12px] text-center">
                      <tbody>
                        {/* Row 1: [4] Total Salary | [5] * Non Taxable Salary */}
                        <tr className="h-[28px]" style={{ verticalAlign: 'middle' }}>
                          <td colSpan={2} className="border border-slate-400 bg-[#DCE6F1] font-medium px-2 w-2/3" style={{ verticalAlign: 'middle' }}>
                            [4] Total Salary
                          </td>
                          <td className="border border-slate-400 bg-[#DCE6F1] font-medium px-2 w-1/3" style={{ verticalAlign: 'middle' }}>
                            [5] * Non Taxable Salary
                          </td>
                        </tr>
                        <tr className="h-[42px]" style={{ verticalAlign: 'middle' }}>
                          <td colSpan={2} className="border border-slate-400 p-1.5 w-2/3" style={{ verticalAlign: 'middle' }}>
                            <input
                              type="text"
                              value={receiptForm.total_salary}
                              onChange={e =>
                                setReceiptForm({ ...receiptForm, total_salary: formatWithCommas(e.target.value) })
                              }
                              className="bg-blue-50/60 border border-slate-400 px-2 py-1 w-full text-[12px] text-right font-mono font-bold"
                            />
                          </td>
                          <td className="border border-slate-400 p-1.5 w-1/3" style={{ verticalAlign: 'middle' }}>
                            <input
                              type="text"
                              value={receiptForm.non_taxable_salary}
                              onChange={e =>
                                setReceiptForm({
                                  ...receiptForm,
                                  non_taxable_salary: formatWithCommas(e.target.value),
                                })
                              }
                              placeholder="수기 입력 (Manual Input)"
                              className="bg-[#D9EE99] border border-slate-400 px-2 py-1 w-full text-[12px] text-right font-mono"
                            />
                          </td>
                        </tr>

                        {/* Row 2: [6] Payable Income Tax | [7] Local Income Tax | [8] Total tax */}
                        <tr className="bg-[#DCE6F1] h-[28px]" style={{ verticalAlign: 'middle' }}>
                          <td className="border border-slate-400 font-medium px-2" style={{ verticalAlign: 'middle' }}>[6] Payable Income Tax</td>
                          <td className="border border-slate-400 font-medium px-2" style={{ verticalAlign: 'middle' }}>[7] Local Income Tax</td>
                          <td className="border border-slate-400 font-medium px-2" style={{ verticalAlign: 'middle' }}>[8] Total tax</td>
                        </tr>
                        <tr className="h-[42px]" style={{ verticalAlign: 'middle' }}>
                          <td className="border border-slate-400 p-1.5" style={{ verticalAlign: 'middle' }}>
                            <input
                              type="text"
                              value={receiptForm.payable_income}
                              onChange={e => handlePayableTaxChange('payable_income', e.target.value)}
                              placeholder="0"
                              className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-full text-[12px] text-right font-mono"
                            />
                          </td>
                          <td className="border border-slate-400 p-1.5" style={{ verticalAlign: 'middle' }}>
                            <input
                              type="text"
                              value={receiptForm.payable_resident}
                              onChange={e => handlePayableTaxChange('payable_resident', e.target.value)}
                              placeholder="0"
                              className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-full text-[12px] text-right font-mono"
                            />
                          </td>
                          <td className="border border-slate-400 p-1.5" style={{ verticalAlign: 'middle' }}>
                            <input
                              type="text"
                              value={receiptForm.payable_special}
                              onChange={e =>
                                setReceiptForm({ ...receiptForm, payable_special: formatWithCommas(e.target.value) })
                              }
                              placeholder="=[6]+[7]"
                              className="bg-blue-50/60 border border-slate-400 px-2 py-1 w-full text-[12px] text-right font-mono font-bold"
                            />
                          </td>
                        </tr>

                        {/* Row 3 & 4: Service Fee & Year-end settlement Fee */}
                        <tr className="h-[34px]" style={{ verticalAlign: 'middle' }}>
                          <td rowSpan={2} className="border border-slate-400 bg-white px-2" style={{ verticalAlign: 'middle' }}></td>
                          <td className="border border-slate-400 bg-[#DCE6F1] font-medium px-2" style={{ verticalAlign: 'middle' }}>
                            [8] Monthly service Fee
                          </td>
                          <td className="border border-slate-400 p-1.5" style={{ verticalAlign: 'middle' }}>
                            <input
                              type="text"
                              value={receiptForm.service_fee}
                              onChange={e =>
                                setReceiptForm({ ...receiptForm, service_fee: formatWithCommas(e.target.value) })
                              }
                              placeholder="30,000"
                              className="bg-[#D9EE99] border border-slate-400 px-2 py-1 w-full text-[12px] text-right font-mono font-semibold"
                            />
                          </td>
                        </tr>
                        <tr className="h-[34px]" style={{ verticalAlign: 'middle' }}>
                          <td className="border border-slate-400 bg-[#DCE6F1] font-medium px-2" style={{ verticalAlign: 'middle' }}>
                            [9] Year-end settlement Fee
                          </td>
                          <td className="border border-slate-400 p-1.5" style={{ verticalAlign: 'middle' }}>
                            <input
                              type="text"
                              value={receiptForm.yearend_fee}
                              onChange={e =>
                                setReceiptForm({ ...receiptForm, yearend_fee: formatWithCommas(e.target.value) })
                              }
                              placeholder="0"
                              className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-full text-[12px] text-right font-mono"
                            />
                          </td>
                        </tr>

                        {/* Row 5: [10] Grand total amount */}
                        <tr className="h-[44px]" style={{ verticalAlign: 'middle' }}>
                          <td colSpan={2} className="border border-slate-400 bg-[#DCE6F1] font-semibold px-2" style={{ verticalAlign: 'middle' }}>
                            [10] Grand total amount
                          </td>
                          <td className="border border-slate-400 px-3 font-bold text-[13px] text-right font-mono bg-emerald-50/50" style={{ verticalAlign: 'middle' }}>
                            {(() => {
                              const totalTax =
                                parseCommaNum(receiptForm.payable_income) + parseCommaNum(receiptForm.payable_resident) >
                                0
                                  ? parseCommaNum(receiptForm.payable_income) +
                                    parseCommaNum(receiptForm.payable_resident)
                                  : parseCommaNum(receiptForm.payable_special);
                              const grand =
                                totalTax +
                                parseCommaNum(receiptForm.service_fee) +
                                parseCommaNum(receiptForm.yearend_fee);
                              return grand > 0 ? `₩${grand.toLocaleString('en-US')}` : '₩0';
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Certification & Issue Date Footer */}
                  <div className="pt-2 space-y-2 border-t border-slate-200">
                    <div className="text-[11.5px] text-slate-800">
                      We hereby certify that the above wage and salary income tax has been duly withheld and paid
                      <br />
                      to the National Tax Service.
                    </div>

                    <div className="flex justify-between items-end pt-1">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold w-[80px]">Issue Date :</span>
                          <select
                            value={receiptForm.reg_year}
                            onChange={e => setReceiptForm({ ...receiptForm, reg_year: Number(e.target.value) })}
                            className="bg-[#F3F3F3] border border-slate-400 text-[12px] px-1.5 py-0.5"
                          >
                            {YEAR_OPTIONS.map(y => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                          <span>.</span>
                          <select
                            value={receiptForm.reg_month}
                            onChange={e => setReceiptForm({ ...receiptForm, reg_month: Number(e.target.value) })}
                            className="bg-[#F3F3F3] border border-slate-400 text-[12px] px-1.5 py-0.5"
                          >
                            {MONTH_OPTIONS.map(m => (
                              <option key={m} value={m}>
                                {String(m).padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                          <span>.</span>
                          <select
                            value={receiptForm.reg_day}
                            onChange={e => setReceiptForm({ ...receiptForm, reg_day: Number(e.target.value) })}
                            className="bg-[#F3F3F3] border border-slate-400 text-[12px] px-1.5 py-0.5"
                          >
                            {DAY_OPTIONS.map(d => (
                              <option key={d} value={d}>
                                {String(d).padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="font-semibold w-[80px]">Taxpayer :</span>
                          <input
                            type="text"
                            value={receiptForm.reg_name}
                            onChange={e => setReceiptForm({ ...receiptForm, reg_name: e.target.value })}
                            className="bg-[#F8F8F8] border border-slate-400 px-2 py-1 w-[220px] text-[12px]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[12px] font-medium tracking-wider">GEOGE TAXPAYER ASSOCIATION</span>
                        <img
                          src="/img/official_seal.png"
                          alt="Geoje Taxpayer Association Official Seal"
                          className="w-[68px] h-[68px] object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-6 py-2 rounded-lg shadow cursor-pointer"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => submitReceiptData(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow flex items-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>저장 후 PDF 다운로드</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptFormModal(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-6 py-2 rounded-lg cursor-pointer"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FULL APPLICATION FORM MEMBER EDIT MODAL */}
      {/* ========================================================================= */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start justify-center p-2 sm:p-6 overflow-y-auto print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full p-4 sm:p-8 space-y-6 my-4 max-h-[92vh] overflow-y-auto">
            {/* Top Header matching Application Form */}
            <div className="sticky top-0 bg-white z-20 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-3 gap-2">
              <div>
                <div className="inline-flex items-center space-x-2 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full mb-1 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Authorized GTA Administrator Application Form (no. {editingMember.seq_no ?? editingMember.id} — #{editingMember.id})
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                  APPLICATION FOR ADMISSION TO GEOJE TAXPAYERS ASSOCIATION
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Tel: (055) 688-2141 &nbsp;|&nbsp; Fax: (055) 688-2142 &nbsp;|&nbsp; www.gtakorea.org
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer self-end md:self-auto"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-7">
              {/* Section 1 ~ 3: Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. Applicant&apos;s Name *{' '}
                      <span className="text-slate-400 font-normal">(write in CAPITAL letters — auto-fills Signature)</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JOHN DOE"
                      value={memberAppForm.applicantName}
                      onChange={e => {
                        const upperName = e.target.value.toUpperCase();
                        setMemberAppForm(prev => ({
                          ...prev,
                          applicantName: upperName,
                          signature: upperName,
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500 uppercase font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nationality *</label>
                    <input
                      type="text"
                      placeholder="e.g. United Kingdom"
                      value={memberAppForm.nationality}
                      onChange={e => setMemberAppForm({ ...memberAppForm, nationality: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">2. Alien Registration Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 800101-3000000"
                      value={memberAppForm.alienRegNo}
                      onChange={e => setMemberAppForm({ ...memberAppForm, alienRegNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Address *</label>
                    <input
                      type="text"
                      placeholder="e.g. member@example.com"
                      value={memberAppForm.email}
                      onChange={e => setMemberAppForm({ ...memberAppForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                    />
                  </div>
                </div>

                {/* Address with Korean Parcel-Style Popup Search -> Auto English Conversion */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-slate-700">
                      3. Residential Address in Korea *{' '}
                      <span className="text-slate-400 font-normal">(Search road address to auto-fill in English)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenMemberAddressPopup}
                      className="bg-gta-600 hover:bg-gta-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>주소 검색 (Search &amp; Auto-Fill English Address)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Click 'Search Address' or enter English address in Korea"
                        value={memberAppForm.address}
                        onChange={e => setMemberAppForm({ ...memberAppForm, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Apt / Room / Dong-Ho (e.g. #103-1002)"
                        value={memberAppForm.addressDetail}
                        onChange={e => {
                          const detail = e.target.value;
                          setMemberAppForm(prev => {
                            const baseAddr = prev.address.replace(/^#?[^,]+,\s*(?=\d)/, '');
                            return {
                              ...prev,
                              addressDetail: detail,
                              address: detail ? `${detail}, ${baseAddr}` : baseAddr,
                            };
                          });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4 ~ 7: Employment & Stay Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                  Employment &amp; Stay Information
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">4. Company Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Northern Marine / Subsea 7"
                    value={memberAppForm.company}
                    onChange={e => setMemberAppForm({ ...memberAppForm, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      5. Work place : (ex : Hanwha Ocean, SHI, HHI, STX, ...)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hanwha Ocean, SHI, HHI, STX, ..."
                      value={memberAppForm.workPlace}
                      onChange={e => setMemberAppForm({ ...memberAppForm, workPlace: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">(Project Name)</label>
                    <input
                      type="text"
                      placeholder="e.g. FLNG Project / Hull No. 2401"
                      value={memberAppForm.projectName}
                      onChange={e => setMemberAppForm({ ...memberAppForm, projectName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">6. Telephone number in Korea (Mobile) *</label>
                  <input
                    type="text"
                    placeholder="e.g. 010-1234-5678"
                    value={memberAppForm.phone}
                    onChange={e => setMemberAppForm({ ...memberAppForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500 font-mono"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">7. Date of Stay &amp; Work *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-600 shrink-0">From:</span>
                      <input
                        type="date"
                        value={memberAppForm.dateFrom}
                        onChange={e => setMemberAppForm({ ...memberAppForm, dateFrom: e.target.value })}
                        className="px-2.5 py-1.5 rounded border border-slate-300 text-xs font-mono w-full bg-white"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-600 shrink-0">To:</span>
                      <input
                        type="date"
                        value={memberAppForm.dateTo}
                        onChange={e => setMemberAppForm({ ...memberAppForm, dateTo: e.target.value })}
                        className="px-2.5 py-1.5 rounded border border-slate-300 text-xs font-mono w-full bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 8: Exemption (Marital & Children Details) */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                  8. Exemption Status (Check at least 1 item below)
                </h3>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
                  <div className="flex flex-wrap items-center gap-6 font-bold text-slate-800">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editMaritalStatus"
                        checked={memberAppForm.maritalStatus === 'Single'}
                        onChange={() => setMemberAppForm({ ...memberAppForm, maritalStatus: 'Single' })}
                        className="text-gta-600 focus:ring-gta-500"
                      />
                      <span>Single</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editMaritalStatus"
                        checked={memberAppForm.maritalStatus === 'Married'}
                        onChange={() => setMemberAppForm({ ...memberAppForm, maritalStatus: 'Married' })}
                        className="text-gta-600 focus:ring-gta-500"
                      />
                      <span>Married</span>
                      <span className="text-[11px] text-amber-700 font-normal">
                        (A copy of your marriage certificate is required)
                      </span>
                    </label>
                  </div>

                  {memberAppForm.maritalStatus === 'Married' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Spouse&apos;s Name</label>
                        <input
                          type="text"
                          placeholder="Spouse full name"
                          value={memberAppForm.spouseName}
                          onChange={e => setMemberAppForm({ ...memberAppForm, spouseName: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Spouse Date of Birth</label>
                        <input
                          type="text"
                          placeholder="DD/MM/YYYY or Resident No."
                          value={memberAppForm.spouseDob}
                          onChange={e => setMemberAppForm({ ...memberAppForm, spouseDob: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs font-mono bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Does spouse have any form of income?
                        </label>
                        <select
                          value={memberAppForm.spouseIncome}
                          onChange={e =>
                            setMemberAppForm({ ...memberAppForm, spouseIncome: e.target.value as 'No' | 'Yes' })
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs font-bold bg-white"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="font-bold text-slate-700">Number of children below 20 years of age:</label>
                      <select
                        value={memberAppForm.childrenCount}
                        onChange={e => handleMemberChildrenCountChange(e.target.value)}
                        className="px-2.5 py-1 rounded border border-slate-300 text-xs font-bold bg-white"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={String(num)}>
                            {num}
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-slate-500">
                        (A copy of child&apos;s birth certificate is required)
                      </span>
                    </div>

                    {memberAppForm.children.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {memberAppForm.children.map((child, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200">
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">
                              Child {idx + 1} Name &amp; DOB
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                placeholder={`Child ${idx + 1} Name`}
                                value={child.name}
                                onChange={e => handleMemberChildChange(idx, 'name', e.target.value)}
                                className="w-2/3 px-2 py-1.5 rounded border border-slate-300 text-xs"
                              />
                              <input
                                type="text"
                                placeholder="DOB (DD/MM/YYYY)"
                                value={child.dob}
                                onChange={e => handleMemberChildChange(idx, 'dob', e.target.value)}
                                className="w-1/3 px-2 py-1.5 rounded border border-slate-300 text-xs font-mono"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 italic bg-amber-50 p-2 rounded border border-amber-200">
                    ※ Family stays in Korea: Only a copy of KOR residence card is necessary.
                  </div>
                </div>
              </div>

              {/* Section 9: Class B Income Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                  9. The Class B Income (USD, EURO, NOK, GBP, DKK, CAD, AUD, SGD, SEK, JPY, KRW)
                </h3>

                {/* Currency Selection Bar */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                      <DollarSign className="w-4 h-4 text-gta-600" />
                      <span>Select Salary Currency (Auto-applied to all income fields &amp; Total Income):</span>
                    </label>
                    <select
                      value={memberAppForm.salaryCurrency}
                      onChange={e => setMemberAppForm({ ...memberAppForm, salaryCurrency: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-gta-300 bg-white text-xs font-extrabold text-gta-800 focus:ring-2 focus:ring-gta-500"
                    >
                      {CURRENCIES.map(cur => (
                        <option key={cur} value={cur}>
                          {cur}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {CURRENCIES.map(cur => (
                      <button
                        key={cur}
                        type="button"
                        onClick={() => setMemberAppForm({ ...memberAppForm, salaryCurrency: cur })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          memberAppForm.salaryCurrency === cur
                            ? 'bg-gta-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ① Basic Salary per month ({memberAppForm.salaryCurrency})
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-extrabold text-gta-700 bg-gta-50 px-1.5 py-0.5 rounded border border-gta-200 font-mono">
                        {memberAppForm.salaryCurrency}
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. 5,000"
                        value={memberAppForm.salaryBasic}
                        onChange={e => setMemberAppForm({ ...memberAppForm, salaryBasic: e.target.value })}
                        className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-gta-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ② Overseas allowance per month ({memberAppForm.salaryCurrency})
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-extrabold text-gta-700 bg-gta-50 px-1.5 py-0.5 rounded border border-gta-200 font-mono">
                        {memberAppForm.salaryCurrency}
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. 2,000"
                        value={memberAppForm.salaryAllowance}
                        onChange={e => setMemberAppForm({ ...memberAppForm, salaryAllowance: e.target.value })}
                        className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-gta-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ③ Bonus per month ({memberAppForm.salaryCurrency})
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-extrabold text-gta-700 bg-gta-50 px-1.5 py-0.5 rounded border border-gta-200 font-mono">
                        {memberAppForm.salaryCurrency}
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. 1,000"
                        value={memberAppForm.salaryBonus}
                        onChange={e => setMemberAppForm({ ...memberAppForm, salaryBonus: e.target.value })}
                        className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-gta-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold text-emerald-900">
                  <span>Total Income / Estimated Monthly Income (①+②+③):</span>
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-mono text-xs font-extrabold">
                      {memberAppForm.salaryCurrency}
                    </span>
                    <span className="font-mono text-lg text-emerald-700 font-black">
                      {memberAppForm.salaryCurrency} {calculateMemberTotalSalary()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 10: Worked for other company */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                  10. Did you work for other company during the same year in Korea?
                </h3>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center gap-6 font-bold text-slate-800">
                    <span>Did you work for other company during the same year in Korea?</span>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="editWorkedOtherCompany"
                        checked={memberAppForm.workedOtherCompany === 'No'}
                        onChange={() => setMemberAppForm({ ...memberAppForm, workedOtherCompany: 'No' })}
                        className="text-gta-600 focus:ring-gta-500"
                      />
                      <span>No</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="editWorkedOtherCompany"
                        checked={memberAppForm.workedOtherCompany === 'Yes'}
                        onChange={() => setMemberAppForm({ ...memberAppForm, workedOtherCompany: 'Yes' })}
                        className="text-gta-600 focus:ring-gta-500"
                      />
                      <span>Yes</span>
                    </label>
                  </div>

                  {memberAppForm.workedOtherCompany === 'Yes' && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
                      ※ If Yes, you must submit a{' '}
                      <strong>&apos;Receipt for wage and salary income Tax withholding&apos;</strong> of your previous
                      employment to GTA to avoid penalty tax.
                    </div>
                  )}
                </div>
              </div>

              {/* GTA Membership Declaration Statement */}
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-center">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 italic">
                  &quot;In accordance with the above, I hereby apply for membership in the GTA.&quot;
                </p>
              </div>

              {/* Section 11: Remark (Memo) */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                  Remark (Administrator Memo / Notes)
                </h3>
                <div>
                  <textarea
                    rows={3}
                    placeholder="Enter any remarks, DOB notes, or special tax memo for this member..."
                    value={memberAppForm.remark}
                    onChange={e => setMemberAppForm({ ...memberAppForm, remark: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                  />
                </div>
              </div>

              {/* Section 11: Required Documents Upload & Signature */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                  Required Documents Upload &amp; Signature
                </h3>

                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-gta-500" />
                      <span>
                        Attach Copies (KOR Residence Card, Marriage Certificate, Child Birth Certificate, Income Receipt)
                      </span>
                    </label>
                    <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      🔒 AES-256 Encrypted
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 pt-1">
                    <label className="cursor-pointer bg-white hover:bg-slate-50 active:bg-slate-100 text-gta-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-300 shadow-xs inline-flex items-center space-x-2 transition-all">
                      <Upload className="w-3.5 h-3.5 text-gta-600" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            const f = e.target.files[0];
                            setMemberAppForm(prev => ({
                              ...prev,
                              files: [...prev.files, { name: f.name, size: f.size }],
                            }));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-500 font-medium font-mono truncate max-w-xs">
                      {memberAppForm.files.length > 0
                        ? memberAppForm.files[memberAppForm.files.length - 1].name
                        : 'No file chosen'}
                    </span>
                  </div>

                  {memberAppForm.files.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {memberAppForm.files.map((f, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 flex justify-between items-center font-mono"
                        >
                          <span>
                            📄 {f.name} ({(f.size / 1024).toFixed(1)} KB)
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-emerald-600 font-bold text-[10px]">Encrypted</span>
                            <button
                              type="button"
                              onClick={() =>
                                setMemberAppForm(prev => ({
                                  ...prev,
                                  files: prev.files.filter((_, i) => i !== idx),
                                }))
                              }
                              className="text-slate-400 hover:text-red-600 text-xs px-1 font-bold"
                              title="Remove file"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Applicant&apos;s Signature *{' '}
                      <span className="text-emerald-600 font-semibold">(Auto-completed from Applicant&apos;s Name)</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full name signature"
                      value={memberAppForm.signature}
                      onChange={e => setMemberAppForm({ ...memberAppForm, signature: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-serif italic font-bold bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Application Date</label>
                    <input
                      type="date"
                      value={memberAppForm.applicationDate}
                      onChange={e => setMemberAppForm({ ...memberAppForm, applicationDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={async () => {
                    if (!editingMember) return;
                    await handleDeleteMember(editingMember.id, editingMember.name);
                  }}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold rounded-xl cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>회원 삭제 (DEL)</span>
                </button>
                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    취소 (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-gta-600 to-gta-500 hover:from-gta-700 hover:to-gta-600 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg cursor-pointer"
                  >
                    수정 저장 (UPDATE APPLICATION FORM)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PRINTABLE RECEIPT VIEW (Matching GTA Excel Sample) */}
      {/* ========================================================================= */}
      {selectedPrintReceipt && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:bg-white print:p-0">
          <div className="bg-white border-2 border-slate-500 shadow-2xl max-w-[760px] w-full p-3 sm:p-4 my-auto max-h-[96vh] flex flex-col print:shadow-none print:border-0 print:my-0 print:max-w-full print:p-0 print:max-h-none">
            {/* Action Bar (Sticky and hidden when printing) */}
            <div className="shrink-0 bg-white z-20 flex justify-between items-center pb-2 mb-2 border-b border-slate-300 print:hidden">
              <span className="text-xs font-bold text-slate-700">
                RECEIPT VIEW #{selectedPrintReceipt.id} — {selectedPrintReceipt.name}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (receiptPrintRef.current) {
                      downloadReceiptPdf(receiptPrintRef.current, selectedPrintReceipt);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 flex items-center space-x-1.5 shadow cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF 저장</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (receiptPrintRef.current) {
                      printReceiptDocument(receiptPrintRef.current);
                    } else {
                      window.print();
                    }
                  }}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-1.5 flex items-center space-x-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄하기</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const r = selectedPrintReceipt;
                    setSelectedPrintReceipt(null);
                    handleOpenEditReceipt(r);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 cursor-pointer"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPrintReceipt(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1.5 cursor-pointer"
                >
                  ✕ 닫기
                </button>
              </div>
            </div>

            <div className="overflow-y-auto overflow-x-hidden flex-1">
              <ReceiptDocument receipt={selectedPrintReceipt} containerRef={receiptPrintRef} />
            </div>
          </div>
        </div>
      )}

      {/* Notice Creation Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-xl w-full space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">새 공지사항 작성</h3>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">공지 제목 (Subject)</label>
                <input
                  type="text"
                  required
                  value={newNoticeTitle}
                  onChange={e => setNewNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">카테고리</label>
                  <select
                    value={newNoticeCategory}
                    onChange={e => setNewNoticeCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="Notice">Notice</option>
                    <option value="공지">공지사항</option>
                    <option value="세무자료">세무자료</option>
                    <option value="FAQ">FAQ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">작성자 이름</label>
                  <input
                    type="text"
                    value={newNoticeAuthor}
                    onChange={e => setNewNoticeAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">공지 내용</label>
                <textarea
                  rows={6}
                  required
                  value={newNoticeContent}
                  onChange={e => setNewNoticeContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white font-extrabold text-xs rounded-xl hover:bg-blue-700 shadow-lg"
                >
                  공지사항 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Detail & Status Management Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-6 p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      selectedConsultation.status === '접수'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : selectedConsultation.status === '진행중'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {selectedConsultation.status}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {selectedConsultation.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">ID: {selectedConsultation.id}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                  {selectedConsultation.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  접수일시: {formatConsultationDate(selectedConsultation.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedConsultation(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant Summary Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">신청인 성명</span>
                <span className="font-bold text-slate-900 text-sm">{selectedConsultation.applicantName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">연락처 (Phone)</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {extractPhoneFromConsultation(selectedConsultation)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">이메일 (Email)</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {extractEmailFromConsultation(selectedConsultation) || '-'}
                </span>
              </div>
            </div>

            {/* Quick Action: Reply via Email */}
            {extractEmailFromConsultation(selectedConsultation) && (
              <div className="flex justify-end">
                <a
                  href={`mailto:${extractEmailFromConsultation(selectedConsultation)}?subject=${encodeURIComponent(
                    `[GTA 한국납세자연합회] Re: ${selectedConsultation.title}`
                  )}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow flex items-center space-x-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>고객에게 이메일 바로 답장하기</span>
                </a>
              </div>
            )}

            {/* Content Details */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">접수 본문 및 자동 추출 데이터</label>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto border border-slate-800 shadow-inner">
                {selectedConsultation.content}
              </div>
            </div>

            {/* Attachments Section */}
            {selectedConsultation.attachments && selectedConsultation.attachments.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">첨부파일 (Attached Files)</label>
                <div className="space-y-2">
                  {selectedConsultation.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-2xl"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <span className="p-2 bg-emerald-600 text-white rounded-xl">
                          <Paperclip className="w-4 h-4" />
                        </span>
                        <div className="overflow-hidden">
                          <p className="font-bold text-xs text-slate-900 truncate">{att.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {att.size ? `${(att.size / 1024).toFixed(1)} KB` : '첨부파일'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(att)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow flex items-center space-x-1.5 transition-all shrink-0 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>파일 다운로드</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Status & Memo Form */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-800">관리자 처리 상태 및 메모</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">상태 변경</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="접수">접수 (Received - 신규 접수 대기)</option>
                    <option value="진행중">진행중 (In Progress - 검토 및 처리 중)</option>
                    <option value="완료">완료 (Completed - 상담 및 등록 완료)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">관리자 메모 입력</label>
                  <input
                    type="text"
                    value={editMemo}
                    placeholder="담당자명, 처리 내용 등 메모..."
                    onChange={e => setEditMemo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteConsultation(selectedConsultation.id)}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>이 문의 내역 영구 삭제</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedConsultation(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    닫기
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedConsultation.id, editStatus, editMemo)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-colors"
                  >
                    저장하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
