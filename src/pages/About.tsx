import React from 'react';
import { TargetIcon, EyeIcon } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Eyebrow } from '../components/Eyebrow';
import { CTASection } from '../components/CTASection';
import { process } from '../data/site';
import { TypewriterText } from '../components/TypewriterText';
import { useCMS } from '../context/CMSContext';

const dmdStoryText = `Dream Maker Developers (DMD) specializes in software development, web and mobile applications, artificial intelligence, UI/UX design, branding, digital media, and IT consulting.

We help businesses, organizations, and individuals innovate, grow, and thrive in the digital world — pairing engineering rigour with design craft so that the things we build are both dependable and genuinely enjoyable to use.`;

export function About() {
  const { cms } = useCMS();
  const hero = cms.pageHeroes.about;
  const team = cms.team;
  const partnerImages = cms.partnerImages.length > 0 ? cms.partnerImages : [
    '/logo.png',
    '/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg',
    '/256842fa-b28b-4563-986d-bcc0bf612542.jpg',
    '/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg',
    '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
    '/67bedf41-d607-4532-8e95-cdbc38a213b5.jpg',
    '/logonav.png',
  ];
  const workflow = cms.workflow;

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

      <section className="bg-white px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Our story</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-bold text-forest md:text-4xl">
              Creativity, technology, and strategic thinking
            </h2>
            <div className="mt-5">
              <TypewriterText
                text={dmdStoryText}
                speed={20}
                className="text-base leading-relaxed text-forest/70 font-normal"
              />
            </div>
          </div>
          <img
            src="/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg"
            alt="The Dream Maker Developers team working together in the studio"
            className="animate-float-slow h-72 w-full rounded-3xl object-cover shadow-lg lg:h-[420px]"
            loading="lazy"
          />
        </div>
      </section>

      <section className="bg-cream px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
          <article className="rounded-3xl bg-forest p-9 md:p-12">
            <TargetIcon className="h-8 w-8 text-lime" aria-hidden="true" />
            <h2 className="mt-6 font-display text-2xl font-bold text-white">Our mission</h2>
            <p className="mt-4 leading-relaxed text-cream/70">
              To build reliable, scalable, and user-centered solutions that empower
              communities, drive progress, and shape the future through innovation.
            </p>
          </article>
          <article className="rounded-3xl border border-forest/10 bg-white p-9 md:p-12">
            <EyeIcon className="h-8 w-8 text-lime-dark" aria-hidden="true" />
            <h2 className="mt-6 font-display text-2xl font-bold text-forest">Our vision</h2>
            <p className="mt-4 leading-relaxed text-forest/60">
              A digital world where bold ideas from anywhere can become real, usable products —
              and where technology serves the people and communities around it.
            </p>
          </article>
        </div>
      </section>

      {/* Replaced 'What we believe' with team of 10 people in a good responsive grid */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <Eyebrow>Our team</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-bold text-forest md:text-4xl">
              {cms.sectionTitles?.teamTitle || 'Meet the minds behind Dream Maker Developers'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-forest/60">
              A multidisciplinary collective of architects, software engineers, AI researchers, and designers collaborating to build world-class digital products.
            </p>
          </div>

          <div className="mt-12 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {team.map((member) => (
              <div
                key={member.name}
                className="group flex flex-col items-center text-center rounded-2xl border border-forest/10 bg-cream/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-lime hover:bg-cream hover:shadow-md"
              >
                <div className="relative mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-20 w-20 rounded-full border-2 border-forest/15 object-cover transition-transform duration-300 group-hover:scale-105 group-hover:border-lime"
                    style={{ borderRadius: '100%' }}
                    loading="lazy"
                  />
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-lime" />
                </div>
                <h3 className="font-display text-sm font-bold text-forest group-hover:text-forest-mid">
                  {member.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-forest/65 leading-tight">
                  {member.role}
                </p>
                <span className="mt-3 inline-block rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-forest/60 border border-forest/5">
                  {member.specialty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sliding partner images only — live synced from CMS */}
      <section className="border-y border-white/10 bg-forest py-8 overflow-hidden">
        <div className="relative overflow-hidden w-full">
          <div className="animate-marquee flex items-center gap-8">
            {[...partnerImages, ...partnerImages].map((imgSrc, idx) => (
              <div
                key={idx}
                className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border-2 border-lime/40 bg-white/10 p-1 shadow-md transition-transform hover:scale-110"
              >
                <img
                  src={imgSrc}
                  alt={`Partner ${idx + 1}`}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Our approach steps */}
            <div className="lg:col-span-7">
              <Eyebrow>Our approach</Eyebrow>
              <h2 className="mt-5 font-display text-3xl font-bold text-forest md:text-4xl">
                How a project moves with us
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-forest/60 max-w-lg">
                We believe in complete transparency, rigorous sprint discipline, and constant collaboration at every stage of the product lifecycle.
              </p>

              <ol className="mt-8 space-y-4">
                {process.map((item) => (
                  <li
                    key={item.step}
                    className="flex flex-col gap-4 rounded-2xl border border-forest/10 bg-white p-6 transition-all hover:border-lime/60 sm:flex-row sm:items-center"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime font-display font-bold text-forest">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-forest">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-forest/60">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Right Column: Video frame on same height level with texts about the video (Live from CMS) */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-forest/10 bg-white p-6 sm:p-8 shadow-sm">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-forest/10">
                  <span className="rounded-full bg-forest px-3 py-1 text-xs font-semibold text-lime">
                    Workflow in Action
                  </span>
                  <span className="text-xs font-medium text-forest/50">Sprint Walkthrough</span>
                </div>

                {/* Video Frame */}
                <div className="mt-5 relative overflow-hidden rounded-2xl bg-forest-deep shadow-md">
                  <video
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-56 sm:h-64 w-full object-cover"
                    poster={workflow.poster}
                    key={workflow.videoUrl}
                  >
                    <source
                      src={workflow.videoUrl}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Text about the video */}
                <h3 className="mt-5 font-display text-xl font-bold text-forest">
                  {workflow.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-forest/65">
                  {workflow.description}
                </p>

                <ul className="mt-4 space-y-2 border-t border-forest/10 pt-4 text-xs font-medium text-forest/75">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-lime-dark" />
                    <span>Real-time code reviews and CI/CD pipelines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-lime-dark" />
                    <span>Interactive weekly demos with stakeholders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-lime-dark" />
                    <span>Zero-downtime containerized production releases</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page-specific CTA container with custom image for About page */}
      <CTASection
        title="Ready to build your next breakthrough?"
        description="Partner with our dedicated team of architects, developers, and designers to turn your boldest ideas into production-ready digital reality."
        image="/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg"
        imageAlt="Dream Maker Developers leadership and team"
      />
    </>
  );
}