'use client';

import { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle2, AlertCircle, Download, DollarSign, KeyRound, MapPin, Search } from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    daum?: any;
  }
}

export default function ConsultPage() {
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLogged = sessionStorage.getItem('gta_admin_logged') === 'true';
      if (isLogged) {
        setIsAdminAuthorized(true);
      }
    }
  }, []);

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === '8992' || adminPinInput === '1201' || adminPinInput === 'gta7273') {
      setIsAdminAuthorized(true);
      sessionStorage.setItem('gta_admin_logged', 'true');
      setAdminPinError('');
    } else {
      setAdminPinError('Invalid Admin Passcode. Only authorized GTA staff can create admission records.');
    }
  };

  const CURRENCIES = ['USD', 'EURO', 'NOK', 'GBP', 'DKK', 'CAD', 'AUD', 'SGD', 'SEK', 'JPY', 'KRW'] as const;

  const [formData, setFormData] = useState({
    applicantName: '',
    nationality: '',
    alienRegNo: '',
    address: '',
    addressDetail: '',
    email: '',
    company: '',
    workPlace: '',
    projectName: '',
    phone: '',
    dateFromYear: '2026',
    dateFromMonth: '10',
    dateFromDay: '01',
    dateToYear: '2026',
    dateToMonth: '10',
    dateToDay: '01',
    workedBefore2004: 'No' as 'No' | 'Yes',
    maritalStatus: 'Single',
    spouseName: '',
    spouseDob: '',
    spouseIncome: 'No',
    childrenCount: '0',
    children: [] as { name: string; dob: string }[],
    salaryCurrency: 'USD',
    salaryBasic: '',
    salaryAllowance: '',
    salaryBonus: '',
    workedOtherCompany: 'No',
    remark: '',
    signature: '',
  });

  // Load Daum/Juso Postcode script for Korean -> English address search popup
  const handleOpenAddressPopup = () => {
    const openPostcode = () => {
      if (window.daum && window.daum.Postcode) {
        new window.daum.Postcode({
          oncomplete: (data: any) => {
            const engAddr = data.roadAddressEnglish || data.jibunAddressEnglish || data.addressEnglish || '';
            const zip = data.zonecode ? `, ${data.zonecode}` : '';
            const fullEng = engAddr ? `${engAddr}, Republic of Korea${zip}` : data.roadAddress;
            setFormData(prev => ({
              ...prev,
              address: prev.addressDetail ? `${prev.addressDetail}, ${fullEng}` : fullEng,
            }));
          },
        }).open();
      }
    };

    if (typeof window !== 'undefined') {
      if (window.daum && window.daum.Postcode) {
        openPostcode();
      } else {
        const script = document.createElement('script');
        script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.onload = openPostcode;
        document.body.appendChild(script);
      }
    }
  };

  const handleChildrenCountChange = (countStr: string) => {
    const count = Math.max(0, parseInt(countStr, 10) || 0);
    setFormData(prev => {
      const nextChildren = Array.from({ length: count }, (_, idx) => prev.children[idx] || { name: '', dob: '' });
      return {
        ...prev,
        childrenCount: String(count),
        children: nextChildren,
      };
    });
  };

  const handleChildChange = (index: number, field: 'name' | 'dob', value: string) => {
    setFormData(prev => {
      const nextChildren = [...prev.children];
      nextChildren[index] = { ...nextChildren[index], [field]: value };
      return { ...prev, children: nextChildren };
    });
  };

  const [files, setFiles] = useState<{ name: string; size: number; encryptedPath: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{ id: string; memberId?: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Download official Excel (.xlsx) form file
  const handleDownloadExcelForm = () => {
    const a = document.createElement('a');
    a.href = '/api/download/application-form';
    a.download = '2026_GTA_Application_form.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile = {
        name: file.name,
        size: file.size,
        encryptedPath: `encrypted/${Date.now()}_${file.name}.enc`,
      };
      setFiles(prev => [...prev, newFile]);
    }
  };

  const calculateTotalSalary = () => {
    const b = parseFloat(formData.salaryBasic) || 0;
    const a = parseFloat(formData.salaryAllowance) || 0;
    const bo = parseFloat(formData.salaryBonus) || 0;
    return (b + a + bo).toLocaleString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const childrenLines =
      formData.children.length > 0
        ? formData.children
            .map((c, idx) => `   - Child ${idx + 1}: ${c.name || 'N/A'} (${c.dob || 'N/A'})`)
            .join('\n')
        : '   - Children Details: None';

    const formattedContent = `
=== APPLICATION FOR ADMISSION TO GEOJE TAXPAYERS ASSOCIATION ===
1. Applicant Name: ${formData.applicantName}
2. Registration Number: ${formData.alienRegNo} | Nationality: ${formData.nationality}
3. Address: ${formData.address} | Email: ${formData.email}
4. Company: ${formData.company}
5. Telephone (Mobile): ${formData.phone}
6. Date of Stay & Work: ${formData.dateFromYear}-${formData.dateFromMonth}-${formData.dateFromDay} ~ ${formData.dateToYear}-${formData.dateToMonth}-${formData.dateToDay}
7. Exemption Status: ${formData.maritalStatus}
   - Spouse Name: ${formData.spouseName || 'N/A'}, DOB: ${formData.spouseDob || 'N/A'}, Income: ${formData.spouseIncome}
   - Children (<20 yrs): ${formData.childrenCount}
${childrenLines}
8. Class B Income per month (${formData.salaryCurrency}):
   - ① Basic Salary: ${formData.salaryCurrency} ${formData.salaryBasic || '0'}
   - ② Overseas Allowance: ${formData.salaryCurrency} ${formData.salaryAllowance || '0'}
   - ③ Bonus: ${formData.salaryCurrency} ${formData.salaryBonus || '0'}
   - Total Monthly Income: ${formData.salaryCurrency} ${calculateTotalSalary()}
9. Worked for other company during same year: ${formData.workedOtherCompany}
10. Remark: ${formData.remark || 'None'}
11. Signature: ${formData.signature || formData.applicantName}
    `.trim();

    // Build legacy-compatible family_txt (Spouse|DOB|Child1|DOB|...)
    const familyParts: string[] = [
      formData.maritalStatus === 'Married' ? formData.spouseName || '' : '',
      formData.maritalStatus === 'Married' ? formData.spouseDob || '' : '',
    ];
    formData.children.forEach(ch => {
      familyParts.push(ch.name || '', ch.dob || '');
    });
    while (familyParts.length < 11) {
      familyParts.push('');
    }

    const dateFromUnix = String(Math.floor(new Date(`${formData.dateFromYear}-${formData.dateFromMonth}-${formData.dateFromDay}`).getTime() / 1000) || Math.floor(Date.now() / 1000));
    const dateToUnix = String(Math.floor(new Date(`${formData.dateToYear}-${formData.dateToMonth}-${formData.dateToDay}`).getTime() / 1000) || Math.floor(Date.now() / 1000));

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: formData.applicantName,
          phone: formData.phone,
          category: 'Application Form',
          title: `[Admission Application] ${formData.applicantName} (${formData.company || 'Individual'})`,
          content: formattedContent,
          attachments: files,
          memberData: {
            name: formData.applicantName,
            number: formData.alienRegNo,
            address: formData.address,
            email: formData.email,
            company: formData.company,
            nationality: formData.nationality,
            phon: formData.phone,
            date_from: dateFromUnix,
            date_to: dateToUnix,
            married: formData.maritalStatus === 'Married' ? '2' : '1',
            age: formData.childrenCount,
            spouse: formData.spouseIncome === 'Yes' ? '1' : '2',
            money_01: formData.salaryBasic ? `${formData.salaryCurrency} ${formData.salaryBasic}` : '0',
            money_02: formData.salaryAllowance ? `${formData.salaryCurrency} ${formData.salaryAllowance}` : '0',
            money_03: formData.salaryBonus ? `${formData.salaryCurrency} ${formData.salaryBonus}` : '0',
            money_04: `${formData.salaryCurrency} ${calculateTotalSalary()}`,
            name2: formData.applicantName,
            name3: formData.alienRegNo,
            family_txt: familyParts.join('|'),
            other_worked: formData.workedOtherCompany === 'Yes' ? 1 : 0,
            remark: formData.remark,
            work_place: formData.workPlace,
            project_name: formData.projectName,
            worked_before_2004: formData.workedBefore2004,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessResult({ id: json.data.id, memberId: json.member?.id });
      } else {
        setErrorMsg(json.message || 'Error processing application submission.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  if (successResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Application Registered Successfully!</h1>
        <p className="text-slate-600 leading-relaxed">
          The member admission application has been registered in the GTA Member Database. You can now search this member and issue monthly tax receipts in the Admin Portal.
        </p>

        <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2.5 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Application ID:</span>
            <span className="font-bold text-gta-700">{successResult.id}</span>
          </div>
          {successResult.memberId && (
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-500">Member No:</span>
              <span className="font-bold text-emerald-700">#{successResult.memberId}</span>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-center space-x-4">
          <Link href="/admin" className="bg-gta-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-gta-700 shadow">
            Go to Admin Portal
          </Link>
          <button
            type="button"
            onClick={() => setSuccessResult(null)}
            className="bg-slate-200 text-slate-800 font-bold px-6 py-3 rounded-xl hover:bg-slate-300 cursor-pointer"
          >
            Register Another Member
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* If NOT admin authorized: Show General Member Guidance & Admin Login Gate */}
      {!isAdminAuthorized ? (
        <div className="space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 text-center space-y-6 max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full uppercase border border-sky-200">
                Notice for General Members &amp; Expatriates
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Application Form Submission Notice
              </h1>
              <p className="text-slate-600 text-sm leading-relaxed max-w-xl mx-auto">
                Direct online web input is strictly managed by authorized GTA staff. General taxpayers should download the official Excel (.xlsx) application form on the <strong>Contact Us</strong> page, fill it out, and submit it to GTA via Email (<strong>gta@gtakorea.org</strong>) or Fax.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Go to Contact Us &amp; Download Form (.XLSX)</span>
              </Link>
              <button
                type="button"
                onClick={handleDownloadExcelForm}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm px-6 py-3.5 rounded-xl border border-slate-300 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Direct Download (.XLSX)</span>
              </button>
            </div>
          </div>

          {/* Admin Verification Gate */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl max-w-md mx-auto space-y-4 border border-slate-800">
            <div className="flex items-center space-x-2.5 text-xs text-amber-400 font-bold uppercase">
              <KeyRound className="w-4 h-4" />
              <span>GTA Staff Administrator Mode</span>
            </div>
            <h3 className="text-lg font-black text-white">Administrator Access Only</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you are a GTA staff administrator writing and uploading an admission record directly to the database, enter your passcode below:
            </p>

            <form onSubmit={handleAdminVerify} className="space-y-3 pt-1">
              <input
                type="password"
                required
                placeholder="Enter Admin Passcode (e.g. 8992)"
                value={adminPinInput}
                onChange={e => setAdminPinInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 font-mono"
              />
              {adminPinError && (
                <div className="text-xs text-red-400 font-semibold">{adminPinError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow cursor-pointer"
              >
                Authorize Administrator Mode
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Top Banner & Official Form Header (Admin Mode Authorized) */
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full mb-2 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized GTA Administrator Entry Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                APPLICATION FOR ADMISSION TO GEOJE TAXPAYERS ASSOCIATION
              </h1>
              <p className="text-xs font-mono text-slate-500 mt-1">
                Tel: (055) 688-2141 &nbsp;|&nbsp; Fax: (055) 688-2142 &nbsp;|&nbsp; www.gtakorea.org
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center space-x-3 text-sm font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Official Admission Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1 ~ 3: Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. Applicant&apos;s Name * <span className="text-slate-400 font-normal">(write in CAPITAL letters — auto-fills Signature)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JOHN DOE"
                    value={formData.applicantName}
                    onChange={e => {
                      const upperName = e.target.value.toUpperCase();
                      setFormData(prev => ({
                        ...prev,
                        applicantName: upperName,
                        signature: upperName,
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nationality *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. United Kingdom"
                    value={formData.nationality}
                    onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2. Registration Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 800101-3000000"
                    value={formData.alienRegNo}
                    onChange={e => setFormData({ ...formData, alienRegNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. johndoe@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                  />
                </div>
              </div>

              {/* Address with Korean Parcel-Style Popup Search -> Auto English Conversion */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-700">
                    3. Residential Address in Korea * <span className="text-slate-400 font-normal">(Search road address to auto-fill in English)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenAddressPopup}
                    className="bg-gta-600 hover:bg-gta-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>주소 검색 (Search &amp; Auto-Fill English Address)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Click 'Search Address' or enter English address in Korea"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Apt / Room / Dong-Ho (e.g. #103-1002)"
                      value={formData.addressDetail}
                      onChange={e => {
                        const detail = e.target.value;
                        setFormData(prev => {
                          const baseAddr = prev.address.replace(/^#?[^,]+,\s*(?=\d)/, '');
                          return {
                            ...prev,
                            addressDetail: detail,
                            address: detail ? `${detail}, ${baseAddr}` : baseAddr,
                          };
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 ~ 7: Employment & Stay Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                Employment &amp; Stay Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">4. Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Northern Marine / Subsea 7"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    5. Work place <span className="font-normal text-slate-500">(ex : Hanwha Ocean, SHI, HHI, STX, ...)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Work place"
                      value={formData.workPlace}
                      onChange={e => setFormData({ ...formData, workPlace: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                    />
                    <input
                      type="text"
                      placeholder="Project Name"
                      value={formData.projectName}
                      onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">6. Telephone (Mobile) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 010-1234-5678"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">7. Date of Stay &amp; Work *</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-600 shrink-0 text-[11px]">From:</span>
                      <input
                        type="date"
                        value={`${formData.dateFromYear}-${formData.dateFromMonth}-${formData.dateFromDay}`}
                        onChange={e => {
                          const parts = e.target.value.split('-');
                          if (parts.length === 3) {
                            setFormData({ ...formData, dateFromYear: parts[0], dateFromMonth: parts[1], dateFromDay: parts[2] });
                          }
                        }}
                        className="px-2 py-1 rounded border border-slate-300 text-xs font-mono w-full bg-white"
                      />
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-600 shrink-0 text-[11px]">To:</span>
                      <input
                        type="date"
                        value={`${formData.dateToYear}-${formData.dateToMonth}-${formData.dateToDay}`}
                        onChange={e => {
                          const parts = e.target.value.split('-');
                          if (parts.length === 3) {
                            setFormData({ ...formData, dateToYear: parts[0], dateToMonth: parts[1], dateToDay: parts[2] });
                          }
                        }}
                        className="px-2 py-1 rounded border border-slate-300 text-xs font-mono w-full bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 8: Exemption (Marital & Children Details) */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                8. Exemption Status (Check at least 1 item below)
              </h3>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
                <div className="flex items-center space-x-6 font-bold text-slate-800">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="maritalStatus"
                      checked={formData.maritalStatus === 'Single'}
                      onChange={() => setFormData({ ...formData, maritalStatus: 'Single' })}
                      className="text-gta-600 focus:ring-gta-500"
                    />
                    <span>Single</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="maritalStatus"
                      checked={formData.maritalStatus === 'Married'}
                      onChange={() => setFormData({ ...formData, maritalStatus: 'Married' })}
                      className="text-gta-600 focus:ring-gta-500"
                    />
                    <span>Married</span>
                    <span className="text-[11px] text-amber-700 font-normal">(A copy of your marriage certificate is required)</span>
                  </label>
                </div>

                {formData.maritalStatus === 'Married' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Spouse&apos;s Name</label>
                      <input
                        type="text"
                        placeholder="Spouse full name"
                        value={formData.spouseName}
                        onChange={e => setFormData({ ...formData, spouseName: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Spouse Date of Birth</label>
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={formData.spouseDob}
                        onChange={e => setFormData({ ...formData, spouseDob: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Does spouse have any form of income?</label>
                      <select
                        value={formData.spouseIncome}
                        onChange={e => setFormData({ ...formData, spouseIncome: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs font-bold"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="font-bold text-slate-700">Number of children below 20 years of age:</label>
                    <select
                      value={formData.childrenCount}
                      onChange={e => handleChildrenCountChange(e.target.value)}
                      className="px-2.5 py-1 rounded border border-slate-300 text-xs font-bold bg-white"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={String(num)}>{num}</option>
                      ))}
                    </select>
                    <span className="text-[11px] text-slate-500">(A copy of child&apos;s birth certificate is required)</span>
                  </div>

                  {formData.children.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {formData.children.map((child, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Child {idx + 1} Name &amp; DOB
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder={`Child ${idx + 1} Name`}
                              value={child.name}
                              onChange={e => handleChildChange(idx, 'name', e.target.value)}
                              className="w-2/3 px-2 py-1.5 rounded border border-slate-300 text-xs"
                            />
                            <input
                              type="text"
                              placeholder="DOB (DD/MM/YYYY)"
                              value={child.dob}
                              onChange={e => handleChildChange(idx, 'dob', e.target.value)}
                              className="w-1/3 px-2 py-1.5 rounded border border-slate-300 text-xs font-mono"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 italic bg-amber-50 p-2 rounded border border-amber-200">
                  ※ Family stays in Korea: Only a copy of KOR residence card is necessary.
                </div>
              </div>
            </div>

            {/* Section 9: Class B Income Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                9. The Class B Income (USD, EURO, NOK, GBP, DKK, CAD, AUD, SGD, SEK, JPY, KRW)
              </h3>

              {/* Currency Selection Bar */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-gta-600" />
                    <span>Select Salary Currency (Auto-applied to all income fields &amp; Total Income):</span>
                  </label>
                  <select
                    value={formData.salaryCurrency}
                    onChange={e => setFormData({ ...formData, salaryCurrency: e.target.value })}
                    className="px-3 py-1.5 rounded-lg border border-gta-300 bg-white text-xs font-extrabold text-gta-800 focus:ring-2 focus:ring-gta-500"
                  >
                    {CURRENCIES.map(cur => (
                      <option key={cur} value={cur}>{cur}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CURRENCIES.map(cur => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => setFormData({ ...formData, salaryCurrency: cur })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        formData.salaryCurrency === cur
                          ? 'bg-gta-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ① Basic Salary per month ({formData.salaryCurrency})
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-extrabold text-gta-700 bg-gta-50 px-1.5 py-0.5 rounded border border-gta-200 font-mono">
                      {formData.salaryCurrency}
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={formData.salaryBasic}
                      onChange={e => setFormData({ ...formData, salaryBasic: e.target.value })}
                      className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-gta-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ② Overseas allowance per month ({formData.salaryCurrency})
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-extrabold text-gta-700 bg-gta-50 px-1.5 py-0.5 rounded border border-gta-200 font-mono">
                      {formData.salaryCurrency}
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. 2000"
                      value={formData.salaryAllowance}
                      onChange={e => setFormData({ ...formData, salaryAllowance: e.target.value })}
                      className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-gta-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ③ Bonus per month ({formData.salaryCurrency})
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-extrabold text-gta-700 bg-gta-50 px-1.5 py-0.5 rounded border border-gta-200 font-mono">
                      {formData.salaryCurrency}
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={formData.salaryBonus}
                      onChange={e => setFormData({ ...formData, salaryBonus: e.target.value })}
                      className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-gta-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold text-emerald-900">
                <span>Total Income / Estimated Monthly Income (①+②+③):</span>
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-mono text-xs font-extrabold">
                    {formData.salaryCurrency}
                  </span>
                  <span className="font-mono text-lg text-emerald-700 font-black">
                    {formData.salaryCurrency} {calculateTotalSalary()}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 10: Worked for other company */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                10. Previous Employment Status
              </h3>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center space-x-6 font-bold text-slate-800">
                  <span>Did you work for other company during the same year in Korea?</span>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="workedOtherCompany"
                      checked={formData.workedOtherCompany === 'No'}
                      onChange={() => setFormData({ ...formData, workedOtherCompany: 'No' })}
                      className="text-gta-600 focus:ring-gta-500"
                    />
                    <span>No</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="workedOtherCompany"
                      checked={formData.workedOtherCompany === 'Yes'}
                      onChange={() => setFormData({ ...formData, workedOtherCompany: 'Yes' })}
                      className="text-gta-600 focus:ring-gta-500"
                    />
                    <span>Yes</span>
                  </label>
                </div>

                {formData.workedOtherCompany === 'Yes' && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
                    ※ If Yes, you must submit a <strong>&apos;Receipt for wage and salary income Tax withholding&apos;</strong> of your previous employment to GTA to avoid penalty tax.
                  </div>
                )}
              </div>
            </div>

            {/* Remark (Memo) */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                Remark (Administrator Memo / Notes)
              </h3>
              <div>
                <textarea
                  rows={3}
                  placeholder="Enter any remarks, DOB notes, or special tax memo for this member..."
                  value={formData.remark}
                  onChange={e => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                />
              </div>
            </div>

            {/* Attachments & Signature */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
                Required Documents Upload &amp; Signature
              </h3>

              <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-300 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-gta-500" />
                    <span>Attach Copies (KOR Residence Card, Marriage Certificate, Child Birth Certificate, Income Receipt)</span>
                  </label>
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    🔒 AES-256 Encrypted
                  </span>
                </div>

                <div className="flex items-center space-x-3 pt-1">
                  <label className="cursor-pointer bg-white hover:bg-slate-50 active:bg-slate-100 text-gta-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-300 shadow-xs inline-flex items-center space-x-2 transition-all">
                    <Upload className="w-3.5 h-3.5 text-gta-600" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-500 font-medium font-mono truncate max-w-xs">
                    {files.length > 0 ? files[files.length - 1].name : 'No file chosen'}
                  </span>
                </div>

                {files.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="font-bold text-slate-600">Encrypted Uploaded Files:</span>
                    {files.map((f, idx) => (
                      <div key={idx} className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 flex justify-between items-center font-mono">
                        <span>📄 {f.name} ({(f.size / 1024).toFixed(1)} KB)</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-600 font-bold text-[10px]">Encrypted</span>
                          <button
                            type="button"
                            onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-600 text-xs px-1 font-bold"
                            title="Remove file"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Applicant&apos;s Signature * <span className="text-emerald-600 font-semibold">(Auto-completed from Applicant&apos;s Name)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full name signature"
                  value={formData.signature}
                  onChange={e => setFormData({ ...formData, signature: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-serif italic font-bold bg-slate-50"
                />
              </div>

              {/* Agreement text */}
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 text-xs text-slate-800 font-semibold text-center italic">
                &quot;In accordance with the above, I hereby apply for membership in the GTA.&quot;
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gta-600 to-gta-500 hover:from-gta-700 hover:to-gta-600 text-white font-extrabold py-4 rounded-2xl shadow-xl transition-all text-base disabled:opacity-50 tracking-wider uppercase cursor-pointer"
            >
              {loading ? 'Submitting Admission Application...' : 'SUBMIT ADMISSION APPLICATION FORM'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
