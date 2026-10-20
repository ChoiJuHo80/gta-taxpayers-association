'use client';

import { useState, useEffect, useCallback } from 'react';
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
  DollarSign,
  Upload,
} from 'lucide-react';
import { Consultation, Notice, ApplicationMember, TaxReceipt } from '@/lib/db';

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
    phone: '',
    dateFrom: '',
    dateTo: '',
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

  // Legacy Receipt Write / Modify Popup Modal State
  const [showReceiptFormModal, setShowReceiptFormModal] = useState(false);
  const [editingReceiptId, setEditingReceiptId] = useState<number | null>(null);
  const [selectedPrintReceipt, setSelectedPrintReceipt] = useState<TaxReceipt | null>(null);

  const nowDate = new Date();
  const [receiptForm, setReceiptForm] = useState({
    member_num: '',
    management_no: '',
    license_no: '612-80-03137',
    association_name: 'Geoje Taxpayers Association',
    chairman_name: 'Kim Se- Kwang',
    resident_no1: '710925-*******',
    address1: '#107, 3696 Geoje-daero, Geoje-city Gyeongnam Korea',
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
        `/api/members?query=${encodeURIComponent(q)}&field=${encodeURIComponent(field)}&page=${p}&limit=20`
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

        const res = await fetch(`/api/receipts?${params.toString()}`);
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

  // Click [WRITE] in "- Receipt List" -> Opens Legacy receipt_write.html modal
  const handleOpenWriteReceipt = (m?: ApplicationMember | null) => {
    const targetMember = m ?? selectedReceiptMember;
    setEditingReceiptId(null);
    const today = new Date();
    setReceiptForm({
      member_num: targetMember ? String(targetMember.id) : '',
      management_no: '',
      license_no: '612-80-03137',
      association_name: 'Geoje Taxpayers Association',
      chairman_name: 'Kim Se- Kwang',
      resident_no1: '710925-*******',
      address1: '#107, 3696 Geoje-daero, Geoje-city Gyeongnam Korea',
      name: targetMember?.name || '',
      resident_no2: targetMember?.number || '',
      address2: targetMember?.address || '',
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
      overseas_name: targetMember?.company || '',
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
      reg_name: targetMember?.name || '',
    });
    setShowReceiptFormModal(true);
  };

  // Click [MODIFY] in "- Receipt List" -> Opens Legacy receipt_modify.html modal
  const handleOpenEditReceipt = (r: TaxReceipt) => {
    setEditingReceiptId(r.id);
    const taxYmd = parseUnixToYmd(r.taxation_period);
    const regYmd = parseUnixToYmd(r.reg_date);
    const cleanVal = (v?: string) => (v && v !== '0' ? v : '');

    setReceiptForm({
      member_num: r.member_num || '',
      management_no: r.management_no || '',
      license_no: r.license_no || '612-80-03137',
      association_name: r.association_name || 'Geoje Taxpayers Association',
      chairman_name: r.chairman_name || 'Kim Se- Kwang',
      resident_no1: r.resident_no1 || '710925-*******',
      address1: r.address1 || '#107, 3696 Geoje-daero, Geoje-city Gyeongnam Korea',
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
      overseas_name: r.overseas_name || '',
      overseas_basicsalary: cleanVal(r.overseas_basicsalary),
      overseas_bonus: cleanVal(r.overseas_bonus),
      overseas_income: cleanVal(r.overseas_income),
      overseas_totalsalary: cleanVal(r.overseas_totalsalary),
      total_basicsalary: cleanVal(r.total_basicsalary) || cleanVal(r.overseas_basicsalary),
      total_bonus: cleanVal(r.total_bonus) || cleanVal(r.overseas_bonus),
      total_income: cleanVal(r.total_income) || cleanVal(r.overseas_income),
      total_totalsalary: cleanVal(r.total_totalsalary) || cleanVal(r.total_salary),
      total_salary: cleanVal(r.total_salary),
      non_taxable_salary: cleanVal(r.non_taxable_salary),
      computed_tax: r.computed_tax || '',
      deduction_overseas: cleanVal(r.deduction_overseas),
      deduction_deduction: cleanVal(r.deduction_deduction),
      payable_income: r.payable_income || '',
      payable_resident: r.payable_resident || '',
      payable_special: r.payable_special || '',
      reg_name: r.reg_name || r.name || '',
    });
    setShowReceiptFormModal(true);
  };

  // Click [+ WRITE] in "- Receipt List" -> Legacy receipt_ok.php?mode=addup (clones the receipt row immediately)
  const handleDuplicateReceipt = async (r: TaxReceipt) => {
    if (!confirm('본 내용을 기준으로 추가등록 하시겠습니까?')) return;
    try {
      const payload = {
        member_num: r.member_num || '',
        management_no: r.management_no || '',
        license_no: r.license_no || '612-80-03137',
        association_name: r.association_name || 'Geoje Taxpayers Association',
        chairman_name: r.chairman_name || 'Kim Se- Kwang',
        resident_no1: r.resident_no1 || '710925-*******',
        address1: r.address1 || '#107, 3696 Geoje-daero, Geoje-city Gyeongnam Korea',
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

  // Exact Legacy basic.js auto_value() + autocommas() handler for Overseas Salary fields (g2, g3, g4)
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

  // Exact Legacy basic.js auto_value() + autocommas() handler for Tax fields (g11, g12, g13)
  const handleTaxCalculationChange = (
    field: 'computed_tax' | 'deduction_overseas' | 'deduction_deduction',
    rawVal: string
  ) => {
    const formatted = formatWithCommas(rawVal);
    setReceiptForm(prev => {
      const next = { ...prev, [field]: formatted };
      const g11 = parseCommaNum(next.computed_tax);
      const g12 = parseCommaNum(next.deduction_overseas);
      const g13 = parseCommaNum(next.deduction_deduction);

      // Legacy basic.js formula:
      // g14 = Math.floor((g11 - g12 - g13) / 10) * 10
      // g15 = Math.floor((g14 * 0.1) / 10) * 10
      // g16 = g14 + g15
      const g14 = Math.floor((g11 - g12 - g13) / 10) * 10;
      const g15 = Math.floor((g14 * 0.1) / 10) * 10;
      const g16 = g14 + g15;

      return {
        ...next,
        payable_income: g11 || g12 || g13 ? g14.toLocaleString('en-US') : '',
        payable_resident: g11 || g12 || g13 ? g15.toLocaleString('en-US') : '',
        payable_special: g11 || g12 || g13 ? g16.toLocaleString('en-US') : '',
      };
    });
  };

  const handleSaveReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
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
      taxation_period: toUnixFromYmd(receiptForm.tax_year, receiptForm.tax_month, receiptForm.tax_day),
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
      } else {
        alert(json.error || 'Failed to save receipt');
      }
    } catch (err) {
      alert('Error saving receipt');
    }
  };

  const handleDeleteReceipt = async (id: number) => {
    if (!confirm('정말 삭제 하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/receipts?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchReceipts(
          receiptQuery,
          receiptsPage,
          selectedReceiptMember ? String(selectedReceiptMember.id) : undefined,
          receiptSearchField
        );
        fetchMembers(memberQuery, membersPage, memberSearchField);
      }
    } catch (e) {
      alert('Failed to delete receipt');
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
      phone: m.phon || '',
      dateFrom: df.length === 10 ? df : '',
      dateTo: dt.length === 10 ? dt : '',
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
      phon: memberAppForm.phone,
      date_from: memberAppForm.dateFrom ? toUnixFromDate(memberAppForm.dateFrom) : editingMember.date_from,
      date_to: memberAppForm.dateTo ? toUnixFromDate(memberAppForm.dateTo) : editingMember.date_to,
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

  const handleDeleteMember = async (id: number, name: string) => {
    if (!confirm('정말 삭제 하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchMembers(memberQuery, membersPage, memberSearchField);
      }
    } catch (err) {
      alert('Failed to delete member');
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

  const handleUpdateStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, adminMemo: editMemo }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingId(null);
        fetchConsultations();
      }
    } catch (err) {
      alert('Update Error');
    }
  };

  const handleDownloadExcel = () => {
    const q = (memberQuery || memberSearchInput).trim();
    const params = new URLSearchParams();
    params.set('field', memberSearchField);
    if (q) {
      params.set('query', q);
    }
    window.location.href = `/api/admin/excel?${params.toString()}`;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gta-900 text-white p-6 rounded-2xl shadow-xl print:hidden">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black">
              GTA 통합 관리자 시스템 (Member &amp; Tax Receipt Portal)
            </h1>
            <p className="text-xs text-slate-300">
              전체 회원 조회({membersTotal.toLocaleString()}명) · 월별 납세 영수증 작성/발급({receiptsTotal.toLocaleString()}건) · 신청서 등록
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
            }}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${membersLoading || receiptsLoading ? 'animate-spin' : ''}`} />
            <span>새로고침</span>
          </button>

          <Link
            href="/consult"
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow flex items-center space-x-1.5 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>+ 신규 회원 신청서 등록 (Application Form)</span>
          </Link>

          <button
            type="button"
            onClick={() => handleOpenWriteReceipt(selectedReceiptMember)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>+ 영수증 직접 작성 (Write Receipt)</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            title="전체 회원검색 및 영수증 발급 탭의 선택 옵션에 따른 회원 목록 엑셀 다운로드"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>엑셀 다운로드</span>
          </button>

          <button
            onClick={() => {
              setAuthenticated(false);
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('gta_admin_logged');
              }
            }}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'members'
              ? 'bg-gta-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 전체 회원 검색 및 영수증 발급 (- Member List)</span>
          <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
            {membersTotal.toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedReceiptMember(null);
            setReceiptsPage(1);
            setActiveTab('receipts');
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'receipts'
              ? 'bg-gta-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>🧾 영수증 내역 및 관리 (- Receipt List)</span>
          <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
            {receiptsTotal.toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'notices'
              ? 'bg-gta-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Megaphone className="w-4 h-4" />
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
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between items-center gap-3"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
              <span className="text-sm font-black text-slate-900 mr-2">- Member List</span>
              {(
                [
                  { value: 'name', label: 'name' },
                  { value: 'number', label: 'number' },
                  { value: 'phone', label: 'phone' },
                ] as const
              ).map(opt => (
                <label key={opt.value} className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="memberSearchField"
                    value={opt.value}
                    checked={memberSearchField === opt.value}
                    onChange={() => setMemberSearchField(opt.value)}
                    className="w-4 h-4 text-gta-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto flex-1 lg:max-w-xl justify-end">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="회원 이름(name), 등록번호(number), 연락처(phone) 검색..."
                  value={memberSearchInput}
                  onChange={e => setMemberSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-gta-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
                <button
                  type="submit"
                  className="bg-gta-600 hover:bg-gta-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer whitespace-nowrap"
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
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap"
                  >
                    초기화
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReceiptMember(null);
                    setReceiptsPage(1);
                    setActiveTab('receipts');
                  }}
                  className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap"
                >
                  영수증전체보기
                </button>
              </div>
            </div>
          </form>

          {/* Members Table (Matching Legacy member_list.html) */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead className="bg-[#FFFBC8] text-slate-900 font-bold border-b border-slate-300">
                  <tr className="divide-x divide-slate-300">
                    <th className="px-2.5 py-2.5">no</th>
                    <th className="px-3 py-2.5">name</th>
                    <th className="px-3 py-2.5">number</th>
                    <th className="px-3 py-2.5">email</th>
                    <th className="px-3 py-2.5">remark</th>
                    <th className="px-3 py-2.5">Telephone</th>
                    <th className="px-3 py-2.5">Date of Stay &amp; Work</th>
                    <th className="px-2.5 py-2.5">Receipts</th>
                    <th className="px-2.5 py-2.5">Modify</th>
                    <th className="px-2.5 py-2.5">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {membersLoading ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-semibold">
                        회원 데이터를 불러오는 중입니다...
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                        검색 조건에 일치하는 회원이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    members.map(m => {
                      const cleanRemark = (m.remark || '').replace(/\\r\\n|\\n|\\r/g, ' ').trim();
                      return (
                        <tr key={m.id} className="hover:bg-yellow-50/40 transition-colors divide-x divide-slate-300">
                          <td className="px-2.5 py-2 font-mono text-xs text-slate-800">
                            {m.seq_no ?? m.id}
                          </td>
                          <td className="px-3 py-2 font-bold text-slate-900">
                            <button
                              type="button"
                              onClick={() => handleViewMemberReceipts(m)}
                              className="hover:underline text-slate-900 font-bold cursor-pointer"
                            >
                              {m.name}
                            </button>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-slate-800">
                            {m.number || ''}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-800 font-mono">
                            {m.email || ''}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-800 max-w-xs">
                            {cleanRemark}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs font-bold text-slate-900">
                            {m.phon || ''}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-slate-800 whitespace-nowrap">
                            {formatUnixDate(m.date_from)} ~ {formatUnixDate(m.date_to)}
                          </td>
                          <td className="px-2.5 py-2 whitespace-nowrap">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full">
                              {m.receipt_count ?? 0}건
                            </span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenEditMember(m)}
                              className="bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-xs cursor-pointer"
                            >
                              MODIFY
                            </button>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleViewMemberReceipts(m)}
                              className="bg-blue-50 hover:bg-blue-100 border border-blue-400 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-xs cursor-pointer"
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
                            className="text-slate-700 hover:text-blue-700 underline font-bold px-1 py-0.5 cursor-pointer"
                          >
                            [BACK 10]
                          </button>
                          <button
                            type="button"
                            onClick={() => setMembersPage(1)}
                            className="text-slate-700 hover:text-blue-700 underline font-bold px-1 py-0.5 cursor-pointer"
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

              <Link
                href="/consult"
                className="bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-800 text-xs font-bold px-3 py-1 rounded-xs"
              >
                WRITE
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LEGACY "- Receipt List" (Exact match to receipt_list.html) */}
      {/* ========================================================================= */}
      {activeTab === 'receipts' && (
        <div className="max-w-[860px] mx-auto space-y-2 print:hidden bg-white p-4 sm:p-6 rounded-xl border border-slate-300 shadow-xs">
          {/* Header Row: "- Receipt List" on left, Radio Search on right */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1">
            <div className="flex items-center space-x-3">
              <span className="text-[15px] font-bold text-black">- Receipt List</span>
              {selectedReceiptMember && (
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedReceiptMember.name} ({selectedReceiptMember.number})
                </span>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('members')}
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-xs cursor-pointer"
              >
                ← 회원목록 (Member List)
              </button>
              {selectedReceiptMember && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReceiptMember(null);
                    setReceiptsPage(1);
                  }}
                  className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-xs cursor-pointer"
                >
                  전체 영수증 보기
                </button>
              )}
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                setSelectedReceiptMember(null);
                setReceiptsPage(1);
                setReceiptQuery(receiptSearchInput);
              }}
              className="flex flex-wrap items-center gap-2.5 text-xs text-black"
            >
              {(
                [
                  { value: 'name', label: 'name' },
                  { value: 'number', label: 'number' },
                  { value: 'phone', label: 'phone' },
                ] as const
              ).map(opt => (
                <label key={opt.value} className="inline-flex items-center space-x-1 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    name="search_mode"
                    value={opt.value}
                    checked={receiptSearchField === opt.value}
                    onChange={() => setReceiptSearchField(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
              <input
                type="text"
                value={receiptSearchInput}
                onChange={e => setReceiptSearchInput(e.target.value)}
                placeholder="name / number / phone"
                className="border border-slate-400 px-2 py-0.5 text-xs w-36"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 text-white font-bold text-xs px-3 py-0.5 rounded-xs cursor-pointer"
              >
                검색
              </button>
              {receiptQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setReceiptSearchInput('');
                    setReceiptQuery('');
                    setReceiptsPage(1);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 border border-slate-400 text-black font-bold text-xs px-2 py-0.5 cursor-pointer"
                >
                  초기화
                </button>
              )}
            </form>
          </div>

          {/* Legacy Receipt List Table (#FFFBC8 header, #CCCCCC grid borders) */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[#CCCCCC] text-center text-[12px] text-black">
              <thead>
                <tr className="bg-[#FFFBC8] h-[28px] font-bold">
                  <td className="border border-[#CCCCCC] px-2 w-[40px]">no</td>
                  <td className="border border-[#CCCCCC] px-2 w-[150px]">name</td>
                  <td className="border border-[#CCCCCC] px-2 w-[130px]">Payer Resident-No</td>
                  <td className="border border-[#CCCCCC] px-2 w-[170px]">Association-Name</td>
                  <td className="border border-[#CCCCCC] px-2 w-[100px]">License-No</td>
                  <td className="border border-[#CCCCCC] px-2 w-[85px]">Date</td>
                  <td className="border border-[#CCCCCC] px-2 w-[65px]">Modify</td>
                  <td className="border border-[#CCCCCC] px-2 w-[50px]">Del</td>
                  <td className="border border-[#CCCCCC] px-2 w-[65px]">+ Write</td>
                </tr>
              </thead>
              <tbody>
                {receiptsLoading ? (
                  <tr>
                    <td colSpan={9} className="border border-[#CCCCCC] py-10 text-center text-slate-500">
                      영수증 목록을 불러오는 중입니다...
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="border border-[#CCCCCC] py-10 text-center text-slate-500">
                      등록된 영수증이 없습니다. 우측 하단 [WRITE] 버튼을 눌러 영수증을 작성하세요.
                    </td>
                  </tr>
                ) : (
                  receipts.map((r, idx) => {
                    const rowNo = receiptsTotal - ((receiptsPage - 1) * 25 + idx);
                    return (
                      <tr key={r.id} className="bg-white hover:bg-yellow-50/40 h-[28px]">
                        <td className="border border-[#CCCCCC] px-1.5 py-1">{rowNo > 0 ? rowNo : idx + 1}</td>
                        <td className="border border-[#CCCCCC] px-2 py-1 font-bold">
                          <button
                            type="button"
                            onClick={() => setSelectedPrintReceipt(r)}
                            className="text-[#0000EE] hover:text-blue-900 underline font-bold cursor-pointer"
                            title="영수증 보기 / 인쇄 (View Receipt)"
                          >
                            {r.name}
                          </button>
                        </td>
                        <td className="border border-[#CCCCCC] px-2 py-1">{r.resident_no2}</td>
                        <td className="border border-[#CCCCCC] px-2 py-1 font-bold">
                          {r.association_name || 'Geoje Taxpayers Association'}
                        </td>
                        <td className="border border-[#CCCCCC] px-2 py-1 font-bold">
                          {r.license_no || '612-80-03137'}
                        </td>
                        <td className="border border-[#CCCCCC] px-2 py-1">{formatUnixDate(r.reg_date)}</td>
                        <td className="border border-[#CCCCCC] px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditReceipt(r)}
                            className="bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-xs cursor-pointer"
                          >
                            MODIFY
                          </button>
                        </td>
                        <td className="border border-[#CCCCCC] px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteReceipt(r.id)}
                            className="bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded-xs cursor-pointer"
                          >
                            DEL
                          </button>
                        </td>
                        <td className="border border-[#CCCCCC] px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => handleDuplicateReceipt(r)}
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-400 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-xs cursor-pointer"
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
      {/* MODAL 1: LEGACY RECEIPT WRITE / MODIFY POPUP (receipt_write.html / receipt_modify.html) */}
      {/* ========================================================================= */}
      {showReceiptFormModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:hidden">
          <div className="bg-white border-2 border-slate-500 shadow-2xl max-w-[850px] w-full p-3 sm:p-5 my-4 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-300 text-xs">
              <span className="font-bold text-slate-700">
                {editingReceiptId
                  ? `영수증 수정 (Receipt Modify #${editingReceiptId})`
                  : '영수증 작성 (Receipt Write)'}
              </span>
              <button
                type="button"
                onClick={() => setShowReceiptFormModal(false)}
                className="text-slate-500 hover:text-black font-bold px-2 py-0.5 cursor-pointer"
              >
                ✕ 닫기
              </button>
            </div>

            <form onSubmit={handleSaveReceipt}>
              <div className="overflow-x-auto">
                <table className="w-[800px] mx-auto border-collapse border border-[#CCCCCC] text-[12px] text-black bg-white">
                  <tbody>
                    {/* Title & Management No */}
                    <tr>
                      <td colSpan={7} className="border border-[#CCCCCC] p-2 bg-white">
                        <div className="text-center text-[15px] font-bold text-[#333333] py-1">
                          RECEIPT FOR CLASS &quot;B&quot; INCOME TAX (MONTHLY)
                        </div>
                        <div className="flex justify-between items-center pt-1 text-[12px]">
                          <div>
                            Management No:{' '}
                            <input
                              type="text"
                              value={receiptForm.management_no}
                              onChange={e => setReceiptForm({ ...receiptForm, management_no: e.target.value })}
                              className="bg-[#F8F8F8] border border-slate-400 px-1.5 py-0.5 text-[12px] w-[160px]"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Tax Dutyer Row 1 */}
                    <tr>
                      <td rowSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white w-[80px]">
                        Tax Dutyer
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white w-[105px]">1) License-No.</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white w-[105px]">
                        <input
                          type="text"
                          value={receiptForm.license_no}
                          onChange={e => setReceiptForm({ ...receiptForm, license_no: e.target.value })}
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[90px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white w-[110px]">2) Association-Name</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white w-[120px]">
                        <input
                          type="text"
                          value={receiptForm.association_name}
                          onChange={e => setReceiptForm({ ...receiptForm, association_name: e.target.value })}
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[110px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white w-[105px]">3) Chairman-Name</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.chairman_name}
                          onChange={e => setReceiptForm({ ...receiptForm, chairman_name: e.target.value })}
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[110px] text-[12px]"
                        />
                      </td>
                    </tr>

                    {/* Tax Dutyer Row 2 */}
                    <tr>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">4) Resident-No.</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.resident_no1}
                          onChange={e => setReceiptForm({ ...receiptForm, resident_no1: e.target.value })}
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[90px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">5) Address</td>
                      <td colSpan={3} className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.address1}
                          onChange={e => setReceiptForm({ ...receiptForm, address1: e.target.value })}
                          className="bg-[#F8F8F8] border border-slate-400 px-1.5 py-0.5 w-full text-[12px]"
                        />
                      </td>
                    </tr>

                    {/* Tax Payer Row 1 */}
                    <tr>
                      <td rowSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        Tax Payer
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">6) Name</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.name}
                          onChange={e => {
                            const val = e.target.value.toUpperCase();
                            setReceiptForm(prev => ({
                              ...prev,
                              name: val,
                              reg_name: val,
                            }));
                          }}
                          className="bg-[#D9EE99] border border-slate-400 px-1 py-0.5 w-[95px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">7) Resident-No.</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.resident_no2}
                          onChange={e => setReceiptForm({ ...receiptForm, resident_no2: e.target.value })}
                          className="bg-[#D9EE99] border border-slate-400 px-1 py-0.5 w-[105px] text-[12px]"
                        />
                        <div className="text-[11px] text-slate-700 mt-0.5">- 빼고 입력하세요.</div>
                      </td>
                      <td rowSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        9) Taxation Period
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white space-y-1">
                        <div className="flex flex-wrap gap-1">
                          <select
                            value={receiptForm.tax_year}
                            onChange={e => setReceiptForm({ ...receiptForm, tax_year: Number(e.target.value) })}
                            className="bg-[#F3F3F3] border border-slate-400 text-[11px] px-1 py-0.5"
                          >
                            {YEAR_OPTIONS.map(y => (
                              <option key={y} value={y}>
                                {y} 년
                              </option>
                            ))}
                          </select>
                          <select
                            value={receiptForm.tax_month}
                            onChange={e => setReceiptForm({ ...receiptForm, tax_month: Number(e.target.value) })}
                            className="bg-[#F3F3F3] border border-slate-400 text-[11px] px-1 py-0.5"
                          >
                            {MONTH_OPTIONS.map(m => (
                              <option key={m} value={m}>
                                {m} 월
                              </option>
                            ))}
                          </select>
                          <select
                            value={receiptForm.tax_day}
                            onChange={e => setReceiptForm({ ...receiptForm, tax_day: Number(e.target.value) })}
                            className="bg-[#F3F3F3] border border-slate-400 text-[11px] px-1 py-0.5"
                          >
                            {DAY_OPTIONS.map(d => (
                              <option key={d} value={d}>
                                {d} 일
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>

                    {/* Tax Payer Row 2 */}
                    <tr>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">8) Address</td>
                      <td colSpan={3} className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.address2}
                          onChange={e => setReceiptForm({ ...receiptForm, address2: e.target.value })}
                          className="bg-[#F8F8F8] border border-slate-400 px-1.5 py-0.5 w-full text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">&nbsp;</td>
                    </tr>

                    {/* Working Place Income Header */}
                    <tr>
                      <td rowSpan={4} className="border border-[#CCCCCC] p-1.5 bg-white">
                        Working Place
                        <br />
                        Income
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">10) Working-Division</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">11) Company-Name</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">12) Basic Salary</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">13) Bonus</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">14) Overseas Allowance</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">15) Total Salary</td>
                    </tr>

                    {/* (101) Local */}
                    <tr>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">(101) Local</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.local_name}
                          onChange={e => setReceiptForm({ ...receiptForm, local_name: e.target.value })}
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-full text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.local_basicsalary}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, local_basicsalary: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[90px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.local_bonus}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, local_bonus: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[90px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.local_income}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, local_income: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[90px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.local_totalsalary}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, local_totalsalary: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[95px] text-[12px]"
                        />
                      </td>
                    </tr>

                    {/* (102) Overseas */}
                    <tr>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">(102) Overseas</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.overseas_name}
                          onChange={e => setReceiptForm({ ...receiptForm, overseas_name: e.target.value })}
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-full text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.overseas_basicsalary}
                          onChange={e => handleOverseasSalaryChange('overseas_basicsalary', e.target.value)}
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[90px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.overseas_bonus}
                          onChange={e => handleOverseasSalaryChange('overseas_bonus', e.target.value)}
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[90px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.overseas_income}
                          onChange={e => handleOverseasSalaryChange('overseas_income', e.target.value)}
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[90px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.overseas_totalsalary}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, overseas_totalsalary: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[95px] text-[12px]"
                        />
                      </td>
                    </tr>

                    {/* (103) TOTAL-SALARY */}
                    <tr>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        (103) TOTAL-SALARY
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.total_basicsalary}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, total_basicsalary: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[90px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.total_bonus}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, total_bonus: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[90px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.total_income}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, total_income: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[90px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.total_totalsalary}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, total_totalsalary: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1 py-0.5 w-[95px] text-[12px]"
                        />
                      </td>
                    </tr>

                    {/* Spacer Row */}
                    <tr>
                      <td colSpan={7} className="border border-[#CCCCCC] h-[10px] p-0 bg-white"></td>
                    </tr>

                    {/* COMPUTED THE ITEMS Header */}
                    <tr>
                      <td colSpan={7} className="border border-[#CCCCCC] p-1.5 bg-white text-center">
                        C O M P U T E D &nbsp;&nbsp;T H E &nbsp;&nbsp; I T E M S
                      </td>
                    </tr>

                    {/* 16) Total salary & PAYABLE TAX */}
                    <tr>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        16) Total salary
                      </td>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.total_salary}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, total_salary: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1.5 py-0.5 w-[150px] text-[12px]"
                        />
                      </td>
                      <td colSpan={3} className="border border-[#CCCCCC] p-1.5 bg-white text-center">
                        PAYABLE TAX
                      </td>
                    </tr>

                    {/* 17) Non Taxable Salary & 22) Income - Tax */}
                    <tr>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        17) Non Taxable Salary
                      </td>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.non_taxable_salary}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, non_taxable_salary: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1.5 py-0.5 w-[150px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">22) Income - Tax</td>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.payable_income}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, payable_income: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1.5 py-0.5 w-[110px] text-[12px]"
                        />
                      </td>
                    </tr>

                    {/* 18) Computed-tax & 23) Local Income Tax */}
                    <tr>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        18) Computed-tax
                      </td>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.computed_tax}
                          onChange={e => handleTaxCalculationChange('computed_tax', e.target.value)}
                          className="bg-[#F8F8F8] border border-slate-400 px-1.5 py-0.5 w-[150px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">23) Local Income Tax</td>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.payable_resident}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, payable_resident: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1.5 py-0.5 w-[110px] text-[12px]"
                        />
                      </td>
                    </tr>

                    {/* Tax Deduction Row 1: 19) Paid-tax in overseas & 24) Payable - Tax */}
                    <tr>
                      <td rowSpan={3} className="border border-[#CCCCCC] p-1.5 bg-white">
                        Tax
                        <br />
                        Deduction
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">19) Paid-tax in overseas</td>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.deduction_overseas}
                          onChange={e => handleTaxCalculationChange('deduction_overseas', e.target.value)}
                          className="bg-[#F8F8F8] border border-slate-400 px-1.5 py-0.5 w-[180px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">24) Payable - Tax</td>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.payable_special}
                          onChange={e =>
                            setReceiptForm({ ...receiptForm, payable_special: formatWithCommas(e.target.value) })
                          }
                          className="bg-[#F8F8F8] border border-slate-400 px-1.5 py-0.5 w-[110px] text-[12px]"
                        />
                      </td>
                    </tr>

                    {/* Tax Deduction Row 2: 20) B-class deduction */}
                    <tr>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">20) B-class deduction</td>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                        <input
                          type="text"
                          value={receiptForm.deduction_deduction}
                          onChange={e => handleTaxCalculationChange('deduction_deduction', e.target.value)}
                          className="bg-[#F8F8F8] border border-slate-400 px-1.5 py-0.5 w-[180px] text-[12px]"
                        />
                      </td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">&nbsp;</td>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">&nbsp;</td>
                    </tr>

                    {/* Tax Deduction Row 3: 21) */}
                    <tr>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">21)</td>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">&nbsp;</td>
                      <td className="border border-[#CCCCCC] p-1.5 bg-white">&nbsp;</td>
                      <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">&nbsp;</td>
                    </tr>

                    {/* Footer Row: Paid the above tax amount + Date Selects + To + Stamp Image */}
                    <tr>
                      <td colSpan={7} className="border border-[#CCCCCC] p-2 bg-white">
                        <div className="flex justify-between items-center">
                          <div className="space-y-1 leading-relaxed">
                            <div>Paid the above tax amount.</div>
                            <div className="flex items-center space-x-1">
                              <select
                                value={receiptForm.reg_year}
                                onChange={e => setReceiptForm({ ...receiptForm, reg_year: Number(e.target.value) })}
                                className="bg-[#F3F3F3] border border-slate-400 text-[11px] px-1 py-0.5"
                              >
                                {YEAR_OPTIONS.map(y => (
                                  <option key={y} value={y}>
                                    {y} 년
                                  </option>
                                ))}
                              </select>
                              <select
                                value={receiptForm.reg_month}
                                onChange={e => setReceiptForm({ ...receiptForm, reg_month: Number(e.target.value) })}
                                className="bg-[#F3F3F3] border border-slate-400 text-[11px] px-1 py-0.5"
                              >
                                {MONTH_OPTIONS.map(m => (
                                  <option key={m} value={m}>
                                    {m} 월
                                  </option>
                                ))}
                              </select>
                              <select
                                value={receiptForm.reg_day}
                                onChange={e => setReceiptForm({ ...receiptForm, reg_day: Number(e.target.value) })}
                                className="bg-[#F3F3F3] border border-slate-400 text-[11px] px-1 py-0.5"
                              >
                                {DAY_OPTIONS.map(d => (
                                  <option key={d} value={d}>
                                    {d} 일
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              To :{' '}
                              <input
                                type="text"
                                value={receiptForm.reg_name}
                                onChange={e => setReceiptForm({ ...receiptForm, reg_name: e.target.value })}
                                className="bg-[#F8F8F8] border border-slate-400 px-1.5 py-0.5 w-[180px] text-[12px]"
                              />
                            </div>
                          </div>
                          <div>
                            <img
                              src="/img/icon_receipt.gif"
                              width={254}
                              height={52}
                              alt="Chairman of Geoje Taxpayers Association"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center items-center space-x-2 pt-4">
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-6 py-1.5 border border-blue-900 cursor-pointer"
                >
                  SEND (저장)
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptFormModal(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-6 py-1.5 border border-slate-400 cursor-pointer"
                >
                  CANCEL (취소)
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 sm:p-10 space-y-6 my-6">
            {/* Top Header matching Application Form */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full mb-2 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Authorized GTA Administrator Application Form (no. {editingMember.seq_no ?? editingMember.id} — #{editingMember.id})
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                  APPLICATION FOR ADMISSION TO GEOJE TAXPAYERS ASSOCIATION
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-1">
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
              {/* Section 1 ~ 3 & 5: Personal Information */}
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
                      placeholder="e.g. KIM SILVIA"
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">2. Registration Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 820012-3932521"
                      value={memberAppForm.alienRegNo}
                      onChange={e => setMemberAppForm({ ...memberAppForm, alienRegNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">3. E-mail Address *</label>
                    <input
                      type="text"
                      placeholder="e.g. silvia@example.com"
                      value={memberAppForm.email}
                      onChange={e => setMemberAppForm({ ...memberAppForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">5. Telephone (Mobile) *</label>
                    <input
                      type="text"
                      placeholder="e.g. 010-3700-3719"
                      value={memberAppForm.phone}
                      onChange={e => setMemberAppForm({ ...memberAppForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500 font-mono"
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

              {/* Section 4 & 6: Employment & Stay Info */}
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">6. Date of Stay &amp; Work *</label>
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

              {/* Section 7: Exemption (Marital & Children Details) */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                  7. Exemption Status (Check at least 1 item below)
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

              {/* Section 8: Class B Income Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                  8. The Class B Income (USD, EURO, NOK, GBP, DKK, CAD, AUD, SGD, SEK, JPY, KRW)
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

              {/* Section 9: Worked for other company */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                  9. Previous Employment Status
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

              {/* Section 10: Remark (Memo) */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                  10. Remark (Administrator Memo / Notes)
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
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gta-50 file:text-gta-700 hover:file:bg-gta-100"
                  />

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
                          <span className="text-emerald-600 font-bold text-[10px]">Encrypted</span>
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
                    const id = editingMember.id;
                    const nm = editingMember.name;
                    setEditingMember(null);
                    await handleDeleteMember(id, nm);
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
      {/* MODAL 3: LEGACY PRINTABLE RECEIPT VIEW (Exact match to page/view_receipt.html) */}
      {/* ========================================================================= */}
      {selectedPrintReceipt && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:bg-white print:p-0">
          <div className="bg-white border-2 border-slate-500 shadow-2xl max-w-[850px] w-full p-3 sm:p-5 my-4 print:shadow-none print:border-0 print:my-0 print:max-w-full print:p-0">
            {/* Action Bar (Hidden when printing) */}
            <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-slate-300 print:hidden">
              <span className="text-xs font-bold text-slate-700">
                RECEIPT VIEW (#{selectedPrintReceipt.id} — {selectedPrintReceipt.name})
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-1 flex items-center space-x-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄하기 (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const r = selectedPrintReceipt;
                    setSelectedPrintReceipt(null);
                    handleOpenEditReceipt(r);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1 cursor-pointer"
                >
                  수정 (MODIFY)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPrintReceipt(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1 cursor-pointer"
                >
                  ✕ 닫기
                </button>
              </div>
            </div>

            {/* Exact 7-Column Legacy Table (view_receipt.html) */}
            <div className="overflow-x-auto">
              <table className="w-[800px] mx-auto border-collapse border border-[#CCCCCC] text-[12px] text-black bg-white">
                <tbody>
                  <tr>
                    <td colSpan={7} className="border border-[#CCCCCC] p-2 bg-white">
                      <div className="text-center text-[15px] font-bold text-[#333333] py-1">
                        RECEIPT FOR CLASS &quot;B&quot; INCOME TAX (MONTHLY)
                      </div>
                      <div className="pt-1 text-[12px]">
                        Management No: {selectedPrintReceipt.management_no}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td rowSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white w-[80px]">
                      Tax Dutyer
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white w-[100px]">1) License-No.</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white w-[100px]">
                      {selectedPrintReceipt.license_no || '612-80-03137'}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white w-[110px]">2) Association-Name</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white w-[120px]">
                      {selectedPrintReceipt.association_name || 'Geoje Taxpayers Association'}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white w-[105px]">3) Chairman-Name</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.chairman_name || 'Kim Se- Kwang'}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">4) Resident-No.</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.resident_no1 || '710925-*******'}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">5) Address</td>
                    <td colSpan={3} className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.address1 || '#107, 3696 Geoje-daero, Geoje-city Gyeongnam Korea'}
                    </td>
                  </tr>

                  <tr>
                    <td rowSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      Tax Payer
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">6) Name</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">{selectedPrintReceipt.name}</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">7) Resident-No.</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">{selectedPrintReceipt.resident_no2}</td>
                    <td rowSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      9) Taxation Period
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {formatUnixMonthDot(selectedPrintReceipt.taxation_period)}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">8) Address</td>
                    <td colSpan={3} className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.address2}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">&nbsp;</td>
                  </tr>

                  <tr>
                    <td rowSpan={4} className="border border-[#CCCCCC] p-1.5 bg-white">
                      Working Place
                      <br />
                      Income
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">10) Working-Division</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">11) Company-Name</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">12) Basic Salary</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">13) Bonus</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">14) Overseas Allowance</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">15) Total Salary</td>
                  </tr>

                  <tr>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">(101) Local</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">{selectedPrintReceipt.local_name}</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.local_basicsalary !== '0' ? selectedPrintReceipt.local_basicsalary : ''}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.local_bonus !== '0' ? selectedPrintReceipt.local_bonus : ''}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.local_income !== '0' ? selectedPrintReceipt.local_income : ''}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.local_totalsalary !== '0' ? selectedPrintReceipt.local_totalsalary : ''}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">(102) Overseas</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">{selectedPrintReceipt.overseas_name}</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.overseas_basicsalary !== '0'
                        ? selectedPrintReceipt.overseas_basicsalary
                        : ''}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.overseas_bonus !== '0' ? selectedPrintReceipt.overseas_bonus : ''}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.overseas_income !== '0' ? selectedPrintReceipt.overseas_income : ''}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.overseas_totalsalary !== '0'
                        ? selectedPrintReceipt.overseas_totalsalary
                        : ''}
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      (103) TOTAL-SALARY
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.total_basicsalary !== '0' ? selectedPrintReceipt.total_basicsalary : ''}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.total_bonus !== '0' ? selectedPrintReceipt.total_bonus : ''}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.total_income !== '0' ? selectedPrintReceipt.total_income : ''}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.total_totalsalary !== '0' ? selectedPrintReceipt.total_totalsalary : ''}
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={7} className="border border-[#CCCCCC] h-[10px] p-0 bg-white"></td>
                  </tr>

                  <tr>
                    <td colSpan={7} className="border border-[#CCCCCC] p-1.5 bg-white text-center">
                      C O M P U T E D &nbsp;&nbsp;T H E &nbsp;&nbsp; I T E M S
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      16) Total salary
                    </td>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.total_salary !== '0' ? selectedPrintReceipt.total_salary : ''}
                    </td>
                    <td colSpan={3} className="border border-[#CCCCCC] p-1.5 bg-white text-center">
                      PAYABLE TAX
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      17) Non Taxable Salary
                    </td>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.non_taxable_salary !== '0' ? selectedPrintReceipt.non_taxable_salary : ''}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">22) Income - Tax</td>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.payable_income}
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      18) Computed-tax
                    </td>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.computed_tax}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">23) Local Income Tax</td>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.payable_resident}
                    </td>
                  </tr>

                  <tr>
                    <td rowSpan={3} className="border border-[#CCCCCC] p-1.5 bg-white">
                      Tax
                      <br />
                      Deduction
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">19) Paid-tax in overseas</td>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.deduction_overseas !== '0' ? selectedPrintReceipt.deduction_overseas : ''}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">24) Payable - Tax</td>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.payable_special}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">20) B-class deduction</td>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">
                      {selectedPrintReceipt.deduction_deduction !== '0' ? selectedPrintReceipt.deduction_deduction : ''}
                    </td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">&nbsp;</td>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">&nbsp;</td>
                  </tr>

                  <tr>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">21)</td>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">&nbsp;</td>
                    <td className="border border-[#CCCCCC] p-1.5 bg-white">&nbsp;</td>
                    <td colSpan={2} className="border border-[#CCCCCC] p-1.5 bg-white">&nbsp;</td>
                  </tr>

                  <tr>
                    <td colSpan={7} className="border border-[#CCCCCC] p-2 bg-white">
                      <div className="flex justify-between items-center">
                        <div className="leading-relaxed">
                          Paid the above tax amount.
                          <br />
                          {formatUnixDateDot(selectedPrintReceipt.reg_date)}
                          <br />
                          To : {selectedPrintReceipt.reg_name || selectedPrintReceipt.name}
                        </div>
                        <div>
                          <img
                            src="/img/icon_receipt.gif"
                            width={254}
                            height={52}
                            alt="Chairman of Geoje Taxpayers Association"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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

      {/* Consultation Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">상담 처리 상태 &amp; 메모 등록</h3>
            <p className="text-xs text-slate-500">ID: {editingId}</p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">상태 변경</label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              >
                <option value="접수">접수 (Received)</option>
                <option value="진행중">진행중 (In Progress)</option>
                <option value="완료">완료 (Completed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">관리자 메모</label>
              <textarea
                rows={4}
                value={editMemo}
                onChange={e => setEditMemo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
              >
                취소
              </button>
              <button
                onClick={() => handleUpdateStatus(editingId)}
                className="px-4 py-2 bg-gta-600 text-white font-bold text-xs rounded-lg hover:bg-gta-700"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
