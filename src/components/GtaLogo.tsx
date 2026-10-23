import React from 'react';

interface GtaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function GtaLogo({ className = '', size = 'md' }: GtaLogoProps) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const isXl = size === 'xl';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/img/logo.png?v=2"
        alt="GTA Geoje Taxpayers Association"
        width={isSm ? 220 : isLg ? 320 : isXl ? 360 : 280}
        height={isSm ? 72 : isLg ? 104 : isXl ? 116 : 90}
        className={`object-contain transition-transform duration-200 ${
          isSm
            ? 'h-[64px] sm:h-[72px] w-auto'
            : isLg
            ? 'h-[90px] sm:h-[104px] w-auto'
            : isXl
            ? 'h-[105px] sm:h-[120px] w-auto'
            : 'h-[72px] sm:h-[86px] md:h-[92px] w-auto'
        }`}
      />
    </div>
  );
}
