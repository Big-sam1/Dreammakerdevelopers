import React from 'react';
import { Eyebrow } from '../Eyebrow';
import { process } from '../../data/site';
import { CountUp } from '../CountUp';
import { useCMS } from '../../context/CMSContext';

export function ProcessSection() {
  const { cms } = useCMS();
  const dynamicStats = [
    { label: 'Projects delivered', value: cms.stats.projectsDelivered },
    { label: 'Happy clients', value: cms.stats.happyClients },
    { label: 'Countries served', value: cms.stats.countriesServed },
    { label: 'Average rating', value: cms.stats.averageRating },
  ];

  return (
    <section className="bg-forest px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <Eyebrow variant="light">How we work</Eyebrow>
          <h2 className="mt-5 font-display text-3xl font-bold text-white md:text-4xl">
            A clear process from first idea to lasting impact
          </h2>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {process.map((item) => (
            <li
              key={item.step}
              className="rounded-2xl border border-white/10 bg-white/5 p-7 transition-colors hover:border-lime/50"
            >
              <span className="font-display text-sm font-bold tracking-widest text-lime">
                {item.step}
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/65">{item.description}</p>
            </li>
          ))}
        </ol>

        <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 lg:grid-cols-4">
          {dynamicStats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-4xl font-bold text-lime">
                  <CountUp value={stat.value} />
                </span>
                <span className="mt-1 block text-sm text-cream/60">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}