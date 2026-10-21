'use client';

import Link from 'next/link';
import {
  FileText,
  ArrowRight,
  Phone,
  BookOpen,
  Scale,
  Receipt,
  Mail,
  MapPin,
  Percent,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { translations, Language } from '@/lib/i18n';

export default function Home() {
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

  const mainCards = [
    {
      title: 'Tax Guide',
      desc: 'Tax flow, income tax table & deduction guide',
      href: '/tax-guide',
      icon: BookOpen,
      iconBg: 'bg-blue-50 text-[#1d3b6b] border-blue-200',
      badge: 'Guide & Table',
    },
    {
      title: 'Tax Law',
      desc: 'Korean tax regulations and international treaties',
      href: '/tax-law',
      icon: Scale,
      iconBg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      badge: '99 Countries',
    },
    {
      title: 'Check My Receipt',
      desc: 'View and download your monthly tax receipts online',
      href: '/consult/lookup',
      icon: Receipt,
      iconBg: 'bg-sky-50 text-sky-900 border-sky-200',
      badge: 'Online Check Receipts',
    },
    {
      title: 'About & Contact',
      desc: '3% member tax deduction benefit & direct inquiry',
      href: '/about?tab=benefit',
      icon: Mail,
      iconBg: 'bg-amber-50 text-amber-900 border-amber-200',
      badge: '3% Tax Deduction',
    },
  ];

  return (
    <div className="pb-20 relative bg-slate-50/70">
      {/* =====================================================================
          HERO SECTION (Confirmed Design #1: Bright Visual Hero)
         ===================================================================== */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-[#eef2f7] via-[#e5ecf5] to-[#dbe5f1]">
        {/* Right side office / professional visual backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f8fafc] via-[#f1f5f9]/95 to-[#1e3a6d]/25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#1d3b6b]/10 border border-[#1d3b6b]/20 text-[#1d3b6b] text-xs font-extrabold px-3.5 py-1.5 rounded-full">
              <span>Geoje Taxpayers Association · Since 2005</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#162d54] leading-[1.12]">
              Easy &amp; Prompt
              <br />
              Tax Solution
            </h1>

            <p className="text-lg sm:text-xl text-slate-700 font-medium leading-relaxed">
              Professional tax services for foreign residents and businesses in Korea
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/consult/lookup"
                className="bg-[#1d3b6b] hover:bg-[#152c52] text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2.5 text-base whitespace-nowrap shrink-0"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </Link>
              <Link
                href="/tax-guide?tab=income-tax-table"
                className="bg-white/90 hover:bg-white text-[#1d3b6b] border border-slate-300 font-bold px-7 py-4 rounded-xl shadow-sm transition-all inline-flex items-center space-x-2 text-base whitespace-nowrap shrink-0"
              >
                <FileText className="w-5 h-5 shrink-0" />
                <span>Income Tax Table</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4-CARD VISUAL GRID (Tax Guide, Tax Law, Check My Receipt, About/Contact)
         ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white rounded-2xl p-6 sm:p-7 shadow-md hover:shadow-xl border border-slate-200/90 transition-all duration-200 group flex flex-col items-center text-center hover:-translate-y-1"
              >
                <div
                  className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-sm shrink-0 ${card.iconBg}`}
                >
                  <IconComponent className="w-8 h-8" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 whitespace-nowrap">
                  {card.badge}
                </span>
                <h3 className="text-xl font-extrabold text-[#162d54] mb-2 group-hover:text-blue-700 transition-colors whitespace-nowrap">
                  {card.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-5 flex-1">
                  {card.desc}
                </p>
                <span className="inline-flex items-center text-xs font-extrabold text-[#1d3b6b] group-hover:translate-x-1 transition-transform whitespace-nowrap">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 shrink-0" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          STREAMLINED BENEFIT BANNER (Brochure Page 3 Accurate Copy)
         ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="bg-gradient-to-r from-[#162d54] via-[#1d3b6b] to-[#264b82] text-white p-8 sm:p-10 rounded-3xl shadow-lg flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-amber-300 text-xs font-extrabold tracking-wider uppercase bg-white/10 px-3.5 py-1 rounded-full whitespace-nowrap">
              <Percent className="w-3.5 h-3.5 shrink-0" />
              <span>Benefit of GTA Members</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              3% Additional Tax Deduction &amp; Online Check Receipts
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              For convenient tax service, we are running a website. GTA members can check their monthly receipts through the website with the membership information.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/consult/lookup"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center space-x-2 whitespace-nowrap shrink-0"
            >
              <Receipt className="w-4 h-4 shrink-0" />
              <span>Check My Receipt</span>
            </Link>
            <Link
              href="/about?tab=benefit"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-sm px-6 py-3.5 rounded-xl transition-all flex items-center space-x-2 whitespace-nowrap shrink-0"
            >
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          COMPACT OFFICE LOCATION & CONTACT SECTION
         ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center space-x-2 text-[#1d3b6b] font-extrabold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Office Location &amp; Contact</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Geoje Taxpayers Association
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We provide professional monthly tax filing, year-end tax settlement, and tax consultation services for foreign residents and businesses in Korea.
            </p>

            <div className="space-y-3 pt-1 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#1d3b6b] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">Address: </span>
                  <span className="text-slate-600">#107, 3696 Geoje-daero, Geoje-city, Gyeongsangnam-do, Korea</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#1d3b6b] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">Tel / Fax: </span>
                  <span className="text-slate-600">+82(0)55-688-2141 / Fax: +82(0)55-688-2142</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-[#1d3b6b] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">E-mail: </span>
                  <span className="text-slate-600">gta@gtakorea.org</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <iframe
                title="GTA Geoje Office Google Maps"
                src={`https://maps.google.com/maps?q=34.8875,128.6929&hl=${lang === 'en' ? 'en' : 'ko'}&z=16&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
