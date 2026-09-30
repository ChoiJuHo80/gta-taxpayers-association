'use client';

import { useState, useEffect } from 'react';
import { Lock, Shield, ArrowRight, FileSpreadsheet, RefreshCw, Search, Building2, UserCheck, KeyRound, AlertCircle } from 'lucide-react';
import { Consultation } from '@/lib/db';
import { translations, Language } from '@/lib/i18n';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminId, setAdminId] = useState('');
  const [authError, setAuthError] = useState('');
  const [lang, setLang] = useState<Language>('en'); // Default to English

  useEffect(() => {
    const savedLang = (localStorage.getItem('gta_lang') as Language) || 'en';
    setLang(savedLang);

    const handleLangChange = (e: CustomEvent<Language>) => {
      setLang(e.detail);
    };

    window.addEventListener('langChange' as any, handleLangChange);
    return () => window.removeEventListener('langChange' as any, handleLangChange);
  }, []);

  const t = translations[lang];

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('전체');
  const [filterStatus, setFilterStatus] = useState<string>('전체');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<'접수' | '진행중' | '완료'>('접수');
  const [editMemo, setEditMemo] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = adminId.trim().toLowerCase();
    const validId = !cleanId || cleanId === 'deokang7' || cleanId === 'admin';
    const validPw = adminPassword === 'gta7273' || adminPassword === '9999' || adminPassword === 'gta2026' || adminPassword === '8992';

    if (validId && validPw) {
      setAuthenticated(true);
      setAuthError('');
      fetchConsultations();
    } else {
      setAuthError(lang === 'ko' ? '관리자 아이디 또는 암호가 일치하지 않습니다. (ID: deokang7 / PW: gta7273)' : 'Invalid Admin ID or Password. (ID: deokang7 / PW: gta7273)');
    }
  };

  const fetchConsultations = async () => {
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
        alert(lang === 'ko' ? '상담 처리 상태 및 세무사 답변이 등록되었습니다.' : 'Status and accountant notes updated successfully.');
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
  // 대우병원 EMR 스타일 2분할 (Split-screen) 안전하고 완벽한 카드 레이아웃
  // =========================================================================
  if (!authenticated) {
    return (
      <div className="w-full bg-slate-900 py-10 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px-200px)] flex items-center justify-center">
        
        <div className="max-w-6xl w-full mx-auto bg-slate-800 rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Side: Brand Visual & Banner Section (대우병원 EMR 스타일 스플래시) */}
          <div className="lg:col-span-7 bg-gradient-to-tr from-gta-900 via-gta-800 to-blue-900 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#1C90FB_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
            
            {/* Top Brand Logo */}
            <div className="relative z-10 flex items-center space-x-3 mb-8 lg:mb-0">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shrink-0">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight block">
                  {t.adminSplashTitle}
                </span>
                <span className="text-xs text-blue-300 font-medium block">
                  {t.adminSplashSub}
                </span>
              </div>
            </div>

            {/* Center Title & Highlights */}
            <div className="relative z-10 my-6 lg:my-10 space-y-5">
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.adminBadge}</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                {t.adminHeroTitle1}<br />
                <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
                  {t.adminHeroTitle2}
                </span>
              </h1>
              
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {t.adminHeroDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-xl border border-white/10 space-y-1">
                  <div className="text-xs text-blue-300 font-bold flex items-center space-x-1">
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t.adminCard1Title}</span>
                  </div>
                  <div className="text-xs text-slate-400">{t.adminCard1Desc}</div>
                </div>

                <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-xl border border-white/10 space-y-1">
                  <div className="text-xs text-blue-300 font-bold flex items-center space-x-1">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{t.adminCard2Title}</span>
                  </div>
                  <div className="text-xs text-slate-400">{t.adminCard2Desc}</div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="relative z-10 text-xs text-slate-400 pt-4 border-t border-slate-700/60 flex justify-between items-center">
              <span>© 2026 Geoje Taxpayers Association</span>
              <span className="text-blue-400 font-mono">v2.4.0-Enterprise</span>
            </div>

          </div>

          {/* Right Side: Clean White Login Card (대우병원 EMR 로그인 폼) */}
          <div className="lg:col-span-5 bg-white p-8 sm:p-12 flex flex-col justify-center">
            
            <div className="w-full space-y-6">
              
              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.adminLoginTitle}</h2>
                <p className="text-xs text-slate-500">
                  {t.adminLoginSub}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    {t.adminLabelId}
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder={t.adminPlaceholderId}
                      value={adminId}
                      onChange={e => setAdminId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    {t.adminLabelPw}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder={t.adminPlaceholderPw}
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                    <span>{t.adminRemember}</span>
                  </label>
                  <span className="text-blue-600 hover:underline cursor-pointer">{t.adminForgot}</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-gta-600 hover:from-blue-700 hover:to-gta-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center space-x-2 group"
                >
                  <span>{t.adminBtnSignIn}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

              </form>

              <div className="pt-4 border-t border-slate-100 text-center">
                <div className="inline-flex items-center space-x-1 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>{t.adminSecFooter}</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================================
  // 로그인 성공 후 관리자 대시보드 화면
  // =========================================================================
  const filtered = consultations.filter(item => {
    const matchCat = filterCategory === '전체' || item.category === filterCategory;
    const matchStat = filterStatus === '전체' || item.status === filterStatus;
    const matchSearch =
      item.applicantName.includes(searchTerm) ||
      item.phone.includes(searchTerm) ||
      item.title.includes(searchTerm);
    return matchCat && matchStat && matchSearch;
  });

  const totalCount = consultations.length;
  const pendingCount = consultations.filter(c => c.status === '접수').length;
  const inProgressCount = consultations.filter(c => c.status === '진행중').length;
  const completedCount = consultations.filter(c => c.status === '완료').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gta-900 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black">
              {lang === 'ko' ? 'GTA 거제시 납세자회 EMR 관리 포털' : 'GTA Geoje Taxpayers Association EMR Portal'}
            </h1>
            <p className="text-xs text-slate-300">
              {lang === 'ko' ? '실시간 세무 상담 접수 및 DB 일괄 관리 대시보드' : 'Real-time Tax Counseling & Database Management Dashboard'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchConsultations}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{lang === 'ko' ? '새로고침' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow flex items-center space-x-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{lang === 'ko' ? '접수 내역 엑셀 다운로드 (.xlsx)' : 'Export Excel (.xlsx)'}</span>
          </button>

          <button
            onClick={() => setAuthenticated(false)}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg"
          >
            {lang === 'ko' ? '로그아웃' : 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500">{lang === 'ko' ? '전체 상담 접수' : 'Total Consultations'}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
        </div>
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-sm">
          <div className="text-xs font-bold text-blue-700">{lang === 'ko' ? '신규 미처리 (접수)' : 'New Received'}</div>
          <div className="text-2xl font-black text-blue-900 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm">
          <div className="text-xs font-bold text-amber-700">{lang === 'ko' ? '세무사 검토 중' : 'In Progress'}</div>
          <div className="text-2xl font-black text-amber-900 mt-1">{inProgressCount}</div>
        </div>
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 shadow-sm">
          <div className="text-xs font-bold text-emerald-700">{lang === 'ko' ? '상담 답변 완료' : 'Completed'}</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-600">{lang === 'ko' ? '상태 필터:' : 'Status Filter:'}</span>
          {['전체', '접수', '진행중', '완료'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
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
            placeholder={lang === 'ko' ? '이름 / 연락처 / 제목 검색' : 'Search Name / Phone / Title'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs"
          />
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">{lang === 'ko' ? '접수번호' : 'ID'}</th>
                <th className="px-6 py-4">{lang === 'ko' ? '신청자 / 연락처' : 'Applicant / Phone'}</th>
                <th className="px-6 py-4">{lang === 'ko' ? '세무 유형' : 'Category'}</th>
                <th className="px-6 py-4">{lang === 'ko' ? '제목 & 내용' : 'Title & Content'}</th>
                <th className="px-6 py-4">{lang === 'ko' ? '처리 상태' : 'Status'}</th>
                <th className="px-6 py-4 text-right">{lang === 'ko' ? '관리 / 수정' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map(item => (
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
                  <td className="px-6 py-4 max-w-xs">
                    <div className="font-bold text-slate-900 truncate">{item.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{item.content}</div>
                    {item.adminMemo && (
                      <div className="text-xs text-blue-700 font-medium mt-1 bg-blue-50 p-1.5 rounded">
                        💬 {lang === 'ko' ? '세무사 메모:' : 'Note:'} {item.adminMemo}
                      </div>
                    )}
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
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      {lang === 'ko' ? '상태 변경' : 'Edit Status'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {lang === 'ko' ? '상담 처리 상태 & 답변 등록' : 'Update Consultation Status & Reply'}
            </h3>
            <p className="text-xs text-slate-500">ID: {editingId}</p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ko' ? '상태 변경' : 'Status'}
              </label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              >
                <option value="접수">{lang === 'ko' ? '접수 (미처리)' : 'Received'}</option>
                <option value="진행중">{lang === 'ko' ? '진행중 (세무사 검토 중)' : 'In Progress'}</option>
                <option value="완료">{lang === 'ko' ? '완료 (상담 답변 등록)' : 'Completed'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ko' ? '전문 세무사 답변 메모' : 'Tax Accountant Note'}
              </label>
              <textarea
                rows={4}
                placeholder={lang === 'ko' ? '신청자에게 보여질 세무 상담 검토 결과 메모를 입력하세요.' : 'Enter review notes for the applicant.'}
                value={editMemo}
                onChange={e => setEditMemo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
              >
                {lang === 'ko' ? '취소' : 'Cancel'}
              </button>
              <button
                onClick={() => handleUpdateStatus(editingId)}
                className="px-4 py-2 bg-gta-600 text-white font-bold text-xs rounded-lg hover:bg-gta-700"
              >
                {lang === 'ko' ? '저장하기' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
