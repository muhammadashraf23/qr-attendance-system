import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
  light?: boolean;
}

export default function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="rounded-xl bg-black text-white flex items-center justify-center font-black tracking-tighter shadow-sm flex-shrink-0"
        style={{ width: size, height: size, fontSize: Math.max(12, Math.floor(size * 0.4)) }}
      >
        CA
      </div>
      <span className="font-extrabold tracking-tight text-gray-900" style={{ fontSize: Math.max(14, Math.floor(size * 0.45)) }}>
        CloudAttend
      </span>
    </div>
  );
}
