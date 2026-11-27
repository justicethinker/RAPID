/**
 * Pilot copy and option lists.
 *
 * This is the single editable configuration for public copy, form options and
 * record codes. The Apps Script backend mirrors the *codes* in
 * `integrations/google-apps-script/Code.gs`; change both together.
 */

export const SCHEMA_VERSION = '2026-10-20';
export const PRIVACY_VERSION = '2026-11-15';
export const PRIVACY_LAST_UPDATED = '15 November 2026';
export const SUPPORT_EMAIL_FALLBACK = 'hello@rapid.africa';

export const SITE = {
  name: 'RAPID',
  title: 'RAPID | Test your startup idea with real people in Nigeria',
  description:
    'Find out if people will use your idea before you build it. RAPID recruits relevant testers in Nigeria and turns their feedback into clear next steps.',
  requestInvite: 'Request your invite',
  requestTest: 'Request a test',
} as const;

export const HOME = {
  hero: {
    eyebrow: 'Nigeria pilot',
    headline: 'Good ideas need the right people.',
    headlineAccent: 'the right people.',
    lead: 'RAPID connects founders with people who face the problem — and shows what they actually do next.',
    primaryCta: 'Join as a tester',
    secondaryCta: 'Request a test',
    note: 'Adults 18+ · Free to apply · Team-assisted matching',
  },
  proof: {
    eyebrow: 'The honesty rule',
    lead: 'A finding is only useful if you can see the counts behind it, the words that produced it and the limits of the sample.',
    note: 'Illustrative finding · Not live data',
  },
  fork: {
    eyebrow: 'The two sides',
    heading: 'One question. Two people who need it answered.',
    tester: {
      title: 'I want to take part in tests',
      body: 'Use what you already know. Get invited when a test fits your experience, and read the task, time and reward before you accept.',
      cta: 'Join as a tester',
    },
    founder: {
      title: 'I need evidence before I build',
      body: 'Bring the question you cannot answer yet. The team scopes it, recruits matched testers and writes down what actually happened.',
      cta: 'Request a test',
    },
  },
  loop: {
    heading: 'How a question becomes evidence',
    lead: 'A RAPID test is not a survey. It is a scoped question, a short task and a written record of what people did next.',
    steps: [
      {
        title: 'Share the question',
        body: 'Tell us what you need to learn and who should answer it.',
      },
      {
        title: 'Scope the test',
        body: 'We agree the task, audience, terms and reward before anyone is invited.',
      },
      {
        title: 'Testers respond',
        body: 'Matched testers accept, do the task and record what actually happened.',
      },
      {
        title: 'Read the evidence',
        body: 'Findings show the counts, the quotes and the limits before you decide.',
      },
    ],
  },
  value: {
    heading: 'What each side gets',
    tester: {
      title: 'What testers get',
      points: [
        'Invitations matched to your experience, not a public task board.',
        'The task, time and reward are stated before you accept.',
        'Your name and contact details stay private from founders.',
        'Reward status is visible in your account after a test.',
      ],
    },
    founder: {
      title: "What founders get",
      points: [
        'Real counts with the denominators behind them, not vanity metrics.',
        'A written record of what testers did and what got in the way.',
        'Published findings that state their limits as well as their signals.',
        'One place to record a build, iterate or pivot decision.',
      ],
    },
  },
  honesty: {
    heading: 'What this can — and cannot — prove',
    points: [
      'Matching is team-assisted. Applying does not guarantee an invitation.',
      'A test does not guarantee payment, a place in a programme or a successful product.',
      'The first pilot focuses on students, recent graduates and working adults in Nigeria.',
      'No dashboard shows sample records. Empty means empty.',
    ],
  },
  problem: {
    heading: 'The problem',
    body: 'Founders often struggle to reach people who face the problem they want to solve. Your experience can help them ask better questions and test their ideas.',
  },
  how: {
    heading: 'How it works',
    steps: [
      'Apply with a few details.',
      'The team reviews your application.',
      'If accepted, receive suitable test invitations by email.',
      'Read the task terms and choose whether to take part.',
    ],
    note: 'WhatsApp reminders and the general group are optional.',
  },
  founders: {
    heading:
      'Find suitable people to test your idea, without handling all the outreach yourself.',
    body: 'RAPID helps plan the test and shares findings to support your next decision.',
    cta: 'Request a test',
    note: 'The first pilot focuses on students, recent graduates, and working adults.',
  },
  finalCta: {
    heading: 'Your next idea needs the right people.',
    lead: 'Join the tester pool, or bring the question you cannot answer yet.',
    cta: 'Join as a tester',
    note: 'Adults 18+ · Team-assisted matching · Nigeria pilot',
  },
} as const;

