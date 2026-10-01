'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Shield, ChevronDown, Menu, X, Lock, Globe, UserPlus, FileText, Mail, Building, Scale, BookOpen } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en'); // Default to English for Foreign Taxpayers
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('gta_lang') as Language;
    if (savedLang) {
      setLang(savedLang);
    } else {
      localStorage.setItem('gta_lang', 'en');
    }
  }, []);

  const toggleLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('gta_lang', newLang);
    window.dispatchEvent(new CustomEvent('langChange', { detail: newLang }));
  };

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
  };

  const t = translations[lang];

  return (
    <header className="sticky top-0 z-50 glass-panel shadow-sm border-b border-slate-200 w-full bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row 1: Brand Logo & Top Actions */}
        <div className="flex justify-between items-center h-16 sm:h-18 gap-4 border-b border-slate-100">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gta-700 via-gta-500 to-blue-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Shield className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl text-gta-900 tracking-tight">
                  GTA Korea
                </span>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                  {t.publicTax}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                {t.brandName}
              </span>
            </div>
          </Link>

          {/* Action CTA & Language Switcher */}
          <div className="hidden sm:flex items-center space-x-2.5 shrink-0 whitespace-nowrap">
            
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 shrink-0 whitespace-nowrap">
              <button
                type="button"
                onClick={() => toggleLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all leading-none ${
                  lang === 'en' ? 'bg-white text-gta-700 shadow-sm font-black' : 'hover:text-slate-900 font-semibold'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => toggleLanguage('ko')}
                className={`px-2.5 py-1 rounded-lg transition-all leading-none ${
                  lang === 'ko' ? 'bg-white text-gta-700 shadow-sm font-black' : 'hover:text-slate-900 font-semibold'
                }`}
              >
                한국어
              </button>
            </div>

            {/* Member Sign-Up Button */}
            <Link
              href="/signup"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 transition-all flex items-center space-x-1.5 shadow-sm whitespace-nowrap shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5 text-gta-600 shrink-0" />
              <span>{t.navSignUp}</span>
            </Link>

            {/* Admin Link */}
            <Link
              href="/admin"
              className="text-xs text-slate-500 hover:text-gta-700 flex items-center space-x-1 px-2 py-2 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>{t.navAdmin}</span>
            </Link>

          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2 shrink-0">
            <button
              onClick={() => toggleLanguage(lang === 'ko' ? 'en' : 'ko')}
              className="px-2 py-1.5 rounded-lg bg-slate-100 text-xs font-bold text-gta-700 border border-slate-200 flex items-center space-x-1 whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'ko' ? 'EN' : 'KR'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Row 2: Sub-Navigation Bar (Single-line menu with larger icons) */}
        <nav className="hidden lg:flex items-center h-12 space-x-4 font-extrabold text-sm text-slate-800">
          
          {/* ABOUT US */}
          <div 
            className="relative h-full flex items-center group"
            onMouseEnter={() => handleMouseEnter('about')}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href="/about"
              className="px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-gta-600 transition-colors flex items-center space-x-2 whitespace-nowrap"
            >
              <Building className="w-5.5 h-5.5 text-gta-600 shrink-0" />
              <span className="whitespace-nowrap tracking-wide text-sm font-extrabold">{t.catAbout}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
            </Link>

            {activeDropdown === 'about' && (
              <div 
                className="absolute top-full left-0 -mt-1 pt-1 w-56 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={() => handleMouseEnter('about')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 py-2.5 space-y-0.5">
                  <Link
                    href="/about?tab=introduction"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    📌 {t.navIntroduction}
                  </Link>
                  <Link
                    href="/about?tab=benefit"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    🎁 {t.navBenefit}
                  </Link>
                  <Link
                    href="/about?tab=location"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    📍 {t.navLocation}
                  </Link>
                  <Link
                    href="/notices"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    📢 Notice
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Tax Law */}
          <div 
            className="relative h-full flex items-center group"
            onMouseEnter={() => handleMouseEnter('taxlaw')}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href="/tax-law"
              className="px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-gta-600 transition-colors flex items-center space-x-2 whitespace-nowrap"
            >
              <Scale className="w-5.5 h-5.5 text-gta-600 shrink-0" />
              <span className="whitespace-nowrap tracking-wide text-sm font-extrabold">{t.catTaxLaw}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
            </Link>

            {activeDropdown === 'taxlaw' && (
              <div 
                className="absolute top-full left-0 -mt-1 pt-1 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={() => handleMouseEnter('taxlaw')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 py-2.5 space-y-0.5">
                  <Link
                    href="/tax-law?tab=korean-tax-law"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    ⚖️ {t.navKoreanTaxLaw}
                  </Link>
                  <Link
                    href="/tax-law?tab=treaties"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    🌐 {t.navTreaties}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Tax Guide */}
          <div 
            className="relative h-full flex items-center group"
            onMouseEnter={() => handleMouseEnter('taxguide')}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href="/tax-guide"
              className="px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-gta-600 transition-colors flex items-center space-x-2 whitespace-nowrap"
            >
              <BookOpen className="w-5.5 h-5.5 text-gta-600 shrink-0" />
              <span className="whitespace-nowrap tracking-wide text-sm font-extrabold">{t.catTaxGuide}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
            </Link>

            {activeDropdown === 'taxguide' && (
              <div 
                className="absolute top-full left-0 -mt-1 pt-1 w-72 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={() => handleMouseEnter('taxguide')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 py-2.5 space-y-0.5">
                  <Link
                    href="/tax-guide?tab=tax-flow"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    🔄 {t.navTaxFlow}
                  </Link>
                  <Link
                    href="/tax-guide?tab=necessary-docs"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    📂 {t.navNecessaryDocs}
                  </Link>
                  <Link
                    href="/tax-guide?tab=income-tax-table"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    📊 {t.navIncomeTaxTable}
                  </Link>
                  <Link
                    href="/tax-guide?tab=tax-deduction"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    💡 {t.navTaxDeduction}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Tax Service -> Contact us */}
          <div 
            className="relative h-full flex items-center group"
            onMouseEnter={() => handleMouseEnter('taxservice')}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href="/contact"
              className="px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-gta-600 transition-colors flex items-center space-x-2 whitespace-nowrap"
            >
              <Mail className="w-5.5 h-5.5 text-gta-600 shrink-0" />
              <span className="whitespace-nowrap tracking-wide text-sm font-extrabold">{t.catTaxService}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
            </Link>

            {activeDropdown === 'taxservice' && (
              <div 
                className="absolute top-full left-0 -mt-1 pt-1 w-56 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={() => handleMouseEnter('taxservice')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 py-2.5 space-y-0.5">
                  <Link
                    href="/consult"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    📝 {t.navApplicationForm}
                  </Link>
                  <Link
                    href="/consult/lookup"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    🔍 {t.navCheckReceipt}
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-gta-50 hover:text-gta-600 font-medium transition-colors"
                  >
                    ✉️ {t.navContactUs}
                  </Link>
                </div>
              </div>
            )}
          </div>

        </nav>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-slate-200 px-4 pt-3 pb-6 space-y-4 bg-white/98">
          
          <div>
            <div className="text-xs font-extrabold text-gta-600 uppercase tracking-wider mb-1 px-2">{t.catAbout}</div>
            <div className="space-y-1 pl-2">
              <Link href="/about?tab=introduction" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                📌 {t.navIntroduction}
              </Link>
              <Link href="/about?tab=benefit" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                🎁 {t.navBenefit}
              </Link>
              <Link href="/about?tab=location" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                📍 {t.navLocation}
              </Link>
              <Link href="/notices" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                📢 Notice
              </Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold text-gta-600 uppercase tracking-wider mb-1 px-2">{t.catTaxLaw}</div>
            <div className="space-y-1 pl-2">
              <Link href="/tax-law?tab=korean-tax-law" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                ⚖️ {t.navKoreanTaxLaw}
              </Link>
              <Link href="/tax-law?tab=treaties" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                🌐 {t.navTreaties}
              </Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold text-gta-600 uppercase tracking-wider mb-1 px-2">{t.catTaxGuide}</div>
            <div className="space-y-1 pl-2">
              <Link href="/tax-guide?tab=tax-flow" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                🔄 {t.navTaxFlow}
              </Link>
              <Link href="/tax-guide?tab=necessary-docs" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                📂 {t.navNecessaryDocs}
              </Link>
              <Link href="/tax-guide?tab=income-tax-table" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                📊 {t.navIncomeTaxTable}
              </Link>
              <Link href="/tax-guide?tab=tax-deduction" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                💡 {t.navTaxDeduction}
              </Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold text-gta-600 uppercase tracking-wider mb-1 px-2">{t.catTaxService}</div>
            <div className="space-y-1 pl-2">
              <Link href="/consult" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                📝 {t.navApplicationForm}
              </Link>
              <Link href="/consult/lookup" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                🔍 {t.navCheckReceipt}
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700">
                ✉️ {t.navContactUs}
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col space-y-2">
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl bg-slate-100 text-sm font-bold text-slate-800 flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4 text-gta-600" />
              <span>{t.navSignUp}</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100"
            >
              🔒 {t.navAdmin}
            </Link>
          </div>

        </div>
      )}
    </header>
  );
}
