import React from 'react';

interface GtaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function GtaLogo({ className = '', size = 'md' }: GtaLogoProps) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex flex-col items-start leading-none select-none ${className}`}>
      {/* GTA Stylized Letters */}
      <div className={`font-black tracking-normal flex items-baseline ${
        isSm ? 'text-2xl' : isLg ? 'text-4xl' : 'text-3xl'
      }`} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <span className="text-[#0B2545] font-black">G</span>
        <span className="text-[#E02424] font-black">T</span>
        <span className="text-[#0B2545] font-black">A</span>
      </div>
      
      {/* Subtext: Geoje Taxpayers Association */}
      <div className={`font-bold tracking-tight text-[#1E293B] whitespace-nowrap mt-0.5 ${
        isSm ? 'text-[9px]' : isLg ? 'text-[13px]' : 'text-[10px] sm:text-[11px]'
      }`} style={{ fontFamily: 'Georgia, serif, Arial' }}>
        Geoje Taxpayers Association
      </div>
    </div>
  );
}
