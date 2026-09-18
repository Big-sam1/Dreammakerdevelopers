import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useCMS } from '../context/CMSContext';

export function Layout() {
  const { pathname } = useLocation();
  const { cms } = useCMS();
  const bg = cms.websiteBackground;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  const hasCustomBg = Boolean(bg && bg.enabled && bg.imageUrl);

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col bg-white transition-colors duration-500 ${
        hasCustomBg ? 'dmd-custom-bg-active text-cream' : ''
      }`}
    >
      {/* Dynamic full-page background image uploaded from device */}
      {hasCustomBg && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={bg.imageUrl}
            alt="Website Custom Background"
            className="w-full h-full object-cover object-center"
            style={{ opacity: bg.opacity || 0.25 }}
          />
          {/* Subtle dark overlay for ultra-crisp typography */}
          <div className="absolute inset-0 bg-forest-deep/60 backdrop-blur-[1px]" />
        </div>
      )}

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <Header />
        <main id="content" className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
