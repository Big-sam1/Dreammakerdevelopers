import React from 'react';
import { CheckIcon } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Eyebrow } from '../components/Eyebrow';
import { ServiceIcon } from '../components/ServiceIcon';
import { CTASection } from '../components/CTASection';
import { useCMS } from '../context/CMSContext';

export function Services() {
  const { cms } = useCMS();
  const hero = cms.pageHeroes.services;
  const services = cms.services;

  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        backgroundImage={(hero as any).backgroundImage}
        blur={(hero as any).blur}
        overlayOpacity={(hero as any).overlayOpacity}
      />

      {/* Services list with stationary/fixed background image that doesn't move as scroll happens */}
      <section
        className="relative bg-fixed bg-center bg-cover bg-no-repeat px-6 py-20"
        style={{ backgroundImage: `url('/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg')` }}
      >
        {/* Semi-transparent dark overlay so cards and content have great contrast */}
        <div className="absolute inset-0 bg-forest-deep/85 backdrop-blur-[2px]" />

        <div className="relative z-10 mx-auto max-w-7xl space-y-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="rounded-full bg-lime/20 px-4 py-1.5 text-xs font-bold tracking-widest text-lime uppercase border border-lime/30">
              End-to-End Capabilities
            </span>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold text-white">
              {cms.sectionTitles?.servicesTitle || 'Engineered For Scale & Performance'}
            </h2>
            <p className="mt-3 text-sm md:text-base text-cream/80">
              Explore our core digital disciplines — delivered by multidisciplinary teams in Kicukiro, Kagarama.
            </p>
          </div>

          {/* Colorless / transparent service container cards over the fixed background */}
          {services.map((service, index) => (
            <article
              key={service.slug}
              id={service.slug}
              className="grid gap-8 rounded-3xl border border-white/20 bg-transparent p-8 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-lime/60 hover:bg-white/5 md:grid-cols-[auto,1fr,1fr] md:p-10"
            >
              <div className="flex items-start gap-4 md:block">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-lime text-forest shadow-md">
                  <ServiceIcon name={service.icon} className="h-6 w-6" />
                </span>
                <span className="mt-4 block font-display text-xs font-bold tracking-widest text-lime/70">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  {service.title}
                </h2>
                <p className="mt-3 text-sm font-medium text-cream/90">{service.summary}</p>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">
                  {service.details}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
                <h3 className="font-display text-xs font-bold uppercase tracking-widest text-lime">
                  What&apos;s included
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {service.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-cream/80">
                      <CheckIcon
                        className="mt-0.5 h-4 w-4 shrink-0 text-lime"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Engagement models</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-bold text-forest md:text-4xl">
              Work with us the way that fits
            </h2>
            <ul className="mt-8 space-y-4">
              {[
              {
                title: 'Project delivery',
                text: 'A defined scope, fixed milestones, and a shipped product at the end.'
              },
              {
                title: 'Dedicated team',
                text: 'Designers and engineers embedded with your team, month to month.'
              },
              {
                title: 'Advisory retainer',
                text: 'Ongoing consulting, audits, and technical direction as you scale.'
              }].
              map((model) =>
              <li
                key={model.title}
                className="rounded-2xl border border-forest/10 bg-cream p-6">
                
                  <h3 className="font-display text-lg font-bold text-forest">{model.title}</h3>
                  <p className="mt-2 text-sm text-forest/60">{model.text}</p>
                </li>
              )}
            </ul>
          </div>
          <img
            src="/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg"
            alt="A web dashboard and mobile app built by Dream Maker Developers"
            className="h-72 w-full rounded-3xl object-cover lg:h-[440px]"
            loading="lazy" />
          
        </div>
      </section>

      {/* Page-specific CTA container with custom image for Services page */}
      <CTASection
        title="Ready to discuss your project scope?"
        description="Whether you need a dedicated development squad, a fixed-milestone digital build, or high-level technical advisory, our engineering leads are ready."
        image="/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg"
        imageAlt="Dream Maker Developers digital software development dashboard"
      />
    </>);

}