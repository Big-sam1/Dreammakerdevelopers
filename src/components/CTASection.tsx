import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, PhoneIcon } from 'lucide-react';
import defaultCtaImage from '../data/5.png';
import { useCMS } from '../context/CMSContext';

export type CTASectionProps = {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  buttonText?: string;
  buttonTo?: string;
};

export function CTASection({
  title = "Have an idea? Let's make it real.",
  description = "Tell us what you're building. We'll come back with a clear plan, an honest timeline, and a team ready to start.",
  image = defaultCtaImage,
  imageAlt = "The Dream Maker Developers studio at work",
  buttonText = "Start a project",
  buttonTo = "/start-project",
}: CTASectionProps) {
  const { cms } = useCMS();
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-forest">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="p-10 md:p-14">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-md text-cream/70 leading-relaxed">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to={buttonTo}
                className="shake-slow-hover inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-forest transition-colors hover:bg-lime-dark"
              >
                {buttonText}
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={`tel:${cms.company.phone.replace(/[^+\d]/g, '')}`}
                className="inline-flex items-center gap-3 text-sm text-cream/80 transition-colors hover:text-lime"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full border border-white/20">
                  <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                {cms.company.phone}
              </a>
            </div>
          </div>
          <div className="h-full min-h-[280px] lg:min-h-[360px]">
            <img
              src={image}
              alt={imageAlt}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(event) => {
                if (event.currentTarget.src !== defaultCtaImage) event.currentTarget.src = defaultCtaImage;
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
