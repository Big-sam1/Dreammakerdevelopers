import React, { createContext, useContext, useState, useEffect } from 'react';
import { navLinks as initialNavLinks, company as initialCompany, stats as initialStats, testimonials as initialTestimonials, team as initialTeam } from '../data/site';
import { services as initialServices } from '../data/services';
import { getCmsStateFromSupabase, saveCmsStateToSupabase, savePublicSubmission } from '../lib/supabase';
import defaultHeroImage from '../data/hero.png';
import defaultHomeCtaImage from '../data/5.png';
import defaultAboutCtaImage from '../data/8.png';
import defaultServicesCtaImage from '../data/10.png';
import defaultNewsCtaImage from '../data/11.png';

const legacyBundledImagePaths: Record<string, string> = {
  '/5.png': defaultHomeCtaImage,
  '/8.png': defaultAboutCtaImage,
  '/10.png': defaultServicesCtaImage,
  '/11.png': defaultNewsCtaImage,
};

function resolveBundledImagePath(image: unknown, fallback: string): string {
  return typeof image === 'string' && image.trim()
    ? legacyBundledImagePaths[image] || image
    : fallback;
}

export type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
};

export type TeamMemberItem = {
  name: string;
  role: string;
  specialty: string;
  image: string;
};

export type ServiceItem = {
  slug: string;
  title: string;
  summary: string;
  details: string;
  icon: string;
  deliverables: string[];
};

export type ProjectItem = {
  id: string;
  title: string;
  category: 'software' | 'mobile' | 'ai' | 'design' | 'consulting';
  categoryLabel: string;
  summary: string;
  impact: string;
  image: string;
  tags: string[];
  link?: string;
};

export type NewsItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  authorImage: string;
  excerpt: string;
  content: string[];
  image: string;
};

export type BranchLocation = {
  id: string;
  name: string;
  city: string;
  country: string;
  caption: string;
  x: number; // percentage coordinate 0-100%
  y: number; // percentage coordinate 0-100%
  status: 'active' | 'headquarters' | 'planned';
  visitors?: string;
};

export type AdminProfile = {
  name: string;
  email: string;
  role: string;
  avatar: string;
  portalLogo: string;
};

export type WebsiteBackground = {
  enabled: boolean;
  imageUrl: string;
  opacity: number; // 0 to 1
  transparentContainers: boolean;
};

export type SectionTitles = {
  projectsTitle: string;
  projectsSubtitle: string;
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  teamTitle: string;
  teamSubtitle: string;
  servicesTitle: string;
  servicesSubtitle: string;
  newsTitle: string;
  newsSubtitle: string;
  mapTitle: string;
  mapSubtitle: string;
  inboxTitle: string;
  inboxSubtitle: string;
  workspacesTitle: string;
  workspacesSubtitle: string;
};

export type ProjectSubmission = {
  id: string;
  solutionType: string;
  budget: string;
  timeline: string;
  description: string;
  features?: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  createdAt: string;
  read?: boolean;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  service: string;
  budget: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

export type SocialLink = {
  label: string;
  url: string;
  enabled: boolean;
};

export type PageHeroItem = {
  title: string;
  eyebrow: string;
  description: string;
  backgroundImage?: string;
  blur?: string;
  overlayOpacity?: number;
};

export type CTASectionItem = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  buttonText: string;
  buttonTo: string;
};

export type CTASectionKey = 'home' | 'about' | 'services' | 'projects' | 'startProject' | 'news';

export type CMSState = {
  heroPhrases: string[];
  heroDescription: string;
  heroBackgroundImage: string;
  ctaSections: Record<CTASectionKey, CTASectionItem>;
  // 1. Branding & Logos
  navLogo: string;
  footerLogo: string;
  brandName: string;
  brandSubtitle: string;
  favicon: string;

  // 2. Counters & Stats
  stats: {
    projectsDelivered: string;
    happyClients: string;
    countriesServed: string;
    averageRating: string;
  };

  // 3. Company & Contact Info
  company: {
    name: string;
    short: string;
    email: string;
    phone: string;
    address: string;
    hours: string;
    tagline: string;
  };

  // 4. Footer Social Links
  socialLinks: SocialLink[];

  // 5. Testimonials
  testimonials: TestimonialItem[];

  // 6. Team Members
  team: TeamMemberItem[];

  // 7. Sliding Partner Images
  partnerImages: string[];

  // 8. Workflow Video
  workflow: {
    videoUrl: string;
    poster?: string;
    title: string;
    description: string;
  };

  // 9. Services
  services: ServiceItem[];

  // 10. Projects
  projects: ProjectItem[];

  // 11. News Articles
  newsArticles: NewsItem[];

  // 12. Workspace Hub Photos (Contact FAQ)
  workspaceImages: {
    lab: string;
    studio: string;
    lounge: string;
  };

  // 13. Page Heroes
  pageHeroes: {
    about: PageHeroItem;
    services: PageHeroItem;
    projects: PageHeroItem;
    contact: PageHeroItem;
    startProject: PageHeroItem;
  };

  // 14. Submissions
  projectSubmissions: ProjectSubmission[];
  contactSubmissions: ContactSubmission[];

  // 15. Map Branches & Locations
  branches: BranchLocation[];

  // 16. Admin Profile & Portal Branding
  adminProfile: AdminProfile;

  // 17. Full-Page Website Background & Transparent Mode
  websiteBackground: WebsiteBackground;

  // 18. Section Titles & Headline Customization
  sectionTitles: SectionTitles;
};

