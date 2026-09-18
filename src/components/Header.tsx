import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRightIcon, MenuIcon, XIcon, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from './Logo';
import { navLinks } from '../data/site';
import { useCMS } from '../context/CMSContext';

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { cms } = useCMS();

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling on phone screens when full-screen menu is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-forest/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Logo />

          {/* Desktop Navigation */}
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-forest text-lime'
                      : 'text-forest/70 hover:bg-cream hover:text-forest'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/start-project"
              className="shake-slow-hover hidden items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-forest transition-all hover:bg-lime-dark sm:inline-flex"
            >
              Start a project
              <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>

            {/* Mobile / Tablet Toggle Button */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="grid h-10 w-10 place-items-center rounded-full border border-forest/15 text-forest hover:bg-cream transition-colors lg:hidden"
            >
              {open ? (
                <XIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <MenuIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Responsive Mobile / Tablet Dropdown Menu Container */}
        {open && (
          <nav
            id="mobile-nav"
            aria-label="Mobile Navigation"
            className="lg:hidden max-sm:fixed max-sm:inset-0 max-sm:z-50 max-sm:h-[100dvh] max-sm:w-screen max-sm:bg-white max-sm:flex max-sm:flex-col max-sm:justify-between max-sm:p-6 max-sm:overflow-y-auto sm:border-t sm:border-forest/10 sm:bg-white sm:px-6 sm:py-5"
          >
            {/* Phone-only top header bar inside full-screen menu */}
            <div className="flex items-center justify-between pb-4 border-b border-forest/10 sm:hidden">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full border border-forest/15 text-forest hover:bg-cream"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Nav Links */}
            <ul className="space-y-1.5 my-auto py-4 sm:py-0">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-2xl px-5 py-3.5 text-base font-semibold transition-all ${
                        isActive
                          ? 'bg-forest text-lime shadow-md shadow-forest/10'
                          : 'text-forest/80 hover:bg-cream hover:text-forest'
                      }`
                    }
                  >
                    <span>{link.label}</span>
                    <ArrowUpRightIcon className="w-4 h-4 opacity-40" />
                  </NavLink>
                </li>
              ))}

              <li className="pt-3">
                <Link
                  to="/start-project"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lime px-5 py-3.5 text-base font-bold text-forest shadow-md shadow-lime/20 hover:bg-lime-dark transition-all"
                >
                  <span>Start a project</span>
                  <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
              </li>
            </ul>

            {/* Phone-only bottom footer section */}
            <div className="pt-5 border-t border-forest/10 sm:hidden space-y-2 text-xs text-forest/70">
              {cms.company?.phone && (
                <a href={`tel:${cms.company.phone}`} className="flex items-center gap-2 hover:text-forest">
                  <Phone className="w-3.5 h-3.5 text-lime-dark" />
                  <span>{cms.company.phone}</span>
                </a>
              )}
              {cms.company?.email && (
                <a href={`mailto:${cms.company.email}`} className="flex items-center gap-2 hover:text-forest">
                  <Mail className="w-3.5 h-3.5 text-lime-dark" />
                  <span>{cms.company.email}</span>
                </a>
              )}
              {cms.company?.address && (
                <div className="flex items-center gap-2 text-[11px] text-forest/50">
                  <MapPin className="w-3.5 h-3.5 text-lime-dark" />
                  <span>{cms.company.address}</span>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}