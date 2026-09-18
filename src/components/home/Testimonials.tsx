import React, { useState, useEffect } from 'react';
import { Eyebrow } from '../Eyebrow';
import { useCMS } from '../../context/CMSContext';

export function Testimonials() {
  const { cms } = useCMS();
  const testimonials = cms.testimonials;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);

  useEffect(() => {
    // Entrance sequence for current index:
    // 1. Text enters first from the bottom/left
    setTextVisible(true);

    // 2. Image enters exactly 1 second (1000ms) after text, from a different direction (top/right)
    const imageTimer = setTimeout(() => {
      setImageVisible(true);
    }, 1000);

    // 3. After display time (5.5s), exit both and advance to next client
    const nextTimer = setTimeout(() => {
      setTextVisible(false);
      setImageVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 500); // 500ms fadeout before next client
    }, 6000);

    return () => {
      clearTimeout(imageTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex]);

  const current = testimonials[currentIndex];

  return (
    <section className="bg-cream px-6 py-20 overflow-hidden">
      <div className="mx-auto max-w-3xl text-center">
        {/* Centered header */}
        <div className="flex justify-center">
          <Eyebrow>Client stories</Eyebrow>
        </div>
        <h2 className="mt-5 font-display text-3xl font-bold text-forest md:text-4xl">
          {cms.sectionTitles?.testimonialsTitle || 'Trusted by teams building something new'}
        </h2>

        {/* Client testimonial container: No frame, image on top, client name, testimony */}
        <div className="mt-14 flex flex-col items-center">
          <div className="flex flex-col items-center max-w-2xl">
            {/* 1. Image on top — enters from top/right with 1 second delay after text */}
            <div
              style={{
                opacity: imageVisible ? 1 : 0,
                transform: imageVisible ? 'translateY(0) scale(1)' : 'translateY(-36px) scale(0.92)',
                transition: 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="will-change-transform"
            >
              <img
                src={current.image}
                alt={current.name}
                style={{ borderRadius: '100%' }}
                className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-lime object-cover shadow-md"
              />
            </div>

            {/* 2. Client text & testimony — enters first from bottom/left */}
            <div
              style={{
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateX(0) translateY(0)' : 'translateX(-30px) translateY(18px)',
                transition: 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="mt-5 flex flex-col items-center will-change-transform"
            >
              <h3 className="font-display text-xl font-bold text-forest sm:text-2xl">
                {current.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-forest/60">
                {current.role}
              </p>

              <blockquote className="mt-6 text-base sm:text-xl leading-relaxed text-forest/80 italic font-normal">
                “{current.quote}”
              </blockquote>
            </div>

            {/* Slide counter numbers (e.g. '02 / 05') removed as requested */}
          </div>
        </div>
      </div>
    </section>
  );
}