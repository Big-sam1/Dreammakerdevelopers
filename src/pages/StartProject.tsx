import React, { useState } from 'react';
import {
  CheckCircle2Icon,
  Loader2Icon,
  SendIcon,
  ShieldCheckIcon,
  ZapIcon,
  UsersIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  GlobeIcon,
  SmartphoneIcon,
  CpuIcon,
  PaletteIcon,
  CloudIcon,
  Code2Icon,
} from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Eyebrow } from '../components/Eyebrow';
import { CTASection } from '../components/CTASection';
import { useCMS } from '../context/CMSContext';

type SolutionType =
  | 'web'
  | 'mobile'
  | 'ai'
  | 'design'
  | 'cloud'
  | 'custom';

type BudgetRange = '< $10,000' | '$10,000 - $25,000' | '$25,000 - $50,000' | '$50,000+';
type TimelineOption = '< 1 Month' | '1 - 3 Months' | '3 - 6 Months' | 'Flexible';

export function StartProject() {
  const { cms, addProjectSubmission } = useCMS();
  const hero = cms.pageHeroes.startProject;
  const company = cms.company;

  const [solutionType, setSolutionType] = useState<SolutionType>('web');
  const [budget, setBudget] = useState<BudgetRange>('$10,000 - $25,000');
  const [timeline, setTimeline] = useState<TimelineOption>('1 - 3 Months');

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    description: '',
    features: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const solutionOptions: { type: SolutionType; label: string; desc: string; icon: React.ElementType }[] = [
    { type: 'web', label: 'Web Platform & SaaS', desc: 'React, Next.js, Cloud APIs', icon: GlobeIcon },
    { type: 'mobile', label: 'Mobile Application', desc: 'iOS, Android, Flutter, React Native', icon: SmartphoneIcon },
    { type: 'ai', label: 'AI & Machine Learning', desc: 'NLP, Computer Vision, Automation', icon: CpuIcon },
    { type: 'design', label: 'UI/UX & Brand System', desc: 'Figma, Design Tokens, Prototypes', icon: PaletteIcon },
    { type: 'cloud', label: 'Cloud Architecture & DevOps', desc: 'AWS, Kubernetes, CI/CD Pipelines', icon: CloudIcon },
    { type: 'custom', label: 'Enterprise Custom Software', desc: 'Bespoke systems, microservices', icon: Code2Icon },
  ];

  const budgetOptions: BudgetRange[] = [
    '< $10,000',
    '$10,000 - $25,000',
    '$25,000 - $50,000',
    '$50,000+',
  ];

  const timelineOptions: TimelineOption[] = [
    '< 1 Month',
    '1 - 3 Months',
    '3 - 6 Months',
    'Flexible',
  ];

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Please provide your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please provide a valid business email address.';
    }
    if (!form.description.trim() || form.description.trim().length < 15) {
      errs.description = 'Please tell us a little about your project (15+ characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    addProjectSubmission({
      solutionType,
      budget,
      timeline,
      name: form.name,
      email: form.email,
      company: form.company,
      phone: form.phone,
      description: form.description,
      features: form.features,
    });
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus('success');
  }

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

      <section className="bg-cream px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Interactive Intake Form */}
            <div className="lg:col-span-8 rounded-3xl border border-forest/10 bg-white p-8 sm:p-12 shadow-sm">
              {status === 'success' ? (
                <div className="text-center py-12">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime text-forest shadow-md">
                    <CheckCircle2Icon className="h-8 w-8" />
                  </span>
                  <h2 className="mt-6 font-display text-3xl font-bold text-forest">
                    Project Request Received!
                  </h2>
                  <p className="mt-3 text-sm text-forest/70 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-semibold text-forest">{form.name}</span>. Our lead architects have received your intake details for{' '}
                    <span className="font-semibold text-forest">
                      {solutionOptions.find((s) => s.type === solutionType)?.label}
                    </span>.
                  </p>
                  <div className="mt-6 rounded-2xl bg-cream p-5 max-w-sm mx-auto text-xs text-forest/65 border border-forest/10">
                    <p className="font-semibold text-forest mb-1">What happens next?</p>
                    <p>We review your technical requirements and reply within 1 business day with estimated sprint milestones and next steps.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle');
                      setForm({ name: '', email: '', company: '', phone: '', description: '', features: '' });
                    }}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3 text-sm font-bold text-lime hover:bg-forest-mid transition-colors"
                  >
                    Submit Another Project
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Step 1: Solution Type */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-lime-dark">
                      Step 01
                    </span>
                    <h2 className="mt-1 font-display text-2xl font-bold text-forest">
                      What are you looking to build?
                    </h2>
                    <p className="mt-1 text-xs text-forest/55">
                      Select the primary service discipline for your project.
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {solutionOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = solutionType === opt.type;
                        return (
                          <button
                            key={opt.type}
                            type="button"
                            onClick={() => setSolutionType(opt.type)}
                            className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                              isSelected
                                ? 'border-forest bg-forest text-white shadow-md'
                                : 'border-forest/10 bg-cream/50 text-forest hover:border-forest/30 hover:bg-white'
                            }`}
                          >
                            <span
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                                isSelected ? 'bg-lime text-forest' : 'bg-forest/10 text-forest'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <div>
                              <span className="block font-display text-sm font-bold">
                                {opt.label}
                              </span>
                              <span
                                className={`text-[11px] ${
                                  isSelected ? 'text-cream/70' : 'text-forest/55'
                                }`}
                              >
                                {opt.desc}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Budget & Timeline */}
                  <div className="mt-10 border-t border-forest/10 pt-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-lime-dark">
                      Step 02
                    </span>
                    <h2 className="mt-1 font-display text-2xl font-bold text-forest">
                      Budget & Target Timeline
                    </h2>

                    <div className="mt-5 grid gap-6 sm:grid-cols-2">
                      {/* Budget */}
                      <div>
                        <label className="block text-xs font-bold text-forest mb-2">
                          Estimated Budget
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {budgetOptions.map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setBudget(b)}
                              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                                budget === b
                                  ? 'border-forest bg-forest text-lime shadow'
                                  : 'border-forest/10 bg-white text-forest/70 hover:border-forest/30'
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <label className="block text-xs font-bold text-forest mb-2">
                          Target Launch Window
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {timelineOptions.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTimeline(t)}
                              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                                timeline === t
                                  ? 'border-forest bg-forest text-lime shadow'
                                  : 'border-forest/10 bg-white text-forest/70 hover:border-forest/30'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Project Vision & Specifications */}
                  <div className="mt-10 border-t border-forest/10 pt-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-lime-dark">
                      Step 03
                    </span>
                    <h2 className="mt-1 font-display text-2xl font-bold text-forest">
                      Tell us about your project
                    </h2>

                    <div className="mt-5 space-y-4">
                      <div>
                        <label htmlFor="description" className="block text-xs font-bold text-forest mb-1.5">
                          Project Overview & Problem Space *
                        </label>
                        <textarea
                          id="description"
                          rows={4}
                          value={form.description}
                          onChange={(e) => {
                            setForm({ ...form, description: e.target.value });
                            setErrors({ ...errors, description: '' });
                          }}
                          placeholder="What problem are you solving? Who is the target user? Mention any key requirements or benchmark references."
                          className="w-full rounded-2xl border border-forest/15 bg-white p-4 text-sm text-forest placeholder:text-forest/35 focus:border-lime-dark focus:ring-2 focus:ring-lime/30 outline-none"
                        />
                        {errors.description && (
                          <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="features" className="block text-xs font-bold text-forest mb-1.5">
                          Core Features or Deliverables <span className="text-forest/40">(Optional)</span>
                        </label>
                        <input
                          id="features"
                          type="text"
                          value={form.features}
                          onChange={(e) => setForm({ ...form, features: e.target.value })}
                          placeholder="e.g. Mobile wallet, Stripe billing, Admin dashboard, Multilingual support"
                          className="w-full rounded-2xl border border-forest/15 bg-white p-3.5 text-sm text-forest placeholder:text-forest/35 focus:border-lime-dark focus:ring-2 focus:ring-lime/30 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Contact Details */}
                  <div className="mt-10 border-t border-forest/10 pt-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-lime-dark">
                      Step 04
                    </span>
                    <h2 className="mt-1 font-display text-2xl font-bold text-forest">
                      Your details
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-xs font-bold text-forest mb-1.5">
                          Full Name *
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={form.name}
                          onChange={(e) => {
                            setForm({ ...form, name: e.target.value });
                            setErrors({ ...errors, name: '' });
                          }}
                          placeholder="Jane Doe"
                          className="w-full rounded-xl border border-forest/15 bg-white p-3 text-sm text-forest placeholder:text-forest/35 focus:border-lime-dark focus:ring-2 focus:ring-lime/30 outline-none"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-xs font-bold text-forest mb-1.5">
                          Business Email *
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => {
                            setForm({ ...form, email: e.target.value });
                            setErrors({ ...errors, email: '' });
                          }}
                          placeholder="jane@company.com"
                          className="w-full rounded-xl border border-forest/15 bg-white p-3 text-sm text-forest placeholder:text-forest/35 focus:border-lime-dark focus:ring-2 focus:ring-lime/30 outline-none"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="company" className="block text-xs font-bold text-forest mb-1.5">
                          Company / Organization
                        </label>
                        <input
                          id="company"
                          type="text"
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          placeholder="Acme Innovations Ltd."
                          className="w-full rounded-xl border border-forest/15 bg-white p-3 text-sm text-forest placeholder:text-forest/35 focus:border-lime-dark focus:ring-2 focus:ring-lime/30 outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-xs font-bold text-forest mb-1.5">
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+250 788 123 456"
                          className="w-full rounded-xl border border-forest/15 bg-white p-3 text-sm text-forest placeholder:text-forest/35 focus:border-lime-dark focus:ring-2 focus:ring-lime/30 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 border-t border-forest/10 pt-6 flex items-center justify-between">
                    <span className="text-xs text-forest/50">
                      🔒 Protected by non-disclosure agreements
                    </span>

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="shake-slow-hover inline-flex items-center gap-2 rounded-full bg-lime px-8 py-3.5 text-sm font-bold text-forest hover:bg-lime-dark disabled:opacity-50 transition-all shadow-md"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                          <span>Preparing estimate…</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Project Request</span>
                          <SendIcon className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column: Why Work With DMD Trust Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl bg-forest p-8 text-white shadow-md">
                <span className="rounded-full bg-lime/20 px-3 py-1 text-xs font-semibold text-lime">
                  The DMD Guarantee
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold">
                  Engineering rigor meets design craft
                </h3>

                <ul className="mt-6 space-y-5 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-lime text-forest shrink-0">
                      <ZapIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <strong className="block text-white font-semibold">2-Week Sprint Kickoff</strong>
                      <span className="text-xs text-cream/70">
                        Agreed scopes begin development within 14 calendar days.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-lime text-forest shrink-0">
                      <ShieldCheckIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <strong className="block text-white font-semibold">100% IP Ownership</strong>
                      <span className="text-xs text-cream/70">
                        You retain full intellectual property of all code, designs, and docs.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-lime text-forest shrink-0">
                      <UsersIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <strong className="block text-white font-semibold">Senior Squad Direct Access</strong>
                      <span className="text-xs text-cream/70">
                        No middle managers. Work directly with principal engineers and designers.
                      </span>
                    </div>
                  </li>
                </ul>

                <div className="mt-8 border-t border-white/10 pt-6 text-xs text-cream/60 space-y-2">
                  <p className="flex items-center gap-2">
                    <MapPinIcon className="h-3.5 w-3.5 text-lime" />
                    <span>HQ in Kicukiro, Kagarama, Kigali, Rwanda</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MailIcon className="h-3.5 w-3.5 text-lime" />
                    <span>{company.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <PhoneIcon className="h-3.5 w-3.5 text-lime" />
                    <span>{company.phone}</span>
                  </p>
                </div>
              </div>

              {/* Direct call box */}
              <div className="rounded-3xl border border-forest/10 bg-white p-7 text-center shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-forest/50">
                  Prefer a Direct Conversation?
                </span>
                <h4 className="mt-2 font-display text-lg font-bold text-forest">
                  Schedule an exploratory call
                </h4>
                <p className="mt-1 text-xs text-forest/65">
                  Discuss architecture, feasibility, or pricing directly with our team.
                </p>
                <a
                  href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-forest/15 px-5 py-2.5 text-xs font-bold text-forest hover:bg-forest hover:text-lime transition-colors"
                >
                  <PhoneIcon className="h-3.5 w-3.5" />
                  <span>Call {company.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page-specific CTA container with custom image for Start a Project page */}
      <CTASection
        title="Ready to transform your vision into reality?"
        description="Partner with Dream Maker Developers to create scalable web, mobile, and AI solutions built to last."
        image="/256842fa-b28b-4563-986d-bcc0bf612542.jpg"
        imageAlt="Dream Maker Developers planning project delivery"
        buttonText="Book a Kickoff Call"
        buttonTo="/contact"
      />
    </>
  );
}
