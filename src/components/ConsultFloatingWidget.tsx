'use client';

import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { translations, Language } from '@/lib/i18n';

export default function ConsultFloatingWidget() {
  const [lang, setLang] = useState<Language>('en');

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

  return (
    <div className="fixed bottom-24 right-4 sm:top-36 sm:bottom-auto sm:right-8 z-40 animate-in slide-in-from-bottom-5 sm:slide-in-from-top-5 duration-300">
      <Link
        href="/consult"
        className="bg-gradient-to-r from-blue-700 via-gta-600 to-blue-600 hover:from-blue-800 hover:to-gta-700 text-white font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-2xl hover:shadow-blue-500/30 flex items-center space-x-2 border-2 border-white/80 transition-all hover:scale-105 active:scale-95 group shrink-0"
        title="Apply for Free Tax Counsel"
      >
        <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center shrink-0">
          <FileText className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="tracking-tight whitespace-nowrap">
          {lang === 'ko' ? '무료 세무 상담 신청' : 'Free Tax Counsel'}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
