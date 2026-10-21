// All site content lives here so it can be edited without touching layout code.
// Wording is taken from the original www.taxlead.in site.

export const company = {
  name: 'TaxLead',
  legalName: 'Taxlead Business Solutions Private Limited',
  tagline: 'Professional Support that propels your business into greater heights',
  taglineMore:
    'Managed by a team of Experts and Strategic Decision Makers. Your Trusted partner in Labour Law, HR Operations, Corporate Laws and Other relevant statutes.',
  email: 'mail@taxlead.in',
  phone: { label: '+91 484 40 61110', href: 'tel:+914844061110' },
  mobiles: [
    { label: '+91 984 72 60111', href: 'tel:+919847260111' },
    { label: '+91 984 76 20111', href: 'tel:+919847620111' },
  ],
  address: ['XXI/820, East Fort Gate, Tripunithura,', 'Kochi - 682 301 India'],
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=East+Fort+Gate+Tripunithura+Kochi+682301',
  profilePdf: '/Taxlead-Company-Profile.pdf',
  social: [
    { name: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/in/taxlead-business-solutions-private-limited-04b20117b' },
    { name: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/Taxlead-Business-Solutions-290207085153122' },
    { name: 'X / Twitter', icon: 'twitter', href: 'https://twitter.com/Taxlead1' },
  ],
}

export const nav = [
  { id: 'top', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'services', label: 'Services' },
  { id: 'contact', label: 'Contact Us' },
]

// The four timeline cards from the original "What We Do" section, in order.
// `anim` is the original scroll animation: cards slide in from the left or right; Exclusive Services zooms in.
export const serviceGroups = [
  {
    id: 'start',
    title: 'Be in Business',
    icon: 'report',
    anim: 'fade-right',
    items: [
      { title: 'Project Reports', text: 'Know your business before you actually start it' },
      { title: 'Business Incorporation', text: 'Get the best legal form for your business viz. Company, LLP, Partnership, Proprietorship etc.' },
      { title: 'Business Funding Support', text: 'Guidance to find the most suitable funding model.' },
      { title: 'Intellectual Property Protection', text: 'Protect your Trademark, Patent, Copyright etc.' },
      { title: 'Business Licenses & Registrations', text: 'FSSAI, MSME, SEZ, Start Ups, IE Code etc.' },
      { title: 'Digital Signatures' },
    ],
  },
  {
    id: 'manage',
    title: 'Manage',
    icon: 'ledger',
    anim: 'fade-left',
    items: [
      { title: 'Tax Planning', text: 'Strategies to ensure the maximum tax efficiency' },
      {
        title: 'Accounting and Payroll Services',
        text: 'IFRS /Ind AS based Book keeping and Finalization of Accounts. End to end Payroll processing with an option of Employee Self Service Portal.',
      },
      {
        title: 'Statutory Filing and compliances',
        text: 'Ensure the Law compliance under various Acts viz. Income Tax, GST, PF, ESI, Labor Law, Company Law, SEZ Forms etc.',
      },
      {
        title: 'Various Audits',
        text: 'Performance of Internal Audit, Concurrent Audit, Statutory Audit, Tax Audit, Stock Audit, Due diligence etc.',
      },
      { title: 'Insurance', text: 'Business and Personal Insurances' },
    ],
  },
  {
    id: 'insight',
    title: 'Management Services',
    icon: 'chart',
    anim: 'fade-right',
    items: [
      { title: 'MIS Reports' },
      { title: 'Budgeting & Forecasting' },
      { title: 'Business Analytics' },
      { title: 'SWOT Analysis' },
      { title: 'Cost Management' },
    ],
  },
  {
    id: 'exclusive',
    title: 'Exclusive Services',
    icon: 'rocket',
    anim: 'zoom-in',
    items: [
      {
        title: 'eCFO Programme',
        text: 'A Virtual CFO programme designed by Taxlead which takes over the role of the CFO in your organization in a cost effective way.',
      },
      { title: 'Business Process Outsourcing', text: 'Cost effective outsourcing services with supreme quality.' },
      {
        title: 'Tailor-made Profit Maximization Programmes',
        text: 'Our business analytics team develops, implements and monitors a customized programme which ensures the optimum growth of your business.',
      },
    ],
  },
]

export const about =
  "Taxlead Business Solutions Private Limited is one of the leading Business Services and Consulting Companies in Kochi. The company has been providing comprehensive business solutions ranging from Incorporation of business entity to total management of the business including statutory filing and compliances. The company's clientele spreads over India and the Middle East countries."

export const teamIntro =
  'Our team comprises of well experienced professionals including CAs, Lawyers and MBAs who have got expertise in the respective areas. The team works to ensure the complete satisfaction of the client.'

export const team = [
  { name: 'Soyson Joseph Thonakkara', role: 'Director' },
  { name: 'Binrai Raveendran', role: 'Director' },
  { name: 'CA. A K Krishna Warrier FCA', role: 'Independent Director' },
]

export const clientsIntro =
  'Taxlead has got clients from various industries namely Information Technology, ITeS, Business Process Outsourcing, Construction, Retail, Banking, Healthcare, Logistics, Manufacturing, Hospitality etc.'

export const industries = [
  'Information Technology', 'ITeS', 'Business Process Outsourcing', 'Construction', 'Retail',
  'Banking', 'Healthcare', 'Logistics', 'Manufacturing', 'Hospitality',
]

// Shown only in local development (`npm run dev`), where the edge function that injects real clients isn't running.
export const sampleClients = ['Northwind', 'Contoso', 'Fabrikam', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark & Co'].map((name) => ({
  name,
  url: '',
  logo: null,
}))
