export interface DemoIdea {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  whyThisFits: string;
  tags: string[];
  /** Slot file under public/images — processed by `pnpm pictures`. */
  image: string;
}

export const DEMO_IDEAS: DemoIdea[] = [
  {
    id: 'lunch',
    title: 'Lunch without the queue',
    subtitle: 'For students near campus',
    duration: '0:58',
    whyThisFits: 'You buy lunch near campus and often wait in line (sample).',
    tags: ['Food', 'Students', 'Nigeria'],
    image: '/images/feed-1.webp',
  },
  {
    id: 'briefs',
    title: 'Clearer briefs for creatives',
    subtitle: 'For designers and small teams',
    duration: '0:47',
    whyThisFits: 'You take design work from clients (sample).',
    tags: ['Design', 'Small business', 'Nigeria'],
    image: '/images/feed-2.webp',
  },
  {
    id: 'study',
    title: 'Study groups that actually meet',
    subtitle: 'For university students',
    duration: '0:52',
    whyThisFits: 'You study in groups before exams (sample).',
    tags: ['Work', 'Students', 'Nigeria'],
    image: '/images/feed-3.webp',
  },
  {
    id: 'farm-fresh',
    title: 'Farm-fresh meals on demand',
    subtitle: 'For urban professionals',
    duration: '0:44',
    whyThisFits: 'You order food delivery often (sample).',
    tags: ['Food', 'Small business', 'Nigeria'],
    image: '/images/feed-1.webp',
  },
  {
    id: 'portfolio',
    title: 'Portfolio reviews that help',
    subtitle: 'For junior designers',
    duration: '0:39',
    whyThisFits: 'You want honest feedback on your design work (sample).',
    tags: ['Design', 'Students', 'Nigeria'],
    image: '/images/feed-2.webp',
  },
  {
    id: 'freelance',
    title: 'Freelance invoicing made simple',
    subtitle: 'For freelancers and contractors',
    duration: '0:51',
    whyThisFits: 'You send invoices to clients regularly (sample).',
    tags: ['Work', 'Small business', 'Nigeria'],
    image: '/images/feed-3.webp',
  },
  {
    id: 'recipe-share',
    title: 'Share recipes with neighbours',
    subtitle: 'For home cooks',
    duration: '0:36',
    whyThisFits: 'You enjoy cooking and sharing meals (sample).',
    tags: ['Food', 'Small business', 'Nigeria'],
    image: '/images/feed-1.webp',
  },
  {
    id: 'brand-kit',
    title: 'Brand kits for small shops',
    subtitle: 'For market traders',
    duration: '0:42',
    whyThisFits: 'You run a small business and need branding (sample).',
    tags: ['Design', 'Small business', 'Nigeria'],
    image: '/images/feed-2.webp',
  },
];

export const SAMPLE_FOUNDER = {
  name: 'Amara Okafor',
  idea: 'A better way to plan campus meals',
  description:
    'Helping students find affordable, healthy meals near campus with real-time options and group orders.',
};

export const FOUNDER_REPORT_STATS = {
  reached: 40,
  fitTarget: 24,
  trialSignups: 8,
};

export const INTERESTS = [
  { id: 'food', label: 'Food', icon: 'UtensilsCrossed' as const },
  { id: 'education', label: 'Education', icon: 'BookOpen' as const },
  { id: 'design', label: 'Design', icon: 'PenTool' as const },
  { id: 'technology', label: 'Technology', icon: 'Laptop' as const },
  { id: 'work', label: 'Work', icon: 'Briefcase' as const },
  { id: 'business', label: 'Small business', icon: 'Store' as const },
] as const;

export const ACTIVITIES = [
  { id: 'feedback', label: 'Share feedback', icon: 'MessageSquare' as const },
  { id: 'try', label: 'Try a product', icon: 'Package' as const },
  { id: 'call', label: 'Talk to a founder', icon: 'Users' as const },
] as const;

export const COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AO', name: 'Angola' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'DR Congo' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'EG', name: 'Egypt' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'KE', name: 'Kenya' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'ML', name: 'Mali' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NE', name: 'Niger' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'ST', name: 'São Tomé and Príncipe' },
  { code: 'SN', name: 'Senegal' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'SD', name: 'Sudan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TG', name: 'Togo' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'UG', name: 'Uganda' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'OTHER', name: 'Other' },
] as const;
