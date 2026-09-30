'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Building, Clock, Printer } from 'lucide-react';
import { translations } from '@/lib/i18n';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gta-100 text-gta-700 text-xs font-bold px-3.5 py-1.5 rounded-full">
          <Mail className="w-4 h-4 text-gta-600" />
          <span>Tax Service</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact Us
        </h1>
        <p className="text-slate-600 leading-relaxed text-base">
          Send us your inquiries and our certified tax advisors will respond promptly via email (gta@gtakorea.org).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
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

        {/* Right Column: English Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-extrabold text-slate-900">Send Us a Direct Message</h2>
            <p className="text-xs text-slate-500 mt-1">
              Messages submitted here are forwarded directly to the GTA official mailbox: <strong>gta@gtakorea.org</strong>
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4 my-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Thank You for Contacting GTA!</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Your message has been successfully transmitted to <strong>gta@gtakorea.org</strong>. Our tax team will get back to you via email shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                }}
                className="mt-2 bg-gta-600 hover:bg-gta-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors"
              >
                Send Another Message
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
                  placeholder="e.g. Inquiry regarding Foreigner Income Tax Filing & 3% Deduction"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Please enter your detailed inquiry or tax question here..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gta-500 text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gta-600 to-gta-500 hover:from-gta-700 hover:to-gta-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Transmitting Message to GTA Email...' : 'Send Message to GTA (gta@gtakorea.org)'}</span>
              </button>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
