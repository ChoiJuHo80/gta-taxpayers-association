'use client';

import Link from 'next/link';
import { Shield, FileText, CheckCircle2, ArrowRight, Phone, Share2, Sparkles, Lock, MapPin, X, Plus, Bell, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { translations, Language } from '@/lib/i18n';
import { Notice } from '@/lib/db';

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<Language>('en'); // Default to English per Brochure standard
  const [showNoticePopup, setShowNoticePopup] = useState(true);
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>('NOT-000'); // Default expand About Login
  const [latestNotices, setLatestNotices] = useState<Notice[]>([
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
    }
  ]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return dateStr.split('T')[0].split(' ')[0];
  };

  useEffect(() => {
    const savedLang = (localStorage.getItem('gta_lang') as Language) || 'en';
    setLang(savedLang);

    const handleLangChange = (e: CustomEvent<Language>) => {
      setLang(e.detail);
    };

    window.addEventListener('langChange' as any, handleLangChange);

    // Fetch latest notices for popup
    fetch('/api/notices')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data.length > 0) {
          setLatestNotices(json.data.slice(0, 5));
          if (json.data[0]) {
            setExpandedNoticeId(json.data[0].id);
          }
        }
      })
      .catch(err => console.error(err));

    return () => window.removeEventListener('langChange' as any, handleLangChange);
  }, []);

  const t = translations[lang];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.brandName,
          text: t.heroSub,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share error', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-16 pb-20 relative">
      
      {/* Top-Left Floating Notice Quick Shortcut Popup (Accordion Expandable) */}
      {showNoticePopup && (
        <div className="fixed top-24 left-4 sm:left-8 z-40 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border-2 border-sky-400 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
          
          {/* Header Bar */}
          <div className="bg-sky-50 px-4 py-3 border-b border-sky-200 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bell className="w-4.5 h-4.5 text-sky-600 animate-bounce" />
              <span className="font-extrabold text-sky-950 text-base tracking-wide">Notice</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                href="/notices"
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center space-x-0.5 bg-red-50 px-2 py-0.5 rounded border border-red-200"
              >
                <span>+ MORE</span>
              </Link>
              <button
                onClick={() => setShowNoticePopup(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
                title="Close Popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notice Quick Accordion List */}
          <div className="p-3 space-y-2 max-h-96 overflow-y-auto divide-y divide-slate-100">
            {latestNotices.map((n) => {
              const isExpanded = expandedNoticeId === n.id;
              return (
                <div key={n.id} className="pt-2 first:pt-0">
                  
                  {/* Clickable Header Row */}
                  <div
                    onClick={() => setExpandedNoticeId(isExpanded ? null : n.id)}
                    className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2 overflow-hidden pr-2">
                      <span className="text-sky-600 font-bold shrink-0">▪</span>
                      <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-sky-600 truncate">
                        {n.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="font-mono text-[11px] text-slate-400">
                        {formatDate(n.createdAt)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-sky-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
                      )}
                    </div>
                  </div>

                  {/* Inline Expanded Content View */}
                  {isExpanded && (
                    <div className="mt-2 p-3.5 bg-slate-50 rounded-xl border border-sky-200 text-xs space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200 pb-1.5">
                        <span>name : <strong className="text-slate-800">{n.author || 'GTA'}</strong></span>
                        <span className="font-mono text-sky-600 font-bold">hit : {n.views}</span>
                      </div>

                      <div className="text-slate-700 whitespace-pre-wrap leading-relaxed font-sans text-xs">
                        {n.content}
                      </div>

                      <div className="pt-1 flex justify-end">
                        <Link
                          href="/notices"
                          className="inline-flex items-center space-x-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 hover:underline"
                        >
                          <Eye className="w-3 h-3" />
                          <span>전체 게시판에서 확인 →</span>
                        </Link>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Bottom Footer bar */}
          <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[11px]">GTA Official Notice</span>
            <button
              onClick={() => setShowNoticePopup(false)}
              className="text-[11px] text-slate-500 hover:text-slate-900 font-bold"
            >
              [ ✕ 닫기 / Close ]
            </button>
          </div>

        </div>
      )}

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gta-900 via-gta-800 to-gta-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Main Slogan Banner (Easy and Prompt Tax Solution) */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-sky-400 via-blue-200 to-cyan-300 bg-clip-text text-transparent font-black italic text-2xl sm:text-3xl lg:text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-wide">
              Easy and Prompt Tax Solution
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-gta-500/20 border border-gta-500/40 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.heroBadge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                {t.heroTitle1}<br />
                <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
                  {t.heroTitle2}
                </span><br />
                {t.heroTitle3}
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                {t.heroSub}
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/tax-guide?tab=income-tax-table"
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all text-center flex items-center justify-center space-x-2"
                >
                  <FileText className="w-5 h-5" />
                  <span>{t.navIncomeTaxTable}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                
                <button
                  onClick={handleShare}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-4 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copied ? t.heroShareCopied : t.heroBtnShare}</span>
                </button>
              </div>
            </div>

            {/* Quick Stats / Status Card */}
            <div className="lg:col-span-5">
              <div className="glass-dark p-8 rounded-2xl border border-slate-700/60 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-amber-400" />
                    <div>
                      <h3 className="font-bold text-white text-lg">{t.heroStatusTitle}</h3>
                      <p className="text-xs text-slate-400">{t.heroStatusSub}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                    {t.heroStatusAvailable}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                    <div className="text-2xl font-black text-amber-400">1,250+</div>
                    <div className="text-xs text-slate-400 mt-1">{t.heroCountLabel}</div>
                  </div>
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                    <div className="text-2xl font-black text-blue-400">99.8%</div>
                    <div className="text-xs text-slate-400 mt-1">{t.heroSatLabel}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-200 leading-relaxed">
                    {t.heroSecNotice}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Special Highlight Banner: Benefit of GTA Members */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-sky-900 text-white p-8 rounded-3xl shadow-xl border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 text-purple-300 text-xs font-extrabold tracking-wider uppercase bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
              <span>› Benefit of GTA Members ‹</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              A 3% Additional Tax Deduction & Convenient Website
            </h2>
            <p className="text-sm text-slate-300">
              {lang === 'ko'
                ? '거제 납세자 회원 가입 시 3% 추가 세액 공제 혜택과 원스톱 온라인 세무 상담 웹사이트를 편리하게 이용하실 수 있습니다.'
                : 'Enjoy an exclusive 3% additional tax deduction for GTA members alongside our convenient, automated tax management website.'}
            </p>
          </div>

          <Link
            href="/about?tab=benefit"
            className="bg-white text-purple-950 hover:bg-purple-100 font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all shrink-0 flex items-center space-x-2"
          >
            <span>{lang === 'ko' ? '혜택 자세히 보기' : 'Learn Member Benefits'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Category Overview Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.serviceTitle}</h2>
          <p className="text-slate-600 mt-2">{t.serviceSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-panel p-8 rounded-2xl hover:shadow-xl transition-all duration-200 border border-slate-200 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-gta-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t.catAbout}</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Learn about GTA's background since 2005, 3% taxpayer association tax deduction, and office location in Geoje.
            </p>
            <Link href="/about" className="text-gta-600 font-bold text-sm flex items-center hover:underline">
              <span>Explore About GTA</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="glass-panel p-8 rounded-2xl hover:shadow-xl transition-all duration-200 border border-slate-200 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t.catTaxLaw}</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Review Korean income tax law for expatriates (Progressive vs Flat Tax 19%) and search tax treaties with 99 countries.
            </p>
            <Link href="/tax-law" className="text-emerald-600 font-bold text-sm flex items-center hover:underline">
              <span>View Tax Law & Treaties</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="glass-panel p-8 rounded-2xl hover:shadow-xl transition-all duration-200 border border-slate-200 group">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t.catTaxGuide}</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Check tax calculation table ($1=KRW 1,300), necessary joining documents, 5-step tax flow, and deduction items.
            </p>
            <Link href="/tax-guide" className="text-amber-600 font-bold text-sm flex items-center hover:underline">
              <span>Check Tax Guide</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

        </div>
      </section>

      {/* Upgraded Map Location Card */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 text-gta-600 font-bold text-sm">
                <MapPin className="w-4 h-4" />
                <span>{t.mapTag}</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                {t.mapTitle}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {t.mapDesc}
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gta-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900">{t.mapAddrHeader}</h4>
                    <p className="text-sm text-slate-600">{t.mapAddr}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gta-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900">{t.mapPhoneHeader}</h4>
                    <p className="text-sm text-slate-600">{t.mapPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Container */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-4">
              <div className="h-64 rounded-xl overflow-hidden relative border border-slate-300 shadow-inner group">
                <iframe
                  title="GTA Geoje Office Google Maps"
                  src={`https://maps.google.com/maps?q=34.8806,128.6211&hl=${lang === 'en' ? 'en' : 'ko'}&z=14&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 gap-2">
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  🌐 {t.mapCert}
                </span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=34.8806,128.6211&hl=${lang}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gta-600 font-bold hover:underline flex items-center space-x-1"
                >
                  <span>{t.mapDirections}</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