/**
 * One labelled example of the loop. Every number and name here is
 * illustrative; the UI repeats that label wherever the sample appears.
 */
export const SAMPLE = {
  label: 'Example',
  brief: {
    kicker: 'Test brief · 04',
    title: 'Checkout drop-off',
    question: 'Why do first-time buyers stop at phone verification?',
    audience: 'Students buying meals near campus',
    task: 'Try the new checkout · 10 min',
    invited: '14',
    accepted: '9',
    completed: '2',
    completion: '22%',
    note: 'Responses reviewed before publishing',
    action: 'Open test',
  },
  invitation: {
    kicker: 'Matched test',
    title: 'Pickup without the queue',
    body: 'For students who buy lunch near campus.',
    tag: 'Example invitation',
    task: 'Try the new checkout',
    taskNote: 'One short task, then tell us what happened.',
    duration: '10 min',
    reward: '₦5,000',
    fit: 'You buy lunch near campus.',
    checklist: [
      'Open the checkout like a first-time buyer.',
      'Try one order and note what blocked you.',
      'Write a short response. No call needed.',
    ],
    productLabel: 'The product',
    product: 'Campus Kitchen',
    productType: 'Food pickup',
    productPlace: 'Lagos',
    afterAccept: 'After you accept, the task opens here. Do it once, in your own time.',
    privacy: 'Your name and contact details stay private.',
    terms: 'Read the terms',
    accept: 'Accept test',
  },
  finding: {
    label: 'Finding · Published',
    statement: '7 of 9 testers stopped at phone verification.',
    link: 'Read the evidence',
    quote:
      'I stopped at the code because I was not sure it would work on my network.',
    quoteBy: 'Tester response · example',
  },
} as const;

export interface FaqItem {
  question: string;
  answer: string;
  privacyLink?: boolean;
}

export const TESTER_FAQ: FaqItem[] = [
  {
    question: 'Is it free to join?',
    answer: 'Yes. Applying to be a tester is free.',
  },
  {
    question: 'Who can join?',
    answer:
      'Anyone aged 18 or over. Our first tests are for students, recent graduates and working adults in Nigeria. Each test also has its own requirements.',
  },
  {
    question: 'Can I be both a founder and a tester?',
    answer:
      'Yes. You can apply as a tester and also request a test for your startup. They are separate paths for now.',
  },
  {
    question: 'What happens after I apply?',
    answer:
      'We aim to review applications within three business days. We’ll email you the outcome, or ask for more details. If you’re approved, invitations appear in your account when a test fits.',
  },
  {
    question: 'Will I get paid?',
    answer:
      'Some tasks offer a reward. The amount, rules and payment timing are shown before you accept. Applying doesn’t guarantee a paid task.',
  },
  {
    question: 'Do I have to join WhatsApp?',
    answer: 'No. Tasks arrive by email. You can choose reminders or join our optional group.',
  },
  {
    question: 'What happens to my details?',
    answer:
      'We use them to review your application, find tests that suit you and contact you about taking part. Founders see anonymised responses, never your name or contact details. Read our Privacy Policy, or contact support to ask for removal.',
    privacyLink: true,
  },
];

export const FOUNDER_FAQ: FaqItem[] = [
  {
    question: 'What counts as a test?',
    answer:
      'A focused question, a defined audience and a short task with a written response. It could be a prototype walkthrough, a conversation or a specific action in your product.',
  },
  {
    question: 'Do I need a finished product?',
    answer:
      'No. A test can use a rough concept, a prototype, a live product or a conversation. We agree what people will see before recruiting starts.',
  },
  {
    question: 'How do you choose testers?',
    answer:
      'Our team picks approved testers whose situation, interests and experience match the people you’re building for.',
  },
  {
    question: 'What do I get at the end?',
    answer:
      'A clear summary of responses, recruitment counts and findings, plus the context behind them, so you know what to do next.',
  },
  {
    question: 'How long does it take?',
    answer:
      'We agree a timeline with you when we scope the test. It depends on your audience and the task.',
  },
  {
    question: 'What does it cost?',
    answer:
      'We talk through your goals first. Then we agree the scope and any cost with you before we recruit anyone.',
  },
  {
    question: 'Will I see who said what?',
    answer:
      'No. You see counts and anonymised quotes, and quotes only where the tester agreed. Names and contact details are never shared.',
  },
];

