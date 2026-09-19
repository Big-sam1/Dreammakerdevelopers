import React from 'react';
import { Hero } from '../components/home/Hero';
import { ServicesPreview } from '../components/home/ServicesPreview';
import { AboutPreview } from '../components/home/AboutPreview';
import { ProcessSection } from '../components/home/ProcessSection';
import { Testimonials } from '../components/home/Testimonials';
import { CTASection } from '../components/CTASection';
import { useCMS } from '../context/CMSContext';

export function Home() {
  const { cms } = useCMS();
  return (
    <>
      <Hero />
      <ServicesPreview />
      <AboutPreview />
      <ProcessSection />
      <Testimonials />
      <CTASection {...cms.ctaSections.home} />
    </>);

}
