'use client';

import { useState } from 'react';
import { Search, FileText, CheckCircle2, AlertCircle, Printer, User, CreditCard, Building2, Calendar, X, LogOut } from 'lucide-react';
import { ApplicationMember, TaxReceipt } from '@/lib/db';

function formatUnixMonth(val?: string): string {
  if (!val) return '-';
  const num = Number(val);
  if (!isNaN(num) && num > 100000000) {
    // Convert Unix timestamp (in seconds) using KST (+9h) so midnight KST maps to the right month
    const d = new Date((num + 9 * 3600) * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  return val;
}

function formatUnixDate(val?: string): string {
  if (!val) return '-';
  const num = Number(val);
  if (!isNaN(num) && num > 100000000) {
    const d = new Date((num + 9 * 3600) * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return val;
}

export default function LookupPage() {
  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<ApplicationMember | null>(null);
  const [receipts, setReceipts] = useState<TaxReceipt[] | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<TaxReceipt | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setReceipts(null);
    setMember(null);

    try {
      const res = await fetch('/api/receipts/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          registrationNumber: registrationNumber.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        if (!json.member && (!json.receipts || json.receipts.length === 0)) {
          setErrorMsg(
            'No matching member or tax receipt found. Please check your Name (in capital letters) and Registration Number.'
          );
        } else {
          setMember(json.member);
          setReceipts(json.receipts || []);
          if (json.receipts && json.receipts.length > 0) {
            setSelectedReceipt(null);
          }
        }
      } else {
        setErrorMsg(json.message || 'Lookup failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMember(null);
    setReceipts(null);
    setSelectedReceipt(null);
    setErrorMsg('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Login / Lookup Card */}
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 space-y-6 print:hidden">
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 text-blue-700 font-bold text-xs bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <FileText className="w-3.5 h-3.5" />
              <span>Online Tax Receipt Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Check My Receipt
            </h1>
            <p className="text-slate-600 text-sm">
              Enter your <strong>Name</strong> and <strong>Registration Number</strong> to sign in and view or print your monthly tax payment receipts.
            </p>
          </div>

          {receipts !== null && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors self-start"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / New Search</span>
            </button>
          )}
        </div>

        <form onSubmit={handleLookup} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Name * <span className="text-slate-400 font-normal normal-case">(Capital letters as on KOR Residence Card)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. KIM SILVIA"
                value={name}
                onChange={e => setName(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:ring-2 focus:ring-gta-500"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Registration Number *
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. 820012-3932521"
                value={registrationNumber}
                onChange={e => setRegistrationNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-gta-500"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gta-600 hover:bg-gta-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Checking...' : 'Check My Receipt'}</span>
            </button>
          </div>
        </form>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="font-bold text-slate-800">📌 Login Guide for GTA Members:</div>
          <div>• <strong>Name:</strong> Write down your full name in CAPITAL letters and spaces as shown on your KOR Residence Card (or Membership Card ID).</div>
          <div>• <strong>Registration Number:</strong> Write down your Registration Number (e.g., <code>750409-5500019</code>) or Membership Password.</div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center space-x-3 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Member Info & Receipts Table */}
      {receipts !== null && (
        <div className="space-y-6 print:hidden">
          {/* Member Profile Banner */}
          <div className="bg-gradient-to-r from-gta-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Verified GTA Member</span>
              </div>
              <h2 className="text-xl font-black">
                {member?.name || receipts[0]?.name || name}
              </h2>
              <div className="text-xs text-slate-300 flex flex-wrap gap-x-4 gap-y-1">
                <span>Registration No: <strong className="font-mono text-white">{member?.number || receipts[0]?.resident_no2 || registrationNumber}</strong></span>
                {(member?.company || receipts[0]?.overseas_name) && (
                  <span>Company: <strong className="text-amber-300">{member?.company || receipts[0]?.overseas_name}</strong></span>
                )}
              </div>
            </div>
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/15 text-right">
              <div className="text-[11px] text-slate-300">Total Issued Receipts</div>
              <div className="text-2xl font-black text-amber-400 font-mono">{receipts.length}</div>
            </div>
          </div>

          {receipts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Tax Receipts Issued Yet</h3>
              <p className="text-xs text-slate-500">
                Your membership record is registered, but there are no monthly tax receipts issued under your account yet.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Monthly Tax Withholding Receipts ({receipts.length})
                </h3>
                <span className="text-xs text-slate-500">Click &quot;View / Print&quot; to open official receipt</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5">No.</th>
                      <th className="px-4 py-3.5">Taxation Period</th>
                      <th className="px-4 py-3.5">Company</th>
                      <th className="px-4 py-3.5 text-right">Total Salary (KRW)</th>
                      <th className="px-4 py-3.5 text-right">Income Tax</th>
                      <th className="px-4 py-3.5 text-right">Resident Tax</th>
                      <th className="px-4 py-3.5 text-right">Total Paid (KRW)</th>
                      <th className="px-4 py-3.5 text-center">Issue Date</th>
                      <th className="px-4 py-3.5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {receipts.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{receipts.length - idx}</td>
                        <td className="px-4 py-3.5 font-mono font-bold text-gta-800">
                          {formatUnixMonth(r.taxation_period)}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                          {r.overseas_name || r.local_name || '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-900">
                          ₩{r.total_salary || r.total_totalsalary || '0'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                          ₩{r.payable_income || '0'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                          ₩{r.payable_resident || '0'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-extrabold text-emerald-700">
                          ₩{r.payable_special || '0'}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-xs text-slate-500">
                          {formatUnixDate(r.reg_date)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(r)}
                            className="bg-gta-600 hover:bg-gta-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View / Print</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official Printable Tax Withholding Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full p-6 sm:p-10 space-y-6 my-8 print:shadow-none print:border-0 print:my-0 print:max-w-full">
            {/* Modal Action Bar (Hidden when printing) */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center space-x-2">
                <span className="bg-gta-100 text-gta-800 text-xs font-extrabold px-3 py-1 rounded-full">
                  Official GTA Tax Receipt #{selectedReceipt.id}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Period: {formatUnixMonth(selectedReceipt.taxation_period)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Receipt Document Body */}
            <div className="border-2 border-slate-800 p-6 sm:p-8 space-y-5 text-xs text-slate-900">
              <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Geoje Taxpayers Association (납세조합 완납 영수증)
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                  Receipt for Wage &amp; Salary Income Tax Withholding
                </h2>
                <div className="text-xs font-mono text-slate-600">
                  Management No: <strong>{selectedReceipt.management_no || '-'}</strong> &nbsp;|&nbsp; Taxation Period: <strong>{formatUnixMonth(selectedReceipt.taxation_period)}</strong>
                </div>
              </div>

              {/* Section 1: Withholding Agent & Taxpayer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-400 p-3.5 space-y-1.5 bg-slate-50/50">
                  <div className="font-black text-slate-800 border-b border-slate-300 pb-1 uppercase text-[11px]">
                    1. Withholding Agent (Taxpayers Association)
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500 font-semibold">Association:</span>
                    <span className="col-span-2 font-bold">{selectedReceipt.association_name || 'Geoje Taxpayers Association'}</span>
                    <span className="text-slate-500 font-semibold">License No:</span>
                    <span className="col-span-2 font-mono">{selectedReceipt.license_no || '612-80-03137'}</span>
                    <span className="text-slate-500 font-semibold">Chairman:</span>
                    <span className="col-span-2 font-semibold">{selectedReceipt.chairman_name || 'Kim Se- Kwang'}</span>
                    <span className="text-slate-500 font-semibold">Address:</span>
                    <span className="col-span-2 text-[11px]">{selectedReceipt.address1 || '#107, 3696 Geoje-daero, Geoje-si, Gyeongsangnam-do, Korea'}</span>
                  </div>
                </div>

                <div className="border border-slate-400 p-3.5 space-y-1.5 bg-slate-50/50">
                  <div className="font-black text-slate-800 border-b border-slate-300 pb-1 uppercase text-[11px]">
                    2. Taxpayer (Earner) Information
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500 font-semibold">Full Name:</span>
                    <span className="col-span-2 font-black text-sm">{selectedReceipt.name}</span>
                    <span className="text-slate-500 font-semibold">Reg. Number:</span>
                    <span className="col-span-2 font-mono font-bold">{selectedReceipt.resident_no2}</span>
                    <span className="text-slate-500 font-semibold">Company:</span>
                    <span className="col-span-2 font-semibold">{selectedReceipt.overseas_name || selectedReceipt.local_name || '-'}</span>
                    <span className="text-slate-500 font-semibold">Address:</span>
                    <span className="col-span-2 text-[11px]">{selectedReceipt.address2 || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Salary Breakdown */}
              <div className="space-y-1.5">
                <div className="font-black text-slate-800 uppercase text-[11px]">
                  3. Wage &amp; Salary Income Details (KRW)
                </div>
                <table className="w-full border-collapse border border-slate-500 text-center text-xs">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th className="border border-slate-400 p-2">Classification</th>
                      <th className="border border-slate-400 p-2">Company Name</th>
                      <th className="border border-slate-400 p-2">Basic Salary</th>
                      <th className="border border-slate-400 p-2">Bonus</th>
                      <th className="border border-slate-400 p-2">Other Income</th>
                      <th className="border border-slate-400 p-2">Total Salary</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr>
                      <td className="border border-slate-400 p-2 font-sans font-semibold bg-slate-50">Overseas (Class B)</td>
                      <td className="border border-slate-400 p-2 font-sans">{selectedReceipt.overseas_name || '-'}</td>
                      <td className="border border-slate-400 p-2 text-right">{selectedReceipt.overseas_basicsalary || '0'}</td>
                      <td className="border border-slate-400 p-2 text-right">{selectedReceipt.overseas_bonus || '0'}</td>
                      <td className="border border-slate-400 p-2 text-right">{selectedReceipt.overseas_income || '0'}</td>
                      <td className="border border-slate-400 p-2 text-right font-bold">{selectedReceipt.overseas_totalsalary || selectedReceipt.total_salary || '0'}</td>
                    </tr>
                    {(selectedReceipt.local_name || (selectedReceipt.local_totalsalary && selectedReceipt.local_totalsalary !== '0')) && (
                      <tr>
                        <td className="border border-slate-400 p-2 font-sans font-semibold bg-slate-50">Local (Class A)</td>
                        <td className="border border-slate-400 p-2 font-sans">{selectedReceipt.local_name || '-'}</td>
                        <td className="border border-slate-400 p-2 text-right">{selectedReceipt.local_basicsalary || '0'}</td>
                        <td className="border border-slate-400 p-2 text-right">{selectedReceipt.local_bonus || '0'}</td>
                        <td className="border border-slate-400 p-2 text-right">{selectedReceipt.local_income || '0'}</td>
                        <td className="border border-slate-400 p-2 text-right font-bold">{selectedReceipt.local_totalsalary || '0'}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={2} className="border border-slate-400 p-2 font-sans">Total Gross Wage (KRW)</td>
                      <td className="border border-slate-400 p-2 text-right">{selectedReceipt.total_basicsalary || selectedReceipt.overseas_basicsalary || '0'}</td>
                      <td className="border border-slate-400 p-2 text-right">{selectedReceipt.total_bonus || '0'}</td>
                      <td className="border border-slate-400 p-2 text-right">{selectedReceipt.total_income || '0'}</td>
                      <td className="border border-slate-400 p-2 text-right text-blue-800">{selectedReceipt.total_salary || selectedReceipt.total_totalsalary || '0'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 3: Tax Computation & Paid Tax */}
              <div className="space-y-1.5">
                <div className="font-black text-slate-800 uppercase text-[11px]">
                  4. Tax Calculation &amp; Withholding Tax Paid (KRW)
                </div>
                <table className="w-full border-collapse border border-slate-500 text-xs">
                  <tbody className="font-mono">
                    <tr>
                      <th className="border border-slate-400 p-2.5 bg-slate-100 text-left font-sans w-1/4">Computed Tax (산출세액)</th>
                      <td className="border border-slate-400 p-2.5 text-right w-1/4">₩{selectedReceipt.computed_tax || '0'}</td>
                      <th className="border border-slate-400 p-2.5 bg-slate-100 text-left font-sans w-1/4">Association Credit (납세조합공제)</th>
                      <td className="border border-slate-400 p-2.5 text-right w-1/4">₩{selectedReceipt.deduction_deduction || '0'}</td>
                    </tr>
                    <tr>
                      <th className="border border-slate-400 p-2.5 bg-slate-100 text-left font-sans">Income Tax (소득세)</th>
                      <td className="border border-slate-400 p-2.5 text-right font-bold">₩{selectedReceipt.payable_income || '0'}</td>
                      <th className="border border-slate-400 p-2.5 bg-slate-100 text-left font-sans">Local Resident Tax (지방소득세)</th>
                      <td className="border border-slate-400 p-2.5 text-right font-bold">₩{selectedReceipt.payable_resident || '0'}</td>
                    </tr>
                    <tr className="bg-emerald-50">
                      <th colSpan={2} className="border border-slate-400 p-3 text-left font-sans font-black text-sm text-emerald-950">
                        Total Monthly Tax Paid (합계 납부세액)
                      </th>
                      <td colSpan={2} className="border border-slate-400 p-3 text-right font-black text-base text-emerald-800">
                        ₩{selectedReceipt.payable_special || '0'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Certification */}
              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center border-t border-slate-300 gap-4">
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p>We hereby certify that the above wage and salary income tax has been duly withheld and paid to the National Tax Service.</p>
                  <p className="font-mono">Issue Date: <strong>{formatUnixDate(selectedReceipt.reg_date)}</strong> &nbsp;|&nbsp; Earner: <strong>{selectedReceipt.reg_name || selectedReceipt.name}</strong></p>
                </div>
                <div className="text-right shrink-0 border-2 border-red-700/80 text-red-700 px-3 py-1.5 rounded font-black text-xs uppercase tracking-wider">
                  Geoje Taxpayers Association [OFFICIAL SEAL]
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
