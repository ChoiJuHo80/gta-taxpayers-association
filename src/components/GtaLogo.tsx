import React from 'react';

interface GtaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function GtaLogo({ className = '', size = 'md' }: GtaLogoProps) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/img/logo.png"
        alt="GTA Geoje Taxpayers Association"
        width={isSm ? 160 : isLg ? 240 : 210}
        height={isSm ? 51 : isLg ? 77 : 67}
        className={`object-contain ${
          isSm ? 'h-12 w-auto' : isLg ? 'h-[77px] w-auto' : 'h-14 sm:h-16 w-auto'
        }`}
      />
    </div>
  );
}