export const TESTER_PAGE = {
  heading: 'Try early products. Say what actually happens.',
  intro:
    'Join a reviewed pool of people in Nigeria. When a test fits your experience, the invitation states the task, time and reward before you decide.',
  sections: [
    {
      title: 'What you will do',
      body: 'Tasks are short — usually 10 to 30 minutes. You might try a prototype, walk through a real situation or answer a focused set of questions. Then you write a short account of what happened.',
    },
    {
      title: 'What you get',
      body: 'Every invitation states the task, the time and the reward before you accept. There is no charge to join. Applying does not guarantee a paid task.',
    },
    {
      title: 'How selection works',
      body: 'The team reviews applications within three business days. Approved testers are invited when their situation and interests match a founder’s question. It is not first come, first served.',
    },
    {
      title: 'Your privacy',
      body: 'Your name, email and phone number are used to run the pilot. Founders receive counts and anonymised responses. Your account shows the reward status for every completed test.',
    },
  ],
} as const;

export const FOUNDER_PAGE = {
  heading: 'Evidence before you build the wrong thing.',
  intro:
    'Bring a real question. RAPID helps you scope it, reach people who face it and read what they actually did — without handling all the outreach yourself.',
  sections: [
    {
      title: 'What a test is',
      body: 'A test is a scoped question with a defined audience and a short task. It is not a focus group or a generic survey. You get evidence about what people actually did.',
    },
    {
      title: 'The process',
      body: 'You send a request. The team scopes the question, audience, terms and reward with you. Matched testers are invited, responses are reviewed, and findings are published only after that review.',
    },
    {
      title: 'What you receive',
      body: 'Recruitment counts with denominators, outcomes and anonymised quotes where consent was given, published findings, and a place to record your build, iterate or pivot decision.',
    },
    {
      title: 'Timing and cost',
      body: 'Timing depends on who qualifies and is agreed during scoping. There is no pricing or payment step on this site; the team confirms any cost before recruitment.',
    },
  ],
} as const;

export const TESTER_FORM = {
  title: 'Request your invite',
  intro:
    "Apply to join RAPID's tester pool. It takes about three minutes. We aim to review applications within three business days.",
  note: 'Applying doesn’t guarantee a test or payment.',
  sections: {
    about: 'About you',
    situation: 'Your situation',
    interests: 'What interests you',
    contact: 'Contact and consent',
  },
  fields: {
    fullName: 'Full name',
    email: 'Email',
    emailConfirm: 'Confirm email',
    country: 'Country',
    cityState: 'City or state',
    ageRange: 'Age range',
    ageConfirm: 'I confirm that I am 18 or older.',
    mainSituation: 'Main situation',
    otherActivities: 'Other activities',
    otherActivitiesHint:
      'Optional. Select anything else that applies. You can study and work at the same time.',
    school: 'School or university',
    schoolHint: 'Required if your main situation or other activities include undergraduate study or a recent graduate.',
    industry: 'Industry',
    industryHint: 'Required if your main situation or other activities include employed or self-employed.',
    industryOther: 'Your industry',
    interests: 'Interests',
    interestsHint: 'Choose 1–3.',
    interestsOther: 'Your interest',
    frustration: 'Tell us about a recent problem',
    frustrationPrompt: '',
    frustrationHint:
      'Tell us about a recent problem in your daily life, studies or work. What happened, and what did you do? Clear and honest beats polished.',
    whatsapp: 'WhatsApp number',
    whatsappOptional: 'Optional',
    whatsappHint: 'Include your country code, for example +234 801 234 5678.',
    whatsappReminders:
      'You may send me WhatsApp reminders about my application and suitable tests.',
    hearAbout: 'How did you hear about us?',
    privacyAck:
      'I have read the Privacy Policy and understand RAPID will use my details to review my application and email me about suitable tests. I can ask to be removed.',
  },
  submit: 'Apply to be a tester',
  saving: 'Saving your details',
  saveError: 'We could not save your details. Please try again.',
  saveErrorDetail: 'Your answers are still here. Retry when you are ready.',
  retry: 'Try again',
  serverValidation: 'Check the highlighted fields and try again.',
} as const;

