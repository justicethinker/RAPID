export const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Explore ideas', href: '#explore-ideas' },
  { label: 'For founders', href: '#roles' },
  { label: 'For testers', href: '#roles' },
] as const;

export const HERO = {
  pill: 'Nigeria pilot',
  headline1: 'Good ideas need',
  headline2: 'the right people.',
  lead: 'Test your ideas with people who could use it or help shape products that solve problems you care about.',
  description: 'RAPID connects founders with real people who can try their ideas and show what they would actually do.',
  primaryCta: 'Join the waitlist',
  secondaryCta: 'Walk through the demo',
  finePrint: 'Free to join. Joining does not guarantee a place.',
} as const;

export const STEPS = [
  {
    title: 'Share a pitch',
    description: "Tell us what you're building in a few minutes.",
  },
  {
    title: 'Meet relevant people',
    description: 'Reach people who experience the problem.',
  },
  {
    title: 'Track actions',
    description: 'See signups, calls, feedback and more.',
  },
  {
    title: 'Choose your next step',
    description: 'Iterate, find co-founders or move forward.',
  },
] as const;

export const PROBLEM_SOLUTION = {
  eyebrow: 'WHY RAPID',
  headline1: 'A good response is not',
  headline2: 'always a real',
  headlineGradient: 'next step.',
  problemTitle: 'The problem',
  problemText: 'Finding the right people takes time. Friendly feedback can hide weak demand. Likes alone do not tell you who will try it.',
  solutionTitle: 'A clearer way to test',
  solutionText: 'RAPID helps you reach people who know the problem and see what they choose to do.',
  closingLine1: 'Useful feedback matters.',
  closingLine2: 'So does what happens after it.',
  actionsHeader: 'Recent actions',
  actionsLabel: 'EXAMPLE ACTIONS',
  actions: [
    { title: 'Asked to try it', sub: 'Showed interest and requested access' },
    { title: 'Requested a conversation', sub: 'Booked a call to learn more' },
    { title: 'Shared a useful concern', sub: 'Provided a specific insight' },
  ],
} as const;

export const CREATE_PITCH = {
  eyebrow: '01',
  eyebrowLabel: 'SHARE YOUR IDEA',
  headline1: 'One short pitch.',
  headline2: 'The details that matter.',
  lead: 'Add a pitch video and a few clear notes so people can understand your idea quickly.',
  tip: 'Explain the idea without sharing private technical details.',
  formTitle: 'Create your pitch',
  formSub: 'Add a short video and key details about your idea.',
  videoLabel: 'Pitch video · Up to 60 seconds',
  fields: [
    { label: 'Problem', value: 'Students spend too long waiting for lunch.' },
    { label: 'Target audience', value: 'Students who buy meals near campus.' },
    { label: 'Solution', value: 'Pre-order a meal and choose a pickup time.' },
    { label: 'Pitch summary', value: 'Less time in line. More control over lunch.' },
  ],
  previewCta: 'Preview pitch',
  saveCta: 'Save draft',
} as const;

export const FIND_PEOPLE = {
  eyebrow: '02',
  eyebrowLabel: 'FIND RELEVANT PEOPLE',
  headline1: 'Reach people who know the',
  headline2: 'problem.',
  lead: 'We use your target audience and what people tell us about their needs to help find a relevant group.',
  pilotNote: 'The pilot starts with team-assisted matching.',
  interestsNote: '**Interests** help us discover a fit. **Screening** checks whether the problem applies.',
  profilesLabel: 'Example profiles',
  audienceLabel: 'Your audience:',
  audienceValue: 'students near campus',
} as const;

export const EXPLORE_IDEAS = {
  eyebrow: '03 / EXPLORE MATCHED IDEAS',
  headline1: 'Scroll into an idea',
  headline2: 'that fits your life.',
  lead: 'Watch a short pitch. See who it is for. Choose whether to try it, talk to the founder or share feedback.',
  demoCta: 'Walk through the demo',
  demoNote: 'Demo only · Sample ideas',
} as const;

export const ROLE_DEMO = {
  demoLabel: 'Interactive demo · Sample data',
  headline1: 'See how RAPID',
  headline2: 'works for you.',
  lead: 'Pick a role and try it. Nothing you click is sent or booked.',
  testerTab: 'Tester',
  testerHint: 'Try ideas and give feedback',
  founderTab: 'Founder',
  founderHint: 'Share your idea, get proof',
  testerIdeaTitle: 'Lunch without the queue',
  testerIdeaSub: 'Pre-order meals near campus.',
  whyThisFits: 'You buy lunch near campus and often wait in line.',
  tryItCta: 'Try it',
  bookCallCta: 'Book a call',
  collaborateCta: 'Collaborate',
  tryTitle: 'Try this idea',
  tryDescription: 'Preview how you could request early access and tell the founder what you need.',
  previewRequestCta: 'Preview request',
  closeCta: 'Close',
  tryFootnote: 'Demo only. No request will be sent.',
  founderTitle: 'Your test, explained',
  founderSub: 'A clear summary of what you learned and what is next.',
  founderIdeaTitle: 'Lunch without the queue',
  founderIdeaChips: ['Food & Lifestyle', 'Students', 'Nigeria'],
  founderStats: '40 people reached · 24 fit the target',
  founderReportLabel: 'What you would see',
  openReportCta: 'Open sample report',
  footerNote: 'Switch roles to see what each person gets from RAPID.',
} as const;

