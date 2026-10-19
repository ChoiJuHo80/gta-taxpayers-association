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
} from 'lucide-react';
import { Consultation, Notice, ApplicationMember, TaxReceipt } from '@/lib/db';

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
  const [memberSearchField, setMemberSearchField] = useState<'all' | 'name' | 'number' | 'company' | 'phone'>('all');
  const [membersLoading, setMembersLoading] = useState(false);

  // Member Edit Modal
  const [editingMember, setEditingMember] = useState<ApplicationMember | null>(null);

  // Receipts State (118,902+ migrated receipts)
  const [selectedReceiptMember, setSelectedReceiptMember] = useState<ApplicationMember | null>(null);
  const [receipts, setReceipts] = useState<TaxReceipt[]>([]);
  const [receiptsTotal, setReceiptsTotal] = useState(0);
  const [receiptsPage, setReceiptsPage] = useState(1);
  const [receiptQuery, setReceiptQuery] = useState('');
  const [receiptSearchInput, setReceiptSearchInput] = useState('');
  const [receiptSearchField, setReceiptSearchField] = useState<'name' | 'resident_no2' | 'license_no'>('name');
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

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      const res = await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMember),
      });
      const json = await res.json();
      if (json.success) {
        alert('회원 정보가 수정되었습니다. (Member updated)');
        setEditingMember(null);
        fetchMembers(memberQuery, membersPage, memberSearchField);
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
    window.location.href = '/api/admin/excel';
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

  const filteredConsultations = consultations.filter(item => {
    const matchStat = filterStatus === '전체' || item.status === filterStatus;
    const matchSearch =
      item.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStat && matchSearch;
  });

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
              fetchConsultations();
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
          onClick={() => setActiveTab('consultations')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'consultations'
              ? 'bg-gta-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>💬 온라인 신청/상담 내역</span>
          <span className="bg-slate-600 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
            {consultations.length}
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
                  { value: 'all', label: '전체(all)' },
                  { value: 'name', label: 'name' },
                  { value: 'number', label: 'number' },
                  { value: 'company', label: 'company' },
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
                  placeholder="회원 이름(name), 등록번호(number), 회사명(company), 연락처(phone) 검색..."
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
                    <th className="px-2.5 py-2.5">Modify</th>
                    <th className="px-2.5 py-2.5">Receipt</th>
                    <th className="px-2.5 py-2.5">Del</th>
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
                          <td className="px-2 py-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setEditingMember({ ...m, remark: cleanRemark })}
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
                          <td className="px-2 py-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(m.id, m.name)}
                              className="bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded-xs cursor-pointer"
                            >
                              DEL
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
              className="flex flex-wrap items-center gap-2 text-xs text-black"
            >
              <label className="inline-flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="search_mode"
                  value="name"
                  checked={receiptSearchField === 'name'}
                  onChange={() => setReceiptSearchField('name')}
                />
                <span>Name</span>
              </label>
              <label className="inline-flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="search_mode"
                  value="resident_no2"
                  checked={receiptSearchField === 'resident_no2'}
                  onChange={() => setReceiptSearchField('resident_no2')}
                />
                <span>Payer Resident-No</span>
              </label>
              <label className="inline-flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="search_mode"
                  value="license_no"
                  checked={receiptSearchField === 'license_no'}
                  onChange={() => setReceiptSearchField('license_no')}
                />
                <span>License-No</span>
              </label>
              <input
                type="text"
                value={receiptSearchInput}
                onChange={e => setReceiptSearchInput(e.target.value)}
                className="border border-slate-400 px-2 py-0.5 text-xs w-32"
              />
              <button
                type="submit"
                className="bg-slate-200 hover:bg-slate-300 border border-slate-400 text-black font-bold text-xs px-2.5 py-0.5 cursor-pointer"
              >
                검색
              </button>
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
      {/* TAB 3: CONSULTATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'consultations' && (
        <div className="space-y-4 print:hidden">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600">상태 필터:</span>
              {['전체', '접수', '진행중', '완료'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    filterStatus === st ? 'bg-gta-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="이름 / 연락처 / 제목 검색"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">접수번호</th>
                    <th className="px-6 py-4">신청자 / 연락처</th>
                    <th className="px-6 py-4">유형</th>
                    <th className="px-6 py-4">제목 &amp; 내용</th>
                    <th className="px-6 py-4">상태</th>
                    <th className="px-6 py-4 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredConsultations.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">{item.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.applicantName}</div>
                        <div className="text-xs text-slate-500">{item.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gta-800 bg-gta-50 px-2 py-0.5 rounded border border-gta-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-bold text-slate-900 truncate">{item.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-2 whitespace-pre-line">{item.content}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            item.status === '완료'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === '진행중'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setEditStatus(item.status);
                            setEditMemo(item.adminMemo || '');
                          }}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          상태 변경
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
      {/* TAB 4: NOTICE BOARD MANAGEMENT */}
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
      {/* MODAL 2: MEMBER EDIT MODAL */}
      {/* ========================================================================= */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                회원 정보 수정 (no. {editingMember.seq_no ?? editingMember.id} — {editingMember.name})
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Name (성명)</label>
                  <input
                    type="text"
                    value={editingMember.name}
                    onChange={e => setEditingMember({ ...editingMember, name: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Number (등록번호)</label>
                  <input
                    type="text"
                    value={editingMember.number}
                    onChange={e => setEditingMember({ ...editingMember, number: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company (회사명)</label>
                  <input
                    type="text"
                    value={editingMember.company}
                    onChange={e => setEditingMember({ ...editingMember, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nationality (국적)</label>
                  <input
                    type="text"
                    value={editingMember.nationality}
                    onChange={e => setEditingMember({ ...editingMember, nationality: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telephone (연락처)</label>
                  <input
                    type="text"
                    value={editingMember.phon}
                    onChange={e => setEditingMember({ ...editingMember, phon: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="text"
                    value={editingMember.email}
                    onChange={e => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Stay &amp; Work (From)</label>
                  <input
                    type="date"
                    value={
                      formatUnixDate(editingMember.date_from).length === 10
                        ? formatUnixDate(editingMember.date_from)
                        : ''
                    }
                    onChange={e => setEditingMember({ ...editingMember, date_from: toUnixFromDate(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Stay &amp; Work (To)</label>
                  <input
                    type="date"
                    value={
                      formatUnixDate(editingMember.date_to).length === 10 ? formatUnixDate(editingMember.date_to) : ''
                    }
                    onChange={e => setEditingMember({ ...editingMember, date_to: toUnixFromDate(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address (국내 거주지 주소)</label>
                <input
                  type="text"
                  value={editingMember.address}
                  onChange={e => setEditingMember({ ...editingMember, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Basic Salary</label>
                  <input
                    type="text"
                    value={editingMember.money_01}
                    onChange={e => setEditingMember({ ...editingMember, money_01: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Allowance</label>
                  <input
                    type="text"
                    value={editingMember.money_02}
                    onChange={e => setEditingMember({ ...editingMember, money_02: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bonus</label>
                  <input
                    type="text"
                    value={editingMember.money_03}
                    onChange={e => setEditingMember({ ...editingMember, money_03: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Income</label>
                  <input
                    type="text"
                    value={editingMember.money_04}
                    onChange={e => setEditingMember({ ...editingMember, money_04: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remark (관리자 메모/비고)</label>
                <textarea
                  rows={3}
                  value={editingMember.remark}
                  onChange={e => setEditingMember({ ...editingMember, remark: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gta-600 hover:bg-gta-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  수정 저장
                </button>
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
