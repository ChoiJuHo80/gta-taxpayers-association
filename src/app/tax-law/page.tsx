'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Scale, Globe, Search, Check, Shield, FileText, Info } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { TREATY_COUNTRIES } from '@/lib/taxData';

function TaxLawContent() {
  const [lang, setLang] = useState<Language>('en');
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'korean-tax-law';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCountries = TREATY_COUNTRIES.filter(c =>
    c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Category Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gta-100 text-gta-700 text-xs font-bold px-3.5 py-1.5 rounded-full">
          <Scale className="w-4 h-4 text-gta-600" />
          <span>Tax Law</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          {lang === 'ko' ? '한국 세법 및 조세 조약' : 'Korean Tax Law & Foreign Tax Treaties'}
        </h1>
        <p className="text-slate-600 leading-relaxed text-base">
          Key regulations of Korean income tax law for expatriates and tax treaty network with 99 countries.
        </p>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex justify-center border-b border-slate-200">
        <div className="flex space-x-2 sm:space-x-4">
          <button
            onClick={() => setActiveTab('korean-tax-law')}
            className={`py-3 px-6 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'korean-tax-law'
                ? 'border-gta-600 text-gta-600 bg-gta-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>⚖️ {t.navKoreanTaxLaw}</span>
          </button>

          <button
            onClick={() => setActiveTab('treaties')}
            className={`py-3 px-6 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'treaties'
                ? 'border-gta-600 text-gta-600 bg-gta-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🌐 {t.navTreaties}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Korean Tax Law (Brochure Page 4) */}
      {activeTab === 'korean-tax-law' && (
        <div className="space-y-12 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 text-gta-600 font-bold text-lg">
                <FileText className="w-6 h-6" />
                <h3>1. Taxpayer (Income tax law Article 1 of 1)</h3>
              </div>
              <div className="p-4 rounded-xl bg-gta-50 border border-gta-200 text-gta-900 font-bold text-sm">
                Resident Definition
              </div>
              <p className="text-slate-700 leading-relaxed text-sm">
                A person who has a domicile or has resided or worked in Korea for <strong>183 days</strong> or more is subject to income tax on all income derived from sources both within and outside of Korea.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 text-emerald-600 font-bold text-lg">
                <Shield className="w-6 h-6" />
                <h3>2. Taxpayers Association (Article 149, 150-3)</h3>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-sm">
                Class B Wage Earners & 3% Tax Credit
              </div>
              <p className="text-slate-700 leading-relaxed text-sm">
                ‘Class B’ wage and income earners (who receive their income from overseas company) may organize taxpayer association through which they may pay taxes. If taxpayer pays taxes through taxpayers association, the taxpayer gets the benefit of a <strong>3% Tax Credit</strong> for payment of taxes.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-2">
              <h3 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
                <Scale className="w-6 h-6 text-gta-600" />
                <span>Progressive Tax Rate vs Flat Tax Rate</span>
              </h3>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Foreign Expatriate Taxation Choice
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-white text-sm uppercase tracking-wider">
                    <th className="py-4 px-6 rounded-tl-xl">Items</th>
                    <th className="py-4 px-6">Progressive Tax Rate</th>
                    <th className="py-4 px-6 rounded-tr-xl">Flat Tax Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm font-semibold">
                  <tr className="hover:bg-slate-50">
                    <td className="py-4 px-6 text-slate-900 font-bold bg-slate-50">Taxpayer</td>
                    <td className="py-4 px-6 text-slate-700">Local Individuals or Expatriates</td>
                    <td className="py-4 px-6 text-gta-700 font-extrabold">Expatriates ONLY</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-4 px-6 text-slate-900 font-bold bg-slate-50">Tax Rate</td>
                    <td className="py-4 px-6 text-slate-700">6 - 45% (Graduated)</td>
                    <td className="py-4 px-6 text-emerald-600 font-extrabold">19% (Fixed Flat)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-4 px-6 text-slate-900 font-bold bg-slate-50">Deduction</td>
                    <td className="py-4 px-6 text-emerald-600">Applicable (Personal, Medical, etc.)</td>
                    <td className="py-4 px-6 text-slate-400">Not Applicable</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-4 px-6 text-slate-900 font-bold bg-slate-50">Tax Return</td>
                    <td className="py-4 px-6 text-emerald-600">Applicable (Year-end Settlement)</td>
                    <td className="py-4 px-6 text-slate-400">Not Applicable</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
              <Info className="w-4 h-4 text-gta-600 shrink-0 mt-0.5" />
              <span>
                Foreign engineers and professionals can choose either Progressive Tax Rate (with all deductions) or 19% Flat Income Tax Rate (+ 1.9% Local Resident Tax = total 20.9%) whichever results in lower tax payable.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Treaties with Foreign Countries (Brochure Page 5) */}
      {activeTab === 'treaties' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-gta-900 to-slate-900 text-white p-8 md:p-10 rounded-3xl shadow-lg space-y-4">
            <span className="bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase">
              As of July 2025
            </span>
            <h2 className="text-3xl font-black">Treaties with Foreign Countries</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
              We, the government of republic of Korea, have entered into tax treaties with many countries for the avoidance of double taxation and the prevention of fiscal evasion on income and the encouragement of international trade and investment. You can find the tax treaties between Korea and 99 countries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search country name (e.g. Norway, USA, UK...)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 text-sm font-semibold"
              />
            </div>
            <div className="text-xs text-slate-500 font-bold whitespace-nowrap">
              Showing {filteredCountries.length} of 99 Tax Treaty Countries
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredCountries.map(item => (
              <div
                key={item.no}
                className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-gta-400 hover:shadow-md transition-all flex items-center space-x-2 text-xs font-bold text-slate-800"
              >
                <span className="w-6 h-6 rounded-full bg-gta-50 text-gta-700 flex items-center justify-center text-[10px] shrink-0 font-extrabold">
                  {item.no}
                </span>
                <span className="truncate">{item.country}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default function TaxLawPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-bold text-slate-500">Loading GTA Tax Law...</div>}>
      <TaxLawContent />
    </Suspense>
  );
}
