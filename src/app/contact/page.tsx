'use client';

import { useState, useRef } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Building, Clock, Printer, Download, FileText, Upload, FileSpreadsheet, X, Sparkles, ArrowDown } from 'lucide-react';
import { translations } from '@/lib/i18n';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedFileName, setSubmittedFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Download official Excel (.xlsx) form file for general members
  const handleDownloadExcelForm = () => {
    const a = document.createElement('a');
    a.href = '/api/download/application-form';
    a.download = '2026_GTA_Application_form.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const scrollToContactForm = () => {
    const el = document.getElementById('contact-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFileSelect = (file: File) => {
    // 25MB limit
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 25MB limit.');
      return;
    }
    setErrorMsg('');
    setAttachedFile(file);
    // If subject is empty, automatically suggest a subject
    if (!formData.subject) {
      if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        setFormData(prev => ({
          ...prev,
          subject: prev.subject || `[Application Form Submission] ${file.name}`,
        }));
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('subject', formData.subject);
      data.append('message', formData.message);
      if (attachedFile) {
        data.append('file', attachedFile);
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (json.success) {
        setSubmittedFileName(attachedFile ? attachedFile.name : null);
        setSubmitted(true);
      } else {
        setErrorMsg(json.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error. Unable to send inquiry to GTA server.');
    } finally {
      setLoading(false);
    }
  };

  const isExcelAttached = attachedFile && (attachedFile.name.toLowerCase().endsWith('.xlsx') || attachedFile.name.toLowerCase().endsWith('.xls'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gta-100 text-gta-700 text-xs font-bold px-3.5 py-1.5 rounded-full">
          <Mail className="w-4 h-4 text-gta-600" />
          <span>Tax Service & Admission</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact Us & Application Form Submission
        </h1>
        <p className="text-slate-600 leading-relaxed text-base">
          Download the official GTA admission application form, complete it on your PC, and attach it directly to submit your admission inquiry to GTA certified advisors (gta@gtakorea.org).
        </p>
      </div>

      {/* Official Admission Application Form Download Card */}
      <div className="bg-gradient-to-r from-sky-900 via-gta-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-700/50 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-sky-500/20 text-sky-300 text-xs font-bold px-3 py-1 rounded-full border border-sky-400/30 whitespace-nowrap">
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Official Admission Document (.XLSX)</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              GTA Admission Application Form Download
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Download the official Excel form, fill in your details (Applicant name, Alien registration number, Company, Class B salary), and attach the saved file in the form below to submit directly!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={handleDownloadExcelForm}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-sm px-6 py-4 rounded-2xl shadow-xl flex items-center justify-center space-x-2.5 transition-all whitespace-nowrap hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Download className="w-5 h-5 animate-pulse shrink-0" />
              <span>DOWNLOAD FORM (.XLSX)</span>
            </button>
            <button
              onClick={scrollToContactForm}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-4 rounded-2xl border border-white/20 flex items-center justify-center space-x-2 transition-all whitespace-nowrap cursor-pointer"
            >
              <span>Attach Written Form</span>
              <ArrowDown className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* 3-Step Guide Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center space-x-3 bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
            <div className="space-y-0.5">
              <div className="font-bold text-slate-100">Download Excel Form</div>
              <div className="text-slate-400 text-[11px]">Click download button to get .XLSX</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
            <div className="space-y-0.5">
              <div className="font-bold text-slate-100">Fill In Your Details</div>
              <div className="text-slate-400 text-[11px]">Open on computer & save changes</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
            <div className="space-y-0.5">
              <div className="font-bold text-slate-100">Attach & Submit Below</div>
              <div className="text-slate-400 text-[11px]">Direct transmission to gta@gtakorea.org</div>
            </div>
          </div>
        </div>
      </div>

      <div id="contact-form-section" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Contact Details Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-gta-900 via-slate-900 to-gta-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-8">
          <div className="space-y-3 border-b border-slate-700 pb-6">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Geoje Taxpayers Association</span>
            <h2 className="text-2xl font-black">Get in Touch with GTA</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              We provide prompt, expert assistance for foreign engineers, executives, and company accounts across South Korea.
            </p>
          </div>

          <div className="space-y-6 text-sm">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs uppercase text-slate-400">Office Address</h4>
                <p className="font-medium text-slate-200 text-xs leading-normal">
                  #107, 3696 Geoje-daero, Geoje-city, Gyeongnam-do, Korea
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs uppercase text-slate-400">Telephone</h4>
                <p className="font-medium text-slate-200 text-xs">
                  Tel: +82(0)55-688-2141
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs uppercase text-slate-400">Fax Number</h4>
                <p className="font-medium text-slate-200 text-xs">
                  Fax: +82(0)55-688-2142
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs uppercase text-slate-400">Official E-Mail</h4>
                <p className="font-medium text-amber-300 text-xs">
                  gta@gtakorea.org
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs uppercase text-slate-400">Office Hours</h4>
                <p className="font-medium text-slate-200 text-xs">
                  Monday ~ Friday: 09:00 - 18:00 (KST)
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Website: www.gtakorea.org</span>
            <span className="text-emerald-400 font-bold">NTS Certified</span>
          </div>
        </div>

        {/* Right Column: Contact Form with File Attachment */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-extrabold text-slate-900">Send Inquiry & Attach Application Form</h2>
            <p className="text-xs text-slate-500 mt-1">
              Messages and attached files are forwarded directly to the GTA official mailbox: <strong>gta@gtakorea.org</strong>
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4 my-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Inquiry & Application Submitted!</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Your message has been successfully transmitted to <strong>gta@gtakorea.org</strong>.
                {submittedFileName && (
                  <span className="block mt-2 font-semibold text-emerald-700 bg-emerald-100/60 py-1.5 px-3 rounded-lg border border-emerald-200">
                    📎 Attached File: {submittedFileName}
                  </span>
                )}
                Our tax team will review your application details and respond via email shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                  setAttachedFile(null);
                  setSubmittedFileName(null);
                }}
                className="mt-2 bg-gta-600 hover:bg-gta-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Send Another Message or File
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john.doe@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GTA Admission Application Form Submission / Tax Inquiry"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 text-sm"
                />
              </div>

              {/* Application Form File Attachment Control */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attach Completed Application Form or Document (Optional)
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  id="contact-file-input"
                  className="hidden"
                  accept=".xlsx,.xls,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                {!attachedFile ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-gta-600 bg-gta-50/70'
                        : 'border-slate-300 hover:border-gta-400 bg-slate-50 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-gta-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to browse or drag & drop your written Application Form here
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supports Excel (.xlsx, .xls), PDF, or images up to 25MB
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 bg-slate-50/80 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isExcelAttached ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isExcelAttached ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">{attachedFile.name}</p>
                          <p className="text-[10px] text-slate-500">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {isExcelAttached && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>GTA Application Form (.xlsx) attached. Member details will be processed automatically.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please enter your detailed inquiry or additional notes regarding your application form..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gta-600 to-gta-500 hover:from-gta-700 hover:to-gta-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Transmitting Inquiry & File to GTA...'
                    : attachedFile
                    ? 'Send Inquiry with Attached File to GTA (gta@gtakorea.org)'
                    : 'Send Message to GTA (gta@gtakorea.org)'}
                </span>
              </button>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
