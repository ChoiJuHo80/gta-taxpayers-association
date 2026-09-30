'use client';

import { useState, useEffect } from 'react';
import { Pin, Download, Search, FileText, HelpCircle, AlertCircle } from 'lucide-react';
import { Notice } from '@/lib/db';

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activeCategory, setActiveCategory] = useState<'전체' | '공지' | '세무자료' | 'FAQ'>('전체');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Initial Seed Notices
    setNotices([
      {
        id: 'NOT-001',
        title: '[공지] 2026년 거제시 납세자회 세무 무료 상담의 날 개최 안내',
        category: '공지',
        content: '거제 납세자 회원 여러분을 위한 2026년 하반기 무료 세무 상담의 날이 개최됩니다. 양도소득세 및 소득세 상담을 사전 접수하실 수 있습니다.',
        isPinned: true,
        views: 342,
        createdAt: '2026-09-01',
      },
      {
        id: 'NOT-002',
        title: '[세무자료] 2026 개정 세법 핵심 요약 및 납세자 안심 안내서 (PDF)',
        category: '세무자료',
        content: '양도소득세 비과세 특례 및 1가구 2주택 공제 한도 개정 주요 사항을 정리한 핵심 세무 해설 자료집입니다.',
        isPinned: false,
        views: 189,
        createdAt: '2026-09-05',
      },
      {
        id: 'NOT-003',
        title: '[FAQ] 세무 상담 신청 후 처리 절차와 기간은 어떻게 되나요?',
        category: 'FAQ',
        content: '온라인 상담 접수 완료 후 담당 전문 세무사가 1~2일 이내에 검토하여 처리 상태와 답변 메모를 제공합니다.',
        isPinned: false,
        views: 512,
        createdAt: '2026-09-12',
      },
      {
        id: 'NOT-004',
        title: '[세무자료] 개인사업자 종합소득세 절세 체크리스트 가이드',
        category: '세무자료',
        content: '거제 지역 소상공인 및 개인사업자 필수 공제 항목 체크리스트 서식입니다.',
        isPinned: false,
        views: 230,
        createdAt: '2026-09-14',
      }
    ]);
  }, []);

  const filteredNotices = notices.filter(n => {
    const matchesCategory = activeCategory === '전체' || n.category === activeCategory;
    const matchesSearch = n.title.includes(searchTerm) || n.content.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900">알림 마당 & 세무 자료실</h1>
        <p className="text-slate-600">거제시 납세자회의 주요 공지사항과 개정 세무 자료 및 FAQ를 확인하세요.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex space-x-2">
          {(['전체', '공지', '세무자료', 'FAQ'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-gta-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="제목 또는 내용 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-gta-500"
          />
        </div>

      </div>

      {/* Notices List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {filteredNotices.map(notice => (
          <div key={notice.id} className="p-6 hover:bg-slate-50 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {notice.isPinned && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Pin className="w-3 h-3" />
                    <span>고정 공지</span>
                  </span>
                )}
                <span className="text-xs font-bold text-gta-700 bg-gta-50 px-2.5 py-0.5 rounded border border-gta-200">
                  {notice.category}
                </span>
                <span className="text-xs text-slate-400">{notice.createdAt}</span>
              </div>
              <span className="text-xs text-slate-400">조회수 {notice.views}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{notice.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{notice.content}</p>

            {notice.category === '세무자료' && (
              <div className="pt-2">
                <button
                  onClick={() => alert(`'${notice.title}' 세무 자료 다운로드가 정상 완료되었습니다.`)}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-gta-600 bg-gta-50 hover:bg-gta-100 px-3 py-1.5 rounded-lg border border-gta-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>세무 가이드 자료 다운로드 (PDF)</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
