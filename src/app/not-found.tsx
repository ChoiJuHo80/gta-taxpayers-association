'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/');
    }, 1000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full space-y-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          GTA Homepage Renewal
        </div>
        <h2 className="text-xl font-black text-slate-900">
          신규 홈페이지 메인으로 이동합니다
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          기존 즐겨찾기 또는 이전 페이지 주소로 접속하셨습니다.<br />
          새롭게 개편된 메인 페이지로 자동 연결 중입니다...
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
          >
            메인 페이지로 바로가기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
