export type Service = {
  slug: string;
  title: string;
  icon:
  'code' |
  'smartphone' |
  'brain' |
  'palette' |
  'sparkles' |
  'play' |
  'shield';
  summary: string;
  details: string;
  deliverables: string[];
};

export const services: Service[] = [
{
  slug: 'software-development',
  title: 'Software Development',
  icon: 'code',
  summary:
  'Custom platforms, internal tools, and APIs engineered to be reliable and scalable.',
  details:
  'From early architecture to production deployment, we build software that fits the way your organization actually works — and keeps performing as you grow.',
  deliverables: [
  'Custom web platforms',
  'API & systems integration',
  'Cloud architecture',
  'Automated testing & CI/CD']

},
{
  slug: 'web-mobile-apps',
  title: 'Web & Mobile Apps',
  icon: 'smartphone',
  summary:
  'Fast, accessible web experiences and native-feeling mobile applications.',
  details:
  'We design and ship responsive websites, progressive web apps, and cross-platform mobile products with performance and accessibility built in from day one.',
  deliverables: [
  'Marketing & commerce websites',
  'iOS and Android applications',
  'Progressive web apps',
  'Performance optimization']

},
{
  slug: 'artificial-intelligence',
  title: 'Artificial Intelligence',
  icon: 'brain',
  summary:
  'Practical AI features that reduce manual work and unlock new insight.',
  details:
  'We help teams apply machine learning and language models where they create measurable value — automation, search, forecasting, and decision support.',
  deliverables: [
  'AI assistants & chat interfaces',
  'Document & data intelligence',
  'Predictive analytics',
  'Workflow automation']

},
{
  slug: 'ui-ux-design',
  title: 'UI / UX Design',
  icon: 'palette',
  summary:
  'Research-led interface design that makes complex products feel effortless.',
  details:
  'Our designers work from user research and real usage data to build interfaces, design systems, and prototypes that teams can ship confidently.',
  deliverables: [
  'User research & testing',
  'Wireframes & prototypes',
  'Design systems',
  'Accessibility reviews']

},
{
  slug: 'branding',
  title: 'Branding',
  icon: 'sparkles',
  summary:
  'Identity systems that make organizations recognizable and trusted.',
  details:
  'Naming, logo, voice, and visual language delivered as a complete kit your team can apply consistently across every channel.',
  deliverables: [
  'Logo & identity systems',
  'Brand strategy & voice',
  'Guidelines & asset kits',
  'Print and packaging']

},
{
  slug: 'digital-media',
  title: 'Digital Media',
  icon: 'play',
  summary:
  'Content, motion, and campaigns that carry your story to the right audience.',
  details:
  'We produce the media that surrounds a launch — motion graphics, product film, social content, and campaign creative built to perform.',
  deliverables: [
  'Motion graphics & video',
  'Social content systems',
  'Campaign creative',
  'Photography direction']

},
{
  slug: 'it-consulting',
  title: 'IT Consulting',
  icon: 'shield',
  summary:
  'Strategic guidance on technology, security, and digital transformation.',
  details:
  'We audit what you have, plan what you need, and help your team make confident decisions about systems, vendors, and security posture.',
  deliverables: [
  'Technology audits',
  'Digital transformation roadmaps',
  'Security & compliance advisory',
  'Team training & enablement']

}];