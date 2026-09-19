import React, { useState, useMemo } from 'react';
import { ArrowUpRightIcon, SparklesIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { CTASection } from '../components/CTASection';
import { useCMS } from '../context/CMSContext';

type Project = {
  id: string;
  title: string;
  category: 'software' | 'mobile' | 'ai' | 'design' | 'consulting';
  categoryLabel: string;
  summary: string;
  impact: string;
  image: string;
  tags: string[];
};

const projectsData: Project[] = [
  {
    id: 'finedge-banking',
    title: 'FinEdge Core Banking & Merchant Portal',
    category: 'software',
    categoryLabel: 'Software & Web',
    summary:
      'A next-generation digital banking platform providing real-time micro-payments, multi-currency wallets, and compliant audit trails for over 150,000 businesses.',
    impact: 'Processed $42M+ in transaction volume in year one',
    image: '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
    tags: ['Next.js', 'Go', 'PostgreSQL', 'TailwindCSS', 'AWS'],
  },
  {
    id: 'healthsync-mobile',
    title: 'HealthSync Telemedicine & Triage App',
    category: 'mobile',
    categoryLabel: 'Mobile Apps',
    summary:
      'Cross-platform iOS and Android app connecting patients with certified specialists for HD video consultations, e-prescriptions, and encrypted vitals tracking.',
    impact: 'Over 85,000 patient consultations conducted',
    image: '/256842fa-b28b-4563-986d-bcc0bf612542.jpg',
    tags: ['Flutter', 'WebRTC', 'FastAPI', 'Firebase', 'HIPAA'],
  },
  {
    id: 'agrivision-ai',
    title: 'AgriVision Satellite & Drone Crop Diagnostic AI',
    category: 'ai',
    categoryLabel: 'Artificial Intelligence',
    summary:
      'Computer vision and machine learning engine that analyzes multispectral drone imagery to detect crop diseases and predict yield outcomes up to 6 weeks early.',
    impact: 'Boosted harvest yields by 28% across 40 cooperative farms',
    image: '/67bedf41-d607-4532-8e95-cdbc38a213b5.jpg',
    tags: ['PyTorch', 'Computer Vision', 'FastAPI', 'Docker', 'GIS'],
  },
  {
    id: 'nova-identity',
    title: 'Nova Capital Brand Identity & Design System',
    category: 'design',
    categoryLabel: 'UI/UX Design',
    summary:
      'Complete brand strategy, visual design language, and design token system for an East African venture fund supporting technology entrepreneurs.',
    impact: 'Increased partner engagement and brand recall by 210%',
    image: '/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg',
    tags: ['Figma', 'Design System', 'Typography', 'Brand Guidelines'],
  },
  {
    id: 'northline-logistics',
    title: 'Northline Freight & Fleet Tracking Cloud',
    category: 'software',
    categoryLabel: 'Software & Web',
    summary:
      'Cloud dispatch and GPS route optimization portal handling cross-border cargo manifests, driver telemetry, and fuel efficiency forecasting.',
    impact: 'Reduced dispatch latency by 45% and cut fuel wastage',
    image: '/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg',
    tags: ['React', 'TypeScript', 'Node.js', 'Redis', 'Mapbox'],
  },
  {
    id: 'govcloud-infra',
    title: 'Kigali Municipal Cloud Migration & DevSecOps',
    category: 'consulting',
    categoryLabel: 'IT Consulting',
    summary:
      'Enterprise cloud modernization and containerization architecture for civic service portals, implementing zero-trust security and continuous disaster recovery.',
    impact: '99.99% service availability with zero security incidents',
    image: '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
    tags: ['Kubernetes', 'Terraform', 'Vault', 'Zero Trust', 'Monitoring'],
  },
  {
    id: 'edulearn-platform',
    title: 'EduLearn Adaptive Learning & Skill Engine',
    category: 'software',
    categoryLabel: 'Software & Web',
    summary:
      'Intelligent online education platform delivering gamified coding and STEM curriculums to thousands of primary and secondary students across Rwanda.',
    impact: 'Trained 12,000+ students in practical programming skills',
    image: '/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg',
    tags: ['React', 'Python', 'GraphQL', 'Stripe', 'Docker'],
  },
  {
    id: 'swiftpay-wallet',
    title: 'SwiftPay Cross-Border Remittance Wallet',
    category: 'mobile',
    categoryLabel: 'Mobile Apps',
    summary:
      'Ultra-low-fee remittance mobile application supporting instant mobile money transfers across Rwanda, Kenya, Uganda, and Tanzania with biometric auth.',
    impact: 'Saved users over $300K in traditional wire fees',
    image: '/256842fa-b28b-4563-986d-bcc0bf612542.jpg',
    tags: ['React Native', 'Node.js', 'Redis', 'FinTech APIs'],
  },
  {
    id: 'kinyarwanda-nlp-voice',
    title: 'LocalSpeak Speech Recognition & NLP Model',
    category: 'ai',
    categoryLabel: 'Artificial Intelligence',
    summary:
      'Voice recognition and natural language processing model trained on localized African languages to enable voice banking and automated customer support.',
    impact: '96.4% word accuracy rate on native voice interactions',
    image: '/67bedf41-d607-4532-8e95-cdbc38a213b5.jpg',
    tags: ['Transformers', 'PyTorch', 'Audio Processing', 'FastAPI'],
  },
  {
    id: 'apex-brand-revamp',
    title: 'Apex Clean Energy Brand & UI System',
    category: 'design',
    categoryLabel: 'UI/UX Design',
    summary:
      'Modular visual design architecture, customer portal interfaces, and brand marketing kit for an off-grid solar energy distribution enterprise.',
    impact: 'Tripled self-service customer portal adoption in 90 days',
    image: '/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg',
    tags: ['Design Tokens', 'Tailwind', 'UX Research', 'Figma'],
  },
  {
    id: 'cyber-audit-retail',
    title: 'OmniRetail Zero-Day Threat Audit & Hardening',
    category: 'consulting',
    categoryLabel: 'IT Consulting',
    summary:
      'Comprehensive penetration testing, PCI-DSS compliance overhaul, and staff security training for an enterprise retail chain with 45 physical locations.',
    impact: 'Remediated 32 critical vulnerabilities before peak holiday season',
    image: '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
    tags: ['PCI-DSS', 'Penetration Testing', 'SIEM', 'Compliance'],
  },
  {
    id: 'kigaliride-fleet',
    title: 'KigaliRide Electric Motorcycle Fleet Dispatch',
    category: 'mobile',
    categoryLabel: 'Mobile Apps',
    summary:
      'Dual-app ecosystem for EV taxi operators and passengers featuring battery swap station telemetry, route optimization, and cashless mobile payments.',
    impact: 'Powering over 2,500 daily green transit trips in Kigali',
    image: '/256842fa-b28b-4563-986d-bcc0bf612542.jpg',
    tags: ['Flutter', 'IoT MQTT', 'Websockets', 'Google Maps API'],
  },
  {
    id: 'predict-ai-supply',
    title: 'SmartStock AI Demand Forecasting & Inventory',
    category: 'ai',
    categoryLabel: 'Artificial Intelligence',
    summary:
      'Time-series forecasting algorithms that analyze seasonal trends, market indices, and local weather patterns to optimize pharmaceutical restocking.',
    impact: 'Reduced stockouts by 72% for regional clinics',
    image: '/67bedf41-d607-4532-8e95-cdbc38a213b5.jpg',
    tags: ['Prophet', 'Python', 'Postgres', 'Scikit-Learn'],
  },
];

const categories = [
  { key: 'all', label: 'All Projects' },
  { key: 'software', label: 'Software & Web' },
  { key: 'mobile', label: 'Mobile Apps' },
  { key: 'ai', label: 'AI & Machine Learning' },
  { key: 'design', label: 'UI/UX & Branding' },
  { key: 'consulting', label: 'IT Consulting' },
];

const ITEMS_PER_PAGE = 6;

export function Projects() {
  const { cms } = useCMS();
  const hero = cms.pageHeroes.projects;
  const projectsData = cms.projects;

  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    return activeCategory === 'all'
      ? projectsData
      : projectsData.filter((p) => p.category === activeCategory);
  }, [activeCategory, projectsData]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));

  // Current page items (not more than 6)
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handleCategoryChange = (catKey: string) => {
    setActiveCategory(catKey);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const grid = document.getElementById('projects-grid-start');
      if (grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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

      <section id="projects-grid-start" className="bg-cream px-6 py-16">
        <div className="mx-auto max-w-7xl">
          {/* Editable Section Title */}
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-forest md:text-4xl">
              {cms.sectionTitles?.projectsTitle || 'Curated Projects Showcase'}
            </h2>
            <p className="mt-2 text-sm text-forest/60">
              Explore our delivered software systems, mobile platforms, and AI architectures.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleCategoryChange(cat.key)}
                className={`rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                  activeCategory === cat.key
                    ? 'bg-forest text-lime shadow-md'
                    : 'bg-white text-forest/70 border border-forest/10 hover:border-forest/30 hover:text-forest'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Projects Counter status */}
          <div className="mt-8 flex items-center justify-between text-xs text-forest/55">
            <span>
              Showing {filteredProjects.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} -{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProjects.length)} of {filteredProjects.length} projects
            </span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Projects Grid: Exactly max 6 per page */}
          <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paginatedProjects.map((project) => (
              <article
                key={project.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden bg-forest/10">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent" />
                  <span className="absolute top-4 left-4 rounded-full bg-forest/90 px-3 py-1 text-xs font-medium text-lime backdrop-blur">
                    {project.categoryLabel}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="font-display text-xl font-bold text-forest group-hover:text-forest-mid">
                    {project.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-forest/65 flex-1">
                    {project.summary}
                  </p>

                  <div className="mt-5 rounded-2xl bg-cream p-3.5 border border-forest/5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-forest">
                      <SparklesIcon className="h-3.5 w-3.5 text-lime-dark shrink-0" />
                      <span>{project.impact}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-forest/5 px-2.5 py-1 text-[11px] font-medium text-forest/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-forest/10 pt-5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-forest/40 uppercase tracking-wider">
                      Case Study
                    </span>
                    {(project as any).link ? (
                      <a
                        href={(project as any).link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-forest transition-colors group-hover:text-lime-dark hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Project
                        <ArrowUpRightIcon className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-forest/40">
                        Explore architecture
                        <ArrowUpRightIcon className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination Controls with numbers and next/prev icons */}
          {totalPages > 1 && (
            <div className="mt-14 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="grid h-10 w-10 place-items-center rounded-full border border-forest/15 bg-white text-forest transition-colors hover:border-forest hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`grid h-10 w-10 place-items-center rounded-full text-sm font-semibold transition-all ${
                    pageNum === currentPage
                      ? 'bg-forest text-lime shadow-md scale-105'
                      : 'border border-forest/10 bg-white text-forest/75 hover:bg-cream hover:text-forest'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="grid h-10 w-10 place-items-center rounded-full border border-forest/15 bg-white text-forest transition-colors hover:border-forest hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Page-specific CTA container with custom image for Projects page */}
      <CTASection {...cms.ctaSections.projects} />
    </>
  );
}
