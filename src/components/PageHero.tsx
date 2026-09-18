import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { Eyebrow } from './Eyebrow';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  videoUrl?: string;
  backgroundImage?: string;
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | string;
  overlayOpacity?: number;
  imageOpacity?: number;
};

export function PageHero({
  eyebrow,
  title,
  description,
  videoUrl,
  backgroundImage,
  blur = 'sm',
  overlayOpacity = 0.75,
  imageOpacity = 0.45,
}: PageHeroProps) {
  const blurStyleMap: Record<string, string> = {
    none: 'blur-none',
    sm: 'blur-sm',
    md: 'blur-md',
    lg: 'blur-lg',
    xl: 'blur-xl',
  };
  const blurClass = blurStyleMap[blur] || 'blur-sm';
  const bgImg = backgroundImage || '/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg';

  return (
    <section className="relative overflow-hidden bg-forest-deep">
      {/* Background image with blur and filtered with green container overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={bgImg}
          alt=""
          style={{ opacity: imageOpacity }}
          className={`h-full w-full object-cover filter ${blurClass} scale-110`}
        />
        <div
          className="absolute inset-0 bg-forest backdrop-blur-[1px]"
          style={{ opacity: overlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/95 via-forest/70 to-forest-deep/85" />
      </div>

      {videoUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover opacity-30"
            poster="/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest/70 to-forest-deep/85" />
        </div>
      )}

      {/* Hero content matching About Hero layout: clean, spacious, no image container */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="max-w-3xl">
          <Eyebrow variant="light">{eyebrow}</Eyebrow>
          <h1 className="mt-5 font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl leading-tight">
            {title}
          </h1>
          <p className="mt-5 text-base md:text-lg leading-relaxed text-cream/85">
            {description}
          </p>
          <nav aria-label="Breadcrumb" className="mt-8">
            <ol className="flex items-center gap-2 text-sm text-cream/65">
              <li>
                <Link to="/" className="transition-colors hover:text-lime">
                  Home
                </Link>
              </li>
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
              <li className="font-semibold text-lime" aria-current="page">
                {eyebrow}
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}