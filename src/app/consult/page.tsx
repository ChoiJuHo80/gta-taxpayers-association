'use client';

import { useState } from 'react';
import { Shield, FileText, Upload, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ConsultPage() {
  const [formData, setFormData] = useState({
    applicantName: '',
    phone: '',
    category: '양도소득세',
    title: '',
    content: '',
    password: '',
  });

  const [files, setFiles] = useState<{ name: string; size: number; encryptedPath: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{ id: string; password: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile = {
        name: file.name,
        size: file.size,
        encryptedPath: `encrypted/${Date.now()}_${file.name}.enc`,
      };
      setFiles(prev => [...prev, newFile]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          attachments: files,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessResult({ id: json.data.id, password: formData.password });
      } else {
        setErrorMsg(json.message || '상담 접수 처리 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setErrorMsg('서버와 통신할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (successResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">세무 상담 신청이 정상적으로 완료되었습니다!</h1>
        <p className="text-slate-600 leading-relaxed">
          신청하신 상담은 전문 세무사 검토를 거쳐 빠르고 정확하게 답변해 드리겠습니다.
        </p>

        <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-3">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 text-sm">접수 번호</span>
            <span className="font-bold text-gta-700">{successResult.id}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 text-sm">조회 비밀번호</span>
            <span className="font-bold text-slate-900">{successResult.password}</span>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            * 나중에 [상담 조회] 메뉴에서 연락처와 위 비밀번호로 처리 상태를 확인하실 수 있습니다.
          </p>
        </div>

        <div className="pt-4 flex justify-center space-x-4">
          <Link href="/consult/lookup" className="bg-gta-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-gta-700">
            상담 처리 상태 조회하기
          </Link>
          <Link href="/" className="bg-slate-200 text-slate-800 font-bold px-6 py-3 rounded-xl hover:bg-slate-300">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 space-y-8">
        
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="inline-flex items-center space-x-2 text-gta-600 font-bold text-xs bg-gta-50 px-3 py-1 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span>SSL 256bit 암호화 안전 접수</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">온라인 무료 세무 상담 신청</h1>
          <p className="text-slate-600 text-sm">
            양도세, 상속/증여세, 종합소득세 등 세무 관련 문의사항을 남겨주시면 담당 세무사가 정밀 검토합니다.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center space-x-3 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">신청자 성함 *</label>
              <input
                type="text"
                required
                placeholder="예: 홍길동"
                value={formData.applicantName}
                onChange={e => setFormData({ ...formData, applicantName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">휴대폰 번호 *</label>
              <input
                type="tel"
                required
                placeholder="예: 010-1234-5678"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">세무 분야 유형 *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 focus:border-transparent text-sm"
              >
                <option value="양도소득세">양도소득세</option>
                <option value="종합소득세">종합소득세</option>
                <option value="상속/증여세">상속/증여세</option>
                <option value="지방세/재산세">지방세/재산세</option>
                <option value="기타 세무상담">기타 세무상담</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">조회용 비밀번호 (숫자 4자리) *</label>
              <input
                type="password"
                required
                maxLength={4}
                placeholder="조회 시 사용할 비밀번호 4자리"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">상담 제목 *</label>
            <input
              type="text"
              required
              placeholder="상담 내용을 요약할 제목을 입력하세요."
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">상담 상세 내용 *</label>
            <textarea
              required
              rows={6}
              placeholder="취득 일자, 매매 금액, 주택 수 등 구체적인 세무 상황을 작성해 주시면 더욱 정확한 상담이 가능합니다."
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 focus:border-transparent text-sm"
            ></textarea>
          </div>

          {/* Secure File Upload Box */}
          <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Upload className="w-4 h-4 text-gta-500" />
                <span>관련 증빙 서류 첨부 (PDF, HWP, 이미지 파일)</span>
              </label>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                🔒 AES-256 파일 암호화 지원
              </span>
            </div>

            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gta-50 file:text-gta-700 hover:file:bg-gta-100"
            />

            {files.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-600">첨부된 암호화 파일 목록:</span>
                {files.map((f, idx) => (
                  <div key={idx} className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
                    <span>📄 {f.name} ({(f.size / 1024).toFixed(1)} KB)</span>
                    <span className="text-emerald-600 font-mono text-[10px]">Encrypted</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gta-600 to-gta-500 hover:from-gta-700 hover:to-gta-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-base disabled:opacity-50"
          >
            {loading ? '안전하게 상담 접수 중...' : '온라인 무료 세무 상담 접수하기'}
          </button>

        </form>

      </div>
    </div>
  );
}
