import React from 'react';
import { Link } from 'react-router-dom';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TwitterIcon,
} from 'lucide-react';
import { Logo } from './Logo';
import { navLinks } from '../data/site';
import { useCMS } from '../context/CMSContext';

export function Footer() {
  const { cms } = useCMS();
  const { company, socialLinks, services } = cms;

  const socialIconMap: Record<string, React.ElementType> = {
    Facebook: FacebookIcon,
    Twitter: TwitterIcon,
    LinkedIn: LinkedinIcon,
    Instagram: InstagramIcon,
  };

  return (
    <footer className="bg-forest-deep text-cream/70">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5">
          <Logo variant="light" />
          <p className="max-w-xs text-sm leading-relaxed">
            {company.short || 'DMD'} designs and develops digital solutions that help businesses and
            communities turn bold ideas into reality.
          </p>
          <div className="flex gap-2">
            {socialLinks.map((item) => {
              const Icon = socialIconMap[item.label] || FacebookIcon;
              return (
                <a
                  key={item.label}
                  href={item.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-cream/70 transition-colors hover:border-lime hover:text-lime"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>

        <nav aria-label="Footer pages">
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-white">
            Company
          </h2>
          <ul className="space-y-2.5 text-sm">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-lime">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer services">
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-white">
            Services
          </h2>
          <ul className="space-y-2.5 text-sm">
            {services.slice(0, 6).map((service) => (
              <li key={service.slug}>
                <Link to="/services" className="transition-colors hover:text-lime">
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-white">
            Get in touch
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
              <span>{company.address}</span>
            </li>
            <li className="flex gap-3">
              <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
              <a href={`mailto:${company.email}`} className="hover:text-lime">
                {company.email}
              </a>
            </li>
            <li className="flex gap-3">
              <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
              <a
                href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}
                className="hover:text-lime"
              >
                {company.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <p>Built with creativity, engineering, and innovation.</p>
        </div>
      </div>
    </footer>
  );
}