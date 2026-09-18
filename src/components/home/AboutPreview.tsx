import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckCircle2Icon, StarIcon } from 'lucide-react';
import { Eyebrow } from '../Eyebrow';
import { CountUp } from '../CountUp';
import { useCMS } from '../../context/CMSContext';
import whoWeAreImage1 from '../../data/1.png';
import whoWeAreImage2 from '../../data/2.png';
import whoWeAreImage3 from '../../data/3.png';
import whoWeAreImage4 from '../../data/4.png';

const skills = ['Software', 'AI', 'UI/UX', 'Branding', 'Mobile', 'Consulting'];

const whoWeAreImages = [
  {
    src: whoWeAreImage1,
    alt: 'Two Dream Maker developers collaborating on code and interface design',
  },
  {
    src: whoWeAreImage2,
    alt: 'DMD team members presenting digital product milestones',
  },
  {
    src: whoWeAreImage3,
    alt: 'Engineering scalable technology and software systems',
  },
];

export function AboutPreview() {
  const { cms } = useCMS();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Auto-swap 3 images with slow fade-off effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % whoWeAreImages.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
        <div className="grid gap-4">
          {/* 3 images auto-swapping in slow fade-off effect */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-2xl bg-forest/5 shadow-sm">
            {whoWeAreImages.map((img, idx) => (
              <img
                key={img.src}
                src={img.src}
                alt={img.alt}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                  idx === activeImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                loading="lazy"
              />
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-between rounded-2xl bg-lime p-6">
              <CheckCircle2Icon className="h-7 w-7 text-forest" aria-hidden="true" />
              <div>
                <p className="font-display text-3xl font-bold text-forest">
                  <CountUp value={cms.stats.projectsDelivered} />
                </p>
                <p className="text-sm text-forest/70">Projects delivered</p>
              </div>
            </div>
            <img
              src={whoWeAreImage4}
              alt="Designers reviewing product wireframes together"
              className="h-full w-full rounded-2xl object-cover"
              loading="lazy" />
            
          </div>
        </div>

        <div>
          <Eyebrow>Who we are</Eyebrow>
          <h2 className="mt-5 font-display text-3xl font-bold text-forest md:text-4xl">
            A forward-thinking partner for the digital world
          </h2>
          <p className="mt-4 leading-relaxed text-forest/60">
            We combine creativity, technology, and strategic thinking to help businesses,
            organizations, and individuals innovate, grow, and thrive. Our mission is to build
            reliable, scalable, user-centered solutions that empower communities and shape the
            future.
          </p>

          <Link
            to="/about"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-lime transition-colors hover:bg-forest-mid">
            
            More about us
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-cream p-6">
              <span className="flex gap-0.5" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) =>
                <StarIcon key={i} className="h-4 w-4 fill-lime-dark text-lime-dark" />
                )}
              </span>
              <p className="mt-3 font-display text-2xl font-bold text-forest">
                <CountUp value={cms.stats.averageRating} /><span className="text-base text-forest/50">/5.0</span>
              </p>
              <p className="mt-1 text-sm text-forest/60">Average client rating</p>
            </div>
            <div className="rounded-2xl bg-cream p-6">
              <p className="font-display text-sm font-bold uppercase tracking-widest text-forest">
                Core skills
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) =>
                <li
                  key={skill}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-forest/70">
                  
                    {skill}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>);

}
