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
        width={isSm ? 180 : isLg ? 240 : 230}
        height={isSm ? 58 : isLg ? 77 : 74}
        className={`object-contain ${
          isSm ? 'h-14 w-auto' : isLg ? 'h-[77px] w-auto' : 'h-15 sm:h-[72px] w-auto'
        }`}
      />
    </div>
  );
}
