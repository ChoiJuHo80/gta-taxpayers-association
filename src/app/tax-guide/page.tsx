'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, RefreshCw, FileText, Calculator, CheckSquare, ArrowRight, CheckCircle2, DollarSign, Info, ShieldCheck, Mail } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { SALARY_TAX_TABLE_1300 } from '@/lib/taxData';

function TaxGuideContent() {
  const [lang, setLang] = useState<Language>('en');
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'tax-flow';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Interactive Tax Calculator State
  const [calcUsd, setCalcUsd] = useState<number>(5000);
  const exchangeRate = 1300;

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

  // Helper for quick tax calc
  const matchedRow = SALARY_TAX_TABLE_1300.find(r => r.monthlySalaryUsd === calcUsd) || {
    monthlySalaryUsd: calcUsd,
    annualSalaryUsd: calcUsd * 12,
    monthlySalaryKrw: calcUsd * exchangeRate,
    annualSalaryKrw: calcUsd * 12 * exchangeRate,
    effectiveRate: calcUsd >= 10000 ? 0.209 : 0.12,
    monthlyPayableTaxKrw: calcUsd >= 10000 ? Math.round(calcUsd * exchangeRate * 0.209) : Math.round(calcUsd * exchangeRate * 0.118),
    taxType: calcUsd >= 10000 ? 'Flat 20.9%' : 'Progressive'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Category Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gta-100 text-gta-700 text-xs font-bold px-3.5 py-1.5 rounded-full">
          <BookOpen className="w-4 h-4 text-gta-600" />
          <span>Tax Guide</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          {lang === 'ko' ? '외국인 세무 가이드' : 'Expatriate Tax Guide & Table'}
        </h1>
        <p className="text-slate-600 leading-relaxed text-base">
          Step-by-step tax workflow, document check-list, monthly tax calculation table ($1=KRW 1,300), and deduction items.
        </p>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex justify-center border-b border-slate-200 overflow-x-auto">
        <div className="flex space-x-2 sm:space-x-4 min-w-max pb-1">
          <button
            onClick={() => setActiveTab('tax-flow')}
            className={`py-3 px-5 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'tax-flow'
                ? 'border-gta-600 text-gta-600 bg-gta-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🔄 {t.navTaxFlow}</span>
          </button>

          <button
            onClick={() => setActiveTab('necessary-docs')}
            className={`py-3 px-5 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'necessary-docs'
                ? 'border-gta-600 text-gta-600 bg-gta-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📂 {t.navNecessaryDocs}</span>
          </button>

          <button
            onClick={() => setActiveTab('income-tax-table')}
            className={`py-3 px-5 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'income-tax-table'
                ? 'border-gta-600 text-gta-600 bg-gta-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📊 {t.navIncomeTaxTable}</span>
          </button>

          <button
            onClick={() => setActiveTab('tax-deduction')}
            className={`py-3 px-5 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'tax-deduction'
                ? 'border-gta-600 text-gta-600 bg-gta-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>💡 {t.navTaxDeduction}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Tax Flow (Brochure Page 8~9) */}
      {activeTab === 'tax-flow' && (
        <div className="space-y-12 animate-in fade-in duration-200">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900">5-Step Monthly & Annual Tax Flow</h2>
            <p className="text-slate-600 text-sm">
              Standard tax administration workflow handled by Geoje Taxpayers Association for members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between relative">
              <div className="space-y-2">
                <span className="text-xs font-black text-gta-600 bg-gta-100 px-2.5 py-1 rounded-full">STEP 01</span>
                <h3 className="font-bold text-slate-900 text-base pt-1">Joining the GTA</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submit GTA application form with a copy of your alien registration card, marriage cert (if married), child birth cert, and salary pay-slips.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between relative">
              <div className="space-y-2">
                <span className="text-xs font-black text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">STEP 02</span>
                <h3 className="font-bold text-slate-900 text-base pt-1">Issuing Tax Invoice</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  GTA emails you a monthly tax invoice between 15th and 20th of every month.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between relative border-l-4 border-l-emerald-500">
              <div className="space-y-2">
                <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">STEP 03</span>
                <h3 className="font-bold text-slate-900 text-base pt-1">Tax Payment & Report</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pay tax to GTA by end of month. GTA reports and pays to NTS and issues monthly receipts. Monthly payment yields 3% deduction.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between relative">
              <div className="space-y-2">
                <span className="text-xs font-black text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">STEP 04</span>
                <h3 className="font-bold text-slate-900 text-base pt-1">Year-end Settlement</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In January, recalculate tax based on fixed annual salary and exchange rate. Refund issued if overpaid or additional payment collected.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between relative">
              <div className="space-y-2">
                <span className="text-xs font-black text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full">STEP 05</span>
                <h3 className="font-bold text-slate-900 text-base pt-1">Tax Certificates</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Certificates of Full Payment issued. Avoids double taxation in home country. Mid-year departure tax cert supported.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-gta-900 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-2">
              <span className="bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1 rounded-full uppercase">
                Transparent Service Fees
              </span>
              <h3 className="text-2xl font-black">GTA Service Charges</h3>
              <p className="text-slate-300 text-xs">
                Official fixed service fee schedule for individual taxpayers and expatriate members.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 text-center">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/20 min-w-40">
                <div className="text-xs text-slate-300">Monthly Tax Service</div>
                <div className="text-2xl font-black text-amber-400 mt-1">KRW 30,000</div>
                <div className="text-[10px] text-slate-400">per person / month</div>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/20 min-w-40">
                <div className="text-xs text-slate-300">Final Tax Return</div>
                <div className="text-2xl font-black text-blue-400 mt-1">KRW 20,000</div>
                <div className="text-[10px] text-slate-400">per person / once a year</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Necessary Documents (Brochure Page 10) */}
      {activeTab === 'necessary-docs' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <div className="border-b border-slate-200 pb-4 space-y-2">
              <span className="text-xs font-bold text-gta-600 bg-gta-50 px-3 py-1 rounded-full uppercase">Required Check-list</span>
              <h2 className="text-3xl font-extrabold text-slate-900">Necessary Documents for Joining GTA</h2>
              <p className="text-slate-600 text-sm">
                To join GTA and receive monthly tax filing and 3% tax deduction, please send the following documents by Email or Fax.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-gta-600 text-white flex items-center justify-center font-bold text-sm">01</div>
                <h3 className="font-bold text-slate-900 text-base">GTA Application Form</h3>
                <p className="text-xs text-slate-600">Completed admission form with basic applicant details, workplace, and dependent info.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-gta-600 text-white flex items-center justify-center font-bold text-sm">02</div>
                <h3 className="font-bold text-slate-900 text-base">Alien Registration Card (ARC)</h3>
                <p className="text-xs text-slate-600">A clear copy of the front and back side of your Alien Registration Card.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-gta-600 text-white flex items-center justify-center font-bold text-sm">03</div>
                <h3 className="font-bold text-slate-900 text-base">Marriage Certificate</h3>
                <p className="text-xs text-slate-600">Required if married to claim dependent spouse basic deduction.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-gta-600 text-white flex items-center justify-center font-bold text-sm">04</div>
                <h3 className="font-bold text-slate-900 text-base">Child's Birth Certificate</h3>
                <p className="text-xs text-slate-600">Required for dependent children below 20 years of age.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-gta-600 text-white flex items-center justify-center font-bold text-sm">05</div>
                <h3 className="font-bold text-slate-900 text-base">Salary Statements / Pay Slips</h3>
                <p className="text-xs text-slate-600">Pay-slip or employment contract to verify Class B wage and income amount.</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-amber-900">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <Mail className="w-5 h-5 text-amber-700" />
                <span>※ Remote & Nationwide E-mail Service</span>
              </div>
              <p className="text-xs leading-relaxed">
                All tax procedures can be handled conveniently via emails (gta@gtakorea.org). You do not need to hesitate to contact or join GTA even though you live outside Geoje City!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Income Tax Table (Brochure Page 6 & 1,300 KRW Formula) */}
      {activeTab === 'income-tax-table' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
              <div>
                <span className="text-xs font-bold text-gta-600 bg-gta-50 px-3 py-1 rounded-full uppercase">Exchange Rate $1 = KRW 1,300</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 flex items-center space-x-2">
                  <Calculator className="w-7 h-7 text-gta-600" />
                  <span>Salary Information & Monthly Payable Tax Table</span>
                </h2>
              </div>
              <div className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                Single Taxpayer Basis (USD / KRW)
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                ⚡ Quick Interactive Tax Estimator ($1 = KRW 1,300)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Salary (USD):</label>
                  <select
                    value={calcUsd}
                    onChange={e => setCalcUsd(Number(e.target.value))}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-2.5 font-bold text-sm focus:ring-2 focus:ring-amber-400"
                  >
                    {[3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000].map(v => (
                      <option key={v} value={v}>${v.toLocaleString()} USD / month</option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                  <div className="text-[11px] text-slate-400">Effective Tax Rate</div>
                  <div className="text-xl font-black text-blue-400 mt-0.5">
                    {(matchedRow.effectiveRate * 100).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-500">{matchedRow.taxType}</div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                  <div className="text-[11px] text-slate-400">Monthly Payable Tax (KRW)</div>
                  <div className="text-xl font-black text-amber-400 mt-0.5">
                    ₩{matchedRow.monthlyPayableTaxKrw.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">Including Resident Tax</div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gta-900 text-white text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 rounded-tl-xl">Monthly Salary (USD)</th>
                    <th className="py-3.5 px-4">Annual Salary (USD)</th>
                    <th className="py-3.5 px-4">Effective Rate</th>
                    <th className="py-3.5 px-4">Monthly Tax (KRW)</th>
                    <th className="py-3.5 px-4 rounded-tr-xl">Applied Tax Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm font-semibold">
                  {SALARY_TAX_TABLE_1300.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50 ${row.monthlySalaryUsd === calcUsd ? 'bg-amber-50/80' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">${row.monthlySalaryUsd.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-600">${row.annualSalaryUsd.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {(row.effectiveRate * 100).toFixed(2)}%
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-amber-600">
                        ₩{row.monthlyPayableTaxKrw.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold">
                        <span className={`px-2.5 py-1 rounded-full ${
                          row.taxType.includes('Flat')
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {row.taxType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800">📌 Table Calculation Notes:</div>
              <div>• Base Exchange Rate: $1 = KRW 1,300</div>
              <div>• USD $3,000 ~ $9,000 applies Progressive Income Tax Rate after standard deductions.</div>
              <div>• USD $10,000 ~ $14,000 applies 20.9% Flat Income Tax Rate (Flat Tax 19% + Local Resident Tax 1.9%).</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Tax Deduction Item (Brochure Page 6~7) */}
      {activeTab === 'tax-deduction' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-3 flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-gta-600" />
                <span>Personal Deduction</span>
              </h3>
              
              <div className="space-y-4 text-sm text-slate-700">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">A. Basic Deduction</div>
                  <p className="text-xs text-slate-600">KRW 1,500,000 per person (Taxpayer, Spouse, and Dependents under 20 years old / aged 60+)</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">B. Additional Deduction</div>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                    <li><strong>The Handicapped:</strong> KRW 2,000,000 per person</li>
                    <li><strong>The Aged (70 years old or more):</strong> KRW 1,000,000 per person</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-3 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Special & Other Tax Deduction Check List</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                  📌 Key Requirement: All deduction items should be spent or paid in Korea by your expense and require official documentary evidence.
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">Taxation Period</div>
                  <div className="text-slate-600">January 1st ~ December 31st annually.</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">Deductible Categories</div>
                  <div className="text-slate-600">Medical expenses in Korea, Educational expenses, Korean Credit Card / Debit Card receipts, Pension / Insurance premiums.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function TaxGuidePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-bold text-slate-500">Loading GTA Tax Guide...</div>}>
      <TaxGuideContent />
    </Suspense>
  );
}