const initialProjects: ProjectItem[] = [
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
    link: 'https://finedge.africa',
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
    link: 'https://healthsync.io',
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
    link: 'https://agrivision.ai',
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
    link: 'https://novacap.vc',
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
    link: 'https://northline.cloud',
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
    link: 'https://kigali.gov.rw',
  },
];

const initialNews: NewsItem[] = [
  {
    id: 'when-you-tell-them-the-truth',
    title: 'When you tell them the truth: Building dependable autonomous systems in 2026',
    category: 'OPINION',
    date: 'January 9, 2026',
    readTime: '7 min read',
    author: 'Sarah Gakire',
    authorRole: 'Head of AI & Machine Learning, DMD',
    authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    excerpt:
      'Engineering real-world AI applications requires stripping away marketing hype and confronting data pipelines, latency bottlenecks, and deterministic failovers head on.',
    content: [
      'In the current technological landscape, the gap between proof-of-concept AI demos and mission-critical production systems remains vast. When an organization commits to deploying artificial intelligence in financial underwriting or medical triage, hallucination is not merely an inconvenience — it is a critical vulnerability.',
      'At Dream Maker Developers, our approach is rooted in deterministic guardrails. Rather than allowing large language models unconstrained generation authority, we design multi-tiered consensus pipelines where every generative output is validated against structured business rules and verified schemas.',
      'Local context matters just as deeply as compute density. Operating within East African enterprise environments requires accommodating patchy network conditions, localized dialects, and specific regulatory data residency mandates. True innovation is not achieved by importing generic cloud models, but by fine-tuning models on domain-specific datasets that solve real challenges for local communities.',
    ],
    image: '/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg',
  },
  {
    id: 'hero-half-post',
    title: 'Architecting resilient serverless APIs under high concurrency',
    category: 'ENGINEERING',
    date: 'January 8, 2026',
    readTime: '5 min read',
    author: 'David Kwizera',
    authorRole: 'Lead Software Architect, DMD',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    excerpt: 'How our backend infrastructure handles sudden 10x traffic surges without database connection pool exhaustion.',
    content: [
      'Serverless computing promises boundless elasticity, but unconstrained concurrency can quickly bring your relational databases to a grinding halt. When 50,000 requests hit an API in a 30-second window, traditional connection pool configurations fail.',
      'We solved this by deploying connection multiplexers and write-ahead Redis buffers. By decoupling the write path from transactional storage, we ensure 99.999% availability during peak transaction periods across all client applications.',
    ],
    image: '/256842fa-b28b-4563-986d-bcc0bf612542.jpg',
  },
];

const initialBranches: BranchLocation[] = [
  {
    id: 'loc-1',
    name: 'Kigali Hub (Main Headquarters)',
    city: 'Kigali',
    country: 'Rwanda',
    caption: 'Primary Engineering Labs, Distributed Cloud & AI Systems Hub',
    x: 54.5,
    y: 56.5,
    status: 'headquarters',
    visitors: '4,210 visits (54.8%)',
  },
  {
    id: 'loc-2',
    name: 'Nairobi Regional Office',
    city: 'Nairobi',
    country: 'Kenya',
    caption: 'East African Fintech, Remittance & Logistics Operations Center',
    x: 56.8,
    y: 54.2,
    status: 'active',
    visitors: '550 visits (7.1%)',
  },
  {
    id: 'loc-3',
    name: 'London Advisory Branch',
    city: 'London',
    country: 'United Kingdom',
    caption: 'European Enterprise Architecture & Partner Relations Center',
    x: 48.6,
    y: 27.5,
    status: 'active',
    visitors: '890 visits (11.6%)',
  },
  {
    id: 'loc-4',
    name: 'New York Client Services',
    city: 'New York',
    country: 'United States',
    caption: 'North American Growth, Capital Ventures & Strategy Suite',
    x: 27.2,
    y: 33.5,
    status: 'active',
    visitors: '1,420 visits (18.5%)',
  },
  {
    id: 'loc-5',
    name: 'Berlin AI Research Pod',
    city: 'Berlin',
    country: 'Germany',
    caption: 'Machine Learning Models & Computer Vision Diagnostics Laboratory',
    x: 52.4,
    y: 25.8,
    status: 'active',
    visitors: '612 visits (8.0%)',
  },
  {
    id: 'loc-6',
    name: 'Dubai Trade Gateway',
    city: 'Dubai',
    country: 'United Arab Emirates',
    caption: 'Middle East Cross-Border Commerce & Cloud Infrastructure Node',
    x: 63.2,
    y: 41.5,
    status: 'planned',
    visitors: '340 visits (4.2%)',
  },
];

