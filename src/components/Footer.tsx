'use client';

import Link from 'next/link';
import { Shield, Phone, Mail, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { translations, Language } from '@/lib/i18n';
import GtaLogo from '@/components/GtaLogo';

export default function Footer() {
  const [lang, setLang] = useState<Language>('en'); // Default to English for Foreign Taxpayers

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
    <footer className="relative overflow-hidden bg-[#EBF1F8] text-slate-700 border-t border-slate-300/80">
      {/* Sample 3 Background Image with Soft Gradient Blending */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFC]/95 via-[#EEF3F9]/85 to-[#DCE6F2]/75 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1d3b6b] via-[#2b5494] to-amber-400/80 opacity-80 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="inline-block">
              <GtaLogo size="md" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md font-medium">
              {t.footerDesc}
            </p>
            <div className="pt-1">
              <a
                href="https://www.nts.go.kr/english/main.do"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-[#1d3b6b] hover:bg-[#152c52] text-white border border-[#1d3b6b] shadow-sm text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
              >
                <span>🏛️ NTS National Tax Service Portal ↗</span>
              </a>
            </div>
            <div className="text-xs text-slate-500 pt-1 font-medium">
              © 2026 Geoje Taxpayers Association. All rights reserved.
            </div>
          </div>

          {/* Col 2: ABOUT US & Tax Law */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#162d54] text-xs uppercase tracking-wider border-b border-slate-400/40 pb-2">Navigation</h4>
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
              <li className="font-extrabold text-[#1d3b6b] mt-1">{t.catAbout}</li>
              <li><Link href="/about?tab=introduction" className="hover:text-[#1d3b6b] hover:font-bold transition-colors">↳ {t.navIntroduction}</Link></li>
              <li><Link href="/about?tab=benefit" className="hover:text-[#1d3b6b] hover:font-bold transition-colors">↳ {t.navBenefit}</Link></li>
              <li><Link href="/about?tab=location" className="hover:text-[#1d3b6b] hover:font-bold transition-colors">↳ {t.navLocation}</Link></li>

              <li className="font-extrabold text-[#1d3b6b] mt-2">{t.catTaxLaw}</li>
              <li><Link href="/tax-law?tab=korean-tax-law" className="hover:text-[#1d3b6b] hover:font-bold transition-colors">↳ {t.navKoreanTaxLaw}</Link></li>
              <li><Link href="/tax-law?tab=treaties" className="hover:text-[#1d3b6b] hover:font-bold transition-colors">↳ {t.navTreaties}</Link></li>
            </ul>
          </div>

          {/* Col 3: Tax Guide & Tax Service */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#162d54] text-xs uppercase tracking-wider border-b border-slate-400/40 pb-2">Tax Guide & Service</h4>
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
              <li className="font-extrabold text-[#1d3b6b] mt-1">{t.catTaxGuide}</li>
              <li><Link href="/tax-guide?tab=tax-flow" className="hover:text-[#1d3b6b] hover:font-bold transition-colors">↳ {t.navTaxFlow}</Link></li>
              <li><Link href="/tax-guide?tab=necessary-docs" className="hover:text-[#1d3b6b] hover:font-bold transition-colors">↳ {t.navNecessaryDocs}</Link></li>
              <li><Link href="/tax-guide?tab=income-tax-table" className="hover:text-[#1d3b6b] hover:font-bold transition-colors">↳ {t.navIncomeTaxTable}</Link></li>
              <li><Link href="/tax-guide?tab=tax-deduction" className="hover:text-[#1d3b6b] hover:font-bold transition-colors">↳ {t.navTaxDeduction}</Link></li>
              <li className="font-extrabold text-[#1d3b6b] mt-2">{t.catTaxService}</li>
              <li><Link href="/consult/lookup" className="hover:text-[#1d3b6b] hover:font-bold transition-colors">↳ {t.navCheckReceipt}</Link></li>
              <li><Link href="/contact" className="hover:text-[#1d3b6b] hover:font-bold transition-colors">↳ {t.navContactUs}</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#162d54] text-xs uppercase tracking-wider border-b border-slate-400/40 pb-2">{t.footerContactTitle}</h4>
            <ul className="space-y-2.5 text-xs text-slate-700 font-semibold">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#1d3b6b] shrink-0" />
                <span>+82(0)55-688-2141</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#1d3b6b] shrink-0" />
                <span>gta@gtakorea.org</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#1d3b6b] shrink-0 mt-0.5" />
                <span>#107, 3696 Geoje-daero, Geoje-city, Korea</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}
