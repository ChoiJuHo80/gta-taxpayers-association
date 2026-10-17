import React from 'react';

interface GtaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function GtaLogo({ className = '', size = 'md' }: GtaLogoProps) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`inline-flex items-center gap-2.5 leading-none select-none ${className}`}>
      {/* GTA Bold Navy Letters */}
      <div
        className={`font-black tracking-tight text-[#0F3D7A] ${
          isSm ? 'text-2xl' : isLg ? 'text-4xl' : 'text-[30px]'
        }`}
        style={{ fontFamily: "'Inter', 'Pretendard', Arial, Helvetica, sans-serif", letterSpacing: '-0.03em' }}
      >
        GTA
      </div>

      {/* Divider line */}
      <div className={`w-[1.5px] bg-slate-300 ${isSm ? 'h-5' : isLg ? 'h-8' : 'h-6'}`} />

      {/* Two-line Subtext: Geoje Taxpayers / Association */}
      <div
        className={`flex flex-col justify-center font-semibold text-slate-600 leading-[1.18] ${
          isSm ? 'text-[10px]' : isLg ? 'text-xs' : 'text-[11px]'
        }`}
        style={{ fontFamily: "'Inter', 'Pretendard', Arial, sans-serif" }}
      >
        <span>Geoje Taxpayers</span>
        <span>Association</span>
      </div>
    </div>
  );
}

