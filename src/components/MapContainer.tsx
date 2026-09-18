import React from 'react';
import { MapPinIcon, NavigationIcon, ExternalLinkIcon } from 'lucide-react';
import mapsImage from '../data/maps.png';

export function MapContainer() {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-forest/10 bg-cream/50 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest/10 bg-white px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-lime">
            <MapPinIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-forest">
              DMD Innovation Hub
            </h3>
            <p className="text-xs text-forest/60">Kicukiro, Kagarama, Kigali, Rwanda</p>
          </div>
        </div>

        <a
          href="https://maps.google.com/?q=Kagarama,Kicukiro,Kigali,Rwanda"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-forest/5 px-3 py-1 text-xs font-semibold text-forest transition-colors hover:bg-lime hover:text-forest"
        >
          <span>Get directions</span>
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
      </div>

      <div className="relative h-64 w-full bg-forest-deep md:h-72">
        <img
          src={mapsImage}
          alt="Map showing Dream Maker Developers' regional presence"
          className="h-full w-full object-contain"
          decoding="async"
        />
        
        {/* Floating badge */}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-forest/90 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur shadow-md">
          <span className="inline-block h-2 w-2 rounded-full bg-lime mr-1.5 animate-pulse" />
          HQ Office • Kicukiro, Kagarama
        </div>
      </div>
    </div>
  );
}
