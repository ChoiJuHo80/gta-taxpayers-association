'use client';

import { useState, useRef } from 'react';
import { Search, FileText, CheckCircle2, AlertCircle, Printer, Download, User, CreditCard, LogOut } from 'lucide-react';
import { ApplicationMember, TaxReceipt } from '@/lib/db';
import ReceiptDocument, { downloadReceiptPdf, printReceiptDocument } from '@/components/ReceiptDocument';

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
  const receiptPrintRef = useRef<HTMLDivElement | null>(null);

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
    <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:p-0 print:m-0 print:space-y-0 print:max-w-none">
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
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors self-start whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out / New Search</span>
            </button>
          )}
        </div>

        <form onSubmit={handleLookup} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider whitespace-nowrap">
              Name * <span className="text-slate-400 font-normal normal-case">(Capital letters as on Residence Card)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. JOHN DOE"
                value={name}
                onChange={e => setName(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:ring-2 focus:ring-gta-500"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider whitespace-nowrap">
              Registration Number *
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. 800101-3000000"
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
              className="w-full bg-gta-600 hover:bg-gta-700 text-white font-bold py-3 px-5 rounded-xl text-sm transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>{loading ? 'Checking...' : 'Check My Receipt'}</span>
            </button>
          </div>
        </form>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="font-bold text-slate-800">📌 Login Guide for GTA Members:</div>
          <div>• <strong>Name:</strong> Write down your full name in CAPITAL letters and spaces as shown on your KOR Residence Card (or Membership Card ID).</div>
          <div>• <strong>Registration Number:</strong> Write down your Registration Number (e.g., <code>800101-3000000</code>) or Membership Password.</div>
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
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider whitespace-nowrap">Verified GTA Member</span>
              </div>
              <h2 className="text-xl font-black">
                {member?.name || receipts[0]?.name || name}
              </h2>
              <div className="text-xs text-slate-300 flex flex-wrap gap-x-4 gap-y-1">
                <span className="whitespace-nowrap">Registration No: <strong className="font-mono text-white">{member?.number || receipts[0]?.resident_no2 || registrationNumber}</strong></span>
                {(member?.company || receipts[0]?.overseas_name) && (
                  <span className="whitespace-nowrap">Company: <strong className="text-amber-300">{member?.company || receipts[0]?.overseas_name}</strong></span>
                )}
              </div>
            </div>
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/15 text-right shrink-0 whitespace-nowrap">
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
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2 bg-slate-50">
                <h3 className="font-extrabold text-slate-900 text-sm whitespace-nowrap">
                  Monthly Tax Withholding Receipts ({receipts.length})
                </h3>
                <span className="text-xs text-slate-500 whitespace-nowrap">Click &quot;View / Print&quot; to open official receipt</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-700 text-[11px] sm:text-xs uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-2.5 sm:px-3 py-3 text-center">No.</th>
                      <th className="px-2.5 sm:px-3 py-3 whitespace-nowrap">Taxation Period</th>
                      <th className="px-2.5 sm:px-3 py-3">Company</th>
                      <th className="px-2.5 sm:px-3 py-3 text-right whitespace-nowrap">Total Salary</th>
                      <th className="px-2.5 sm:px-3 py-3 text-right whitespace-nowrap">Income Tax</th>
                      <th className="px-2.5 sm:px-3 py-3 text-right whitespace-nowrap">Resident Tax</th>
                      <th className="px-2.5 sm:px-3 py-3 text-right whitespace-nowrap">Total Paid</th>
                      <th className="px-2.5 sm:px-3 py-3 text-center whitespace-nowrap">Issue Date</th>
                      <th className="px-2.5 sm:px-3 py-3 text-center whitespace-nowrap">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                    {receipts.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-2.5 sm:px-3 py-3 font-mono text-xs text-slate-500 text-center">
                          {receipts.length - idx}
                        </td>
                        <td className="px-2.5 sm:px-3 py-3 font-mono font-bold text-gta-800 whitespace-nowrap">
                          {formatUnixMonth(r.taxation_period)}
                        </td>
                        <td className="px-2.5 sm:px-3 py-3 font-semibold text-slate-800 truncate max-w-[140px]" title={r.overseas_name || r.local_name || '-'}>
                          {r.overseas_name || r.local_name || '-'}
                        </td>
                        <td className="px-2.5 sm:px-3 py-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                          ₩{r.total_salary || r.total_totalsalary || '0'}
                        </td>
                        <td className="px-2.5 sm:px-3 py-3 text-right font-mono text-slate-700 whitespace-nowrap">
                          ₩{r.payable_income || '0'}
                        </td>
                        <td className="px-2.5 sm:px-3 py-3 text-right font-mono text-slate-700 whitespace-nowrap">
                          ₩{r.payable_resident || '0'}
                        </td>
                        <td className="px-2.5 sm:px-3 py-3 text-right font-mono font-extrabold text-emerald-700 whitespace-nowrap">
                          ₩{r.payable_special || '0'}
                        </td>
                        <td className="px-2.5 sm:px-3 py-3 text-center font-mono text-xs text-slate-500 whitespace-nowrap">
                          {formatUnixDate(r.reg_date)}
                        </td>
                        <td className="px-2.5 sm:px-3 py-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(r)}
                            className="bg-gta-600 hover:bg-gta-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs inline-flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                          >
                            <Printer className="w-3.5 h-3.5 shrink-0" />
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:bg-white print:p-0">
          <div className="bg-white border-2 border-slate-500 shadow-2xl max-w-[760px] w-full p-3 sm:p-4 my-auto max-h-[96vh] flex flex-col print:shadow-none print:border-0 print:my-0 print:max-w-full print:p-0 print:max-h-none">
            {/* Modal Action Bar (Hidden when printing) */}
            <div className="shrink-0 flex justify-between items-center border-b border-slate-300 pb-2 mb-2 print:hidden">
              <div className="flex items-center space-x-2">
                <span className="bg-gta-100 text-gta-800 text-xs font-extrabold px-3 py-1 rounded-full">
                  Official GTA Tax Receipt #{selectedReceipt.id}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (receiptPrintRef.current) {
                      downloadReceiptPdf(receiptPrintRef.current, selectedReceipt);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 flex items-center space-x-1.5 shadow cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (receiptPrintRef.current) {
                      printReceiptDocument(receiptPrintRef.current);
                    } else {
                      window.print();
                    }
                  }}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-1.5 flex items-center space-x-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="overflow-y-auto overflow-x-hidden flex-1">
              <ReceiptDocument receipt={selectedReceipt} containerRef={receiptPrintRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
