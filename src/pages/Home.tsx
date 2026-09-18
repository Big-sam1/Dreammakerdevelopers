import React from 'react';
import { Hero } from '../components/home/Hero';
import { ServicesPreview } from '../components/home/ServicesPreview';
import { AboutPreview } from '../components/home/AboutPreview';
import { ProcessSection } from '../components/home/ProcessSection';
import { Testimonials } from '../components/home/Testimonials';
import { CTASection } from '../components/CTASection';

export function Home() {
  return (
    <>
      <Hero />
      <ServicesPreview />
      <AboutPreview />
      <ProcessSection />
      <Testimonials />
      <CTASection />
    </>);

}