export const FOUNDER_FORM = {
  title: 'Request a test',
  intro:
    'Tell us what you need to learn and who you need to reach. We will contact you to see whether the pilot is a fit.',
  note: 'No pricing or payment step. We’ll follow up on WhatsApp.',
  fields: {
    fullName: 'Full name',
    whatsapp: 'WhatsApp number',
    whatsappHint: 'Include your country code, for example +234 801 234 5678.',
    email: 'Email',
    emailOptional: 'Optional',
    testDescription: 'What do you want to test?',
    testDescriptionHint:
      'Describe your idea and what you need to learn before your next step.',
    audience: 'Who is it for?',
    audienceDescription: 'Tell us who',
    audienceDescriptionHint: 'A short description of the people you need to reach.',
    privacyAck:
      'I have read the Privacy Policy and understand RAPID will contact me on WhatsApp about this request.',
  },
  submit: 'Request a call',
  saving: 'Saving your details',
  saveError: 'We could not save your details. Please try again.',
  saveErrorDetail: 'Your answers are still here. Retry when you are ready.',
  retry: 'Try again',
  serverValidation: 'Check the highlighted fields and try again.',
} as const;

export const THANKS = {
  tester: {
    title: 'Thanks, we’ve got your application.',
    body: 'We’ve sent a receipt to the email you used. Our team aims to review applications within three business days.',
    bodyAfter: 'Applying doesn’t guarantee a test or payment.',
    home: 'Return home',
  },
  founder: {
    title: 'Thanks, we’ve got your request.',
    body: 'We aim to message you on WhatsApp within three business days to talk through your question, audience and terms.',
    home: 'Return home',
  },
} as const;

