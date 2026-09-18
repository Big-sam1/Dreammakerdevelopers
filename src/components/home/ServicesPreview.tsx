import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import { Eyebrow } from '../Eyebrow';
import { ServiceIcon } from '../ServiceIcon';
import { useCMS } from '../../context/CMSContext';

const accents = [
'bg-white text-forest border-forest/10',
'bg-lime text-forest border-lime',
'bg-forest text-white border-forest'];


export function ServicesPreview() {
  const { cms } = useCMS();
  const services = cms.services;
  return (
    <section className="bg-cream px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <Eyebrow>What we do</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-bold text-forest md:text-4xl">
              Everything you need to build and launch
            </h2>
          </div>
          <p className="text-forest/60 md:pb-2">
            One team across strategy, design, engineering, and media — so your product,
            brand, and technology all move in the same direction.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service, index) => {
            const accent = accents[index % accents.length];
            const isDark = accent.includes('bg-forest');
            const isLime = accent.includes('bg-lime');
            return (
              <article
                key={service.slug}
                className={`flex flex-col rounded-2xl border p-7 transition-transform duration-200 hover:-translate-y-1 ${accent}`}>
                
                <ServiceIcon name={service.icon} className="h-8 w-8" />
                <h3 className="mt-6 font-display text-lg font-bold">{service.title}</h3>
                <p
                  className={`mt-3 flex-1 text-sm leading-relaxed ${
                  isDark ? 'text-cream/70' : isLime ? 'text-forest/70' : 'text-forest/60'}`
                  }>
                  
                  {service.summary}
                </p>
                <Link
                  to="/services"
                  className={`mt-6 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  isDark ?
                  'bg-lime text-forest hover:bg-lime-dark' :
                  isLime ?
                  'bg-forest text-lime hover:bg-forest-mid' :
                  'bg-cream text-forest hover:bg-lime'}`
                  }>
                  
                  Explore more
                  <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </article>);

          })}
        </div>
      </div>
    </section>);

}