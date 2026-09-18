import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, StarIcon } from 'lucide-react';

import { useCMS } from '../../context/CMSContext';

export function Hero() {
  const { cms } = useCMS();
  return (
    <section className="relative overflow-hidden bg-forest">
      <div
        className="absolute inset-y-0 right-0 hidden w-1/2 lg:block"
        aria-hidden="true">
        
        <img
          src="/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg"
          alt=""
          className="h-full w-full object-cover object-center" />
        
        <div className="absolute inset-0 bg-forest/45" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-forest [mask-image:linear-gradient(to_right,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl font-bold uppercase leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            We turn bold ideas into{' '}
            <span className="text-lime">digital reality</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-cream/75">
            Dream Maker Developers is a technology and innovation company building reliable,
            scalable, user-centered software, apps, AI, and brands for businesses and
            communities.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/start-project"
              className="shake-slow-hover inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-forest transition-all hover:bg-lime-dark">
              Start a project
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-lime hover:text-lime">
              Explore services
            </Link>
          </div>

          {/* 4 circular images with average rating and happy clients reviews on same line */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 w-fit">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-8 w-8 rounded-full border-2 border-forest object-cover"
                style={{ borderRadius: '100%' }}
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Client reviewer"
              />
              <img
                className="inline-block h-8 w-8 rounded-full border-2 border-forest object-cover"
                style={{ borderRadius: '100%' }}
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Client reviewer"
              />
              <img
                className="inline-block h-8 w-8 rounded-full border-2 border-forest object-cover"
                style={{ borderRadius: '100%' }}
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
                alt="Client reviewer"
              />
              <img
                className="inline-block h-8 w-8 rounded-full border-2 border-forest object-cover"
                style={{ borderRadius: '100%' }}
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                alt="Client reviewer"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-white">{cms.stats.averageRating}</span>
              <span className="flex gap-0.5" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <StarIcon key={i} className="h-3.5 w-3.5 fill-lime text-lime" />
                ))}
              </span>
              <span className="text-cream/50">•</span>
              <span className="font-medium text-cream/80">{cms.stats.happyClients} client reviews</span>
            </div>
          </div>
        </div>

        <div className="mt-12 lg:hidden">
          <img
            src="/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg"
            alt="Dream Maker Developers team members presenting a project on a laptop"
            className="h-64 w-full rounded-2xl object-cover sm:h-80" />
          
        </div>
      </div>
    </section>);

}