const defaultState: CMSState = {
  heroPhrases: ['digital reality', 'scalable software', 'intelligent experiences'],
  heroDescription: 'Dream Maker Developers is a technology and innovation company building reliable, scalable, user-centered software, apps, AI, and brands for businesses and communities.',
  heroBackgroundImage: defaultHeroImage,
  ctaSections: {
    home: { title: "Have an idea? Let's make it real.", description: "Tell us what you're building. We'll come back with a clear plan, an honest timeline, and a team ready to start.", image: defaultHomeCtaImage, imageAlt: 'The Dream Maker Developers studio at work', buttonText: 'Start a project', buttonTo: '/start-project' },
    about: { title: 'Ready to build your next breakthrough?', description: 'Partner with our dedicated team of architects, developers, and designers to turn your boldest ideas into production-ready digital reality.', image: defaultAboutCtaImage, imageAlt: 'Dream Maker Developers leadership and team', buttonText: 'Start a project', buttonTo: '/start-project' },
    services: { title: 'Ready to discuss your project scope?', description: 'Whether you need a dedicated development squad, a fixed-milestone digital build, or high-level technical advisory, our engineering leads are ready.', image: defaultServicesCtaImage, imageAlt: 'Dream Maker Developers digital software development dashboard', buttonText: 'Start a project', buttonTo: '/start-project' },
    projects: { title: 'Inspired by what you see?', description: "Let's build your next flagship product with the same engineering rigor, modern design craft, and scalable architecture.", image: defaultHomeCtaImage, imageAlt: 'Dream Maker Developers reviewing project deliverables', buttonText: 'Start a project', buttonTo: '/start-project' },
    startProject: { title: 'Ready to transform your vision into reality?', description: 'Partner with Dream Maker Developers to create scalable web, mobile, and AI solutions built to last.', image: defaultHomeCtaImage, imageAlt: 'Dream Maker Developers planning project delivery', buttonText: 'Book a Kickoff Call', buttonTo: '/contact' },
    news: { title: 'Have an engineering story or project in mind?', description: 'Share your insights with our editorial team or consult with our engineers to build scalable digital solutions.', image: defaultNewsCtaImage, imageAlt: 'DMD development team discussing software engineering insights', buttonText: 'Start a project', buttonTo: '/start-project' },
  },
  navLogo: '/logonav.png',
  footerLogo: '/logo.png',
  brandName: 'Dream Maker',
  brandSubtitle: 'Developers',
  favicon: '/favicon.svg',

  stats: {
    projectsDelivered: '120+',
    happyClients: '45+',
    countriesServed: '9',
    averageRating: '4.9',
  },

  company: {
    name: 'Dream Maker Developers Ltd',
    short: 'DMD',
    email: 'info@dreammakerdevelopers.com',
    phone: '+250 788 123 456',
    address: 'Kicukiro, Kagarama, Kigali, Rwanda',
    hours: 'Mon - Fri: 8:00 AM - 6:00 PM CAT',
    tagline: 'Engineering scalable software, digital media, and AI solutions.',
  },

  socialLinks: [
    { label: 'Facebook', url: 'https://facebook.com/dreammakerdevelopers', enabled: true },
    { label: 'Twitter', url: 'https://twitter.com/dreammakerdev', enabled: true },
    { label: 'LinkedIn', url: 'https://linkedin.com/company/dreammakerdevelopers', enabled: true },
    { label: 'Instagram', url: 'https://instagram.com/dreammakerdevelopers', enabled: true },
  ],

  testimonials: [
    {
      id: 'test-1',
      name: 'Elena Rostova',
      role: 'Head of Growth, Zenith Global Media',
      quote:
        'From mobile experience to web performance, DMD set a standard our users love. Working with them was effortless and the technical architecture is rock solid.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'test-2',
      name: 'Marcus Vance',
      role: 'Chief Technology Officer, Northline Cloud',
      quote:
        'They shipped our enterprise cloud portal two weeks ahead of schedule with zero security vulnerabilities. The best engineering team in East Africa.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'test-3',
      name: 'Amina Diallo',
      role: 'VP Product, AfriPay Financial',
      quote:
        'Their AI crop analysis pipeline and fintech integrations transformed our entire workflow. High integrity, responsive sprint reviews, and world-class craft.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    },
  ],

  team: [
    {
      name: 'Jean-Luc Habimana',
      role: 'Chief Executive Officer & Founder',
      specialty: 'Strategy & Systems Architecture',
      image: '/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg',
    },
    {
      name: 'David Kwizera',
      role: 'Lead Software Architect',
      specialty: 'Distributed Systems & Go',
      image: '/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg',
    },
    {
      name: 'Sarah Gakire',
      role: 'Head of AI & Machine Learning',
      specialty: 'Computer Vision & Deep Learning',
      image: '/256842fa-b28b-4563-986d-bcc0bf612542.jpg',
    },
    {
      name: 'Eric Mugisha',
      role: 'Principal UI/UX Designer',
      specialty: 'Design Systems & Figma',
      image: '/67bedf41-d607-4532-8e95-cdbc38a213b5.jpg',
    },
    {
      name: 'Aline Umutoni',
      role: 'Lead Mobile Developer',
      specialty: 'Flutter, iOS & Android',
      image: '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
    },
    {
      name: 'Patrick Niyonsaba',
      role: 'Senior DevOps & Cloud Engineer',
      specialty: 'Kubernetes, AWS & CI/CD',
      image: '/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg',
    },
    {
      name: 'Chantal Mukamana',
      role: 'Head of Digital Media & Motion',
      specialty: 'Brand Identity & Media Production',
      image: '/256842fa-b28b-4563-986d-bcc0bf612542.jpg',
    },
    {
      name: 'Kevin Bizimana',
      role: 'Senior Full-Stack Engineer',
      specialty: 'Next.js, TypeScript & Node',
      image: '/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg',
    },
    {
      name: 'Nadine Uwase',
      role: 'QA & Security Engineer',
      specialty: 'Penetration Testing & Automation',
      image: '/67bedf41-d607-4532-8e95-cdbc38a213b5.jpg',
    },
    {
      name: 'Olivier Munyaneza',
      role: 'Technical Project Lead',
      specialty: 'Agile Delivery & Client Success',
      image: '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
    },
  ],

  partnerImages: [
    '/logo.png',
    '/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg',
    '/256842fa-b28b-4563-986d-bcc0bf612542.jpg',
    '/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg',
    '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
    '/67bedf41-d607-4532-8e95-cdbc38a213b5.jpg',
    '/logonav.png',
    '/favicon.jpeg',
  ],

  workflow: {
    videoUrl: '',
    title: 'Inside Our Agile Engineering Sprints',
    description:
      'This video demonstrates how our cross-functional teams in Kicukiro, Kagarama collaborate daily. From interactive Figma prototypes to cloud deployments, every phase is engineered with precision, peer code reviews, and automated testing.',
  },

  services: initialServices,
  projects: initialProjects,
  newsArticles: initialNews,

  workspaceImages: {
    lab: '/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg',
    studio: '/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg',
    lounge: '/67bedf41-d607-4532-8e95-cdbc38a213b5.jpg',
  },

  pageHeroes: {
    about: {
      eyebrow: 'About',
      title: 'Dream Maker Developers',
      description: 'A forward-thinking technology and innovation company dedicated to transforming ideas into impactful digital solutions.',
      backgroundImage: '',
      blur: 'none',
      overlayOpacity: 0.85,
    },
    services: {
      eyebrow: 'Services',
      title: 'Digital solutions, end to end',
      description: 'Software, apps, AI, design, branding, media, and consulting — delivered by one team that stays accountable from first sketch to long-term support.',
      backgroundImage: '',
      blur: 'none',
      overlayOpacity: 0.85,
    },
    projects: {
      eyebrow: 'Projects',
      title: 'Crafted with purpose & precision',
      description: 'A curated showcase of scalable software, mobile apps, artificial intelligence tools, and brand identities engineered by Dream Maker Developers.',
      backgroundImage: '',
      blur: 'none',
      overlayOpacity: 0.85,
    },
    contact: {
      eyebrow: 'Contact',
      title: "Let's build something worth using",
      description: 'Share a few details about your project and our team will get back to you with next steps.',
      backgroundImage: '',
      blur: 'none',
      overlayOpacity: 0.85,
    },
    startProject: {
      eyebrow: 'Start a Project',
      title: "Let's build your next digital product",
      description: 'Share your project goals, timelines, and scope. Our lead architects in Kicukiro, Kagarama will review your requirements and return with a detailed execution roadmap and cost estimate.',
      backgroundImage: '',
      blur: 'none',
      overlayOpacity: 0.85,
    },
  },

  projectSubmissions: [
    {
      id: 'sub-demo-1',
      solutionType: 'Web Platform & SaaS',
      budget: '$25,000 - $50,000',
      timeline: '1 - 3 Months',
      description: 'Need a multi-tenant subscription SaaS for East African medical labs to manage patient records securely.',
      features: 'HIPAA compliance, automated SMS reports, mobile money checkout',
      name: 'Dr. Joseph Ndahiro',
      email: 'joseph@medilab.rw',
      company: 'MediLab Africa',
      phone: '+250 788 456 789',
      createdAt: '2026-09-17T14:32:00Z',
      read: false,
    },
    {
      id: 'sub-demo-2',
      solutionType: 'Mobile Application',
      budget: '$10,000 - $25,000',
      timeline: '< 1 Month',
      description: 'Electric vehicle charging station locator with live battery telemetry and mobile wallet booking.',
      features: 'Google Maps API, Bluetooth lock unlock, MoMo pay',
      name: 'Grace Mutoni',
      email: 'grace@kigalicharge.com',
      company: 'Kigali EV Mobility',
      phone: '+250 782 112 233',
      createdAt: '2026-09-16T10:15:00Z',
      read: true,
    },
  ],

  contactSubmissions: [
    {
      id: 'con-demo-1',
      name: 'Michael Rukundo',
      email: 'michael@eastlogistics.com',
      service: 'Software Development',
      budget: '$10,000 - $25,000',
      message: 'Looking to overhaul our cargo tracking dashboard and integrate GPS telemetry across 80 transit trucks.',
      createdAt: '2026-09-17T18:45:00Z',
      read: false,
    },
  ],

  branches: initialBranches,

  adminProfile: {
    name: 'Chief Administrator',
    email: 'admin@dreammakerdevelopers.com',
    role: 'Super Admin & Lead Architect',
    avatar: '',
    portalLogo: '/logonav.png',
  },

  websiteBackground: {
    enabled: false,
    imageUrl: '',
    opacity: 0.15,
    transparentContainers: true,
  },

  sectionTitles: {
    projectsTitle: 'Curated Projects Showcase',
    projectsSubtitle: 'A curated showcase of scalable software, mobile apps, artificial intelligence tools, and brand identities.',
    testimonialsTitle: 'Client Testimonials & Stories',
    testimonialsSubtitle: 'Trusted by teams building something new around the world.',
    teamTitle: 'Meet the minds behind Dream Maker Developers',
    teamSubtitle: 'A multidisciplinary collective of architects, software engineers, AI researchers, and designers.',
    servicesTitle: 'Engineered For Scale & Performance',
    servicesSubtitle: 'Explore our core digital disciplines — delivered by multidisciplinary teams in Kicukiro, Kagarama.',
    newsTitle: 'News, Opinions & Publications',
    newsSubtitle: 'Publish editorial analyses, technical opinions, and manage author identities.',
    mapTitle: 'Visitor Geo Distribution & Virtual Map',
    mapSubtitle: 'Interactive location pinning, regional hubs, and live global telemetry.',
    inboxTitle: 'Client Inquiries & Briefs',
    inboxSubtitle: 'Incoming briefs from "Start a Project" and Web3Forms contact submissions.',
    workspacesTitle: 'Our Kagarama Hub & Workspaces',
    workspacesSubtitle: 'Kicukiro, Kigali — Systems Lab, Sprint Studio, and Design Lounge.',
  },
};

type CMSContextType = {
  cms: CMSState;
  syncStatus: 'loading' | 'saving' | 'saved' | 'error';
  updateCMS: (updater: (prev: CMSState) => CMSState) => void;
  updateStats: (newStats: CMSState['stats']) => void;
  updateCompany: (newCompany: Partial<CMSState['company']>) => void;
  updateSocialLinks: (links: SocialLink[]) => void;
  updateLogos: (logos: { navLogo?: string; footerLogo?: string; favicon?: string; brandName?: string; brandSubtitle?: string }) => void;
  updateWorkflow: (workflow: CMSState['workflow']) => void;
  updateWorkspaceImages: (images: CMSState['workspaceImages']) => void;
  updatePageHero: (page: keyof CMSState['pageHeroes'], data: Partial<PageHeroItem>) => void;
  updateCtaSection: (page: CTASectionKey, data: Partial<CTASectionItem>) => void;
  updateHeroDescription: (description: string) => void;
  addProject: (project: ProjectItem) => void;
  updateProject: (project: ProjectItem) => void;
  deleteProject: (id: string) => void;
  addNewsArticle: (article: NewsItem) => void;
  updateNewsArticle: (article: NewsItem) => void;
  deleteNewsArticle: (id: string) => void;
  addTestimonial: (item: TestimonialItem) => void;
  updateTestimonial: (item: TestimonialItem) => void;
  deleteTestimonial: (id: string) => void;
  updateTeamMember: (index: number, member: TeamMemberItem) => void;
  addTeamMember: (member: TeamMemberItem) => void;
  deleteTeamMember: (index: number) => void;
  updatePartnerImages: (images: string[]) => void;
  updateService: (index: number, service: ServiceItem) => void;
  addService: (service: ServiceItem) => void;
  deleteService: (index: number) => void;
  addProjectSubmission: (sub: Omit<ProjectSubmission, 'id' | 'createdAt'>) => void;
  addContactSubmission: (sub: Omit<ContactSubmission, 'id' | 'createdAt'>) => void;
  addBranch: (branch: BranchLocation) => void;
  updateBranch: (branch: BranchLocation) => void;
  deleteBranch: (id: string) => void;
  updateAdminProfile: (profile: Partial<AdminProfile>) => void;
  updateWebsiteBackground: (bg: Partial<WebsiteBackground>) => void;
  updateSectionTitles: (titles: Partial<SectionTitles>) => void;
  markSubmissionsRead: (ids: string[], type: 'projects' | 'contacts', read: boolean) => void;
  deleteSubmissions: (ids: string[], type: 'projects' | 'contacts') => void;
  resetToDefaults: () => void;
  persistStateDirectly: (nextState: CMSState) => Promise<boolean>;
};

const CMSContext = createContext<CMSContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dmd_cms_state_v2';

function mergeWithDefaults(parsed: any): CMSState {
  if (!parsed || typeof parsed !== 'object') return defaultState;
  return {
    ...defaultState,
    ...parsed,
    // Migrate the legacy square JPEG to the circular SVG favicon.
    favicon: parsed.favicon === '/favicon.jpeg' ? defaultState.favicon : (parsed.favicon || defaultState.favicon),
    // Replace the former hard-coded Home hero photo with the project hero asset.
    heroBackgroundImage: parsed.heroBackgroundImage === '/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg'
      ? defaultHeroImage
      : (parsed.heroBackgroundImage || defaultHeroImage),
    heroPhrases: Array.isArray(parsed.heroPhrases) && parsed.heroPhrases.filter(Boolean).length > 0
      ? parsed.heroPhrases.filter((phrase: unknown) => typeof phrase === 'string' && phrase.trim()).slice(0, 3)
      : defaultState.heroPhrases,
    heroDescription: typeof parsed.heroDescription === 'string' ? parsed.heroDescription : defaultState.heroDescription,
    ctaSections: (Object.keys(defaultState.ctaSections) as CTASectionKey[]).reduce((sections, key) => {
      const saved = parsed.ctaSections?.[key] || {};
      sections[key] = {
        ...defaultState.ctaSections[key],
        ...saved,
        image: resolveBundledImagePath(saved.image, defaultState.ctaSections[key].image),
      };
      return sections;
    }, {} as Record<CTASectionKey, CTASectionItem>),
    stats: { ...defaultState.stats, ...(parsed.stats || {}) },
    company: { ...defaultState.company, ...(parsed.company || {}) },
    socialLinks: Array.isArray(parsed.socialLinks) && parsed.socialLinks.length > 0 ? parsed.socialLinks : defaultState.socialLinks,
    testimonials: Array.isArray(parsed.testimonials) && parsed.testimonials.length > 0 ? parsed.testimonials : defaultState.testimonials,
    team: Array.isArray(parsed.team) && parsed.team.length > 0 ? parsed.team : defaultState.team,
    partnerImages: Array.isArray(parsed.partnerImages) && parsed.partnerImages.length > 0 ? parsed.partnerImages : defaultState.partnerImages,
    workflow: {
      ...defaultState.workflow,
      ...(parsed.workflow || {}),
      videoUrl: parsed.workflow?.videoUrl?.includes('assets.mixkit.co') ? '' : (parsed.workflow?.videoUrl || ''),
    },
    services: Array.isArray(parsed.services) && parsed.services.length > 0 ? parsed.services : defaultState.services,
    projects: Array.isArray(parsed.projects) && parsed.projects.length > 0 ? parsed.projects : defaultState.projects,
    newsArticles: Array.isArray(parsed.newsArticles) && parsed.newsArticles.length > 0 ? parsed.newsArticles : defaultState.newsArticles,
    workspaceImages: { ...defaultState.workspaceImages, ...(parsed.workspaceImages || {}) },
    pageHeroes: {
      about: { ...defaultState.pageHeroes.about, ...(parsed.pageHeroes?.about || {}) },
      services: { ...defaultState.pageHeroes.services, ...(parsed.pageHeroes?.services || {}) },
      projects: { ...defaultState.pageHeroes.projects, ...(parsed.pageHeroes?.projects || {}) },
      contact: { ...defaultState.pageHeroes.contact, ...(parsed.pageHeroes?.contact || {}) },
      startProject: { ...defaultState.pageHeroes.startProject, ...(parsed.pageHeroes?.startProject || {}) },
    },
    projectSubmissions: Array.isArray(parsed.projectSubmissions) ? parsed.projectSubmissions : defaultState.projectSubmissions,
    contactSubmissions: Array.isArray(parsed.contactSubmissions) ? parsed.contactSubmissions : defaultState.contactSubmissions,
    branches: Array.isArray(parsed.branches) && parsed.branches.length > 0 ? parsed.branches : defaultState.branches,
    adminProfile: { ...defaultState.adminProfile, ...(parsed.adminProfile || {}) },
    websiteBackground: { ...defaultState.websiteBackground, ...(parsed.websiteBackground || {}) },
    sectionTitles: { ...defaultState.sectionTitles, ...(parsed.sectionTitles || {}) },
  };
}

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [cms, setCms] = useState<CMSState>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return mergeWithDefaults(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse stored CMS state, using defaults', e);
    }
    return defaultState;
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<CMSContextType['syncStatus']>('loading');
  // Always retain the newest complete state. Retry logic uses this ref so an
  // older failed request can never overwrite a newer admin edit.
  const latestCmsRef = React.useRef<CMSState>(cms);
  const retryTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Every CMS mutation is a full-state write. Serialize those writes so a
  // slower request containing older team/news/media data can never finish
  // after a newer request and restore stale content in Supabase.
  const saveQueueRef = React.useRef<Promise<void>>(Promise.resolve());

  // Tracks the last Supabase updated_at we received — used to skip
  // unnecessary re-renders when nothing actually changed on the server.
  const lastSyncedAtRef = React.useRef<string | null>(null);
  // Debounce timer ref for Supabase saves.
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Effect 1: Cross-tab sync via BroadcastChannel + localStorage events ──
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('dmd_live_cms_sync');
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'CMS_UPDATE' && event.data.payload) {
          setCms(mergeWithDefaults(event.data.payload));
        }
      };
    }
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try {
          setCms(mergeWithDefaults(JSON.parse(e.newValue)));
        } catch (err) {
          console.error('Failed to parse synced CMS state', err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // ── Effect 2: Initial load from Supabase (direct, no server proxy) ────────
  useEffect(() => {
    let isMounted = true;
    getCmsStateFromSupabase()
      .then((result) => {
        if (isMounted && result?.state) {
          lastSyncedAtRef.current = result.updatedAt;
          setCms((prev) => mergeWithDefaults({ ...prev, ...(result.state as object) }));
        }
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setIsHydrated(true); });
    return () => { isMounted = false; };
  }, []);

  // ── Effect 3: Live-sync poll every 5 s with change detection ─────────────
  // Skips re-render when updatedAt hasn't changed → zero unnecessary renders.
  useEffect(() => {
    const poll = async () => {
      if (syncStatus === 'saving') return;
      const result = await getCmsStateFromSupabase();
      if (!result?.state) return;
      // Only update React state when the server timestamp actually changed
      if (lastSyncedAtRef.current === result.updatedAt) return;
      lastSyncedAtRef.current = result.updatedAt;
      setCms((prev) => mergeWithDefaults({ ...prev, ...(result.state as object) }));
    };
    const interval = window.setInterval(poll, 5_000);
    return () => window.clearInterval(interval);
  }, [syncStatus]);

  // ── Effect 4a: localStorage + BroadcastChannel update (immediate) ─────────
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cms));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('dmd_live_cms_sync');
        bc.postMessage({ type: 'CMS_UPDATE', payload: cms });
        bc.close();
      }
    } catch (e) {
      console.error('Failed to update local CMS state', e);
    }
  }, [cms]);

  useEffect(() => {
    latestCmsRef.current = cms;
  }, [cms]);

  // ── Effect 4b: Supabase save — DEBOUNCED 600 ms ──────────────────────────
  // Prevents flooding the database on every keystroke or rapid state change.
  useEffect(() => {
    if (!isHydrated) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    const persistLatestState = async () => {
      for (let attempt = 0; attempt <= 3; attempt += 1) {
        const saved = await saveCmsStateToSupabase(latestCmsRef.current);
        if (saved.ok) {
          if (saved.updatedAt) lastSyncedAtRef.current = saved.updatedAt;
          setSyncStatus('saved');
          return;
        }
        if (attempt < 3) {
          await new Promise<void>((resolve) => {
            retryTimerRef.current = setTimeout(resolve, 2_000 * (attempt + 1));
          });
        }
      }
      setSyncStatus('error');
    };

    saveTimerRef.current = setTimeout(() => {
      setSyncStatus('saving');
      saveQueueRef.current = saveQueueRef.current
        .catch(() => {})
        .then(persistLatestState);
    }, 600);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [cms, isHydrated]);

  const persistStateDirectly = async (nextState: CMSState): Promise<boolean> => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    latestCmsRef.current = nextState;
    setCms(nextState);
    setSyncStatus('saving');
    const saved = await saveCmsStateToSupabase(nextState);
    if (saved.ok) {
      if (saved.updatedAt) lastSyncedAtRef.current = saved.updatedAt;
      setSyncStatus('saved');
      return true;
    }
    setSyncStatus('error');
    return false;
  };

  const updateCMS = (updater: (prev: CMSState) => CMSState) => {
    setCms((prev) => updater(prev));
  };


  const updateStats = (newStats: CMSState['stats']) => {
    setCms((prev) => ({ ...prev, stats: newStats }));
  };

  const updateCompany = (newCompany: Partial<CMSState['company']>) => {
    setCms((prev) => ({ ...prev, company: { ...prev.company, ...newCompany } }));
  };

  const updateSocialLinks = (socialLinks: SocialLink[]) => {
    setCms((prev) => ({ ...prev, socialLinks }));
  };

  const updateLogos = (logos: { navLogo?: string; footerLogo?: string; favicon?: string; brandName?: string; brandSubtitle?: string }) => {
    setCms((prev) => ({
      ...prev,
      ...(logos.navLogo ? { navLogo: logos.navLogo } : {}),
      ...(logos.footerLogo ? { footerLogo: logos.footerLogo } : {}),
      ...(logos.favicon ? { favicon: logos.favicon } : {}),
      ...(logos.brandName ? { brandName: logos.brandName } : {}),
      ...(logos.brandSubtitle ? { brandSubtitle: logos.brandSubtitle } : {}),
    }));
  };

  const updateWorkflow = (workflow: CMSState['workflow']) => {
    setCms((prev) => ({ ...prev, workflow }));
  };

  const updateWorkspaceImages = (workspaceImages: CMSState['workspaceImages']) => {
    setCms((prev) => ({ ...prev, workspaceImages }));
  };

  const updatePageHero = (page: keyof CMSState['pageHeroes'], data: Partial<PageHeroItem>) => {
    setCms((prev) => ({
      ...prev,
      pageHeroes: {
        ...prev.pageHeroes,
        [page]: {
          ...prev.pageHeroes[page],
          ...data,
        },
      },
    }));
  };

  const updateCtaSection = (page: CTASectionKey, data: Partial<CTASectionItem>) => {
    setCms((prev) => ({
      ...prev,
      ctaSections: { ...prev.ctaSections, [page]: { ...prev.ctaSections[page], ...data } },
    }));
  };

  const updateHeroDescription = (heroDescription: string) => {
    setCms((prev) => ({ ...prev, heroDescription }));
  };

  const addProject = (project: ProjectItem) => {
    setCms((prev) => ({ ...prev, projects: [project, ...prev.projects] }));
  };

  const updateProject = (project: ProjectItem) => {
    setCms((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === project.id ? project : p)),
    }));
  };

  const deleteProject = (id: string) => {
    setCms((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
  };

  const addNewsArticle = (article: NewsItem) => {
    setCms((prev) => ({ ...prev, newsArticles: [article, ...prev.newsArticles] }));
  };

  const updateNewsArticle = (article: NewsItem) => {
    setCms((prev) => ({
      ...prev,
      newsArticles: prev.newsArticles.map((n) => (n.id === article.id ? article : n)),
    }));
  };

  const deleteNewsArticle = (id: string) => {
    setCms((prev) => ({ ...prev, newsArticles: prev.newsArticles.filter((n) => n.id !== id) }));
  };

  const addTestimonial = (item: TestimonialItem) => {
    setCms((prev) => ({ ...prev, testimonials: [...prev.testimonials, item] }));
  };

  const updateTestimonial = (item: TestimonialItem) => {
    setCms((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t) => (t.id === item.id ? item : t)),
    }));
  };

  const deleteTestimonial = (id: string) => {
    setCms((prev) => ({ ...prev, testimonials: prev.testimonials.filter((t) => t.id !== id) }));
  };

  const updateTeamMember = (index: number, member: TeamMemberItem) => {
    setCms((prev) => {
      const copy = [...prev.team];
      copy[index] = member;
      return { ...prev, team: copy };
    });
  };

  const addTeamMember = (member: TeamMemberItem) => {
    setCms((prev) => ({ ...prev, team: [...prev.team, member] }));
  };

  const deleteTeamMember = (index: number) => {
    setCms((prev) => ({ ...prev, team: prev.team.filter((_, i) => i !== index) }));
  };

  const updatePartnerImages = (partnerImages: string[]) => {
    setCms((prev) => ({ ...prev, partnerImages }));
  };

  const updateService = (index: number, service: ServiceItem) => {
    setCms((prev) => {
      const copy = [...prev.services];
      copy[index] = service;
      return { ...prev, services: copy };
    });
  };

  const addService = (service: ServiceItem) => {
    setCms((prev) => ({ ...prev, services: [...prev.services, service] }));
  };

  const deleteService = (index: number) => {
    setCms((prev) => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
  };

  const addProjectSubmission = (sub: Omit<ProjectSubmission, 'id' | 'createdAt'>) => {
    const newSub: ProjectSubmission = {
      ...sub,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setCms((prev) => ({
      ...prev,
      projectSubmissions: [newSub, ...prev.projectSubmissions],
    }));
    savePublicSubmission('project', newSub);
  };

  const addContactSubmission = (sub: Omit<ContactSubmission, 'id' | 'createdAt'>) => {
    const newSub: ContactSubmission = {
      ...sub,
      id: `cont-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setCms((prev) => ({
      ...prev,
      contactSubmissions: [newSub, ...prev.contactSubmissions],
    }));
    savePublicSubmission('contact', newSub);
  };

  // 15. Map Branches Management
  const addBranch = (branch: BranchLocation) => {
    setCms((prev) => ({ ...prev, branches: [...prev.branches, branch] }));
  };

  const updateBranch = (branch: BranchLocation) => {
    setCms((prev) => ({
      ...prev,
      branches: prev.branches.map((b) => (b.id === branch.id ? branch : b)),
    }));
  };

  const deleteBranch = (id: string) => {
    setCms((prev) => ({
      ...prev,
      branches: prev.branches.filter((b) => b.id !== id),
    }));
  };

  // 16. Admin Profile
  const updateAdminProfile = (profile: Partial<AdminProfile>) => {
    setCms((prev) => {
      const merged = { ...prev.adminProfile, ...profile };
      return {
        ...prev,
        adminProfile: merged,
      };
    });
  };

  // 17. Website Background & Transparent Mode
  const updateWebsiteBackground = (bg: Partial<WebsiteBackground>) => {
    setCms((prev) => ({
      ...prev,
      websiteBackground: { ...prev.websiteBackground, ...bg },
    }));
  };

  // 18. Section Titles
  const updateSectionTitles = (titles: Partial<SectionTitles>) => {
    setCms((prev) => ({
      ...prev,
      sectionTitles: { ...prev.sectionTitles, ...titles },
    }));
  };

  // 19. Bulk Submissions Selection Actions
  const markSubmissionsRead = (ids: string[], type: 'projects' | 'contacts', read: boolean) => {
    setCms((prev) => {
      if (type === 'projects') {
        return {
          ...prev,
          projectSubmissions: prev.projectSubmissions.map((s) =>
            ids.includes(s.id) ? { ...s, read } : s
          ),
        };
      } else {
        return {
          ...prev,
          contactSubmissions: prev.contactSubmissions.map((s) =>
            ids.includes(s.id) ? { ...s, read } : s
          ),
        };
      }
    });
  };

  const deleteSubmissions = (ids: string[], type: 'projects' | 'contacts') => {
    setCms((prev) => {
      if (type === 'projects') {
        return {
          ...prev,
          projectSubmissions: prev.projectSubmissions.filter((s) => !ids.includes(s.id)),
        };
      } else {
        return {
          ...prev,
          contactSubmissions: prev.contactSubmissions.filter((s) => !ids.includes(s.id)),
        };
      }
    });
  };

  const resetToDefaults = () => {
    setCms(defaultState);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <CMSContext.Provider
      value={{
        cms,
        syncStatus,
        updateCMS,
        updateStats,
        updateCompany,
        updateSocialLinks,
        updateLogos,
        updateWorkflow,
        updateWorkspaceImages,
        updatePageHero,
        updateCtaSection,
        updateHeroDescription,
        addProject,
        updateProject,
        deleteProject,
        addNewsArticle,
        updateNewsArticle,
        deleteNewsArticle,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        updateTeamMember,
        addTeamMember,
        deleteTeamMember,
        updatePartnerImages,
        updateService,
        addService,
        deleteService,
        addProjectSubmission,
        addContactSubmission,
        addBranch,
        updateBranch,
        deleteBranch,
        updateAdminProfile,
        updateWebsiteBackground,
        updateSectionTitles,
        markSubmissionsRead,
        deleteSubmissions,
        resetToDefaults,
        persistStateDirectly,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}
