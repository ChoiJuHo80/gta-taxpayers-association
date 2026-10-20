'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X, Lock, Globe, FileText, Mail, Building, Scale, BookOpen, KeyRound, UserCheck, AlertCircle } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import GtaLogo from '@/components/GtaLogo';

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Admin Login Popup Modal State
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [adminId, setAdminId] = useState('gtakorea');
  const [adminPw, setAdminPw] = useState('');
  const [adminError, setAdminError] = useState('');

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

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && sessionStorage.getItem('gta_admin_logged') === 'true') {
      router.push('/admin');
    } else {
      setAdminError('');
      setAdminPw('');
      setShowAdminPopup(true);
    }
  };

  const handleAdminPopupLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = adminId.trim().toLowerCase();
    const validId = !cleanId || cleanId === 'gtakorea' || cleanId === 'deokang7' || cleanId === 'admin';
    const validPw = adminPw === '8992' || adminPw === '1201' || adminPw === 'gta7273' || adminPw === '9999';

    if (validId && validPw) {
      sessionStorage.setItem('gta_admin_logged', 'true');
      window.dispatchEvent(new CustomEvent('adminLogged'));
      setShowAdminPopup(false);
      router.push('/admin');
    } else {
      setAdminError('Invalid Admin ID or Password. (PW: 8992)');
    }
  };

  const t = translations[lang];

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel shadow-sm border-b border-slate-200 w-full bg-white/95 backdrop-blur-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Row 1: Brand Logo & Top Actions */}
          <div className="flex justify-between items-center py-1 min-h-[70px] sm:min-h-[80px] gap-4 border-b border-slate-100">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center group shrink-0">
              <GtaLogo size="md" />
            </Link>

            {/* Action CTA & Language Switcher */}
            <div className="hidden sm:flex items-center space-x-2.5 shrink-0 whitespace-nowrap">
              {/* Language Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 shrink-0 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => toggleLanguage('en')}
                  className={`px-2.5 py-1 rounded-lg transition-all leading-none cursor-pointer ${
                    lang === 'en' ? 'bg-white text-gta-700 shadow-sm font-black' : 'hover:text-slate-900 font-semibold'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => toggleLanguage('ko')}
                  className={`px-2.5 py-1 rounded-lg transition-all leading-none cursor-pointer ${
                    lang === 'ko' ? 'bg-white text-gta-700 shadow-sm font-black' : 'hover:text-slate-900 font-semibold'
                  }`}
                >
                  한국어
                </button>
              </div>

              {/* Member Sign-Up / Check My Receipt Button */}
              <Link
                href="/consult/lookup"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 transition-all flex items-center space-x-1.5 shadow-sm whitespace-nowrap shrink-0"
              >
                <FileText className="w-3.5 h-3.5 text-gta-600 shrink-0" />
                <span>Check My Receipt</span>
              </Link>

              {/* Admin Popup Trigger Button */}
              <button
                type="button"
                onClick={handleAdminClick}
                className="text-xs text-slate-500 hover:text-gta-700 flex items-center space-x-1 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>{t.navAdmin}</span>
              </button>
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

          {/* Row 2: Sub-Navigation Bar */}
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
                <Building className="w-5 h-5 text-gta-600 shrink-0" />
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
                <Scale className="w-5 h-5 text-gta-600 shrink-0" />
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
                <BookOpen className="w-5 h-5 text-gta-600 shrink-0" />
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

            {/* Tax Service */}
            <div
              className="relative h-full flex items-center group"
              onMouseEnter={() => handleMouseEnter('taxservice')}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/contact"
                className="px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-gta-600 transition-colors flex items-center space-x-2 whitespace-nowrap"
              >
                <Mail className="w-5 h-5 text-gta-600 shrink-0" />
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
                href="/consult/lookup"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-100 text-sm font-bold text-slate-800 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4 text-gta-600" />
                <span>Check My Receipt</span>
              </Link>
              <button
                type="button"
                onClick={e => {
                  setMobileMenuOpen(false);
                  handleAdminClick(e);
                }}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 text-left"
              >
                🔒 {t.navAdmin}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Admin Login Popup Modal */}
      {showAdminPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 sm:p-8 space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowAdminPopup(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-gta-700 bg-gta-50 px-2.5 py-1 rounded-full border border-gta-200">
                <Lock className="w-3.5 h-3.5" />
                <span>GTA Staff Only</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 pt-1">Admin Portal Login</h3>
              <p className="text-xs text-slate-500">
                Enter administrator ID and password to access member search and receipt management.
              </p>
            </div>

            {adminError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminPopupLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Admin ID</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={adminId}
                    onChange={e => setAdminId(e.target.value)}
                    placeholder="gtakorea"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Password *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={adminPw}
                    onChange={e => setAdminPw(e.target.value)}
                    placeholder="Enter Admin Password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-gta-500"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdminPopup(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gta-600 hover:bg-gta-700 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  Sign In →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
