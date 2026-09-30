'use client';

import { useState, useEffect } from 'react';
import { Pin, Download, Search, FileText, Eye, User, Calendar, ArrowLeft, LayoutList, LayoutGrid } from 'lucide-react';
import { Notice } from '@/lib/db';
import { translations, Language } from '@/lib/i18n';

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [searchTarget, setSearchTarget] = useState<'subject' | 'contents' | 'name'>('subject');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [viewMode, setViewMode] = useState<'classic' | 'modern'>('classic');
  const [lang, setLang] = useState<Language>('en'); // Default to English for Foreign Taxpayers

  useEffect(() => {
    const savedLang = (localStorage.getItem('gta_lang') as Language) || 'en';
    setLang(savedLang);

    const handleLangChange = (e: CustomEvent<Language>) => {
      setLang(e.detail);
    };

    window.addEventListener('langChange' as any, handleLangChange);
    fetchNotices();

    return () => window.removeEventListener('langChange' as any, handleLangChange);
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notices');
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setNotices(json.data);
      } else {
        // Fallback default notices if DB empty
        setNotices([
          {
            id: 'NOT-000',
            title: 'About Login',
            author: 'GTA',
            authorEmail: 'gta@gtakorea.org',
            category: 'Notice',
            content: 'Thank you for your joining GTA.(Geoje Taxpayers Association)\n\nIf you would like to check your Receipt for payment of tax,\nPlease Login to our website.\n\nNAME: Write down your full name with capital letters and blank such as your alien registration card. (or Membership Card ID)\n(ex: KIM SILVIA)\n\nNUMBER: Write down your Alien Registration Number with hyphen. (or Membership Card Password)\n(ex: 820012-3932521)',
            isPinned: true,
            views: 12396,
            createdAt: '2007-02-15 17:26:36',
          },
          {
            id: 'NOT-001',
            title: '2026 Free Tax Consultation Day for Geoje Foreign Taxpayers',
            author: 'GTA',
            authorEmail: 'gta@gtakorea.org',
            category: '공지',
            content: 'Geoje Taxpayers Association provides free tax counseling sessions for local and foreign taxpayers. Please register via our online consultation system.',
            isPinned: true,
            views: 342,
            createdAt: '2026-09-01',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (notice: Notice) => {
    setSelectedNotice(notice);
    // Trigger view count increment
    try {
      const res = await fetch(`/api/notices/${notice.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedNotice(json.data);
        setNotices(prev => prev.map(n => n.id === notice.id ? { ...n, views: json.data.views } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotices = notices.filter(n => {
    const cat = activeCategory.toLowerCase();
    const matchesCategory = activeCategory === '전체' || activeCategory === 'All' || n.category.toLowerCase().includes(cat);
    
    let matchesSearch = true;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      if (searchTarget === 'subject') {
        matchesSearch = n.title.toLowerCase().includes(q);
      } else if (searchTarget === 'contents') {
        matchesSearch = n.content.toLowerCase().includes(q);
      } else if (searchTarget === 'name') {
        matchesSearch = (n.author || '').toLowerCase().includes(q) || (n.authorEmail || '').toLowerCase().includes(q);
      }
    }
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900">
          {lang === 'ko' ? '알림 마당 & 세무 자료실' : 'Notices & Announcements'}
        </h1>
        <p className="text-slate-600 text-sm">
          {lang === 'ko'
            ? '거제시 납세자회의 주요 공지사항과 세무 안내 자료를 확인하실 수 있습니다.'
            : 'Check important announcements, tax guides, and official updates from Geoje Taxpayers Association.'}
        </p>
      </div>

      {/* Classic Board Header Banner (Matching Old Website Style) */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-xl p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-2 text-lg font-bold">
          <span className="opacity-90">About GTA</span>
          <span className="opacity-60">|</span>
          <span className="text-amber-300">Notice</span>
        </div>
        
        <div className="flex items-center space-x-2 bg-white/10 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('classic')}
            className={`px-3 py-1 text-xs font-bold rounded flex items-center space-x-1 ${viewMode === 'classic' ? 'bg-white text-blue-900 shadow' : 'text-white hover:bg-white/10'}`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>{lang === 'ko' ? '클래식 게시판' : 'Classic List'}</span>
          </button>
          <button
            onClick={() => setViewMode('modern')}
            className={`px-3 py-1 text-xs font-bold rounded flex items-center space-x-1 ${viewMode === 'modern' ? 'bg-white text-blue-900 shadow' : 'text-white hover:bg-white/10'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{lang === 'ko' ? '카드형 보기' : 'Card Grid'}</span>
          </button>
        </div>
      </div>

      {/* Notice Detail Modal / Embedded View */}
      {selectedNotice ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all animate-fadeIn">
          
          {/* Detail Sub Header Banner */}
          <div className="bg-sky-600 text-white px-6 py-3 font-bold flex justify-between items-center text-sm">
            <span>About GTA | Notice Detail</span>
            <button
              onClick={() => setSelectedNotice(null)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'ko' ? '목록으로 돌아가기' : 'Back to Notice List'}</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Meta bar matching classic website format */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-slate-700">
                <div>
                  <span className="font-bold text-slate-500">name : </span>
                  <span className="font-bold text-slate-900">{selectedNotice.author || 'GTA'}</span>
                  {selectedNotice.authorEmail && (
                    <span className="text-slate-500"> ({selectedNotice.authorEmail})</span>
                  )}
                </div>

                <div className="text-slate-400 font-mono text-xs flex items-center space-x-4">
                  <span>{selectedNotice.createdAt}</span>
                  <span>|</span>
                  <span className="font-bold text-blue-600">hit : {selectedNotice.views}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center space-x-2">
                <span className="font-bold text-slate-500">subject : </span>
                <span className="font-extrabold text-slate-900 text-base">{selectedNotice.title}</span>
                {selectedNotice.isPinned && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    HOT
                  </span>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200 min-h-[220px]">
              <div className="prose max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                {selectedNotice.content}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedNotice(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow transition-all"
              >
                {lang === 'ko' ? '목록으로 돌아가기' : 'Close & Return to List'}
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* List View */
        <div className="space-y-6">

          {/* Classic Table View (Matching Screenshot) */}
          {viewMode === 'classic' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5 text-center w-16">num</th>
                      <th className="px-4 py-3.5 text-center w-16">file</th>
                      <th className="px-6 py-3.5">subject</th>
                      <th className="px-4 py-3.5 text-center w-36">data</th>
                      <th className="px-4 py-3.5 text-center w-24">count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          Loading notices...
                        </td>
                      </tr>
                    ) : filteredNotices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          {lang === 'ko' ? '등록된 공지사항이 없습니다.' : 'No notices found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredNotices.map((notice, idx) => (
                        <tr
                          key={notice.id}
                          onClick={() => handleOpenDetail(notice)}
                          className="hover:bg-sky-50/70 transition-colors cursor-pointer group"
                        >
                          <td className="px-4 py-3.5 text-center font-mono text-slate-500 font-medium">
                            {notice.isPinned ? (
                              <Pin className="w-3.5 h-3.5 text-red-500 inline-block" />
                            ) : (
                              filteredNotices.length - idx
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors inline-block" />
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                {notice.title}
                              </span>
                              {notice.isPinned && (
                                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded uppercase">
                                  HOT
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono text-xs text-slate-500">
                            {notice.createdAt.split(' ')[0]}
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono text-xs text-slate-600 font-bold">
                            {notice.views}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Modern Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotices.map(notice => (
                <div
                  key={notice.id}
                  onClick={() => handleOpenDetail(notice)}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {notice.isPinned && (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <Pin className="w-3 h-3" />
                          <span>Pinned</span>
                        </span>
                      )}
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {notice.category}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{notice.createdAt.split(' ')[0]}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    {notice.title}
                  </h3>
                  
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
                    <span>by {notice.author || 'GTA'}</span>
                    <span>Hits: {notice.views}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Bar matching screenshot (radio options name/subject/contents, input box, SEARCH button) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs">
            <div className="flex items-center space-x-4 font-medium text-slate-700">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="searchTarget"
                  checked={searchTarget === 'name'}
                  onChange={() => setSearchTarget('name')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>name</span>
              </label>

              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="searchTarget"
                  checked={searchTarget === 'subject'}
                  onChange={() => setSearchTarget('subject')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>subject</span>
              </label>

              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="searchTarget"
                  checked={searchTarget === 'contents'}
                  onChange={() => setSearchTarget('contents')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>contents</span>
              </label>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search text..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              <button
                onClick={() => {}}
                className="bg-lime-600 hover:bg-lime-700 text-white font-extrabold px-4 py-1.5 rounded uppercase tracking-wider text-xs shadow transition-all shrink-0"
              >
                SEARCH
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
