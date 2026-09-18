import React from 'react';

type EyebrowProps = {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
};

export function Eyebrow({ children, variant = 'dark' }: EyebrowProps) {
  const base =
  variant === 'light' ?
  'border-white/20 bg-white/10 text-lime' :
  'border-forest/10 bg-white text-forest';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${base}`}>
      
      <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
      {children}
    </span>);

}