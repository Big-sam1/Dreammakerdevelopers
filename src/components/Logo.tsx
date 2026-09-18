import React from 'react';
import { Link } from 'react-router-dom';
import { useCMS } from '../context/CMSContext';

type LogoProps = {
  variant?: 'light' | 'dark';
};

export function Logo({ variant = 'dark' }: LogoProps) {
  const { cms } = useCMS();
  const textColor = variant === 'light' ? 'text-white' : 'text-forest';
  
  // Use CMS-managed logo dynamically
  const logoSrc = variant === 'light' 
    ? (cms.footerLogo || '/logo.png') 
    : (cms.navLogo || '/logonav.png');

  const brandName = cms.brandName || 'Dream Maker';
  const brandSubtitle = cms.brandSubtitle || 'Developers';

  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-3"
      aria-label="Dream Maker Developers home"
    >
      {/* DMD Logo Image (Live synced from CMS) */}
      <img
        src={logoSrc}
        alt={`${brandName} ${brandSubtitle} logo`}
        className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105"
      />

      {/* Dream Maker Developers text next to the logo image */}
      <span className={`font-display text-lg font-bold leading-tight ${textColor}`}>
        {brandName}
        <span
          className={`block text-[11px] font-semibold uppercase tracking-[0.2em] ${
            variant === 'light' ? 'text-lime' : 'text-lime-dark'
          }`}
        >
          {brandSubtitle}
        </span>
      </span>
    </Link>
  );
}