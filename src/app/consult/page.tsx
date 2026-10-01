'use client';

import { useState } from 'react';
import { Shield, FileText, Upload, Lock, CheckCircle2, AlertCircle, Download, Calendar, User, Building, Phone, Mail, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function ConsultPage() {
  const [formData, setFormData] = useState({
    applicantName: '',
    nationality: '',
    alienRegNo: '',
    address: '',
    email: '',
    company: '',
    workplace: '',
    phone: '',
    dateFromYear: '2026',
    dateFromMonth: '10',
    dateFromDay: '01',
    dateToYear: '2026',
    dateToMonth: '10',
    dateToDay: '01',
    maritalStatus: 'Single',
    spouseName: '',
    spouseDob: '',
    spouseIncome: 'No',
    childrenCount: '0',
    child1Name: '', child1Dob: '',
    child2Name: '', child2Dob: '',
    child3Name: '', child3Dob: '',
    child4Name: '', child4Dob: '',
    salaryBasic: '',
    salaryAllowance: '',
    salaryBonus: '',
    workedOtherCompany: 'No',
    password: '',
    signature: '',
  });

  const [files, setFiles] = useState<{ name: string; size: number; encryptedPath: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{ id: string; password: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Download official Word (.doc) form file
  const handleDownloadWordForm = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>APPLICATION FOR ADMISSION TO GEOJE TAXPAYERS ASSOCIATION</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 25px; line-height: 1.5; }
          h2 { text-align: center; margin-bottom: 5px; font-size: 18pt; }
          .header-info { text-align: center; font-size: 11pt; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          td, th { border: 1px solid #777; padding: 8px; font-size: 10pt; }
          .section-title { font-weight: bold; background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h2>APPLICATION FOR ADMISSION TO GEOJE TAXPAYERS ASSOCIATION</h2>
        <div className="header-info">
          Tel: (055) 688-2141 &nbsp;&nbsp; Fax: (055) 688-2142 &nbsp;&nbsp; www.gtakorea.org
        </div>
        
        <table>
          <tr>
            <td colspan="2"><b>1. Applicant's name:</b> (write in capital letters)</td>
          </tr>
          <tr>
            <td><b>2. Alien Registration Number:</b></td>
            <td><b>* Nationality:</b></td>
          </tr>
          <tr>
            <td><b>3. Address:</b></td>
            <td><b>e-mail:</b></td>
          </tr>
          <tr>
            <td><b>4. Company:</b></td>
            <td><b>5. Work place (Project Name):</b> (ex: DSME, SHI, HHI, STX)</td>
          </tr>
          <tr>
            <td colspan="2"><b>6. Telephone number in Korea (Mobile):</b></td>
          </tr>
          <tr>
            <td colspan="2"><b>7. Date of Stay & Work:</b> From ____/____/________ ~ To ____/____/________</td>
          </tr>
          <tr>
            <td colspan="2" class="section-title">8. Exemption: Please check at least 1 item below.</td>
          </tr>
          <tr>
            <td colspan="2">
              [  ] Single &nbsp;&nbsp;&nbsp;&nbsp; [  ] Married (A copy of your marriage certificate is required)<br/>
              Spouse's name: ________________________ His/Her Date of Birth: ____________________<br/>
              ※ Does your spouse have any form of income? (Yes / No)<br/>
              Number of children below 20 years of age: _____ (A copy of child's birth certificate is required)<br/>
              Child 1 Name: _____________________ DOB: ______________<br/>
              Child 2 Name: _____________________ DOB: ______________
            </td>
          </tr>
          <tr>
            <td colspan="2" class="section-title">9. The Class B Income (USD, EUR, NOK, GBP, KRW)</td>
          </tr>
          <tr>
            <td colspan="2">
              ① Basic Salary per month: _________________________________<br/>
              ② Overseas allowance per month: ___________________________<br/>
              ③ Bonus per month: _____________________________________<br/>
              Total per month (①+②+③): _______________________________
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <b>10. Did you work for other company during the same year?</b> (Yes / No)<br/>
              <i>If Yes, you must submit a 'Receipt for wage and salary income Tax withholding' of your previous employment to GTA to avoid penalty tax.</i>
            </td>
          </tr>
        </table>
        
        <br/><br/>
        <p>I have read and ratified the charter of Geoje Taxpayers Association and hereby apply for admission.</p>
        <br/>
        <p>Applicant's Signature: ___________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: ____/____/________</p>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GTA_Admission_Application_Form.doc';
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

    const formattedContent = `
=== APPLICATION FOR ADMISSION TO GEOJE TAXPAYERS ASSOCIATION ===
1. Applicant Name: ${formData.applicantName}
2. Alien Reg Number: ${formData.alienRegNo} | Nationality: ${formData.nationality}
3. Address: ${formData.address} | Email: ${formData.email}
4. Company: ${formData.company}
5. Workplace / Project: ${formData.workplace}
6. Telephone (Mobile): ${formData.phone}
7. Date of Stay & Work: ${formData.dateFromYear}-${formData.dateFromMonth}-${formData.dateFromDay} ~ ${formData.dateToYear}-${formData.dateToMonth}-${formData.dateToDay}
8. Exemption Status: ${formData.maritalStatus}
   - Spouse Name: ${formData.spouseName || 'N/A'}, DOB: ${formData.spouseDob || 'N/A'}, Income: ${formData.spouseIncome}
   - Children (<20 yrs): ${formData.childrenCount}
   - Child 1: ${formData.child1Name || 'N/A'} (${formData.child1Dob || 'N/A'})
   - Child 2: ${formData.child2Name || 'N/A'} (${formData.child2Dob || 'N/A'})
9. Class B Income per month:
   - ① Basic Salary: ${formData.salaryBasic || '0'}
   - ② Overseas Allowance: ${formData.salaryAllowance || '0'}
   - ③ Bonus: ${formData.salaryBonus || '0'}
   - Total Monthly Income: ${calculateTotalSalary()}
10. Worked for other company during same year: ${formData.workedOtherCompany}
11. Signature: ${formData.signature || formData.applicantName}
    `.trim();

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
          password: formData.password,
          attachments: files,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessResult({ id: json.data.id, password: formData.password });
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
        <h1 className="text-3xl font-extrabold text-slate-900">Application Submitted Successfully!</h1>
        <p className="text-slate-600 leading-relaxed">
          Your admission application to Geoje Taxpayers Association has been securely registered. Our tax advisor will review your submitted application.
        </p>

        <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-3 font-mono text-sm">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Application ID:</span>
            <span className="font-bold text-gta-700">{successResult.id}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Lookup Password:</span>
            <span className="font-bold text-slate-900">{successResult.password}</span>
          </div>
          <p className="text-xs text-slate-500 font-sans pt-1">
            * You can lookup your application status anytime under [Check My Receipt / Status Lookup] menu.
          </p>
        </div>

        <div className="pt-4 flex justify-center space-x-4">
          <Link href="/consult/lookup" className="bg-gta-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-gta-700 shadow">
            Check Application Status
          </Link>
          <Link href="/" className="bg-slate-200 text-slate-800 font-bold px-6 py-3 rounded-xl hover:bg-slate-300">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Top Banner & Official Form Header */}
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-gta-600 font-bold text-xs bg-gta-50 px-3 py-1 rounded-full mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>SSL 256-bit Encrypted Admission Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              APPLICATION FOR ADMISSION TO GEOJE TAXPAYERS ASSOCIATION
            </h1>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Tel: (055) 688-2141 &nbsp;|&nbsp; Fax: (055) 688-2142 &nbsp;|&nbsp; www.gtakorea.org
            </p>
          </div>

          {/* Download Official Word Form Button */}
          <button
            onClick={handleDownloadWordForm}
            className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition-all shrink-0 group"
          >
            <Download className="w-4 h-4 group-hover:bounce" />
            <span>DOWNLOAD FORM (.DOC)</span>
          </button>
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
                  1. Applicant's Name * <span className="text-slate-400 font-normal">(write in CAPITAL letters)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KIM SILVIA"
                  value={formData.applicantName}
                  onChange={e => setFormData({ ...formData, applicantName: e.target.value.toUpperCase() })}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">2. Alien Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 820012-3932521"
                  value={formData.alienRegNo}
                  onChange={e => setFormData({ ...formData, alienRegNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">3. E-mail Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. silvia@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">6. Telephone (Mobile) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 010-3700-3719"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address in Korea *</label>
              <input
                type="text"
                required
                placeholder="Enter your full residential address in Geoje/Korea"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
              />
            </div>
          </div>

          {/* Section 4 ~ 7: Employment & Stay Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
              Employment & Stay Information
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
                  5. Work place / Project Name <span className="text-slate-400 font-normal">(ex: DSME, SHI, HHI, STX)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. DSME Yard Project"
                  value={formData.workplace}
                  onChange={e => setFormData({ ...formData, workplace: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">7. Date of Stay & Work *</label>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-600 shrink-0">From:</span>
                  <input
                    type="date"
                    value={`${formData.dateFromYear}-${formData.dateFromMonth}-${formData.dateFromDay}`}
                    onChange={e => {
                      const parts = e.target.value.split('-');
                      setFormData({ ...formData, dateFromYear: parts[0], dateFromMonth: parts[1], dateFromDay: parts[2] });
                    }}
                    className="px-2 py-1 rounded border border-slate-300 text-xs font-mono w-full"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-600 shrink-0">To:</span>
                  <input
                    type="date"
                    value={`${formData.dateToYear}-${formData.dateToMonth}-${formData.dateToDay}`}
                    onChange={e => {
                      const parts = e.target.value.split('-');
                      setFormData({ ...formData, dateToYear: parts[0], dateToMonth: parts[1], dateToDay: parts[2] });
                    }}
                    className="px-2 py-1 rounded border border-slate-300 text-xs font-mono w-full"
                  />
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
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Spouse's Name</label>
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
                <div className="flex items-center space-x-3">
                  <label className="font-bold text-slate-700">Number of children below 20 years of age:</label>
                  <select
                    value={formData.childrenCount}
                    onChange={e => setFormData({ ...formData, childrenCount: e.target.value })}
                    className="px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                  <span className="text-[11px] text-slate-500">(A copy of child's birth certificate is required)</span>
                </div>

                {parseInt(formData.childrenCount) > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600">Child 1 Name & DOB</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Name"
                          value={formData.child1Name}
                          onChange={e => setFormData({ ...formData, child1Name: e.target.value })}
                          className="w-2/3 px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="DOB"
                          value={formData.child1Dob}
                          onChange={e => setFormData({ ...formData, child1Dob: e.target.value })}
                          className="w-1/3 px-2 py-1 rounded border border-slate-300 text-xs font-mono"
                        />
                      </div>
                    </div>

                    {parseInt(formData.childrenCount) > 1 && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600">Child 2 Name & DOB</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Name"
                            value={formData.child2Name}
                            onChange={e => setFormData({ ...formData, child2Name: e.target.value })}
                            className="w-2/3 px-2 py-1 rounded border border-slate-300 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="DOB"
                            value={formData.child2Dob}
                            onChange={e => setFormData({ ...formData, child2Dob: e.target.value })}
                            className="w-1/3 px-2 py-1 rounded border border-slate-300 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 italic bg-amber-50 p-2 rounded border border-amber-200">
                ※ Family stays in Korea: Only a copy of Alien Registration Card is necessary.
              </div>
            </div>
          </div>

          {/* Section 9: Class B Income Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
              9. The Class B Income (USD, EUR, NOK, GBP, KRW)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">① Basic Salary per month</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={formData.salaryBasic}
                  onChange={e => setFormData({ ...formData, salaryBasic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">② Overseas allowance per month</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={formData.salaryAllowance}
                  onChange={e => setFormData({ ...formData, salaryAllowance: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">③ Bonus per month</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={formData.salaryBonus}
                  onChange={e => setFormData({ ...formData, salaryBonus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex justify-between items-center text-xs font-bold text-emerald-900">
              <span>Total Estimated Monthly Income (①+②+③):</span>
              <span className="font-mono text-base text-emerald-700">{calculateTotalSalary()}</span>
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
                  ※ If Yes, you must submit a <strong>'Receipt for wage and salary income Tax withholding'</strong> of your previous employment to GTA to avoid penalty tax.
                </div>
              )}
            </div>
          </div>

          {/* Attachments & Signature */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-gta-900 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-gta-600">
              Required Documents Upload & Signature
            </h3>

            {/* Secure Encrypted File Upload Box */}
            <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-300 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-gta-500" />
                  <span>Attach Copies (ARC Card, Marriage Certificate, Child Birth Certificate, Income Receipt)</span>
                </label>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  🔒 AES-256 Encrypted
                </span>
              </div>

              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gta-50 file:text-gta-700 hover:file:bg-gta-100"
              />

              {files.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-slate-600">Encrypted Uploaded Files:</span>
                  {files.map((f, idx) => (
                    <div key={idx} className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 flex justify-between items-center font-mono">
                      <span>📄 {f.name} ({(f.size / 1024).toFixed(1)} KB)</span>
                      <span className="text-emerald-600 font-bold text-[10px]">Encrypted</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Applicant's Signature * <span className="text-slate-400 font-normal">(Type full name)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full name signature"
                  value={formData.signature}
                  onChange={e => setFormData({ ...formData, signature: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-serif italic font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4-Digit Status Lookup Password *
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="Create 4-digit PIN (e.g. 1234)"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gta-600 to-gta-500 hover:from-gta-700 hover:to-gta-600 text-white font-extrabold py-4 rounded-2xl shadow-xl transition-all text-base disabled:opacity-50 tracking-wider uppercase"
          >
            {loading ? 'Submitting Admission Application...' : 'SUBMIT ADMISSION APPLICATION FORM'}
          </button>

        </form>

      </div>
    </div>
  );
}
