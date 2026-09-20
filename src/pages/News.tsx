import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
  XIcon,
  ExternalLinkIcon,
  Share2Icon,
  BookmarkIcon,
  SparklesIcon,
} from 'lucide-react';
import { CTASection } from '../components/CTASection';
import { useCMS } from '../context/CMSContext';

type Article = {
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

// Comprehensive editorial articles dataset with author photos and full content
const editorialArticles: Article[] = [
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
    image: '/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg',
  },
  {
    id: 'decided-to-move-out',
    title: 'Migrating legacy monoliths to event-driven microservices in Kigali',
    category: 'CLOUD & DEVOPS',
    date: 'January 6, 2026',
    readTime: '6 min read',
    author: 'Patrick Nshimiyimana',
    authorRole: 'DevOps & Cloud Lead, DMD',
    authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    excerpt: 'Step-by-step breakdown of how we dismantled a 7-year-old banking monolith without a single minute of downtime.',
    content: [
      'Dismantling legacy core applications is comparable to replacing jet engines mid-flight. Using the Strangler Fig pattern, our engineering teams created parallel event streams using Apache Kafka, incrementally routing transactions from legacy subroutines to modern containerized microservices.',
      'The result: zero customer downtime, 65% faster transaction turnaround times, and a modular architecture ready for the next decade of digital growth.',
    ],
    image: '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
  },
  {
    id: 'latest-1-unwrapped',
    title: 'Our 2025 engineering milestones and lessons learned',
    category: 'LATEST',
    date: 'January 5, 2026',
    readTime: '4 min read',
    author: 'Jean-Luc Mugisha',
    authorRole: 'Managing Director, DMD',
    authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    excerpt: 'Reflecting on shipping 120+ digital products and doubling our team in Kicukiro, Kagarama.',
    content: [
      'In 2025, DMD delivered 120+ digital products across 9 countries. Our growth is testament to our core principle: engineering quality is never compromised for speed. By investing in our apprenticeship program and fostering Rwandan engineering talent, we built solutions recognized globally.',
    ],
    image: '/256842fa-b28b-4563-986d-bcc0bf612542.jpg',
  },
  {
    id: 'latest-2-wedding',
    title: 'Why design tokens are the secret to rapid mobile scaling',
    category: 'UI/UX DESIGN',
    date: 'January 4, 2026',
    readTime: '3 min read',
    author: 'Amina Uwase',
    authorRole: 'Principal UX Designer, DMD',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    excerpt: 'Unifying design systems across web, iOS, and Android seamlessly.',
    content: [
      'Maintaining visual consistency across React Web, Flutter, and native iOS requires an automated single source of truth. Design tokens allow our product designers to update color palettes, typography scales, and component paddings directly in code repositories.',
    ],
    image: '/67bedf41-d607-4532-8e95-cdbc38a213b5.jpg',
  },
  {
    id: 'latest-3-tell-truth',
    title: 'Zero-trust security checklists for modern web applications',
    category: 'SECURITY',
    date: 'January 3, 2026',
    readTime: '5 min read',
    author: 'Patrick Nshimiyimana',
    authorRole: 'DevOps & Cloud Lead, DMD',
    authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    excerpt: 'Practical implementation patterns for mTLS and automated key rotation.',
    content: [
      'Perimeter-based network security is dead. In modern distributed cloud infrastructures, every request must be authenticated, authorized, and encrypted. Here is how DMD incorporates mutual TLS and ephemeral token rotation from day one.',
    ],
    image: '/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg',
  },
  {
    id: 'latest-4-example',
    title: 'Evaluating LLM inference latency on localized African servers',
    category: 'AI & ML',
    date: 'January 2, 2026',
    readTime: '6 min read',
    author: 'Sarah Gakire',
    authorRole: 'Head of AI & Machine Learning, DMD',
    authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    excerpt: 'Benchmarking on-premise open weights vs international cloud provider endpoints.',
    content: [
      'Latency is the enemy of user engagement. When querying API endpoints hosted overseas, regional round-trip delays often exceed 400ms. By deploying quantized open-weights models in local data centers, we reduced time-to-first-token to under 45ms.',
    ],
    image: '/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg',
  },
  {
    id: 'latest-5-finest-theme',
    title: 'Offline-first database syncing in low connectivity regions',
    category: 'MOBILE',
    date: 'December 28, 2025',
    readTime: '4 min read',
    author: 'Eric Manzi',
    authorRole: 'Lead Mobile Developer, DMD',
    authorImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    excerpt: 'Ensuring seamless local SQLite replication with cloud masters.',
    content: [
      'Field agents in rural cooperatives need applications that function without an active cellular data signal. We share our conflict-free replicated data types (CRDT) architecture that ensures data integrity when phones reconnect.',
    ],
    image: '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
  },
  {
    id: 'grid-1-grad',
    title: 'Mentoring the next generation of software craftsmen in Rwanda',
    category: 'BUSINESS',
    date: 'December 24, 2025',
    readTime: '4 min read',
    author: 'Jean-Luc Mugisha',
    authorRole: 'Managing Director, DMD',
    authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    excerpt: 'Inside the DMD apprenticeship curriculum taking novices to production-ready engineers in 12 months.',
    content: [
      'Talent is universal, but opportunity is not. At our Kagarama hub, we provide high-intensity immersion into version control, code review etiquette, automated testing, and client management to prepare developers for international careers.',
    ],
    image: '/256842fa-b28b-4563-986d-bcc0bf612542.jpg',
  },
  {
    id: 'grid-2-entrance',
    title: 'How we build high-converting fintech interfaces from scratch',
    category: 'BUSINESS',
    date: 'December 20, 2025',
    readTime: '5 min read',
    author: 'Amina Uwase',
    authorRole: 'Principal UX Designer, DMD',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    excerpt: 'Balancing strict regulatory KYC friction with delightful, intuitive onboarding flows.',
    content: [
      'Every unnecessary step in a banking onboarding funnel reduces completion rates by up to 18%. We break down our micro-interaction patterns that verify identity seamlessly without overwhelming new users.',
    ],
    image: '/67bedf41-d607-4532-8e95-cdbc38a213b5.jpg',
  },
  {
    id: 'grid-3-rhoda',
    title: 'Micro-frontends in enterprise web portals: A pragmatic guide',
    category: 'BUSINESS',
    date: 'December 18, 2025',
    readTime: '6 min read',
    author: 'Cedric Habimana',
    authorRole: 'Senior Frontend Engineer, DMD',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    excerpt: 'When to adopt independent module federation and when to stick with a clean modular monolith.',
    content: [
      'Micro-frontends introduce operational complexity that only makes sense at scale. We review real case studies comparing bundle size trade-offs and deployment team velocity.',
    ],
    image: '/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg',
  },
  {
    id: 'grid-4-tonight',
    title: 'Optimizing database queries for 10M+ daily financial records',
    category: 'BUSINESS',
    date: 'December 14, 2025',
    readTime: '7 min read',
    author: 'David Kwizera',
    authorRole: 'Lead Software Architect, DMD',
    authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    excerpt: 'Deep dive into partitioned indexes, materialized query rollups, and cache eviction strategies.',
    content: [
      'When transaction ledgers reach hundreds of gigabytes, unindexed joins can freeze production instances. Learn how composite partitioning and automated rollup tables maintain sub-50ms query response times.',
    ],
    image: '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
  },
];

