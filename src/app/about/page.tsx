'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, Target, MapPin, CheckCircle, ExternalLink, Award, FileCheck, Globe, Phone, Mail, Printer, Building } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';

function AboutContent() {
  const [lang, setLang] = useState<Language>('en');
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'introduction';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    const savedLang = (localStorage.getItem('gta_lang') as Language) || 'en';
    setLang(savedLang);

    const handleLangChange = (e: CustomEvent<Language>) => {
      setLang(e.detail);
    };

    window.addEventListener('langChange' as any, handleLangChange);
    return () => window.removeEventListener('langChange' as any, handleLangChange);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const t = translations[lang];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Category Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gta-100 text-gta-700 text-xs font-bold px-3.5 py-1.5 rounded-full">
          <Building className="w-4 h-4 text-gta-600" />
          <span>ABOUT US</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          {lang === 'ko' ? '협회 소개 & 안내' : 'About Geoje Taxpayers Association'}
        </h1>
        <p className="text-slate-600 leading-relaxed text-base">
          {t.footerDesc}
        </p>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex justify-center border-b border-slate-200">
        <div className="flex space-x-2 sm:space-x-4">
          <button
            onClick={() => setActiveTab('introduction')}
            className={`py-3 px-6 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'introduction'
                ? 'border-gta-600 text-gta-600 bg-gta-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📌 {t.navIntroduction}</span>
          </button>

          <button
            onClick={() => setActiveTab('benefit')}
            className={`py-3 px-6 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'benefit'
                ? 'border-gta-600 text-gta-600 bg-gta-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🎁 {t.navBenefit}</span>
          </button>

          <button
            onClick={() => setActiveTab('location')}
            className={`py-3 px-6 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'location'
                ? 'border-gta-600 text-gta-600 bg-gta-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📍 {t.navLocation}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Introduction (Brochure Page 2) */}
      {activeTab === 'introduction' && (
        <div className="space-y-12 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-gta-900 via-gta-800 to-gta-900 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <Shield className="w-96 h-96" />
            </div>
            
            <div className="max-w-3xl space-y-6 relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  Authorized by National Tax Service
                </span>
                <a
                  href="https://www.nts.go.kr/english/main.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full flex items-center space-x-1 transition-colors shadow-sm"
                >
                  <span>🏛️ NTS National Tax Service Portal ↗</span>
                </a>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black">
                Foreigner’s Best Tax Partner GTA
              </h2>
              <p className="text-slate-200 text-base leading-relaxed">
                GTA was authorized by the National Tax Service of Republic of Korea and organized on June 16th, 2005. We were organized to assist and advice for foreigners’ Income tax matters.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">Established: June 16, 2005</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">Official Site: www.gtakorea.org</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">Authorized: National Tax Service (NTS)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 text-gta-600 font-bold text-lg">
                <Award className="w-6 h-6" />
                <h3>Our Core Mission</h3>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm">
                GTA has been providing tax consulting for foreigners in major shipyards and industrial complexes including Hanwha Ocean, Samsung Heavy Industries (SHI), HD Hyundai Heavy Industries (HHI), Hyundai Mipo Dockyard (HMD), and partnered firms since its establishment in 2005.
              </p>
              <p className="text-slate-700 leading-relaxed text-sm">
                We handle monthly tax filing, tax deduction calculations, Class B wage income processing, and annual tax returns to ensure complete compliance and max tax benefit for foreign professionals in Korea.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
                <Target className="w-5 h-5 text-gta-500" />
                <span>{lang === 'ko' ? '주요 협력 및 지원 조선사' : 'Major Serving Shipyards & Clients'}</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm flex items-center space-x-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Hanwha Ocean</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm flex items-center space-x-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>SHI (Samsung)</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm flex items-center space-x-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>HD Hyundai (HHI)</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm flex items-center space-x-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>HMD & Contractors</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-2xl font-extrabold text-slate-900 border-b border-slate-200 pb-3">
              {lang === 'ko' ? '거제시 납세자회 대표 인사말' : 'Greeting from GTA Representative'}
            </h3>
            <p className="text-slate-700 leading-relaxed text-sm">
              {lang === 'ko'
                ? '거제시 납세자회는 2005년 6월 16일 국세청 승인을 받아 설립된 이래, 거제 및 전국의 조선소, 대기업, 해양 플랜트 프로젝트에 종사하는 외국인 임직원 및 기업의 소득세 수임과 절세 혜택을 전담해 왔습니다.'
                : 'Since authorization by the NTS in June 2005, GTA has served foreign executives, engineers, and companies working in shipbuilding and marine projects with reliable income tax filing and legal tax credit benefits.'}
            </p>
            <div className="pt-4 text-right">
              <span className="font-extrabold text-slate-900 text-base">
                {lang === 'ko' ? '거제시 납세자회 대표 최 주 호' : 'Representative Juho Choi, Geoje Taxpayers Association'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Benefit of GTA (Brochure Page 3) */}
      {activeTab === 'benefit' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900">Benefit of GTA members</h2>
            <p className="text-slate-600 text-sm">
              GTA endeavors to reduce your tax burden and provide cost-effective tax solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md space-y-4 flex flex-col justify-between group hover:border-gta-400 transition-all">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform">
                  3%
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  3% Taxpayers Association Deduction (Article 150)
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  If you become a member of GTA and pay tax through us on a monthly basis, the Korean tax authority gives you the benefit of a 3% additional deduction from your income tax. (Tax credit ceiling: KRW 1 million per year)
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                ⭐ Article 150 & 150-3 of Korean Income Tax Law
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md space-y-4 flex flex-col justify-between group hover:border-gta-400 transition-all">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-gta-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Tax Certificate for Visa / ARC Extension
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Under immigration law, foreigners extending their stay must submit a Certificate of Full Tax Payment. GTA members receive tax certificates quickly within 1 day upon request whenever needed for Visa or Alien Registration Card extension.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs font-bold text-gta-700 bg-gta-50 p-2.5 rounded-xl border border-gta-200">
                📄 Issued in 1 Business Day
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md space-y-4 flex flex-col justify-between group hover:border-gta-400 transition-all">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Convenient Member Portal Website
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We operate a dedicated website for GTA members. Members can easily view their monthly tax payment receipts, download certificates, and check tax filing status online using their membership credentials.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                🌐 Online Receipt & Certificate System
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Location (Brochure Page 2 & Request Upgrade) */}
      {activeTab === 'location' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
              <div>
                <span className="text-xs font-bold text-gta-600 bg-gta-50 px-3 py-1 rounded-full uppercase">Office Location</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 flex items-center space-x-2">
                  <MapPin className="w-7 h-7 text-red-500" />
                  <span>Geoje Taxpayers Association Head Office</span>
                </h2>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                🌐 Google Maps Global API v3 Upgraded
              </span>
            </div>

            <div className="h-96 rounded-2xl overflow-hidden relative border border-slate-300 shadow-md">
              <iframe
                title="GTA Office Google Maps Location"
                src={`https://maps.google.com/maps?q=34.8806,128.6211&hl=${lang === 'en' ? 'en' : 'ko'}&z=15&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2 text-gta-600 font-bold text-xs">
                  <MapPin className="w-4 h-4" />
                  <span>{t.mapAddrHeader}</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-snug">
                  #107, 3696 Geoje-daero, Geoje-city, Gyeongnam-do, Korea
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2 text-gta-600 font-bold text-xs">
                  <Phone className="w-4 h-4" />
                  <span>{t.mapPhoneHeader}</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold">
                  +82(0)55-688-2141
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2 text-gta-600 font-bold text-xs">
                  <Printer className="w-4 h-4" />
                  <span>{t.mapFaxHeader}</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold">
                  +82(0)55-688-2142
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2 text-gta-600 font-bold text-xs">
                  <Mail className="w-4 h-4" />
                  <span>{t.mapEmailHeader}</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold">
                  gta@gtakorea.org
                </p>
              </div>
            </div>

            <div className="pt-2 text-center sm:text-right">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=34.8806,128.6211&hl=${lang}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gta-600 hover:bg-gta-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t.mapDirections}</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-bold text-slate-500">Loading GTA About...</div>}>
      <AboutContent />
    </Suspense>
  );
}
