import React, { useState } from 'react';
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon, ChevronDownIcon } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { ContactForm } from '../components/ContactForm';
import { useCMS } from '../context/CMSContext';

const faqs = [
{
  question: 'How quickly can we start?',
  answer:
  'Most projects kick off within two weeks of an agreed scope. Urgent work can often start sooner.'
},
{
  question: 'Do you work with early-stage teams?',
  answer:
  'Yes. We regularly help founders and small organizations go from concept to a first working product.'
},
{
  question: 'What happens after launch?',
  answer:
  'We offer ongoing support, maintenance, and iteration retainers so your product keeps improving.'
},
{
  question: 'Where is DMD located and can we meet in person?',
  answer:
  'Our headquarters and innovation hub is located in Kicukiro, Kagarama, Kigali, Rwanda. We welcome in-person meetings by appointment as well as global remote collaboration.'
}];


export function Contact() {
  const { cms } = useCMS();
  const hero = cms.pageHeroes.contact;
  const company = cms.company;
  const defaultWorkspaceImages = {
    lab: '/3e957b1a-e5c2-4295-a84f-3a8e4e0af287.jpg',
    studio: '/0ff3ad28-e918-4423-91ef-740844bec2eb.jpg',
    lounge: '/67bedf41-d607-4532-8e95-cdbc38a213b5.jpg',
  };
  const workspaceImages = {
    ...defaultWorkspaceImages,
    ...(cms.workspaceImages || {}),
  };
  const defaultWorkspaceLabels = {
    lab:    { title: 'Systems Lab',    description: 'Hardware & distributed infrastructure', caption: 'Innovation Lab' },
    studio: { title: 'Design Studio',  description: 'Interface design and ergonomics suite', caption: 'Sprint Studio'  },
    lounge: { title: 'Collab Lounge',  description: 'Client sprint rooms and demo staging',  caption: 'Design Lounge'  },
  };
  const workspaceLabels = {
    lab:    { ...defaultWorkspaceLabels.lab,    ...(cms.workspaceLabels?.lab    || {}) },
    studio: { ...defaultWorkspaceLabels.studio, ...(cms.workspaceLabels?.studio || {}) },
    lounge: { ...defaultWorkspaceLabels.lounge, ...(cms.workspaceLabels?.lounge || {}) },
  };
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
      

      <section className="bg-cream px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr,1.15fr]">
          <div className="space-y-4">
            <div className="rounded-3xl bg-forest p-8 md:p-10">
              <h2 className="font-display text-xl font-bold text-white">Contact details</h2>
              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-forest">
                    <MapPinIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-medium text-white">Office</span>
                    <span className="text-cream/65">{company.address}</span>
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-forest">
                    <MailIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-medium text-white">Email</span>
                    <a href={`mailto:${company.email}`} className="text-cream/65 hover:text-lime">
                      {company.email}
                    </a>
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-forest">
                    <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-medium text-white">Phone</span>
                    <a
                      href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}
                      className="text-cream/65 hover:text-lime">
                      
                      {company.phone}
                    </a>
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-forest">
                    <ClockIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-medium text-white">Office hours</span>
                    <span className="text-cream/65">{company.hours}</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-forest/10 bg-white p-8 md:p-10">
              <h2 className="font-display text-xl font-bold text-forest">
                Frequently asked
              </h2>
              <div className="mt-6 divide-y divide-forest/10">
                {faqs.map((faq, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <div key={faq.question} className="py-3.5 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="flex w-full items-center justify-between gap-4 text-left font-display text-sm font-bold text-forest transition-colors hover:text-lime-dark"
                        aria-expanded={isOpen}
                      >
                        <span>{faq.question}</span>
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cream transition-transform duration-300 ${
                            isOpen ? 'rotate-180 bg-lime text-forest' : 'text-forest/60'
                          }`}
                        >
                          <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </button>

                      {isOpen && (
                        <p className="mt-2.5 text-sm leading-relaxed text-forest/65 animate-in fade-in duration-200">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 3 frames of images + 1 empty green container in 2 rows and 2 columns */}
              <div className="mt-8 border-t border-forest/10 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest/70">
                    {cms.sectionTitles?.workspacesTitle || 'Our Kagarama Hub & Workspaces'}
                  </span>
                  <span className="text-[11px] font-semibold text-lime-dark">
                    Kicukiro, Kigali
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Hub image cards — title, description and caption from admin CMS */}
                  {(['lab', 'studio', 'lounge'] as const).map((key) => (
                    <div key={key} className="group relative overflow-hidden rounded-2xl border border-forest/10 bg-forest/5 shadow-sm">
                      <div className="relative h-28 sm:h-32 overflow-hidden">
                        <img
                          key={workspaceImages[key]}
                          src={workspaceImages[key]}
                          alt={workspaceLabels[key].title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { (e.target as HTMLImageElement).src = defaultWorkspaceImages[key]; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-forest/75 via-transparent to-transparent opacity-70" />
                        <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white px-1.5 py-0.5 rounded bg-forest/80 backdrop-blur-sm">
                          {workspaceLabels[key].caption}
                        </span>
                      </div>
                      <div className="px-3 py-2.5 bg-white/80 backdrop-blur-sm">
                        <p className="text-[11px] font-bold text-forest leading-tight">{workspaceLabels[key].title}</p>
                        <p className="text-[10px] text-forest/55 leading-tight mt-0.5">{workspaceLabels[key].description}</p>
                      </div>
                    </div>
                  ))}

                  {/* Row 2, Col 2: Empty Green Container */}
                  <div className="relative h-28 sm:h-32 rounded-2xl bg-lime border border-lime-dark/30 shadow-sm transition-all hover:bg-lime-dark/90 flex items-center justify-center p-4">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-forest/80 text-center">
                      DMD Studio
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>);

}