'use client';

import { useState, useEffect } from 'react';
import { UserCheck, Building2, Shield, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import Link from 'next/link';

export default function SignUpPage() {
  const [lang, setLang] = useState<Language>('en'); // Default English
  const [memberType, setMemberType] = useState<'individual' | 'corporate'>('individual');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    passwordConfirm: '',
    bizNo: '',
    address: '',
    taxInterest: '양도소득세',
    agree: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const savedLang = (localStorage.getItem('gta_lang') as Language) || 'en';
    setLang(savedLang);

    const handleLangChange = (e: CustomEvent<Language>) => {
      setLang(e.detail);
    };

    window.addEventListener('langChange' as any, handleLangChange);
    return () => window.removeEventListener('langChange' as any, handleLangChange);
  }, []);

  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.passwordConfirm) {
      setErrorMsg(lang === 'ko' ? '비밀번호가 서로 일치하지 않습니다.' : 'Passwords do not match.');
      return;
    }

    if (!formData.agree) {
      setErrorMsg(lang === 'ko' ? '이용약관 및 개인정보 동의가 필요합니다.' : 'Terms agreement is required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          memberType,
          bizNo: formData.bizNo,
          address: formData.address,
          interest: formData.taxInterest,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(json.message || '회원가입 처리 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setErrorMsg(lang === 'ko' ? '서버와 통신할 수 없습니다.' : 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          {lang === 'ko' ? 'GTA 회원가입이 성공적으로 완료되었습니다!' : 'Registration Completed Successfully!'}
        </h1>
        <p className="text-slate-600">
          {t.registerSuccess}
        </p>

        <div className="pt-4 flex justify-center space-x-4">
          <Link href="/consult" className="bg-gta-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-gta-700">
            {t.svc1Btn}
          </Link>
          <Link href="/" className="bg-slate-200 text-slate-800 font-bold px-6 py-3 rounded-xl hover:bg-slate-300">
            {lang === 'ko' ? '홈으로 돌아가기' : 'Return Home'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 space-y-8">
        
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="inline-flex items-center space-x-2 text-gta-600 font-bold text-xs bg-gta-50 px-3 py-1 rounded-full">
            <Shield className="w-3.5 h-3.5" />
            <span>{t.signUpBadge}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">{t.signUpTitle}</h1>
          <p className="text-slate-600 text-sm">{t.signUpSub}</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center space-x-3 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Member Type Selection Tab */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setMemberType('individual')}
            className={`p-4 rounded-xl border font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
              memberType === 'individual'
                ? 'border-gta-600 bg-gta-50 text-gta-800 shadow-sm'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span>{t.memberTypeIndividual}</span>
          </button>

          <button
            type="button"
            onClick={() => setMemberType('corporate')}
            className={`p-4 rounded-xl border font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
              memberType === 'corporate'
                ? 'border-gta-600 bg-gta-50 text-gta-800 shadow-sm'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>{t.memberTypeCorporate}</span>
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldFullName} *</label>
              <input
                type="text"
                required
                placeholder={lang === 'ko' ? '성명 입력' : 'Enter Full Name'}
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldPhone} *</label>
              <input
                type="tel"
                required
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldEmail} *</label>
              <input
                type="email"
                required
                placeholder="example@email.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldInterest}</label>
              <select
                value={formData.taxInterest}
                onChange={e => setFormData({ ...formData, taxInterest: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
              >
                <option value="양도소득세">양도소득세 (Capital Gains Tax)</option>
                <option value="종합소득세">종합소득세 (Income Tax)</option>
                <option value="상속/증여세">상속/증여세 (Inheritance/Gift Tax)</option>
                <option value="지방세/재산세">지방세/재산세 (Local Property Tax)</option>
              </select>
            </div>
          </div>

          {memberType === 'corporate' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldBizNo} *</label>
              <input
                type="text"
                required
                placeholder="123-45-67890"
                value={formData.bizNo}
                onChange={e => setFormData({ ...formData, bizNo: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldPassword} *</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldPasswordConfirm} *</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={formData.passwordConfirm}
                onChange={e => setFormData({ ...formData, passwordConfirm: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldAddress}</label>
            <input
              type="text"
              placeholder={lang === 'ko' ? '경상남도 거제시 주소 입력' : 'Enter Address in Geoje'}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gta-500"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agree}
                onChange={e => setFormData({ ...formData, agree: e.target.checked })}
                className="rounded text-gta-600 focus:ring-gta-500 w-4 h-4"
              />
              <span className="text-xs text-slate-700 font-semibold">{t.agreeTerms}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gta-600 hover:bg-gta-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-sm disabled:opacity-50"
          >
            {loading ? (lang === 'ko' ? '회원가입 처리 중...' : 'Registering Member...') : t.btnRegister}
          </button>

        </form>

      </div>
    </div>
  );
}
