'use client';

import { useState } from 'react';
import { Search, Lock, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Consultation } from '@/lib/db';

export default function LookupPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Consultation[] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setResults(null);

    try {
      const res = await fetch('/api/consultations/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const json = await res.json();
      if (json.success) {
        if (json.data.length === 0) {
          setErrorMsg('일치하는 상담 내역이 없습니다. 연락처와 비밀번호를 확인해주세요.');
        } else {
          setResults(json.data);
        }
      } else {
        setErrorMsg(json.message || '조회 실패');
      }
    } catch (err: any) {
      setErrorMsg('서버와 통신할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '완료':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>상담 완료</span></span>;
      case '진행중':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>세무사 검토 중</span></span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1"><FileText className="w-3.5 h-3.5" /><span>접수 완료</span></span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="inline-flex items-center space-x-2 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full">
            <Search className="w-3.5 h-3.5" />
            <span>실시간 상담 처리 현황 확인</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">세무 상담 접수 내역 조회</h1>
          <p className="text-slate-600 text-sm">
            상담 신청 시 작성하신 **휴대폰 번호**와 **비밀번호(4자리)**를 입력하시면 진행 상태를 확인하실 수 있습니다.
          </p>
        </div>

        <form onSubmit={handleLookup} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">휴대폰 번호</label>
            <input
              type="tel"
              required
              placeholder="010-1234-5678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">비밀번호 (4자리)</label>
            <input
              type="password"
              required
              maxLength={4}
              placeholder="비밀번호 4자리"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gta-600 hover:bg-gta-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors shadow-md"
            >
              {loading ? '조회 중...' : '상담내역 조회하기'}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Results Display */}
      {results && results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">조회된 상담 내역 ({results.length}건)</h2>
          {results.map(item => (
            <div key={item.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                    {item.id}
                  </span>
                  <span className="text-xs bg-gta-50 text-gta-800 font-bold px-2 py-0.5 rounded border border-gta-200">
                    {item.category}
                  </span>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-700 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {item.content}
                </p>
              </div>

              {/* Admin Feedback Reply Memo */}
              {item.adminMemo && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-1">
                  <div className="text-xs font-bold text-gta-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-gta-600" />
                    <span>거제시 납세자회 전문 세무사 답변 메모:</span>
                  </div>
                  <p className="text-sm text-gta-900 font-medium pl-5">{item.adminMemo}</p>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>신청자: {item.applicantName} 님</span>
                <span>신청일시: {item.createdAt}</span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
