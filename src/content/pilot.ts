/**
 * Pilot copy and option lists.
 *
 * This is the single editable configuration for public copy, form options and
 * record codes. The Apps Script backend mirrors the *codes* in
 * `integrations/google-apps-script/Code.gs`; change both together.
 */

export const SCHEMA_VERSION = '2026-10-20';
export const PRIVACY_VERSION = '2026-10-20';
export const PRIVACY_LAST_UPDATED = '20 October 2026';
export const SUPPORT_EMAIL_FALLBACK = 'hello@rapid.africa';

export const SITE = {
  name: 'RAPID',
  title: 'RAPID | Help decide what gets built next',
  description:
    'Share your experience in short research tasks and help founders test products for people like you.',
  requestInvite: 'Request your invite',
  requestTest: 'Request a test',
} as const;

export const HOME = {
  hero: {
    headline: 'Help decide what gets built next.',
    lead: 'Share your experience in short research tasks and help founders test products for people like you.',
    cta: 'Request your invite',
    note: 'For adults aged 18 and above. Invitations depend on the needs of each test.',
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
    heading: 'Your experience can help decide what gets built next.',
    lead: 'Share what you know in short research tasks.',
    cta: 'Request your invite',
    note: 'For adults aged 18 and above.',
  },
} as const;

export interface FaqItem {
  question: string;
  answer: string;
  privacyLink?: boolean;
}

export const FAQ: FaqItem[] = [
  {
    question: 'Is joining free?',
    answer: 'Yes. Applying to be a tester is free.',
  },
  {
    question: 'Who can join?',
    answer:
      'Adults aged 18 or above. Our first tests focus on students, recent graduates, and working adults. Each test has its own requirements.',
  },
  {
    question: 'What happens after I apply?',
    answer:
      'We aim to review applications within three business days. We will email you with the outcome or ask for more details.',
  },
  {
    question: 'Will I be paid?',
    answer:
      'Some tasks may offer a reward. The amount, rules, and payment timing will be shared before you choose to take part. Applying does not guarantee a paid task.',
  },
  {
    question: 'Must I join WhatsApp?',
    answer: 'No. Tasks arrive by email. You can choose reminders or join our optional group.',
  },
  {
    question: 'How are my details used?',
    answer:
      'To review your application, find suitable tests, and contact you about participation. Read our Privacy Policy or contact support to ask for removal.',
    privacyLink: true,
  },
];

export const TESTER_FORM = {
  title: 'Request your invite',
  intro:
    "Apply to join RAPID's tester pool. It takes about three minutes. We aim to review applications within three business days.",
  note: 'Applying does not guarantee a test or payment.',
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
    frustrationPrompt:
      'Tell us about a recent problem in your daily life, studies, or work. What happened, and what did you do?',
    frustrationHint: 'A clear answer matters more than fancy writing.',
    whatsapp: 'WhatsApp number',
    whatsappOptional: 'Optional',
    whatsappHint: 'Include your country code, for example +234 801 234 5678.',
    whatsappReminders:
      'You may send me WhatsApp reminders about my application and suitable tests.',
    hearAbout: 'How did you hear about us?',
    privacyAck:
      'I have read the Privacy Policy and understand RAPID will use my details to review my application and email me about suitable tests. I can ask to be removed.',
  },
  submit: 'Request your invite',
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
  note: 'No pricing or payment step. We will follow up on WhatsApp.',
  fields: {
    fullName: 'Full name',
    whatsapp: 'WhatsApp number',
    whatsappHint: 'Include your country code, for example +234 801 234 5678.',
    email: 'Email',
    emailOptional: 'Optional',
    testDescription: 'What do you want to test?',
    testDescriptionHint: 'What is your idea, and what do you need to learn before your next step?',
    audience: 'Who is it for?',
    audienceDescription: 'Tell us who',
    audienceDescriptionHint: 'A short description of the people you need to reach.',
    privacyAck:
      'I have read the Privacy Policy and understand RAPID will contact me on WhatsApp about this request.',
  },
  submit: 'Send my request',
  saving: 'Saving your details',
  saveError: 'We could not save your details. Please try again.',
  saveErrorDetail: 'Your answers are still here. Retry when you are ready.',
  retry: 'Try again',
  serverValidation: 'Check the highlighted fields and try again.',
} as const;

export const THANKS = {
  tester: {
    title: 'Thanks for applying to RAPID.',
    body: 'We aim to review your application within three business days and email you with the outcome or a request for more details. Check your spam folder. If you have not heard from us after that, contact',
    bodyAfter: 'Applying does not guarantee a test or payment.',
    home: 'Return home',
  },
  founder: {
    title: 'Thanks. We have received your request.',
    body: 'We aim to contact you on WhatsApp within three business days to discuss whether the pilot is a fit.',
    home: 'Return home',
  },
} as const;

export const NOT_FOUND = {
  title: "We couldn't find that page.",
  body: 'The page may have moved, or the link may be wrong. These pages may help:',
  links: [
    { label: 'Home', to: '/' },
    { label: 'Request your invite', to: '/join' },
    { label: 'Request a test', to: '/founders' },
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
