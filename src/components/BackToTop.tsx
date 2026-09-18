import React, { useEffect, useState } from 'react';
import { ArrowUp, ChevronUp } from 'lucide-react';

interface BackToTopProps {
  /** Optional ID of an internal scrollable container (e.g. admin dashboard main) */
  scrollContainerId?: string;
  className?: string;
}

export function BackToTop({ scrollContainerId, className = '' }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = scrollContainerId ? document.getElementById(scrollContainerId) : null;

    const checkScroll = () => {
      const windowOffset = window.pageYOffset || document.documentElement.scrollTop || 0;
      const containerOffset = container ? container.scrollTop : 0;
      const current = Math.max(windowOffset, containerOffset);

      setVisible(current > 200);
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    if (container) {
      container.addEventListener('scroll', checkScroll, { passive: true });
    }

    // Initial check in case page is already scrolled
    checkScroll();

    return () => {
      window.removeEventListener('scroll', checkScroll);
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
    };
  }, [scrollContainerId]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (scrollContainerId) {
      const container = document.getElementById(scrollContainerId);
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className={`fixed bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 z-40 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-lime text-forest font-bold shadow-xl shadow-forest/25 border-2 border-forest/10 hover:bg-lime-dark hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer animate-fade-in group ${className}`}
    >
      <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
}
