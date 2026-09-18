import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { BackToTop } from './BackToTop';
import { useCMS } from '../context/CMSContext';

export function Layout() {
  const { pathname } = useLocation();
  const { cms } = useCMS();
  const bg = cms.websiteBackground;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  // Public pages only: reveal headings, copy, images and cards in gentle,
  // alternating directions as visitors scroll. Admin routes do not use Layout.
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(
      '#content section > *, #content article > *, #content .rounded-2xl, #content .rounded-xl'
    )).filter((element) => !element.closest('[data-no-reveal]'));
    targets.forEach((element, index) => {
      element.classList.add('site-reveal', `site-reveal-${index % 4}`);
    });
    if (!('IntersectionObserver' in window)) {
      targets.forEach((element) => element.classList.add('site-revealed'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('site-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });
    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
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
        {/* Floating Back to Top Button (responsive across small, medium, and large screens) */}
        <BackToTop />
      </div>
    </div>
  );
}
