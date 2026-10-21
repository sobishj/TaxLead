// All site content lives here so it can be edited without touching layout code.

export const company = {
  name: 'Taxlead Business Solutions',
  legalName: 'Taxlead Business Solutions Private Limited',
  tagline: 'Professional support that propels your business to greater heights.',
  email: 'mail@taxlead.in',
  phone: { label: '+91 484 406 1110', href: 'tel:+914844061110' },
  mobiles: [
    { label: '+91 98472 60111', href: 'tel:+919847260111' },
    { label: '+91 98476 20111', href: 'tel:+919847620111' },
  ],
  address: ['XXI/820, East Fort Gate', 'Tripunithura, Kochi – 682 301', 'Kerala, India'],
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=East+Fort+Gate+Tripunithura+Kochi+682301',
  profilePdf: '/Taxlead-Company-Profile.pdf',
  social: [
    { name: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/in/taxlead-business-solutions-private-limited-04b20117b' },
    { name: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/Taxlead-Business-Solutions-290207085153122' },
    { name: 'X / Twitter', icon: 'twitter', href: 'https://twitter.com/Taxlead1' },
  ],
}

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'exclusive', label: 'Exclusive' },
  { id: 'team', label: 'Team' },
  { id: 'contact', label: 'Contact' },
]

export const highlights = [
  { value: 'End-to-end', label: 'From incorporation to ongoing compliance' },
  { value: 'India + ME', label: 'Clients across India and the Middle East' },
  { value: 'CA · Law · MBA', label: 'Multidisciplinary professional team' },
]

export const serviceGroups = [
  {
    id: 'start',
    title: 'Be in Business',
    blurb: 'Plan, structure and launch your venture on solid legal and financial ground.',
    items: [
      { icon: 'report', title: 'Project Reports', text: 'Detailed project reports that let you plan a business properly before you launch it.' },
      { icon: 'building', title: 'Business Incorporation', text: 'Choose the right structure — private limited company, LLP, partnership or sole proprietorship — and get it registered.' },
      { icon: 'funding', title: 'Business Funding Support', text: 'Identify the funding model that best fits your stage and plans, and prepare to raise it.' },
      { icon: 'shield', title: 'Intellectual Property', text: 'Protect your brand and ideas through trademark, patent and copyright registration.' },
      { icon: 'badge', title: 'Licenses & Registrations', text: 'FSSAI, MSME/Udyam, SEZ, Startup India registration, Import Export Code and more.' },
      { icon: 'signature', title: 'Digital Signatures', text: 'Class-3 digital signature certificates for filings, tenders and e-governance.' },
    ],
  },
  {
    id: 'manage',
    title: 'Manage',
    blurb: 'Keep books, people and filings in order so you can focus on growth.',
    items: [
      { icon: 'percent', title: 'Tax Planning', text: 'Lawful strategies that keep your business and personal tax position efficient.' },
      { icon: 'ledger', title: 'Accounting & Payroll', text: 'Bookkeeping to IFRS / Ind AS, finalisation of accounts and end-to-end payroll with an employee self-service portal.' },
      { icon: 'check', title: 'Statutory Filing & Compliance', text: 'Income Tax, GST, PF, ESI, labour laws, company law and SEZ compliance — filed on time.' },
      { icon: 'search', title: 'Audits', text: 'Internal, concurrent, statutory, tax and stock audits, plus due-diligence reviews.' },
      { icon: 'umbrella', title: 'Insurance', text: 'Business and personal insurance cover matched to your actual risks.' },
    ],
  },
  {
    id: 'insight',
    title: 'Management Services',
    blurb: 'Turn your numbers into decisions with reporting and analysis built for owners.',
    items: [
      { icon: 'chart', title: 'MIS Reports', text: 'Clear, periodic management reports that show how the business is really doing.' },
      { icon: 'target', title: 'Budgeting & Forecasting', text: 'Realistic budgets and rolling forecasts to plan cash, hiring and investment.' },
      { icon: 'pulse', title: 'Business Analytics', text: 'Data-driven insight into sales, margins, costs and customer behaviour.' },
      { icon: 'grid', title: 'SWOT Analysis', text: 'A structured look at strengths, weaknesses, opportunities and threats.' },
      { icon: 'scissors', title: 'Cost Management', text: 'Find and remove cost leakages without hurting quality or growth.' },
    ],
  },
]

export const exclusive = [
  {
    icon: 'cfo',
    title: 'eCFO Programme',
    text: 'A virtual Chief Financial Officer for your business — strategic finance leadership at a fraction of the cost of a full-time hire.',
  },
  {
    icon: 'layers',
    title: 'Business Process Outsourcing',
    text: 'Hand over finance, HR and compliance processes to a team that puts quality first, so your people can focus on the core business.',
  },
  {
    icon: 'rocket',
    title: 'Profit Maximisation Programmes',
    text: 'Tailor-made growth plans built and monitored by our analytics team to lift revenue and protect margins.',
  },
]

export const industries = [
  'Information Technology', 'ITeS', 'BPO', 'Construction', 'Retail',
  'Banking', 'Healthcare', 'Logistics', 'Manufacturing', 'Hospitality',
]

export const team = [
  { name: 'Soyson Joseph Thonakkara', role: 'Director' },
  { name: 'Binrai Raveendran', role: 'Director' },
  { name: 'CA. A K Krishna Warrier FCA', role: 'Independent Director' },
]

export const stats = [
  { value: '3', label: 'Service pillars — start, manage and grow' },
  { value: String(serviceGroups.reduce((n, g) => n + g.items.length, 0) + exclusive.length), label: 'Services under one roof' },
  { value: String(industries.length), label: 'Industries served' },
  { value: '2', label: 'Regions — India and the Middle East' },
]

export const process = [
  { title: 'Understand', text: 'We start with a conversation about your business, your stage and what is slowing you down.' },
  { title: 'Plan', text: 'You get a clear scope, timeline and fee — with the right structure, filings and reports mapped out.' },
  { title: 'Run', text: 'Our team handles the work and the deadlines, and keeps you posted with simple, regular reporting.' },
]

// Shown only in local development (`npm run dev`), where the edge function that injects real clients isn't running.
export const sampleClients = ['Northwind', 'Contoso', 'Fabrikam', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark & Co'].map((name) => ({
  name,
  url: '',
  logo: null,
}))