const subnavCategories = [
  'All',
  'Engineering',
  'AI & ML',
  'Business',
  'UI/UX Design',
  'Mobile',
  'Cloud & DevOps',
];

export function News() {
  const { cms } = useCMS();
  
  const allArticles = useMemo(() => {
    if (cms.newsArticles && cms.newsArticles.length > 0) {
      return cms.newsArticles;
    }
    return editorialArticles;
  }, [cms.newsArticles]);

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'All') return allArticles;
    const target = activeCategory.trim().toLowerCase();
    return allArticles.filter((a) => {
      const cat = (a.category || '').trim().toLowerCase();
      if (cat === target) return true;
      if (target === 'ai & ml' && (cat.includes('ai') || cat.includes('ml') || cat === 'ai & ml')) return true;
      if (target === 'ui/ux design' && (cat.includes('ui') || cat.includes('ux') || cat.includes('design'))) return true;
      if (target === 'cloud & devops' && (cat.includes('cloud') || cat.includes('devops') || cat.includes('infra'))) return true;
      if (target === 'mobile' && (cat.includes('mobile') || cat.includes('flutter') || cat.includes('ios') || cat.includes('android'))) return true;
      if (target === 'engineering' && (cat.includes('engineer') || cat.includes('arch') || cat.includes('tech') || cat.includes('opinion'))) return true;
      if (target === 'business' && (cat.includes('business') || cat.includes('milestone') || cat.includes('latest') || cat.includes('growth'))) return true;
      return cat === target || cat.includes(target);
    });
  }, [allArticles, activeCategory]);

  const displayList = filteredArticles.length > 0 ? filteredArticles : allArticles;

  const [selectedArticleState, setSelectedArticleState] = useState<Article | null>(null);
  const [isFullArticleOpen, setIsFullArticleOpen] = useState(false);

  useEffect(() => {
    if (displayList.length > 0 && (!selectedArticleState || !displayList.some((a) => a.id === selectedArticleState.id))) {
      setSelectedArticleState(displayList[0]);
    }
  }, [displayList, selectedArticleState]);

  const selectedArticle = selectedArticleState || displayList[0] || editorialArticles[0];

  const leftStack = [displayList[1] || displayList[0], displayList[2] || displayList[0]].filter(Boolean);
  const latestSidebar = displayList.slice(3, 8).length > 0 ? displayList.slice(3, 8) : allArticles.slice(1, 6);
  const businessRow = displayList.slice(8, 12).length > 0 ? displayList.slice(8, 12) : allArticles.slice(2, 6);

  const handleSelectArticle = (article: Article) => {
    setSelectedArticleState(article);
    const centerEl = document.getElementById('center-opinion-lead');
    if (centerEl) {
      centerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="bg-white min-h-screen text-forest">
      {/* 1. Masthead Header matching editorial newspaper style */}
      <header className="border-b border-forest/15 pt-8 pb-4">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-lime-dark">
              The Official Journal of Dream Maker Developers
            </span>
            <h1 className="mt-2 font-display text-4xl sm:text-6xl font-extrabold tracking-tight uppercase text-forest">
              DMD NEW-TIMES
            </h1>
            <p className="mt-1 text-xs text-forest/50">
              Technology • Artificial Intelligence • Product Craft • Kigali, Rwanda
            </p>
          </div>

          {/* Horizontal category subnav */}
          <nav className="mt-8 flex items-center justify-center gap-1 sm:gap-6 overflow-x-auto border-t border-forest/10 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-forest/70">
            {subnavCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 whitespace-nowrap transition-colors border-b-2 ${
                  activeCategory === cat
                    ? 'border-forest text-forest font-bold'
                    : 'border-transparent hover:text-forest'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* 2. Top Editorial Section: 3-Column Layout */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column (2 Stacked Stories) — Click to select */}
          <div className="lg:col-span-3 space-y-8 divide-y divide-forest/10 lg:divide-y-0">
            {leftStack.map((item) => (
              <article
                key={item.id}
                onClick={() => handleSelectArticle(item)}
                className="group cursor-pointer pt-6 lg:pt-0 first:pt-0 transition-opacity hover:opacity-90"
              >
                <div className="relative h-44 w-full overflow-hidden rounded-xl bg-forest/5 shadow-sm">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute top-2.5 left-2.5 rounded bg-forest/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime">
                    {item.category}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold leading-snug text-forest group-hover:text-lime-dark transition-colors">
                  {item.title}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={item.authorImage}
                    alt={item.author}
                    className="h-5 w-5 rounded-full object-cover border border-forest/20"
                  />
                  <p className="text-xs text-forest/50">
                    {item.author} • {item.date}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Center Column: DYNAMIC SELECTED LEAD STORY */}
          <div
            id="center-opinion-lead"
            className="lg:col-span-6 border-y lg:border-y-0 lg:border-x border-forest/10 py-8 lg:py-0 lg:px-8"
          >
            <article className="group">
              {/* Selected Image at Center */}
              <div
                onClick={() => setIsFullArticleOpen(true)}
                className="relative h-80 sm:h-[400px] w-full overflow-hidden rounded-2xl bg-forest/5 shadow-md cursor-pointer"
              >
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 rounded-md bg-forest px-3 py-1 text-xs font-bold uppercase tracking-widest text-lime shadow">
                  {selectedArticle.category}
                </span>
                <span className="absolute bottom-3 right-3 rounded-full bg-forest/90 px-3 py-1 text-[11px] font-semibold text-lime backdrop-blur border border-lime/30 flex items-center gap-1.5 shadow">
                  <SparklesIcon className="h-3 w-3" /> Click to read full news
                </span>
              </div>

              {/* Details below image with writer photo & name */}
              <div className="mt-6 text-center sm:text-left">
                {/* Big news caption / headline — Click opens full news covering the whole page */}
                <h2
                  onClick={() => setIsFullArticleOpen(true)}
                  className="font-display text-2xl sm:text-3xl font-extrabold leading-tight text-forest cursor-pointer transition-colors hover:text-lime-dark hover:underline"
                  title="Click to read entire story"
                >
                  {selectedArticle.title}
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-forest/75 font-normal">
                  {selectedArticle.excerpt}
                </p>

                {/* Writer Info: Writer Image + Writer Name & Credentials */}
                <div className="mt-5 border-t border-forest/10 pt-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedArticle.authorImage}
                      alt={selectedArticle.author}
                      className="h-11 w-11 rounded-full object-cover border-2 border-lime shadow-sm"
                    />
                    <div className="text-left">
                      <span className="block font-display text-sm font-bold text-forest">
                        {selectedArticle.author}
                      </span>
                      <span className="block text-xs text-forest/60">
                        {selectedArticle.authorRole}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-xs text-forest/50">
                    <span className="block font-medium">{selectedArticle.date}</span>
                    <span>{selectedArticle.readTime}</span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Right Column ("LATEST" Sidebar List) — Click to select */}
          <div className="lg:col-span-3">
            <div className="border-b-2 border-forest pb-2 flex items-center justify-between">
              <h3 className="font-display text-xs font-bold uppercase tracking-widest text-forest">
                LATEST
              </h3>
              <span className="text-[10px] text-forest/50">Click to view</span>
            </div>

            <div className="mt-4 divide-y divide-forest/10">
              {latestSidebar.map((item) => (
                <article
                  key={item.id}
                  onClick={() => handleSelectArticle(item)}
                  className={`group flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0 cursor-pointer transition-colors ${
                    selectedArticle.id === item.id ? 'bg-lime/15 rounded-lg px-2' : 'hover:bg-cream/60'
                  }`}
                >
                  <div className="flex-1">
                    <h4 className="font-display text-xs font-bold leading-snug text-forest group-hover:text-lime-dark transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-forest/50">
                      <span>{item.author}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-14 w-14 rounded-lg object-cover shrink-0 border border-forest/10"
                    loading="lazy"
                  />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mid-Section: Business & Engineering Grid — Click to select */}
      <section className="bg-cream/50 border-t border-forest/10 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between border-b border-forest/15 pb-3">
            <h2 className="font-display text-sm font-extrabold uppercase tracking-widest text-forest">
              BUSINESS & ENGINEERING INSIGHTS
            </h2>
            <span className="text-xs font-bold text-lime-dark">Click any story to view</span>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {businessRow.map((item) => (
              <article
                key={item.id}
                onClick={() => handleSelectArticle(item)}
                className={`group cursor-pointer rounded-2xl p-2 transition-all ${
                  selectedArticle.id === item.id
                    ? 'bg-lime/20 ring-2 ring-forest'
                    : 'hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="relative h-44 w-full overflow-hidden rounded-xl bg-forest/10 shadow-sm">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 rounded bg-forest/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime">
                    {item.category}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-sm font-bold text-forest group-hover:text-lime-dark transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-forest/50">
                  <img
                    src={item.authorImage}
                    alt={item.author}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                  <span>{item.author}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-forest/65 line-clamp-2">
                  {item.excerpt}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FULL-SCREEN / FULL-PAGE MODAL READER (Covers whole page with close icon) */}
      {isFullArticleOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-forest-deep/95 backdrop-blur-md p-4 sm:p-6 lg:p-12 animate-in fade-in duration-300">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white text-forest shadow-2xl overflow-hidden border border-forest/15">
            {/* Modal Header Bar */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-forest/10 bg-white/95 px-6 py-4 backdrop-blur">
              <span className="rounded-full bg-forest px-3 py-1 text-xs font-bold uppercase tracking-widest text-lime">
                {selectedArticle.category} • Full Story
              </span>

              {/* Close Icon for going back */}
              <button
                type="button"
                onClick={() => setIsFullArticleOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-cream text-forest hover:bg-forest hover:text-lime transition-all"
                aria-label="Close article"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-10 lg:p-12">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-forest">
                {selectedArticle.title}
              </h1>

              {/* Writer Header in Modal */}
              <div className="mt-6 flex items-center justify-between flex-wrap gap-4 border-y border-forest/10 py-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedArticle.authorImage}
                    alt={selectedArticle.author}
                    className="h-14 w-14 rounded-full object-cover border-2 border-lime shadow-md"
                  />
                  <div>
                    <span className="block font-display text-base font-bold text-forest">
                      {selectedArticle.author}
                    </span>
                    <span className="text-xs text-forest/60">
                      {selectedArticle.authorRole}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-forest/60">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 text-lime-dark" />
                    {selectedArticle.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4 text-lime-dark" />
                    {selectedArticle.readTime}
                  </span>
                </div>
              </div>

              {/* Big Featured Image */}
              <div className="mt-8 relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Article Multi-paragraph text */}
              <div className="mt-8 space-y-5 text-base sm:text-lg leading-relaxed text-forest/85">
                <p className="font-semibold text-forest text-lg sm:text-xl leading-relaxed">
                  {selectedArticle.excerpt}
                </p>

                {selectedArticle.content.map((p, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {/* Promotion / External Notice as requested: For more news visit DMD Official Newspaper website */}
              <div className="mt-12 rounded-2xl bg-forest p-8 text-center text-white shadow-xl">
                <span className="rounded-full bg-lime/20 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-lime border border-lime/30">
                  DMD Press Network
                </span>
                <h3 className="mt-3 font-display text-xl sm:text-2xl font-bold">
                  For more news visit DMD Official Newspaper website
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-cream/70 max-w-md mx-auto">
                  Access live investigative dispatches, technical whitepapers, and international software journalism.
                </p>
                <div className="mt-6 flex justify-center">
                  <a
                    href="https://dreammakerdev.com/news"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-xs sm:text-sm font-bold text-forest hover:bg-lime-dark transition-colors shadow-md"
                  >
                    <span>Visit DMD Official Newspaper</span>
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsFullArticleOpen(false)}
                  className="rounded-full border border-forest/20 px-8 py-3 text-xs font-bold text-forest hover:bg-cream transition-colors"
                >
                  Close Article & Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Page-specific CTA container with custom image for News page */}
      <CTASection {...cms.ctaSections.news} />
    </div>
  );
}