export const ACTION_EVIDENCE = {
  eyebrow: '04 / LEARN FROM ACTIONS',
  headline1: 'See the steps people',
  headlineGradient: 'actually take.',
  lead: 'RAPID helps you measure early traction from a relevant audience, then decide what to test next.',
  accordion: [
    { title: 'Joined a waitlist', text: 'A light signal of interest in hearing more. It does not show someone will use the product.' },
    { title: 'Signed up for a trial', text: 'Someone asked for access. Signing up is not the same as using it.' },
    { title: 'Attended a call', text: 'Booked and attended are different. Attending shows real effort and time.' },
    { title: 'Completed a pre-order', sub: 'Where offered', text: 'A payment pledge is not a completed order. Only a completed order counts here, and only where offered.' },
  ],
  reportTitle: 'What your test tells you',
  reportSteps: [
    { title: 'Who responded', sub: 'People who fit the audience.' },
    { title: 'What they did', sub: 'Completed actions, not just clicks.' },
    { title: 'What to test next', sub: 'A clearer next question.' },
  ],
  buildLabel: 'Build',
  iterateLabel: 'Iterate',
  pivotLabel: 'Pivot',
  buildText: 'The evidence is strong enough to start building. Signals help you decide; they do not guarantee success.',
  iterateText: 'Something worked and something did not. Change one thing and run another test.',
  pivotText: 'People did not respond to the core idea. Try a different problem or audience.',
  footnote: 'Example report. Signals help decisions; they do not guarantee success.',
} as const;

export const FEEDBACK_LOOP = {
  eyebrow1: 'PRODUCT PREVIEW',
  eyebrow2: '· SAMPLE STORY',
  headline: 'See what your input',
  headlineGradient: 'helped change.',
  step1Title: 'You shared',
  step1Quote: 'I need to choose a pickup time.',
  step1Caption: 'From a student near campus',
  step2Title: 'The founder improved',
  step2Product: 'Grilled Chicken Bowl',
  step2Tagline: 'Fresh. Local. Fast.',
  step2Label: 'Pickup time',
  step3Title: 'You hear back',
  step3Title2: 'Pickup times are now part of the next test.',
  step3Text: 'Your feedback helps shape what we build.',
  step3Cta: 'View update →',
  caption: 'An example of the feedback loop we plan to build.',
  plannedHeadline1: 'More ways to',
  plannedHeadline2: 'stay involved.',
  plannedFeatures: [
    { title: 'Saved ideas', desc: 'Bookmark ideas you care about and get updates.' },
    { title: 'Founder conversations', desc: 'Join structured discussions with founders.' },
    { title: 'Your activity history', desc: 'See how your feedback helps over time.' },
  ],
} as const;

export const ROLES_VALUE = {
  headline1: 'Two ways to move',
  headlineGradient: 'ideas forward.',
  founderTitle: 'For founders',
  founderText: 'Find relevant people. Test a clear question. Learn what to change before investing more.',
  founderCta: 'Join as a founder',
  testerTitle: 'For testers',
  testerText: 'Discover ideas that fit your needs. Try early products and help shape what gets built.',
  testerCta: 'Join as a tester',
  bothNote: 'You can do both with one profile.',
} as const;

export const FAQ_SECTION = {
  headline1: 'A few things',
  headlineGradient: 'to know',
  lead: 'Quick answers about the Nigeria pilot, who can join, and how it works.',
} as const;

export const FINAL_CTA = {
  headline1: 'Your next idea needs',
  headline2: 'the right people.',
  lead: 'Join the RAPID waitlist for a chance to enter the Nigeria pilot.',
  cta: 'Join the waitlist',
  finePrint: 'Joining does not guarantee a place.',
} as const;

export const FOOTER = {
  privacy: 'Privacy',
  contact: 'Contact',
  exploreDemo: 'Explore the demo',
  copyright: '© RAPID. Nigeria pilot.',
} as const;

