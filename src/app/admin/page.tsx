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
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Consultation, Notice, ApplicationMember, TaxReceipt } from '@/lib/db';

function formatUnixMonth(val?: string): string {
  if (!val) return '-';
  const num = Number(val);
  if (!isNaN(num) && num > 100000000) {
    const d = new Date((num + 9 * 3600) * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  return val;
}

function formatUnixDate(val?: string): string {
  if (!val) return '-';
  const num = Number(val);
  if (!isNaN(num) && num > 100000000) {
    const d = new Date((num + 9 * 3600) * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return val;
}

function toUnixFromMonth(ym: string): string {
  // ym format: YYYY-MM -> Unix timestamp (seconds)
  if (!ym || !ym.includes('-')) return String(Math.floor(Date.now() / 1000));
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return String(Math.floor(Date.now() / 1000));
  const d = new Date(y, m - 1, 1, 9, 0, 0);
  return String(Math.floor(d.getTime() / 1000));
}

function toUnixFromDate(ymd: string): string {
  if (!ymd || !ymd.includes('-')) return String(Math.floor(Date.now() / 1000));
  const [y, m, day] = ymd.split('-').map(Number);
  if (!y || !m || !day) return String(Math.floor(Date.now() / 1000));
  const d = new Date(y, m - 1, day, 9, 0, 0);
  return String(Math.floor(d.getTime() / 1000));
}

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
  const [receipts, setReceipts] = useState<TaxReceipt[]>([]);
  const [receiptsTotal, setReceiptsTotal] = useState(0);
  const [receiptsPage, setReceiptsPage] = useState(1);
  const [receiptQuery, setReceiptQuery] = useState('');
  const [receiptSearchInput, setReceiptSearchInput] = useState('');
  const [receiptsLoading, setReceiptsLoading] = useState(false);

  // Receipt Create / Edit Modal State
  const [showReceiptFormModal, setShowReceiptFormModal] = useState(false);
  const [editingReceiptId, setEditingReceiptId] = useState<number | null>(null);
  const [memberReceiptsList, setMemberReceiptsList] = useState<TaxReceipt[]>([]);
  const [selectedPrintReceipt, setSelectedPrintReceipt] = useState<TaxReceipt | null>(null);

  const todayYm = new Date().toISOString().slice(0, 7);
  const todayYmd = new Date().toISOString().slice(0, 10);

  const [receiptForm, setReceiptForm] = useState({
    member_num: '',
    management_no: '',
    license_no: '612-80-03137',
    association_name: 'Geoje Taxpayers Association',
    chairman_name: 'Kim Se- Kwang',
    resident_no1: '710925-*******',
    address1: '#107, 3696 Geoje-daero, Geoje-si, Gyeongsangnam-do, Republic of Korea',
    name: '',
    resident_no2: '',
    address2: '',
    taxation_period_ym: todayYm,
    reg_date_ymd: todayYmd,
    local_name: '',
    local_basicsalary: '0',
    local_bonus: '0',
    local_income: '0',
    local_totalsalary: '0',
    overseas_name: '',
    overseas_basicsalary: '0',
    overseas_bonus: '0',
    overseas_income: '0',
    overseas_totalsalary: '0',
    total_salary: '0',
    computed_tax: '0',
    deduction_overseas: '0',
    deduction_deduction: '0',
    payable_income: '0',
    payable_resident: '0',
    payable_special: '0',
    non_taxable_salary: '',
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
      const res = await fetch(`/api/members?query=${encodeURIComponent(q)}&field=${encodeURIComponent(field)}&page=${p}&limit=20`);
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

  const fetchReceipts = useCallback(async (q: string, p: number) => {
    setReceiptsLoading(true);
    try {
      const res = await fetch(`/api/receipts?query=${encodeURIComponent(q)}&page=${p}&limit=25`);
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
  }, []);

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
      fetchReceipts(receiptQuery, receiptsPage);
      fetchConsultations();
      fetchNotices();
    }
  }, [authenticated, memberQuery, membersPage, memberSearchField, receiptQuery, receiptsPage, fetchMembers, fetchReceipts, fetchConsultations, fetchNotices]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = adminId.trim().toLowerCase();
    const validId = !cleanId || cleanId === 'gtakorea' || cleanId === 'deokang7' || cleanId === 'admin';
    const validPw = adminPassword === '8992' || adminPassword === '1201' || adminPassword === 'gta7273' || adminPassword === '9999';

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

  // Open Receipt Writing Modal for a specific Member
  const handleOpenWriteReceiptForMember = async (m: ApplicationMember) => {
    setEditingReceiptId(null);
    let existingList: TaxReceipt[] = [];
    try {
      const res = await fetch(`/api/receipts?memberNum=${encodeURIComponent(String(m.id))}&limit=50`);
      const json = await res.json();
      if (json.success && json.receipts) {
        existingList = json.receipts;
      }
    } catch (e) {
      console.error(e);
    }
    setMemberReceiptsList(existingList);

    const latest = existingList[0];
    setReceiptForm({
      member_num: String(m.id),
      management_no: latest?.management_no || `${m.company || 'GTA'}-${m.id}`,
      license_no: '612-80-03137',
      association_name: 'Geoje Taxpayers Association',
      chairman_name: 'Kim Se- Kwang',
      resident_no1: '710925-*******',
      address1: '#107, 3696 Geoje-daero, Geoje-si, Gyeongsangnam-do, Republic of Korea',
      name: m.name || '',
      resident_no2: m.number || '',
      address2: m.address || latest?.address2 || '',
      taxation_period_ym: todayYm,
      reg_date_ymd: todayYmd,
      local_name: latest?.local_name || '',
      local_basicsalary: latest?.local_basicsalary || '0',
      local_bonus: latest?.local_bonus || '0',
      local_income: latest?.local_income || '0',
      local_totalsalary: latest?.local_totalsalary || '0',
      overseas_name: m.company || latest?.overseas_name || '',
      overseas_basicsalary: latest?.overseas_basicsalary || m.money_01 || '0',
      overseas_bonus: latest?.overseas_bonus || m.money_03 || '0',
      overseas_income: latest?.overseas_income || m.money_02 || '0',
      overseas_totalsalary: latest?.overseas_totalsalary || m.money_04 || '0',
      total_salary: latest?.total_salary || m.money_04 || '0',
      computed_tax: latest?.computed_tax || '0',
      deduction_overseas: latest?.deduction_overseas || '0',
      deduction_deduction: latest?.deduction_deduction || '0',
      payable_income: latest?.payable_income || '0',
      payable_resident: latest?.payable_resident || '0',
      payable_special: latest?.payable_special || '0',
      non_taxable_salary: latest?.non_taxable_salary || '',
    });
    setShowReceiptFormModal(true);
  };

  // Open Receipt Editing Modal for an existing Receipt
  const handleOpenEditReceipt = (r: TaxReceipt) => {
    setEditingReceiptId(r.id);
    setMemberReceiptsList([]);
    const ym = formatUnixMonth(r.taxation_period);
    const ymd = formatUnixDate(r.reg_date);
    setReceiptForm({
      member_num: r.member_num || '',
      management_no: r.management_no || '',
      license_no: r.license_no || '612-80-03137',
      association_name: r.association_name || 'Geoje Taxpayers Association',
      chairman_name: r.chairman_name || 'Kim Se- Kwang',
      resident_no1: r.resident_no1 || '710925-*******',
      address1: r.address1 || '#107, 3696 Geoje-daero, Geoje-si, Gyeongsangnam-do, Republic of Korea',
      name: r.name || '',
      resident_no2: r.resident_no2 || '',
      address2: r.address2 || '',
      taxation_period_ym: ym.length === 7 ? ym : todayYm,
      reg_date_ymd: ymd.length === 10 ? ymd : todayYmd,
      local_name: r.local_name || '',
      local_basicsalary: r.local_basicsalary || '0',
      local_bonus: r.local_bonus || '0',
      local_income: r.local_income || '0',
      local_totalsalary: r.local_totalsalary || '0',
      overseas_name: r.overseas_name || '',
      overseas_basicsalary: r.overseas_basicsalary || '0',
      overseas_bonus: r.overseas_bonus || '0',
      overseas_income: r.overseas_income || '0',
      overseas_totalsalary: r.overseas_totalsalary || '0',
      total_salary: r.total_salary || '0',
      computed_tax: r.computed_tax || '0',
      deduction_overseas: r.deduction_overseas || '0',
      deduction_deduction: r.deduction_deduction || '0',
      payable_income: r.payable_income || '0',
      payable_resident: r.payable_resident || '0',
      payable_special: r.payable_special || '0',
      non_taxable_salary: r.non_taxable_salary || '',
    });
    setShowReceiptFormModal(true);
  };

  // Auto-calculate totals in Receipt Form
  const handleAutoCalcReceiptTax = () => {
    const parseNum = (s: string) => parseFloat(String(s).replace(/[^0-9.-]/g, '')) || 0;
    const ob = parseNum(receiptForm.overseas_basicsalary);
    const obo = parseNum(receiptForm.overseas_bonus);
    const oi = parseNum(receiptForm.overseas_income);
    const lb = parseNum(receiptForm.local_basicsalary);
    const lbo = parseNum(receiptForm.local_bonus);
    const li = parseNum(receiptForm.local_income);

    const overseasTotal = ob + obo + oi;
    const localTotal = lb + lbo + li;
    const totalGross = overseasTotal + localTotal;

    const compTax = parseNum(receiptForm.computed_tax);
    const dedAssoc = parseNum(receiptForm.deduction_deduction);
    const dedOver = parseNum(receiptForm.deduction_overseas);

    const payInc = compTax > 0 ? Math.max(0, compTax - dedAssoc - dedOver) : parseNum(receiptForm.payable_income);
    const payRes = Math.floor(payInc * 0.01) * 10; // 10% resident tax (truncated to 10 won)
    const payTotal = payInc + payRes;

    setReceiptForm(prev => ({
      ...prev,
      overseas_totalsalary: overseasTotal > 0 ? overseasTotal.toLocaleString() : prev.overseas_totalsalary,
      local_totalsalary: localTotal > 0 ? localTotal.toLocaleString() : prev.local_totalsalary,
      total_salary: totalGross > 0 ? totalGross.toLocaleString() : prev.total_salary,
      payable_income: payInc.toLocaleString(),
      payable_resident: payRes.toLocaleString(),
      payable_special: payTotal.toLocaleString(),
    }));
  };

  const handleSaveReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...receiptForm,
      taxation_period: toUnixFromMonth(receiptForm.taxation_period_ym),
      reg_date: toUnixFromDate(receiptForm.reg_date_ymd),
      total_basicsalary: receiptForm.overseas_basicsalary,
      total_bonus: receiptForm.overseas_bonus,
      total_income: receiptForm.overseas_income,
      total_totalsalary: receiptForm.total_salary,
      reg_name: receiptForm.name,
    };

    try {
      const res = await fetch('/api/receipts', {
        method: editingReceiptId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingReceiptId ? { id: editingReceiptId, ...payload } : payload),
      });
      const json = await res.json();
      if (json.success) {
        alert(editingReceiptId ? '영수증이 수정되었습니다. (Receipt updated)' : '신규 영수증이 발급/등록되었습니다! (Receipt issued)');
        setShowReceiptFormModal(false);
        fetchReceipts(receiptQuery, receiptsPage);
        fetchMembers(memberQuery, membersPage);
      } else {
        alert(json.error || 'Failed to save receipt');
      }
    } catch (err) {
      alert('Error saving receipt');
    }
  };

  const handleDeleteReceipt = async (id: number) => {
    if (!confirm(`영수증(#${id})을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/receipts?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchReceipts(receiptQuery, receiptsPage);
        setMemberReceiptsList(prev => prev.filter(r => r.id !== id));
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
        fetchMembers(memberQuery, membersPage);
      }
    } catch (err) {
      alert('Failed to update member');
    }
  };

  const handleDeleteMember = async (id: number, name: string) => {
    if (!confirm(`${name} (#${id}) 회원을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchMembers(memberQuery, membersPage);
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
  // Popup-only Login Modal (No separate main page needed per Item 9)
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
              fetchReceipts(receiptQuery, receiptsPage);
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
            onClick={() => {
              setEditingReceiptId(null);
              setMemberReceiptsList([]);
              setReceiptForm({
                member_num: '',
                management_no: '',
                license_no: '612-80-03137',
                association_name: 'Geoje Taxpayers Association',
                chairman_name: 'Kim Se- Kwang',
                resident_no1: '710925-*******',
                address1: '#107, 3696 Geoje-daero, Geoje-si, Gyeongsangnam-do, Republic of Korea',
                name: '',
                resident_no2: '',
                address2: '',
                taxation_period_ym: todayYm,
                reg_date_ymd: todayYmd,
                local_name: '',
                local_basicsalary: '0',
                local_bonus: '0',
                local_income: '0',
                local_totalsalary: '0',
                overseas_name: '',
                overseas_basicsalary: '0',
                overseas_bonus: '0',
                overseas_income: '0',
                overseas_totalsalary: '0',
                total_salary: '0',
                computed_tax: '0',
                deduction_overseas: '0',
                deduction_deduction: '0',
                payable_income: '0',
                payable_resident: '0',
                payable_special: '0',
                non_taxable_salary: '',
              });
              setShowReceiptFormModal(true);
            }}
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
          <span>👥 전체 회원 검색 및 영수증 발급 (Members)</span>
          <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
            {membersTotal.toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('receipts')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'receipts'
              ? 'bg-gta-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>🧾 영수증 전체 내역 및 관리 (Tax Receipts)</span>
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
      {/* TAB 1: MEMBER SEARCH & RECEIPT ISSUANCE (5,215+ Members) */}
      {/* ========================================================================= */}
      {activeTab === 'members' && (
        <div className="space-y-4 print:hidden">
          {/* Search Bar with Legacy Filter Radio Buttons (all / name / number / company / phone) */}
          <form
            onSubmit={e => {
              e.preventDefault();
              setMembersPage(1);
              setMemberQuery(memberSearchInput);
            }}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between items-center gap-3"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-gta-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
                <button
                  type="submit"
                  className="bg-gta-600 hover:bg-gta-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer whitespace-nowrap"
                >
                  검색 (Search)
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
                  onClick={() => setActiveTab('receipts')}
                  className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap"
                >
                  영수증전체보기
                </button>
              </div>
            </div>
          </form>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">
                조회된 회원 수: <strong className="text-gta-700 font-mono">{membersTotal.toLocaleString()}</strong>명 (페이지 {membersPage} / {totalMemberPages})
              </span>
              <span className="text-slate-500">
                ※ 각 회원의 <strong>[+ 영수증 작성/내역]</strong> 버튼을 클릭하면 해당 회원의 월별 세금 영수증을 즉시 작성·발급할 수 있습니다.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-3.5">no</th>
                    <th className="px-3.5 py-3.5">name</th>
                    <th className="px-3.5 py-3.5">number</th>
                    <th className="px-3.5 py-3.5">email / company</th>
                    <th className="px-3.5 py-3.5">remark</th>
                    <th className="px-3.5 py-3.5">Telephone</th>
                    <th className="px-3.5 py-3.5">Date of Stay &amp; Work</th>
                    <th className="px-3.5 py-3.5 text-center">Receipts</th>
                    <th className="px-3.5 py-3.5 text-right">Modify / Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
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
                        <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-3.5 py-3.5 font-mono text-xs font-extrabold text-slate-700">
                            {m.seq_no ?? m.id}
                          </td>
                          <td className="px-3.5 py-3.5">
                            <div className="font-extrabold text-slate-900">{m.name}</div>
                          </td>
                          <td className="px-3.5 py-3.5 font-mono text-xs font-bold text-slate-700">
                            {m.number || '-'}
                          </td>
                          <td className="px-3.5 py-3.5">
                            <div className="text-xs text-slate-700 font-mono">{m.email || '-'}</div>
                            {m.company && m.company !== '-' && (
                              <div className="text-[11px] font-bold text-gta-700 mt-0.5">{m.company}</div>
                            )}
                          </td>
                          <td className="px-3.5 py-3.5 max-w-xs">
                            {cleanRemark ? (
                              <div className="text-xs text-slate-700">{cleanRemark}</div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-3.5 py-3.5 font-mono text-xs font-bold text-slate-800">
                            {m.phon || '-'}
                          </td>
                          <td className="px-3.5 py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                            {formatUnixDate(m.date_from)} ~ {formatUnixDate(m.date_to)}
                          </td>
                          <td className="px-3.5 py-3.5 text-center">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold px-2.5 py-1 rounded-full">
                              {m.receipt_count ?? 0}건
                            </span>
                          </td>
                          <td className="px-3.5 py-3.5 text-right whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingMember({ ...m, remark: cleanRemark })}
                              className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-lg inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>MODIFY</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenWriteReceiptForMember(m)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>VIEW / 영수증</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(m.id, m.name)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg inline-flex items-center cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <button
                type="button"
                disabled={membersPage <= 1}
                onClick={() => setMembersPage(p => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전 (Prev)</span>
              </button>
              <span className="font-mono font-bold text-slate-700">
                Page {membersPage} of {totalMemberPages}
              </span>
              <button
                type="button"
                disabled={membersPage >= totalMemberPages}
                onClick={() => setMembersPage(p => Math.min(totalMemberPages, p + 1))}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
              >
                <span>다음 (Next)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TAX RECEIPTS MANAGEMENT (118,902+ Receipts) */}
      {/* ========================================================================= */}
      {activeTab === 'receipts' && (
        <div className="space-y-4 print:hidden">
          <form
            onSubmit={e => {
              e.preventDefault();
              setReceiptsPage(1);
              setReceiptQuery(receiptSearchInput);
            }}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3"
          >
            <div className="relative w-full sm:max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="영수증 대상자 이름(Name), 등록번호(Registration No), 회사명(Company), 관리번호 검색..."
                value={receiptSearchInput}
                onChange={e => setReceiptSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-gta-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="submit"
                className="bg-gta-600 hover:bg-gta-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer"
              >
                영수증 검색 (Search)
              </button>
              {receiptQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setReceiptSearchInput('');
                    setReceiptQuery('');
                    setReceiptsPage(1);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer"
                >
                  초기화
                </button>
              )}
            </div>
          </form>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">
                전체 영수증 내역: <strong className="text-emerald-700 font-mono">{receiptsTotal.toLocaleString()}</strong>건 (페이지 {receiptsPage} / {totalReceiptPages})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">ID</th>
                    <th className="px-4 py-3.5">Period (귀속연월)</th>
                    <th className="px-4 py-3.5">Taxpayer Name</th>
                    <th className="px-4 py-3.5">Reg. Number</th>
                    <th className="px-4 py-3.5">Company</th>
                    <th className="px-4 py-3.5 text-right">Total Salary</th>
                    <th className="px-4 py-3.5 text-right">Total Tax Paid</th>
                    <th className="px-4 py-3.5 text-center">Issue Date</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {receiptsLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-semibold">
                        영수증 데이터를 불러오는 중입니다...
                      </td>
                    </tr>
                  ) : receipts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                        조회된 영수증이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    receipts.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-500">#{r.id}</td>
                        <td className="px-4 py-3.5 font-mono font-bold text-gta-800">
                          {formatUnixMonth(r.taxation_period)}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900">{r.name}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{r.resident_no2}</td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">
                          {r.overseas_name || r.local_name || '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-800">
                          ₩{r.total_salary || r.total_totalsalary || '0'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-extrabold text-emerald-700">
                          ₩{r.payable_special || '0'}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-xs text-slate-500">
                          {formatUnixDate(r.reg_date)}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPrintReceipt(r)}
                            className="bg-gta-600 hover:bg-gta-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>보기/인쇄</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditReceipt(r)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-lg inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>수정</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReceipt(r.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg inline-flex items-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <button
                type="button"
                disabled={receiptsPage <= 1}
                onClick={() => setReceiptsPage(p => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전 (Prev)</span>
              </button>
              <span className="font-mono font-bold text-slate-700">
                Page {receiptsPage} of {totalReceiptPages}
              </span>
              <button
                type="button"
                disabled={receiptsPage >= totalReceiptPages}
                onClick={() => setReceiptsPage(p => Math.min(totalReceiptPages, p + 1))}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
              >
                <span>다음 (Next)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
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
      {/* MODAL 1: RECEIPT WRITING / EDITING MODAL */}
      {/* ========================================================================= */}
      {showReceiptFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  Tax Withholding Receipt Editor
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {editingReceiptId
                    ? `영수증 수정 (#${editingReceiptId})`
                    : `월별 납세 영수증 작성 / 발급 (${receiptForm.name || '신규 작성'})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptFormModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Receipts Quick List for this Member */}
            {memberReceiptsList.length > 0 && !editingReceiptId && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 flex justify-between items-center">
                  <span>📋 해당 회원의 기존 발급 영수증 내역 ({memberReceiptsList.length}건)</span>
                  <span className="text-[11px] text-slate-500">최근 영수증 금액이 아래 입력란에 자동 복사되었습니다.</span>
                </div>
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 text-xs">
                  {memberReceiptsList.map(r => (
                    <div key={r.id} className="px-3 py-2 flex justify-between items-center hover:bg-blue-50/40">
                      <div className="space-x-3 font-mono">
                        <span className="font-bold text-gta-700">{formatUnixMonth(r.taxation_period)}</span>
                        <span className="text-slate-600">급여: ₩{r.total_salary}</span>
                        <span className="font-bold text-emerald-700">납부세액: ₩{r.payable_special}</span>
                      </div>
                      <div className="space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPrintReceipt(r)}
                          className="text-blue-600 hover:underline font-bold cursor-pointer"
                        >
                          [영수증 보기/인쇄]
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditReceipt(r)}
                          className="text-slate-600 hover:underline font-bold cursor-pointer"
                        >
                          [수정]
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveReceipt} className="space-y-5 text-xs">
              {/* Row 1: Taxpayer Info & Period */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Member No (회원번호)</label>
                  <input
                    type="text"
                    value={receiptForm.member_num}
                    onChange={e => setReceiptForm({ ...receiptForm, member_num: e.target.value })}
                    placeholder="e.g. 4874"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Management No (관리번호)</label>
                  <input
                    type="text"
                    value={receiptForm.management_no}
                    onChange={e => setReceiptForm({ ...receiptForm, management_no: e.target.value })}
                    placeholder="e.g. NAKILAT-4823"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blue-800 mb-1">Taxation Period (귀속연월) *</label>
                  <input
                    type="month"
                    required
                    value={receiptForm.taxation_period_ym}
                    onChange={e => setReceiptForm({ ...receiptForm, taxation_period_ym: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-blue-300 bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Date (발급일자) *</label>
                  <input
                    type="date"
                    required
                    value={receiptForm.reg_date_ymd}
                    onChange={e => setReceiptForm({ ...receiptForm, reg_date_ymd: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Name, Reg No, Company, Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Taxpayer Name (성명) *</label>
                  <input
                    type="text"
                    required
                    value={receiptForm.name}
                    onChange={e => setReceiptForm({ ...receiptForm, name: e.target.value.toUpperCase() })}
                    placeholder="e.g. KIM SILVIA"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Number (등록번호) *</label>
                  <input
                    type="text"
                    required
                    value={receiptForm.resident_no2}
                    onChange={e => setReceiptForm({ ...receiptForm, resident_no2: e.target.value })}
                    placeholder="e.g. 750409-5500019"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Name (해외/소속회사) *</label>
                  <input
                    type="text"
                    value={receiptForm.overseas_name}
                    onChange={e => setReceiptForm({ ...receiptForm, overseas_name: e.target.value })}
                    placeholder="e.g. NAKILAT / SUBSEA 7"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Taxpayer Address in Korea (국내 주소)</label>
                <input
                  type="text"
                  value={receiptForm.address2}
                  onChange={e => setReceiptForm({ ...receiptForm, address2: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              {/* Row 3: Wage & Salary (KRW) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-800 uppercase">급여 내역 (Wage &amp; Salary Details - KRW)</span>
                  <button
                    type="button"
                    onClick={handleAutoCalcReceiptTax}
                    className="bg-gta-600 hover:bg-gta-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
                  >
                    ⚡ 합계 및 지방소득세(10%) 자동계산
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Basic Salary (기본급 KRW)</label>
                    <input
                      type="text"
                      value={receiptForm.overseas_basicsalary}
                      onChange={e => {
                        const val = e.target.value;
                        setReceiptForm(prev => ({
                          ...prev,
                          overseas_basicsalary: val,
                          overseas_totalsalary: val,
                          total_salary: val,
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bonus (상여금 KRW)</label>
                    <input
                      type="text"
                      value={receiptForm.overseas_bonus}
                      onChange={e => setReceiptForm({ ...receiptForm, overseas_bonus: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Other Income (기타수당 KRW)</label>
                    <input
                      type="text"
                      value={receiptForm.overseas_income}
                      onChange={e => setReceiptForm({ ...receiptForm, overseas_income: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-blue-800 mb-1">Total Salary (총 급여액 KRW) *</label>
                    <input
                      type="text"
                      value={receiptForm.total_salary}
                      onChange={e =>
                        setReceiptForm({
                          ...receiptForm,
                          total_salary: e.target.value,
                          overseas_totalsalary: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-blue-300 bg-white font-mono font-bold text-blue-900"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Tax Calculation & Payable Tax (KRW) */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <div className="font-extrabold text-emerald-950 uppercase">
                  세액 산출 및 납부세액 (Tax Calculation &amp; Payable Tax - KRW)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Computed Tax (산출세액)</label>
                    <input
                      type="text"
                      value={receiptForm.computed_tax}
                      onChange={e => setReceiptForm({ ...receiptForm, computed_tax: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Association Credit (납세조합세액공제)</label>
                    <input
                      type="text"
                      value={receiptForm.deduction_deduction}
                      onChange={e => setReceiptForm({ ...receiptForm, deduction_deduction: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Foreign Tax Credit (외국납부세액공제)</label>
                    <input
                      type="text"
                      value={receiptForm.deduction_overseas}
                      onChange={e => setReceiptForm({ ...receiptForm, deduction_overseas: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Payable Income Tax (소득세) *</label>
                    <input
                      type="text"
                      value={receiptForm.payable_income}
                      onChange={e => setReceiptForm({ ...receiptForm, payable_income: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Local Resident Tax (지방소득세) *</label>
                    <input
                      type="text"
                      value={receiptForm.payable_resident}
                      onChange={e => setReceiptForm({ ...receiptForm, payable_resident: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1">Total Tax Paid (합계 납부세액) *</label>
                    <input
                      type="text"
                      value={receiptForm.payable_special}
                      onChange={e => setReceiptForm({ ...receiptForm, payable_special: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border-2 border-emerald-500 bg-white font-mono font-black text-emerald-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowReceiptFormModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  취소 (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg cursor-pointer"
                >
                  {editingReceiptId ? '영수증 수정 저장 (Update Receipt)' : '영수증 발급/저장하기 (Save & Issue Receipt)'}
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
                    value={formatUnixDate(editingMember.date_from).length === 10 ? formatUnixDate(editingMember.date_from) : ''}
                    onChange={e => setEditingMember({ ...editingMember, date_from: toUnixFromDate(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Stay &amp; Work (To)</label>
                  <input
                    type="date"
                    value={formatUnixDate(editingMember.date_to).length === 10 ? formatUnixDate(editingMember.date_to) : ''}
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
      {/* MODAL 3: PRINTABLE OFFICIAL RECEIPT PREVIEW */}
      {/* ========================================================================= */}
      {selectedPrintReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full p-6 sm:p-10 space-y-6 my-8 print:shadow-none print:border-0 print:my-0 print:max-w-full">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 print:hidden">
              <span className="bg-gta-100 text-gta-800 text-xs font-extrabold px-3 py-1 rounded-full">
                Official GTA Tax Receipt #{selectedPrintReceipt.id}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt (인쇄)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPrintReceipt(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="border-2 border-slate-800 p-6 sm:p-8 space-y-5 text-xs text-slate-900">
              <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Geoje Taxpayers Association (납세조합 완납 영수증)
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                  Receipt for Wage &amp; Salary Income Tax Withholding
                </h2>
                <div className="text-xs font-mono text-slate-600">
                  Management No: <strong>{selectedPrintReceipt.management_no || '-'}</strong> &nbsp;|&nbsp; Taxation Period: <strong>{formatUnixMonth(selectedPrintReceipt.taxation_period)}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-400 p-3.5 space-y-1.5 bg-slate-50/50">
                  <div className="font-black text-slate-800 border-b border-slate-300 pb-1 uppercase text-[11px]">
                    1. Withholding Agent (Taxpayers Association)
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500 font-semibold">Association:</span>
                    <span className="col-span-2 font-bold">{selectedPrintReceipt.association_name || 'Geoje Taxpayers Association'}</span>
                    <span className="text-slate-500 font-semibold">License No:</span>
                    <span className="col-span-2 font-mono">{selectedPrintReceipt.license_no || '612-80-03137'}</span>
                    <span className="text-slate-500 font-semibold">Chairman:</span>
                    <span className="col-span-2 font-semibold">{selectedPrintReceipt.chairman_name || 'Kim Se- Kwang'}</span>
                    <span className="text-slate-500 font-semibold">Address:</span>
                    <span className="col-span-2 text-[11px]">{selectedPrintReceipt.address1 || '#107, 3696 Geoje-daero, Geoje-si, Gyeongsangnam-do, Korea'}</span>
                  </div>
                </div>

                <div className="border border-slate-400 p-3.5 space-y-1.5 bg-slate-50/50">
                  <div className="font-black text-slate-800 border-b border-slate-300 pb-1 uppercase text-[11px]">
                    2. Taxpayer (Earner) Information
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500 font-semibold">Full Name:</span>
                    <span className="col-span-2 font-black text-sm">{selectedPrintReceipt.name}</span>
                    <span className="text-slate-500 font-semibold">Reg. Number:</span>
                    <span className="col-span-2 font-mono font-bold">{selectedPrintReceipt.resident_no2}</span>
                    <span className="text-slate-500 font-semibold">Company:</span>
                    <span className="col-span-2 font-semibold">{selectedPrintReceipt.overseas_name || selectedPrintReceipt.local_name || '-'}</span>
                    <span className="text-slate-500 font-semibold">Address:</span>
                    <span className="col-span-2 text-[11px]">{selectedPrintReceipt.address2 || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-black text-slate-800 uppercase text-[11px]">
                  3. Wage &amp; Salary Income Details (KRW)
                </div>
                <table className="w-full border-collapse border border-slate-500 text-center text-xs">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th className="border border-slate-400 p-2">Classification</th>
                      <th className="border border-slate-400 p-2">Company Name</th>
                      <th className="border border-slate-400 p-2">Basic Salary</th>
                      <th className="border border-slate-400 p-2">Bonus</th>
                      <th className="border border-slate-400 p-2">Other Income</th>
                      <th className="border border-slate-400 p-2">Total Salary</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr>
                      <td className="border border-slate-400 p-2 font-sans font-semibold bg-slate-50">Overseas (Class B)</td>
                      <td className="border border-slate-400 p-2 font-sans">{selectedPrintReceipt.overseas_name || '-'}</td>
                      <td className="border border-slate-400 p-2 text-right">{selectedPrintReceipt.overseas_basicsalary || '0'}</td>
                      <td className="border border-slate-400 p-2 text-right">{selectedPrintReceipt.overseas_bonus || '0'}</td>
                      <td className="border border-slate-400 p-2 text-right">{selectedPrintReceipt.overseas_income || '0'}</td>
                      <td className="border border-slate-400 p-2 text-right font-bold">{selectedPrintReceipt.overseas_totalsalary || selectedPrintReceipt.total_salary || '0'}</td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={2} className="border border-slate-400 p-2 font-sans">Total Gross Wage (KRW)</td>
                      <td className="border border-slate-400 p-2 text-right">{selectedPrintReceipt.total_basicsalary || selectedPrintReceipt.overseas_basicsalary || '0'}</td>
                      <td className="border border-slate-400 p-2 text-right">{selectedPrintReceipt.total_bonus || '0'}</td>
                      <td className="border border-slate-400 p-2 text-right">{selectedPrintReceipt.total_income || '0'}</td>
                      <td className="border border-slate-400 p-2 text-right text-blue-800">{selectedPrintReceipt.total_salary || selectedPrintReceipt.total_totalsalary || '0'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-1.5">
                <div className="font-black text-slate-800 uppercase text-[11px]">
                  4. Tax Calculation &amp; Withholding Tax Paid (KRW)
                </div>
                <table className="w-full border-collapse border border-slate-500 text-xs">
                  <tbody className="font-mono">
                    <tr>
                      <th className="border border-slate-400 p-2.5 bg-slate-100 text-left font-sans w-1/4">Computed Tax (산출세액)</th>
                      <td className="border border-slate-400 p-2.5 text-right w-1/4">₩{selectedPrintReceipt.computed_tax || '0'}</td>
                      <th className="border border-slate-400 p-2.5 bg-slate-100 text-left font-sans w-1/4">Association Credit (납세조합공제)</th>
                      <td className="border border-slate-400 p-2.5 text-right w-1/4">₩{selectedPrintReceipt.deduction_deduction || '0'}</td>
                    </tr>
                    <tr>
                      <th className="border border-slate-400 p-2.5 bg-slate-100 text-left font-sans">Income Tax (소득세)</th>
                      <td className="border border-slate-400 p-2.5 text-right font-bold">₩{selectedPrintReceipt.payable_income || '0'}</td>
                      <th className="border border-slate-400 p-2.5 bg-slate-100 text-left font-sans">Local Resident Tax (지방소득세)</th>
                      <td className="border border-slate-400 p-2.5 text-right font-bold">₩{selectedPrintReceipt.payable_resident || '0'}</td>
                    </tr>
                    <tr className="bg-emerald-50">
                      <th colSpan={2} className="border border-slate-400 p-3 text-left font-sans font-black text-sm text-emerald-950">
                        Total Monthly Tax Paid (합계 납부세액)
                      </th>
                      <td colSpan={2} className="border border-slate-400 p-3 text-right font-black text-base text-emerald-800">
                        ₩{selectedPrintReceipt.payable_special || '0'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center border-t border-slate-300 gap-4">
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p>We hereby certify that the above wage and salary income tax has been duly withheld and paid to the National Tax Service.</p>
                  <p className="font-mono">Issue Date: <strong>{formatUnixDate(selectedPrintReceipt.reg_date)}</strong> &nbsp;|&nbsp; Earner: <strong>{selectedPrintReceipt.reg_name || selectedPrintReceipt.name}</strong></p>
                </div>
                <div className="text-right shrink-0 border-2 border-red-700/80 text-red-700 px-3 py-1.5 rounded font-black text-xs uppercase tracking-wider">
                  Geoje Taxpayers Association [OFFICIAL SEAL]
                </div>
              </div>
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
              <button onClick={() => setShowNoticeModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
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