export const NOT_FOUND = {
  title: 'This page doesn’t exist.',
  body: 'The link may be wrong, or the page may have moved. Try one of these:',
  // These mirror the header nav, so a lost visitor is offered the same names
  // they already saw rather than retired campaign wording.
  links: [
    { label: 'Home', to: '/' },
    { label: 'For founders', to: '/founders' },
    { label: 'For testers', to: '/join' },
    { label: 'Privacy Policy', to: '/privacy' },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Stable option codes + readable labels                               */
/* ------------------------------------------------------------------ */

export interface Option {
  code: string;
  label: string;
  hint?: string;
}

export interface Country {
  code: string;
  name: string;
}

export const AGE_RANGES: Option[] = [
  { code: '18_24', label: '18–24' },
  { code: '25_29', label: '25–29' },
  { code: '30_35', label: '30–35' },
  { code: '36_plus', label: '36 or older' },
];

export const SITUATIONS: Option[] = [
  {
    code: 'early_undergraduate',
    label: 'Early undergraduate',
    hint: 'Levels 100–200',
  },
  {
    code: 'late_undergraduate',
    label: 'Late undergraduate',
    hint: 'Level 300 and above',
  },
  { code: 'recent_graduate', label: 'Recent graduate', hint: 'Within the last two years' },
  { code: 'employed', label: 'Employed' },
  { code: 'entrepreneur', label: 'Entrepreneur or self-employed' },
  { code: 'other', label: 'Other' },
];

export const INDUSTRIES: Option[] = [
  { code: 'education', label: 'Education' },
  { code: 'finance', label: 'Finance' },
  { code: 'technology', label: 'Technology' },
  { code: 'retail', label: 'Retail' },
  { code: 'food_hospitality', label: 'Food and hospitality' },
  { code: 'health', label: 'Health' },
  { code: 'transport', label: 'Transport' },
  { code: 'creative_work', label: 'Creative work' },
  { code: 'other', label: 'Other' },
];

export const INTERESTS: Option[] = [
  { code: 'education', label: 'Education' },
  { code: 'money_finance', label: 'Money and finance' },
  { code: 'work_career', label: 'Work and career' },
  { code: 'food', label: 'Food' },
  { code: 'health_fitness', label: 'Health and fitness' },
  { code: 'transport', label: 'Transport' },
  { code: 'housing', label: 'Housing' },
  { code: 'technology', label: 'Technology' },
  { code: 'entertainment', label: 'Entertainment' },
  { code: 'shopping', label: 'Shopping' },
  { code: 'other', label: 'Other' },
];

export const HEARD_ABOUT: Option[] = [
  { code: 'friend', label: 'Friend' },
  { code: 'whatsapp_group', label: 'WhatsApp group' },
  { code: 'x', label: 'X' },
  { code: 'linkedin', label: 'LinkedIn' },
  { code: 'school_or_hub', label: 'School or hub' },
  { code: 'other', label: 'Other' },
];

export const FOUNDER_AUDIENCES: Option[] = [
  { code: 'students', label: 'Students' },
  { code: 'recent_graduates', label: 'Recent graduates' },
  { code: 'working_adults', label: 'Working adults' },
  { code: 'more_than_one', label: 'More than one of these' },
  { code: 'someone_else', label: 'Someone else' },
];

/** Primary segment stored on every tester record. */
export const SEGMENT_LABELS: Record<string, string> = {
  early_undergraduate: 'Student — early undergraduate',
  late_undergraduate: 'Student — late undergraduate',
  recent_graduate: 'Recent graduate',
  employed: 'Working adult',
  entrepreneur: 'Entrepreneur or self-employed',
  other: 'Other',
};

export const COUNTRIES: Country[] = [
  { code: "NG", name: "Nigeria" },
  { code: "AF", name: "Afghanistan" },
  { code: "AX", name: "Åland Islands" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AS", name: "American Samoa" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AI", name: "Anguilla" },
  { code: "AQ", name: "Antarctica" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AW", name: "Aruba" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BM", name: "Bermuda" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia, Plurinational State of" },
  { code: "BQ", name: "Bonaire, Sint Eustatius and Saba" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BV", name: "Bouvet Island" },
  { code: "BR", name: "Brazil" },
  { code: "IO", name: "British Indian Ocean Territory" },
  { code: "BN", name: "Brunei Darussalam" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "KY", name: "Cayman Islands" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CX", name: "Christmas Island" },
  { code: "CC", name: "Cocos (Keeling) Islands" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo, The Democratic Republic of the" },
  { code: "CK", name: "Cook Islands" },
  { code: "CR", name: "Costa Rica" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CW", name: "Curaçao" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FK", name: "Falkland Islands (Malvinas)" },
  { code: "FO", name: "Faroe Islands" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GF", name: "French Guiana" },
  { code: "PF", name: "French Polynesia" },
  { code: "TF", name: "French Southern Territories" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GI", name: "Gibraltar" },
  { code: "GR", name: "Greece" },
  { code: "GL", name: "Greenland" },
  { code: "GD", name: "Grenada" },
  { code: "GP", name: "Guadeloupe" },
  { code: "GU", name: "Guam" },
  { code: "GT", name: "Guatemala" },
  { code: "GG", name: "Guernsey" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HM", name: "Heard Island and McDonald Islands" },
  { code: "VA", name: "Holy See (Vatican City State)" },
  { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran, Islamic Republic of" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IM", name: "Isle of Man" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JE", name: "Jersey" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "Korea, Democratic People's Republic of" },
  { code: "KR", name: "Korea, Republic of" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Lao People's Democratic Republic" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MO", name: "Macao" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MQ", name: "Martinique" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "YT", name: "Mayotte" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia, Federated States of" },
  { code: "MD", name: "Moldova, Republic of" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MS", name: "Montserrat" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NC", name: "New Caledonia" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NU", name: "Niue" },
  { code: "NF", name: "Norfolk Island" },
  { code: "MK", name: "North Macedonia" },
  { code: "MP", name: "Northern Mariana Islands" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestine, State of" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PN", name: "Pitcairn" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "PR", name: "Puerto Rico" },
  { code: "QA", name: "Qatar" },
  { code: "RE", name: "Réunion" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russian Federation" },
  { code: "RW", name: "Rwanda" },
  { code: "BL", name: "Saint Barthélemy" },
  { code: "SH", name: "Saint Helena, Ascension and Tristan da Cunha" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "MF", name: "Saint Martin (French part)" },
  { code: "PM", name: "Saint Pierre and Miquelon" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SX", name: "Sint Maarten (Dutch part)" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "GS", name: "South Georgia and the South Sandwich Islands" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SJ", name: "Svalbard and Jan Mayen" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syrian Arab Republic" },
  { code: "TW", name: "Taiwan, Province of China" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania, United Republic of" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TK", name: "Tokelau" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Türkiye" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TC", name: "Turks and Caicos Islands" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UM", name: "United States Minor Outlying Islands" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela, Bolivarian Republic of" },
  { code: "VN", name: "Viet Nam" },
  { code: "VG", name: "Virgin Islands, British" },
  { code: "VI", name: "Virgin Islands, U.S." },
  { code: "WF", name: "Wallis and Futuna" },
  { code: "EH", name: "Western Sahara" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

export function labelFor(options: Option[], code: string | undefined | null): string {
  if (!code) return '';
  return options.find((option) => option.code === code)?.label ?? '';
}

export function countryName(code: string | undefined | null): string {
  if (!code) return '';
  return COUNTRIES.find((country) => country.code === code)?.name ?? '';
}