export const WAITLIST = {
  heading: 'Join the RAPID waitlist',
  sub: "Add your name and email and we'll keep you updated on the Nigeria pilot.",
  nameLabel: 'Full name',
  namePlaceholder: 'Enter your full name',
  emailLabel: 'Email address',
  emailPlaceholder: 'Enter your email address',
  joinCta: 'Join the waitlist',
  successTitle: 'You are on the list',
  successText: 'We will email you if there is a Nigeria pilot opportunity that fits your interests. Joining does not guarantee a place.',
  duplicateTitle: "You're already on the list",
  duplicateText: 'We will email you if there is a Nigeria pilot opportunity that fits.',
  exploreDemoCta: 'Explore the demo',
  closeCta: 'Close',
  errorText: 'We could not save your details. Nothing is lost. Check your connection and try again.',
  retryCta: 'Retry',
  savingText: 'Saving…',
  brandHeading1: 'Your next step',
  brandHeading2: 'starts here.',
  brandLead: 'Connect, validate, and build for a brighter Africa.',
  brandCta: 'Join waitlist',
  brandCallCta: 'Book a call',
  brandCollabCta: 'Collaborate',
  brandChipsLeft: ['Founder joined', 'Collaboration request', 'Great pitch!'],
  brandChipsRight: ['Call booked', 'Customer matched', 'In the network'],
  brandIllustrative: 'Illustrative',
  brandFlow: 'IDEA → ACTION → VALIDATION → TRACTION',
  brandIdeas: 'Ideas shape Africa',
  brandReal: 'Real people real input',
  brandDiverse: 'Diverse perspectives',
} as const;

export const DEMO_APP = {
  demoLabel: 'Interactive demo · Sample data',
  backToIdeas: '← Back to ideas',
  pitchTitle: 'Lunch without the queue',
  pitchPreview: 'Pitch preview',
  problemLabel: 'THE PROBLEM',
  problemText: 'Students lose time waiting for lunch.',
  audienceLabel: "WHO IT'S FOR",
  audienceText: 'Students who buy lunch near campus.',
  ideaLabel: 'THE IDEA',
  ideaText: 'Choose a meal and pickup time before you arrive.',
  summaryLabel: 'Pitch summary',
  summaryText: 'Less time in line. More control over lunch.',
  tryQuestion: 'Would you try this?',
  trySub: "Choose what fits you. It's fine to skip.",
  previewTrialCta: 'Preview trial signup',
  shareFeedbackCta: 'Share feedback',
  notForMeCta: 'Not for me',
  notForMeText: 'No problem. Skipping has no penalty.',
  videoNotice: 'Video plays only after a click. This sample has no real video.',
  reportTitle: 'Your test, explained',
  reportSub: "A clear summary of what you learned and what's next.",
  reportProjectLabel: 'Project',
  keyFindingLabel: 'KEY FINDING',
  keyFinding: 'Students liked choosing a pickup time. Meal choice needs another test.',
  statsReached: '40 people reached',
  statsFit: '24 fit the target',
  statsTrial: '8 trial signups',
  statsNote: '8 of the 24 people who fit the target requested trial access.',
  whatWeLearned: 'WHAT WE LEARNED',
  learned1Title: 'Pickup time mattered most',
  learned1Text: 'Students were much more likely to sign up when they could choose a pickup time.',
  learned2Title: 'Menu options need more choice',
  learned2Text: 'Several people said they wanted more variety, especially vegetarian options.',
  whatNotTellUs: 'WHAT THIS DOES NOT TELL US',
  notTellUsTitle: 'A signup does not confirm repeat use or payment.',
  notTellUsText: "People who signed up may not come back, and we haven't tested whether they would pay for the service.",
  nextStepLabel: 'RECOMMENDED NEXT STEP',
  planTestCta: 'Plan another test →',
  reportFootnote: 'These counts are sample data. The founder chooses Build, Iterate or Pivot based on the evidence.',
} as const;

export const ACTION_VARIANTS = {
  interested: {
    title: 'Show interest',
    description: 'Let the founder know you are interested.',
    message: "I'm interested in Lunch without the queue. Keep me updated.",
  },
  tryIt: {
    title: 'Try this idea',
    description: 'Preview how you could request early access and tell the founder what you need.',
    message:
      "Hi! I'm a student near campus and I'd love early access to this. I usually grab lunch between 11–1pm. Please keep me updated!",
  },
  bookCall: {
    title: 'Book a call',
    description: 'Preview how you could ask the founder for a short call.',
    message: 'Hi! Can we talk about this for 15 minutes this week?',
  },
  collaborate: {
    title: 'Collaborate',
    description: 'Preview how you could offer your skills to this idea.',
    message: "Hi! I'd like to help with this idea. Here is what I can do.",
  },
  previewTrial: {
    title: 'Preview trial signup',
    description: 'Preview how you would request trial access.',
    message:
      "Hi! I'm a student near campus and I'd love early access to this. I usually grab lunch between 11–1pm. Please keep me updated!",
  },
  shareFeedback: {
    title: 'Share feedback',
    description: 'Preview how you would tell the founder what you think.',
    message: 'One thing that would help me try this: …',
  },
} as const;

export type ActionVariantKey = keyof typeof ACTION_VARIANTS;
