'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Notice } from '@/lib/db';
import { Megaphone, X, Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function NoticePopupModal() {
  const pathname = usePathname();
  const [activeNotices, setActiveNotices] = useState<Notice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hideToday, setHideToday] = useState(false);

  useEffect(() => {
    // Never show on admin screens
    if (pathname && pathname.startsWith('/admin')) {
      return;
    }

    const fetchActivePopups = async () => {
      try {
        const res = await fetch('/api/notices?active_popup=true');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const todayStr = new Date().toISOString().slice(0, 10);
          
          // Filter out notices dismissed for today
          const filtered = json.data.filter((n: Notice) => {
            const dismissedDate = localStorage.getItem(`gta_popup_dismiss_${n.id}`);
            return dismissedDate !== todayStr;
          });

          if (filtered.length > 0) {
            setActiveNotices(filtered);
            setCurrentIndex(0);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error('Failed to load active popup notices:', err);
      }
    };

    fetchActivePopups();
  }, [pathname]);

  if (!isOpen || activeNotices.length === 0) return null;

  const currentNotice = activeNotices[currentIndex];
  if (!currentNotice) return null;

  const handleClose = () => {
    if (hideToday && currentNotice) {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`gta_popup_dismiss_${currentNotice.id}`, todayStr);
    }
    
    // If there are more notices that weren't closed, advance or close
    if (activeNotices.length > 1 && currentIndex < activeNotices.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setHideToday(false);
    } else {
      setIsOpen(false);
    }
  };

  const handleCloseAll = () => {
    if (hideToday) {
      const todayStr = new Date().toISOString().slice(0, 10);
      activeNotices.forEach(n => {
        localStorage.setItem(`gta_popup_dismiss_${n.id}`, todayStr);
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 print:hidden">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-notice-title"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-gta-900 to-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-amber-400 text-gta-950 p-1.5 rounded-lg">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-300 tracking-wider uppercase block">
                GTA Official Notice
              </span>
              <h4 className="text-sm font-extrabold text-white">
                알림 공지사항
              </h4>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {activeNotices.length > 1 && (
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-mono">
                {currentIndex + 1} / {activeNotices.length}
              </span>
            )}
            <button
              onClick={handleCloseAll}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {currentNotice.category}
              </span>
              {currentNotice.popupStartDate && currentNotice.popupEndDate && (
                <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    공지 기간: {currentNotice.popupStartDate} ~ {currentNotice.popupEndDate}
                  </span>
                </span>
              )}
            </div>

            <h3 id="popup-notice-title" className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {currentNotice.title}
            </h3>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
            {currentNotice.content}
          </div>

          {/* Pagination Navigation if multiple notices */}
          {activeNotices.length > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex(prev => Math.max(0, prev - 1));
                  setHideToday(false);
                }}
                className="disabled:opacity-30 disabled:cursor-not-allowed hover:text-gta-700 flex items-center space-x-1 font-bold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전 공지</span>
              </button>

              <div className="flex space-x-1.5">
                {activeNotices.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setHideToday(false);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-gta-600 w-5' : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to notice ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={currentIndex === activeNotices.length - 1}
                onClick={() => {
                  setCurrentIndex(prev => Math.min(activeNotices.length - 1, prev + 1));
                  setHideToday(false);
                }}
                className="disabled:opacity-30 disabled:cursor-not-allowed hover:text-gta-700 flex items-center space-x-1 font-bold cursor-pointer"
              >
                <span>다음 공지</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <label className="inline-flex items-center space-x-2 text-slate-600 font-semibold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideToday}
              onChange={e => setHideToday(e.target.checked)}
              className="w-4 h-4 rounded text-gta-600 focus:ring-gta-500 cursor-pointer"
            />
            <span>오늘 하루 이 창을 열지 않음</span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
