import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';

export function NotFound() {
  return (
    <section className="grid min-h-[60vh] place-items-center bg-cream px-6 py-24 text-center">
      <div>
        <p className="font-display text-6xl font-bold text-forest">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-forest">Page not found</h1>
        <p className="mx-auto mt-3 max-w-sm text-forest/60">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-lime transition-colors hover:bg-forest-mid">
          
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </section>);

}