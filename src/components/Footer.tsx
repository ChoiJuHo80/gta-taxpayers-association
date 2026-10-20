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
    <footer className="bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]/80 text-slate-600 border-t border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="inline-block">
              <GtaLogo size="sm" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md font-medium">
              {t.footerDesc}
            </p>
            <div className="pt-1">
              <a
                href="https://www.nts.go.kr/english/main.do"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white hover:bg-gta-900 text-gta-900 hover:text-white border border-slate-300 hover:border-gta-900 shadow-sm text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
              >
                <span>🏛️ NTS National Tax Service Portal ↗</span>
              </a>
            </div>
            <div className="text-xs text-slate-500 pt-1">
              © 2026 Geoje Taxpayers Association. All rights reserved.
            </div>
          </div>

          {/* Col 2: ABOUT US & Tax Law */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-300/80 pb-2">Navigation</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="font-bold text-gta-900 mt-1">{t.catAbout}</li>
              <li><Link href="/about?tab=introduction" className="hover:text-gta-700 hover:font-semibold transition-colors">↳ {t.navIntroduction}</Link></li>
              <li><Link href="/about?tab=benefit" className="hover:text-gta-700 hover:font-semibold transition-colors">↳ {t.navBenefit}</Link></li>
              <li><Link href="/about?tab=location" className="hover:text-gta-700 hover:font-semibold transition-colors">↳ {t.navLocation}</Link></li>

              <li className="font-bold text-gta-900 mt-2">{t.catTaxLaw}</li>
              <li><Link href="/tax-law?tab=korean-tax-law" className="hover:text-gta-700 hover:font-semibold transition-colors">↳ {t.navKoreanTaxLaw}</Link></li>
              <li><Link href="/tax-law?tab=treaties" className="hover:text-gta-700 hover:font-semibold transition-colors">↳ {t.navTreaties}</Link></li>
            </ul>
          </div>

          {/* Col 3: Tax Guide & Tax Service */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-300/80 pb-2">Tax Guide & Service</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="font-bold text-gta-900 mt-1">{t.catTaxGuide}</li>
              <li><Link href="/tax-guide?tab=tax-flow" className="hover:text-gta-700 hover:font-semibold transition-colors">↳ {t.navTaxFlow}</Link></li>
              <li><Link href="/tax-guide?tab=necessary-docs" className="hover:text-gta-700 hover:font-semibold transition-colors">↳ {t.navNecessaryDocs}</Link></li>
              <li><Link href="/tax-guide?tab=income-tax-table" className="hover:text-gta-700 hover:font-semibold transition-colors">↳ {t.navIncomeTaxTable}</Link></li>
              <li><Link href="/tax-guide?tab=tax-deduction" className="hover:text-gta-700 hover:font-semibold transition-colors">↳ {t.navTaxDeduction}</Link></li>
              <li className="font-bold text-gta-900 mt-2">{t.catTaxService}</li>
              <li><Link href="/consult/lookup" className="hover:text-gta-700 hover:font-semibold transition-colors">↳ {t.navCheckReceipt}</Link></li>
              <li><Link href="/contact" className="hover:text-gta-700 hover:font-semibold transition-colors">↳ {t.navContactUs}</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-300/80 pb-2">{t.footerContactTitle}</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gta-700 shrink-0" />
                <span>+82(0)55-688-2141</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gta-700 shrink-0" />
                <span>gta@gtakorea.org</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gta-700 shrink-0 mt-0.5" />
                <span>#107, 3696 Geoje-daero, Geoje-city, Korea</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}
