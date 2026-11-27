# RAPID — Website copy map

Every piece of text on the site, mapped to the section it appears in and the route a visitor sees it on.

- **Snapshot:** 2 November 2026, built from the working tree and read out of the running site (`localhost:5191`).
- **Scope:** complete for every public page and every tester-facing screen. Staff tooling is mapped at page and panel level — it is internal and never indexed.
- **Verbatim:** copy is reproduced exactly as rendered, including curly apostrophes, headline line breaks and capitalisation. Where a word is generated at runtime it appears in `{braces}`.

---

## How to read this

Each page entry starts with its **route** and **page metadata** (browser title and description), then walks the page in visual order: `§1`, `§2`, `§3`…

Inside a section the labels mean:

| Label | Meaning |
|---|---|
| Eyebrow | Small uppercase kicker above the heading |
| H1 / H2 / H3 | Heading hierarchy on the page |
| Lead | First paragraph after a heading |
| Body | Supporting paragraph |
| CTA | Button or link; the arrow shows its destination |
| Micro | Small print, captions, stamps and notes |
| Alt | Image alternative text (read by screen readers) |

Links are shown as `→ /route`. Strings that exist in more than one place are marked **Reused**.

**Source of truth.** Public marketing copy lives in the page components (`src/pages/*.tsx`). Shared strings — FAQs, form labels, thank-you copy, 404 links — live in `src/content/pilot.ts`. Account and dashboard copy lives with its page. Section 17 lists the exact files.

---

# 1. Global elements

## 1.1 Site header — every public page

**Desktop**

| Element | Text |
|---|---|
| Logo link (aria-label) | “RAPID home” |
| Logo descriptor | “PEOPLE-POWERED” / “RESEARCH” |
| Nav item → `/founders` | “For founders” |
| Nav item → `/join` | “For testers” |
| Nav item → `/how-it-works` | “How it works” |
| Nav item → `/about` | “About” |
| Sign-in link → `/sign-in` | “Sign in” |
| Primary CTA → `/contact` | “Start a project” |

**Mobile**

The four nav items repeat, plus:

| Element | Text |
|---|---|
| Sign-in link → `/sign-in` | “Sign in” |


## 1.2 Site footer — every public page

**Brand column**

| Element | Text |
|---|---|
| Logo link (aria-label) | “RAPID home” |
| Tagline | “Good questions.” / “Better possibilities.” |
| Description | “Connecting founders and everyday people through thoughtful research in Nigeria.” |

**Explore**

| Link | Text |
|---|---|
| `/how-it-works` | “How it works” |
| `/about` | “About RAPID” |
| `/privacy` | “Privacy” |

**Get started**

| Link | Text |
|---|---|
| `/founders` | “For founders” |
| `/join` | “For testers” |
| `/sign-in` | “Sign in” |

**Get in touch**

| Element | Text |
|---|---|
| Email link | “hello@rapid.africa” |
| Link → `/contact` | “Request a call” |

**Bottom bar**

| Element | Text |
|---|---|
| Copyright | “© {current year} RAPID · Nigeria pilot” |
| Signature | “MADE FOR REAL LIFE” + brand mark |

## 1.3 Shared accessibility and system text

| Element | Text |
|---|---|
| Skip link (visible on focus) | “Skip to main content” |
| Accordion control (aria) | Question text is both the trigger label and the heading |
| Required-field marker | Red asterisk after the label (decorative; `aria-required` on the input) |
| Image caption, all photography | “Illustrative photograph” or “Illustrative” |

---

# 2. Home — `/`

**Metadata**
- Title: `RAPID | User research for founders in Nigeria`
- Description: `Test your startup idea with relevant people in Nigeria. RAPID helps founders plan research, recruit testers and turn feedback into clear next steps.`

## §1 Hero — `home-hero`

| Element | Copy |
|---|---|
| Eyebrow | “PEOPLE-POWERED RESEARCH · NIGERIA” |
| H1 | “Good ideas” / “meet real life.” |
| Lead | “Find the right people, test your idea and discover what to improve before your next big decision.” |
| CTA (primary) → `/contact` | “Let’s test your idea” |
| CTA (secondary) → `/join` | “I want to be a tester” |
| Micro strip | “FOUNDER QUESTIONS” · “REAL PERSPECTIVES” · “BETTER DECISIONS” (separated by the brand mark) |

**Hero composition**

| Element | Copy |
|---|---|
| Photo alt | “Two people sharing ideas over a laptop” |
| Photo credit | “Illustrative photograph” |
| Stamp | “MADE FOR” / “real people.” |
| Note label | “THE QUESTION” |
| Note quote | “What happens when people actually try it?” |
| Note footer | “THAT’S WHERE WE START” |

**Hero edge band**

| Element | Copy |
|---|---|
| Statement | “LESS GUESSING. MORE UNDERSTANDING.” |

## §2 The idea behind RAPID — `intro-section`

| Element | Copy |
|---|---|
| Eyebrow | “THE IDEA BEHIND RAPID” |
| H2 | “Great ideas don’t happen in a vacuum.” |
| Lead | “They happen when you listen, learn and make something better together.” |
| Body | “RAPID helps founders reach relevant testers, uncover what matters to customers and turn real feedback into confident product decisions.” |
| Link → `/how-it-works` | “Get to know the process” |

## §3 Two ways in — `pathways`

| Element | Copy |
|---|---|
| Eyebrow | “TWO WAYS IN” |
| H2 | “What brings you here?” |
| Intro (right) | “Different perspectives. A shared curiosity about what could be better.” |

**Card 1 — `/join`**

| Element | Copy |
|---|---|
| Index | “01 / FOR TESTERS” |
| H3 | “Your experience” / “has a point.” |
| Body | “Try new ideas. Tell it like it is. Help shape what gets built next.” |
| CTA | “Explore testing” |
| Image alt | “Person writing notes while using a phone” |
| Caption | “Illustrative” |

**Card 2 — `/founders`**

| Element | Copy |
|---|---|
| Index | “02 / FOR FOUNDERS” |
| H3 | “Build with people,” / “not assumptions.” |
| Body | “Reach relevant testers, uncover friction and make your next product decision with clarity.” |
| CTA | “Explore research” |
| Image alt | “Person thinking beside a laptop” |
| Caption | “Illustrative” |

## §4 How it works — `method-section`

| Element | Copy |
|---|---|
| Eyebrow | “HOW IT WORKS” |
| H2 | “From “what if?”” / “to what’s next.” |
| Link → `/how-it-works` | “The whole process” |

| Step | H3 | Body |
|---|---|---|
| 01 | “Start with a question” | “Founders tell us what they are building, what they need to learn and who they need to hear from.” |
| 02 | “Bring in real life” | “We scope the test and invite people whose experiences fit. Testers choose whether to take part.” |
| 03 | “Make your next move” | “Get a clear account of what people did, where they struggled and what the evidence means for your next move.” |

## §5 What we believe — `belief-section`

| Element | Copy |
|---|---|
| Badge label | “THE RAPID” / “POINT OF VIEW” |
| Eyebrow | “A LITTLE MORE HUMAN” |
| H2 | “People aren’t” / “data points.” |
| Body | “Behind every response is a real person. That’s why we keep participation voluntary, make terms clear and put context around the findings.” |
| Link → `/about` | “What we believe” |

## §6 Closing CTA — `end-section`

| Element | Copy |
|---|---|
| Eyebrow | “LET’S FIND OUT TOGETHER” |
| H2 | “Something good” / “starts with a question.” |
| Body | “Whether you’re building or sharing your experience, there’s a place for you here.” |
| CTA → `/contact` | “Talk to the team” |
| CTA → `/join` | “Become a tester” |

---

# 3. For founders — `/founders`

**Metadata**
- Title: `Startup user research in Nigeria | RAPID`
- Description: `Recruit relevant testers, validate your startup idea and get actionable user research with RAPID. Request a call with our team.`

## §1 Hero — `audience-hero founder-hero`

| Element | Copy |
|---|---|
| Eyebrow | “FOR FOUNDERS & TEAMS” |
| H1 | “Build what your customers” / “actually need.” |
| Lead | “Put your product in front of relevant people, discover what works and find the friction worth fixing. RAPID turns real feedback into a clear path forward.” |
| CTA → `/contact` | “Request a call” |
| Link → `/how-it-works` | “How it works” |
| Micro | “No account needed · Scope and cost agreed before recruitment” |
| Photo alt | “Colleagues reviewing research notes together” |
| Photo credit | “Illustrative photograph” |
| Image message | “BETTER QUESTIONS” / “Better” / “decisions.” |

## §2 A clearer way forward — `intro-section`

| Element | Copy |
|---|---|
| Eyebrow | “A CLEARER WAY FORWARD” |
| H2 | “Build for the world” / “as it is.” |
| Lead | “The right customer insight changes your next decision.” |
| Body | “From a first concept to a product in progress, our team scopes the right research, recruits relevant testers and makes their feedback useful to your team.” |
| Link → `/contact` | “Tell us what you’re working on” |

## §3 What you get — `method-section`

| Element | Copy |
|---|---|
| Eyebrow | “WHAT YOU GET” |
| H2 | “A question.” / “A plan. Clarity.” |
| Intro (right) | “A focused research partner from the first conversation to a decision you can act on.” |

| Step | H3 | Body |
|---|---|---|
| 01 | “A focused brief” | “Agree the question, audience, task and terms with the RAPID team.” |
| 02 | “Relevant perspectives” | “Our team invites reviewed testers whose experiences fit the question.” |
| 03 | “Findings with context” | “Understand outcomes, counts and anonymised feedback where consent allows.” |

## §4 FAQ — `faq-section`

| Element | Copy |
|---|---|
| Eyebrow | “THE DETAILS” |
| H2 | “Good question.” |
| Body | “Everything you need to know before we start.” |
| Link → `/contact` | “Talk to us” |

| # | Question | Answer |
|---|---|---|
| 1 | “What counts as a test?” | “A scoped question with a defined audience, a short task and a written response. It can be a prototype walkthrough, a conversation or a specific action in your product.” |
| 2 | “How are testers chosen?” | “Our team selects approved testers whose situation, interests and experience match your research question.” |
| 3 | “What will I receive?” | “You receive a clear summary of responses, recruitment counts, findings and the context behind the evidence, ready to inform your next decision.” |
| 4 | “How long does it take?” | “We agree the research timeline with you during scoping, based on your audience and the work involved.” |
| 5 | “What does it cost?” | “We discuss your goals and agree the scope and any cost with you before recruitment begins.” |
| 6 | “Will I see who said what?” | “No. Founders see counts and anonymised quotes only where the tester explicitly consented. Names and contact details are never shared.” |

## §5 Closing CTA — `end-section`

| Element | Copy |
|---|---|
| Eyebrow | “LET’S TALK” |
| H2 | “Bring the question.” / “We’ll take it from there.” |
| Body | “Tell us a little about your idea. We’ll follow up on WhatsApp to arrange a conversation.” |
| CTA → `/contact` | “Request a call” |

---

# 4. For testers — `/join`

**Metadata**
- Title: `Become a product tester in Nigeria | RAPID`
- Description: `Join RAPID’s tester community in Nigeria. Share honest feedback on new ideas and see each task and reward before you decide to take part.`

## §1 Hero — `audience-hero tester-hero`

| Element | Copy |
|---|---|
| Eyebrow | “FOR CURIOUS PEOPLE” |
| H1 | “Your point of view” / “has power.” |
| Lead | “Try ideas before they take off. Share what really happens. Help make the things we use a little better for everyone.” |
| CTA → `/sign-up/tester` | “Become a tester” |
| Link → `/sign-in` | “Already a tester? Sign in” |
| Micro | “Free to apply · Adults 18+ · Nigeria pilot” |
| Photo alt | “Two people comparing notes over a laptop” |
| Photo credit | “Illustrative photograph” |
| Image message | “YOUR EXPERIENCE” / “is the” / “insight.” |

## §2 Your experience matters — `intro-section`

| Element | Copy |
|---|---|
| Eyebrow | “YOUR EXPERIENCE MATTERS” |
| H2 | “No expert title” / “required.” |
| Lead | “You already know things nobody else knows quite like you do.” |
| Body | “Tell us about your experience, get invited when there’s a fit and decide whether a test is right for you. Honest feedback is the whole point.” |
| Link → `/sign-up/tester` | “Create your account” |

## §3 On your terms — `method-section tester-method`

| Element | Copy |
|---|---|
| Eyebrow | “ON YOUR TERMS” |
| H2 | “Here’s the” / “deal.” |
| Intro (right) | “A little clarity goes a long way. You’ll know what you’re signing up for.” |

| Step | H3 | Body |
|---|---|---|
| 01 | “Know the task” | “Each invitation explains what to do and how long it takes before you decide.” |
| 02 | “See the reward” | “See the reward and payment timing before you accept. Invitations depend on the research and your experience.” |
| 03 | “Keep your privacy” | “Your contact details stay with RAPID. Founders receive anonymised responses.” |

## §4 FAQ — `faq-section`

| Element | Copy |
|---|---|
| Eyebrow | “BEFORE YOU JOIN” |
| H2 | “Wondering” / “about anything?” |
| Body | “The honest answers, right here.” |
| Link → `/how-it-works` | “See how it works” |

| # | Question | Answer |
|---|---|---|
| 1 | “Is joining free?” | “Yes. Applying to be a tester is free.” |
| 2 | “Who can join?” | “Adults aged 18 or above. Our first tests focus on students, recent graduates and working adults in Nigeria. Each test has its own requirements.” |
| 3 | “What happens after I apply?” | “We aim to review applications within three business days. We email you with the outcome or ask for more details. If you are approved, invitations appear in your account when a test fits.” |
| 4 | “Will I be paid?” | “Some tasks offer a reward. The amount, rules and payment timing are stated before you accept. Applying does not guarantee a paid task.” |
| 5 | “Must I join WhatsApp?” | “No. Tasks arrive by email. You can choose reminders or join our optional group.” |
| 6 | “How are my details used?” | “To review your application, find suitable tests and contact you about participation. Founders see anonymised responses, never your name or contact details. Read our Privacy Policy or contact support to ask for removal.” (The words “Privacy Policy” are a link to `/privacy`.) |

## §5 Closing CTA — `end-section`

| Element | Copy |
|---|---|
| Eyebrow | “READY WHEN YOU ARE” |
| H2 | “Bring your” / “point of view.” |
| Body | “Create an account and keep track of your application, invitations and reward status in one place.” |
| CTA → `/sign-up/tester` | “Create a tester account” |

---

# 5. How it works — `/how-it-works`

**Metadata**
- Title: `How user research works | RAPID`
- Description: `See how RAPID helps founders scope a product test, recruit relevant testers and turn their feedback into actionable findings.`

## §1 Hero — `signal-hero`

| Element | Copy |
|---|---|
| Eyebrow | “THE RAPID PROCESS” |
| H1 | “Good questions make better beginnings.” (“better beginnings.” in green) |
| Lead | “A straightforward, human-led research process that connects your idea with the people you are building for.” |

## §2 The journey — numbered process list

| Element | Copy |
|---|---|
| Eyebrow | “THE JOURNEY” |
| H2 | “From curious to clearer.” |

| # | H3 | Body |
|---|---|---|
| 01 | “The question” | “A founder tells us what they need to learn and who they want to reach.” |
| 02 | “The plan” | “Together we agree a focused task, audience, timing and reward before recruitment.” |
| 03 | “The perspectives” | “Our team invites suitable testers. Each person can read the terms and choose whether to participate.” |
| 04 | “The learning” | “Responses are reviewed and findings are shared with counts, context and the limits of the evidence.” |

## §3 Two doors — split panel

**For testers**

| Element | Copy |
|---|---|
| Eyebrow | “FOR TESTERS” |
| H2 | “Your voice, on your terms.” |
| Body | “Apply for free, get matched when a suitable test comes along, and track your participation and reward status in your account.” |
| Link → `/join` | “Become a tester” |

**For founders**

| Element | Copy |
|---|---|
| Eyebrow | “FOR FOUNDERS” |
| H2 | “Start with what you need to know.” |
| Body | “Bring the team your question. We will discuss fit, scope and cost before any recruitment begins.” |
| CTA → `/contact` | “Request a call” |

---

# 6. About — `/about`

**Metadata**
- Title: `About RAPID | Human-centred research in Nigeria`
- Description: `Meet RAPID: a human-led research service connecting founders with relevant testers to inform better product decisions.`

## §1 Hero — `signal-hero`

| Element | Copy |
|---|---|
| Eyebrow | “ABOUT RAPID” |
| H1 | “Built on the belief that people know things.” (“people know things.” in green) |
| Lead | “RAPID connects founders with the people they are building for. Starting in Nigeria, our team turns focused research questions and real experiences into insights that move ideas forward.” |

## §2 What guides us — principle cards

| Element | Copy |
|---|---|
| Eyebrow | “WHAT GUIDES US” |
| H2 | “Better evidence starts with respect.” |

| # | H3 | Body |
|---|---|---|
| 1 | “Curiosity over certainty” | “Ask a clear question and make room for an answer that surprises you.” |
| 2 | “People before data points” | “Make participation voluntary, explain the terms, and protect personal details.” |
| 3 | “Clarity over claims” | “Show the context behind every finding so teams can make informed decisions.” |

## §3 Closing panel — `signal-closing`

| Element | Copy |
|---|---|
| H2 | “Let’s learn something together.” |
| CTA → `/contact` | “Talk to the team” |
| CTA → `/join` | “Become a tester” |

---

# 7. Contact — `/contact`

**Metadata**
- Title: `Request a research call | RAPID`
- Description: `Tell RAPID what you are building and request a call to discuss customer research and product testing in Nigeria.`

## §1 Hero and form — `signal-hero`

**Left column**

| Element | Copy |
|---|---|
| Eyebrow | “LET’S TALK” |
| H1 | “Start with a conversation.” |
| Lead | “Tell us what you’re building and who you need to reach. Our team will follow up on WhatsApp to arrange a call and plan your research.” |
| Callout heading | “What happens next?” |
| Callout body | “We aim to get in touch within three business days. Timing and any cost are agreed before recruitment begins.” |
| Email line | “Prefer email? hello@rapid.africa” |

**Right column** — the founder form, mapped field by field in §14.2.

| Element | Copy |
|---|---|
| Form submit button | “Request a call” |
| Form note | “No pricing or payment step. We will follow up on WhatsApp.” |

---

# 8. Thank-you pages

## 8.1 Tester — `/thanks/tester`

**Metadata:** Title `Thanks for applying | RAPID` · noindex

| Element | Copy |
|---|---|
| Badge | “Application received” |
| H1 | “Thanks for applying to RAPID.” |
| Lead | “We sent a receipt to the email you used. The team aims to review applications within three business days.” |
| CTA → `/sign-in` | “Sign in to your account” |
| CTA → `/` | “Return home” |
| Micro | “Applying does not guarantee a test or payment. Need help? Email hello@rapid.africa.” |
| Cross-link | “Want the other side? Request a test as a founder. RAPID is the same pilot for both.” |

**Sidebar — “What happens next”**

| # | Copy |
|---|---|
| 01 | “The team reviews your application and may ask a follow-up question.” |
| 02 | “If approved, invitations appear in your account and arrive by email when a test fits.” |
| 03 | “Read the terms and reward, then accept or decline.” |

| Element | Copy |
|---|---|
| Reference block (when present) | “Your reference” / `{reference}` / “Keep this reference if you contact support.” |
| Footer note | “A person reads every application.” |

## 8.2 Founder — `/thanks/founder`

**Metadata:** Title `Thanks for your request | RAPID` · noindex

| Element | Copy |
|---|---|
| Badge | “Request received” |
| H1 | “Thanks. We have received your request.” |
| Lead | “The team aims to contact you on WhatsApp within three business days to scope the question, audience and terms.” |
| CTA → `/` | “Return home” |
| Micro | “Prefer to talk first? Email hello@rapid.africa or reply on WhatsApp when the team contacts you.” |
| Cross-link | “Want the other side? Join as a tester. RAPID is the same pilot for both.” |

**Sidebar — “What happens next”**

| # | Copy |
|---|---|
| 01 | “The team reads your request and follows up on WhatsApp to arrange a conversation.” |
| 02 | “Together, we discuss the question, audience, timing and any cost.” |
| 03 | “If the project is a fit, the team agrees the next steps with you before recruitment.” |

| Element | Copy |
|---|---|
| Footer note | “A person reads every request.” |

---

# 9. Not found — any unmatched route

**Metadata:** Title `Page not found | RAPID` · noindex

| Element | Copy |
|---|---|
| Eyebrow | “Page not found” |
| H1 | “We couldn't find that page.” |
| Body | “The page may have moved, or the link may be wrong. These pages may help:” |
| Link 1 → `/` | “Home” |
| Link 2 → `/join` | “For testers” |
| Link 3 → `/founders` | “For founders” |
| Link 4 → `/privacy` | “Privacy Policy” |
| Decorative | “404” |

---

# 10. Privacy Policy — `/privacy`

**Metadata**
- Title: `Privacy Policy | RAPID`
- Description: `How the RAPID pilot website collects, uses and protects tester applications and founder requests.`

| Element | Copy |
|---|---|
| Eyebrow | “Legal” |
| H1 | “Privacy Policy” |
| Revision line | “Last updated: 24 October 2026 · Notice version 2026-10-24” |
| Intro | “RAPID respects your privacy. This notice explains what the pilot website collects, why we collect it, and the choices you have.” |
| Contents label (sidebar) | “Contents” |
| Contents label (mobile) | “On this page” |

## Sections

**1. About this notice** — “This notice explains what the RAPID pilot website collects, why we collect it, and the choices you have. It covers tester applications and founder requests submitted through this site.” / “RAPID is running a small pilot to learn whether we can find suitable people, get useful participation, and help founders make clearer decisions with less outreach effort. Testers and founders now have accounts, so this notice also covers sign-in, invitations, responses and the status shown in each dashboard.”

**2. Information we collect** — “If you apply to be a tester, we collect your name, email address, country, city or state, age range, confirmation that you are 18 or older, main situation, optional other activities, school or university where relevant, industry where relevant, 1–3 interests, your answer about a recent problem, optional WhatsApp number and reminder consent, how you heard about us, and your privacy acknowledgement and its time.” / “If you request a test as a founder, we collect your name, WhatsApp number, optional email address, what you want to test, who the test is for, any short description you add, and your privacy acknowledgement and its time.” / “Technical and source information may include the form type, submission time, a random submission identifier, schema and privacy versions, landing path, and approved source, medium and campaign tags. Analytics records page views, button clicks, form starts, validation error field codes, save failures and confirmed new records.” / “If you sign in, our identity provider processes your email address and a verification code. We store the resulting account ID, your verified email address and the profile details above. We never receive or store a password. We record invitations you receive, whether you accept or decline, the response you submit, any quote consent you give, and the reward status staff record.” / “We do not send names, email addresses, phone numbers, written answers or raw tracking URLs to analytics. We do not collect identity numbers, income, home addresses or payment details.”

**3. How we use your information** — “We use your information to:”
- “Review your application and decide whether the pilot is a fit.”
- “Find suitable tests and email you about them.”
- “Contact founders on WhatsApp about a request.”
- “Run your account, show your application status and deliver invitations.”
- “Collect responses, record outcomes and share findings with the relevant founder.”
- “Record reward status so you can see whether a reward has been sent.”
- “Keep the records needed to run and review the pilot.”
- “Prevent spam, duplicate submissions and misuse of the forms.”
- “Understand how the website is used and improve it.”
- “The pilot uses team review. We do not use automated matching to decide who is accepted.”

**4. Email, WhatsApp and the optional group** — “Tasks arrive by email. WhatsApp reminders are optional and are only sent if you tick the reminder box and give a number. You can withdraw that consent at any time, and we will stop reminders after you decline or withdraw.” / “After acceptance, we may offer an optional WhatsApp group. Members can see each other's phone numbers. The group is administered, join requests are checked against accepted applicants, and task answers or member contact lists are not posted there. Group membership has no effect on eligibility or rewards.”

**5. Who can use RAPID** — “The pilot is for adults aged 18 or above. We ask every tester to confirm their age before applying. Each test also has its own requirements.”

**6. Who we share it with** — “We use service providers to run the pilot website and store the records. These currently include Vercel for hosting and server functions, Neon for the Postgres database, Clerk for passwordless sign-in, Resend for transactional email, and privacy-friendly analytics where enabled. Providers receive only what they need to perform their service.” / “We may share relevant, anonymous findings with the founder who commissioned a test. The founder sees counts, outcomes and anonymised quotes only where the tester explicitly consented. We do not share names or contact details with a founder.” / “We do not sell personal information. We may disclose information where required by law, to protect users, investigate abuse, or protect RAPID's legal rights.”

**7. Retention and deletion** — “We keep account and application records while the pilot runs and for up to 12 months after your last activity. Declined or inactive tester records are anonymised after 12 months unless there is a legal or operational reason to keep them longer. Invitation and response rows are kept without contact details so founder counts remain accurate.” / “If you ask to be removed, we anonymise your person record in place: name, email, phone and written answers are cleared, and the account can no longer sign in. Counts stay intact. Some information may remain in backups for a limited period.”

**8. Your choices and rights** — “You can ask us to:”
- “Tell you what personal information we hold about you.”
- “Correct inaccurate information.”
- “Delete your information.”
- “Withdraw WhatsApp reminder consent.”
- “Stop contacting you about tests or the pilot.”
- “To make a request, contact hello@rapid.africa. Some information may need to be kept where required by law or for legitimate security and record-keeping purposes.”

**9. Security** — “We use reasonable technical and organisational measures to protect the information we hold. Access to application records is limited to named team members. No online service can guarantee complete security.”

**10. Cookies and analytics** — “Signing in uses essential cookies set by our identity provider. They keep you signed in and protect the session; they are not used for advertising. Server-side sessions are HttpOnly, Secure in production and SameSite=Lax.” / “We use privacy-friendly analytics that does not use advertising cookies and does not build profiles across websites. We record page paths and limited interaction events, not the answers you type into a form, and authenticated dashboard paths are excluded. If our analytics approach changes, we will update this notice and provide any choices required by law.”

**11. Changes to this notice** — “We may update this notice as the pilot changes. The latest version will show its revision date at the top. If a change materially affects how we use your information, we will take reasonable steps to tell you before it applies.”

**12. Contact us** — “If you have questions about this notice, your personal information, or how RAPID handles data, contact:”

| Field | Value |
|---|---|
| Organisation | “RAPID” |
| Email | “hello@rapid.africa” |
| Country of operation | “Nigeria” |
| Website | `{site URL}` — currently renders as `localhost:5199` in this build (see issue #1) |

**Closing line** — “By using the pilot website, you acknowledge that you have read this notice and understand how your information may be collected and used.”

---

# 11. Sign-in and account creation

## 11.1 Sign in — `/sign-in`

**Metadata:** Title `Sign in | RAPID` · Description `Sign in to RAPID to see your application, invitations and test findings.` · noindex

| Element | Copy |
|---|---|
| H1 | “Welcome back.” |
| Intro (Clerk configured) | “Use the email you signed up with, or continue with Google if that is how you created the account.” |
| Intro (no Clerk) | “Sign in to see your invitations, track your participation and manage your profile.” |
| Card loading | “Loading sign-in…” |
| Field | Label “Email”; hint “Use the address on your account.” |
| Submit | “Sign in” / busy: “Signing in” |
| Error (unknown email) | “We couldn't find an active account with that email address. Check the address, or create an account.” |
| Error (other) | “We could not sign you in. Check your connection and try again.” |
| Service unavailable | “Sign-in is unavailable right now. Email hello@rapid.africa and the team will reopen your account.” |
| Footer | “New to RAPID? Create your account to join as a tester. Founders can talk to our team.” |
| Photo caption | “THE RAPID COMMUNITY” + brand mark |
| Photo note | “REAL PEOPLE. REAL PERSPECTIVES.” / “Your experience makes the difference.” |
| Photo alt | “Two people reviewing notes during a test session” |
| Photo tag | “RAPID · Pilot” |
| Photo caption | “Pilot session · illustrative” |

## 11.2 Choose a path — `/sign-up`

**Metadata:** Title `Create your account | RAPID` · Description `Create a tester account or talk to the RAPID team about research.`

| Element | Copy |
|---|---|
| Eyebrow | “One account” |
| H1 | “Create your RAPID account” |
| Lead | “Testers can create an account to manage invitations. Founders can talk to our team without signing up.” |
| Signed-in note | “You are signed in as {email}. Pick what you want to do next.” |

**Card 1 — testers → `/sign-up/tester`**

| Element | Copy |
|---|---|
| Index | “01 · Testers” |
| H2 | “I want to take part in tests” |
| Body | “Join the tester pool, get invitations that match your experience and choose whether to accept each one.” |
| CTA | “Continue as a tester” |

**Card 2 — founders → `/contact`**

| Element | Copy |
|---|---|
| Index | “02 · Founders” |
| H2 | “I need people to test my idea” |
| Body | “Bring a real question, get matched testers and read the evidence before your next build decision.” |
| CTA | “Request a call” |

| Element | Copy |
|---|---|
| Footer | “Already have an account? Sign in.” |

## 11.3 Tester sign-up, step 1 — `/sign-up/tester`

**Metadata:** Title `Create your tester account | RAPID` · Description = intro below · noindex

| Element | Copy |
|---|---|
| Step indicator | “Step 1 of 2 · Your account” |
| H1 | “Your perspective starts here.” |
| Intro (Clerk) | “Continue with Google or your email address. Next you will answer a few questions about your situation and interests.” |
| Intro (no Clerk) | “Create your account, then tell us a little about yourself so we can find tests that fit.” |
| Dev panel fields | “Full name”, “Email” |
| Submit | “Create account” / busy: “Creating your account” |
| Dev panel errors | “Account creation isn't available right now. Try again shortly or contact the team.” / “We could not create the account. Check your connection and try again.” |
| Footer | “Already have an account? Sign in” / “Choose a different role” |
| Photo alt | “A participant writing notes during a research conversation” |

## 11.4 Tester sign-up, step 2 — `/sign-up/tester` (signed in)

| Element | Copy |
|---|---|
| Step indicator | “Step 2 of 2 · Your details” |
| H1 | “Tell us about you.” |
| Intro | “Your experience helps us match you with relevant tests. Your answers go straight to your account.” |
| Signed-in note | “Signed in as {email}” + “Not you?” |
| Body | The tester form — mapped in §14.3 |

## 11.5 Founder sign-up — `/sign-up/founder`

There is no founder sign-up screen. The route redirects to `/contact`, and `/app/founder/*` also redirects there. Copy for a founder account still exists in `SignUpRole.tsx` but is unreachable (see issue #4).

## 11.6 Admin access — `/admin`

**Metadata:** Title `Admin access | RAPID` · Description `Staff access to the RAPID pilot.` · noindex

| Element | Copy |
|---|---|
| H1 | “Pilot admin access” |
| Signed-out body | “Staff accounts are not self-serve. An existing admin invites your email address, then you create an account with that same address.” |
| Signed-out body 2 | “If you are the first admin, your address is on the STAFF_EMAILS allowlist and access is attached the first time you sign in.” |
| CTA → `/admin/sign-up` | “Create an admin account” |
| CTA → `/admin/sign-in` | “I already have an account” |
| Signed-in, no role | “You are signed in as {email}, but that address does not hold staff access.” / “Staff access is granted by an existing admin. Ask them to invite this exact address, then sign in again.” |
| Buttons | “Check again” / “Use another address” |
| Error state | “Try again” / “Sign out” |
| Footer | “Not staff? Join as a tester or founder.” |

## 11.7 Admin sign in — `/admin/sign-in`

**Metadata:** Title `Admin sign in | RAPID` · noindex

| Element | Copy |
|---|---|
| H1 | “Admin sign in” |
| Intro | “Staff only. Sign in with the credentials the team issued to you.” |
| Fields | “Username”, “Password” |
| Submit | “Sign in” / busy: “Signing in” |
| Errors | “That username and password did not match.” / “Admin sign-in is not available on this deployment.” / “We could not sign you in. Check your connection and try again.” |
| Unavailable panel | “Admin sign-in is unavailable here. See admin access or email hello@rapid.africa.” |

## 11.8 Admin sign up — `/admin/sign-up`

**Metadata:** Title `Admin account | RAPID` · Description `Create the account that an existing RAPID admin invited.` · noindex

| Element | Copy |
|---|---|
| H1 (invited) | “Create your admin account” |
| Intro (invited) | “Use the exact email address an admin invited. Access is attached when the account signs in — there is nothing else to accept.” |
| H1 (already signed in, not invited) | “This address is not invited yet” |
| Footer | “Already have the account? Sign in” / “Back to admin access” |

---

# 12. Tester dashboard

Signed-in area. All routes are `noindex`.

## 12.1 Shell — `/app/*`

| Element | Copy |
|---|---|
| Sidebar label | “Your RAPID space” |
| Nav group (multiple roles) | “Workspace” · “Overview” |
| Nav group (tester) | “Tester” · “Overview”, “Invitations”, “History”, “Profile” |
| Nav group (staff) | “Staff” · “Staff dashboard”, “Applications”, “Tests”, “Admins” |
| Nav group (account) | “Account” · “Notifications” (unread count badge, “9+” above nine) |
| User block | `{name}` / `{email}` · “Public site” · “Sign out” |
| Mobile header | “Public site”, sign-out aria-label “Sign out” |
| Unread announcement (screen readers) | “{n} unread notification(s)” |

## 12.2 Overview — `/app/tester`

**Metadata:** Title `Tester account | RAPID` · noindex

| Element | Copy |
|---|---|
| Kicker | “YOUR TESTER SPACE” + brand mark |
| H1 | “Hello, {first name}.” — falls back to “Hello there.” |
| Lead | `{next action from the account}` |
| CTA → `/app/tester/invitations` | “View invitations” |
| Welcome art | “YOUR” / “PERSPECTIVE” · “matters.” |

**Stats**

| Label | Small print |
|---|---|
| “INVITATIONS” | “In your account” |
| “ACTIVE” | “Waiting for you” |
| “COMPLETED” | “Tests completed” |

**Recent invitations panel**

| Element | Copy |
|---|---|
| Panel title | “Recent invitations” |
| Panel action | “View all” |
| Empty title | “No invitations yet” |
| Empty body | “When a test matches your experience, it will appear here and arrive by email. You can read the task and reward before deciding.” |
| Row fallback | Test title or “RAPID test”; reward note or “Reward shared in the terms”; “Invited {date}” |
| Link | “See your test history” |

**Application panel**

| Element | Copy |
|---|---|
| Panel title | “Your application” |
| Labels | “Applied”, “Location”, “Reference” |
| Empty location | “Not added” |

**Profile card**

| Element | Copy |
|---|---|
| Heading | “Make it yours.” |
| Body | “Keep your profile up to date so the team can find the right fit.” |
| Link | “View profile” |

## 12.3 Invitations — `/app/tester/invitations`

**Metadata:** Title `Invitations | RAPID` · noindex

| Element | Copy |
|---|---|
| Eyebrow | “Tester” |
| H1 | “Invitations” |
| Description | “Read the task and terms before you accept. Nothing is shared with a founder until you submit a response.” |
| Loading | “Loading invitations…” |
| List header | “Open and answered” · “{n} total” |
| Empty title | “No invitations yet” |
| Empty body | “Invitations appear here when the team matches you to a test. We also send an email so you do not have to keep checking.” |
| Row meta | “Invited {date}” · reward note or “Reward shared in the terms” |

## 12.4 Invitation detail — `/app/tester/invitations/{id}`

**Metadata:** Title `Invitation | RAPID` · noindex

| Element | Copy |
|---|---|
| Back link | “All invitations” |
| Eyebrow | “Invitation” |
| H1 | Test title or “RAPID test” |
| Description | The test question |
| Panel: task | “The task and terms” |
| Task fallback | “The team will confirm the task details before you start.” |
| Meta | “Reward” → reward note or “No reward stated”; “Invited” → date |

**Status: invited**

| Element | Copy |
|---|---|
| Panel title | “Will you take part?” |
| Panel description | “Accepting records your agreement to the terms above. You can still decline before submitting a response.” |
| Buttons | “Accept invitation” / “Decline” |

**Status: accepted**

| Element | Copy |
|---|---|
| Panel title | “Submit what happened” |
| Panel description | “A short, honest account is more useful than a polished one.” |
| Field 1 | “What happened?” — options: “I tried it”, “I booked a call”, “I agreed to collaborate”, “I did not take action” |
| Field 2 | “Your account of what happened” — hint “Between 20 and 1,000 characters. Say what you did and what got in the way.” — counter “{n}/1000” |
| Consent | “RAPID may share this account as an anonymous quote with the founder. Your name and contact details are never shared.” |
| Submit | “Submit response” / “Saving…” |
| Errors | “This invitation has already been answered.” / “We could not save your answer. Try again.” / “We could not save your response. Try again.” |

**Status: completed**

| Element | Copy |
|---|---|
| Panel title | “Your response” |
| Panel description | “This is what the founder sees, without your name or contact details.” |
| Quote label | “Tester response · {date}” |
| Meta | “Outcome”, “Reward” → “Sent” / “Pending” / “Not applicable” |

**Status: declined**

| Element | Copy |
|---|---|
| Panel title | “Invitation declined” |
| Body | “You declined this test. It will stay in your history and will not affect future invitations.” |

## 12.5 History — `/app/tester/history`

**Metadata:** Title `Test history | RAPID` · noindex

| Element | Copy |
|---|---|
| Eyebrow | “Tester” |
| H1 | “History” |
| Description | “Every test you completed or declined, with the outcome you recorded and the reward status.” |
| Loading | “Loading history…” |
| List header | “Your record” · “{n} test(s)” |
| Empty title | “Nothing here yet” |
| Empty body | “Completed and declined tests will appear here.” |
| Row meta | “Outcome · {label}” or “Outcome · No response”; “Reward · Sent” / “Reward · Pending” |

## 12.6 Profile — `/app/tester/profile`

**Metadata:** Title `Profile | RAPID` · noindex

| Element | Copy |
|---|---|
| Eyebrow | “Tester” |
| H1 | “Profile” |
| Description | “Keep your contact details current so invitations and rewards reach you.” |
| Panel | “Contact details” |
| Fields | “Full name”; “Email” (read-only) + “Email changes are handled by support so an account cannot be taken over.”; “Phone” + “Include your country code.”; “WhatsApp” + “Include your country code.” |
| Checkbox | “You may send WhatsApp reminders about my application and suitable tests.” |
| Submit | “Save profile” / “Saving…” |
| Success | “Profile saved.” |
| Errors | “Check the fields.” / “Could not save.” |
| Panel 2 | “Leaving the pilot” — “Email support to request removal. RAPID anonymises your record, keeps the test counts intact and stops contacting you.” |

## 12.7 Notifications — `/app/notifications`

**Metadata:** Title `Notifications | RAPID` · noindex

| Element | Copy |
|---|---|
| Eyebrow | “Your account” |
| H1 | “Notifications” |
| Description | “{n} unread update(s).” or “Updates about your application, invitations and tests appear here.” |
| Loading | “Loading notifications…” |
| Empty title | “Nothing yet” |
| Empty body | “When the team reviews an application, sends an invitation, publishes findings or marks a reward, the update appears here and is emailed to you.” |
| Row actions | “Open” / “Mark read” |
| Unread indicator (aria) | “Unread” |

## 12.8 Application status copy

Used on the overview, the account picker and staff screens.

| Status code | Label | Sentence |
|---|---|---|
| `received` | “Received” | “We have your application. The team reviews new applications within three business days.” |
| `under_review` | “Under review” | “The team is reviewing your application. We will email you when there is a decision.” |
| `approved` | “Approved” | “You are approved. When a test matches your experience, an invitation will appear here and arrive by email.” |
| `waitlisted` | “Waitlisted” | “You are on the waitlist. We will invite you when a test matches your experience.” |
| `declined` | “Not selected” | “The team cannot offer you a place in the pilot right now. Reply to the decision email if you think this was a mistake.” |
| `withdrawn` | “Withdrawn” | “Your application is withdrawn. Email support if you would like to apply again.” |
| fallback | `{code with underscores removed}` | “The team is reviewing your application.” |

## 12.9 Invitation status labels

| Code | Label |
|---|---|
| `invited` | “Invited” |
| `accepted` | “Accepted” |
| `declined` | “Declined” |
| `completed` | “Completed” |
| `withdrawn` | “Withdrawn” |

## 12.10 Account picker — `/app`

**Metadata:** Title `Your account | RAPID` · noindex

| Element | Copy |
|---|---|
| No profile — H1 | “This account has no profile yet” |
| No profile — body | “You are signed in as {email}. Finish your tester application or contact our team about research.” |
| Card 1 | “Join as a tester” — “Three-minute application. Take part in short research tasks.” |
| Card 2 | “Request a test” — “Tell us what you need to learn and who you need to reach.” |
| Multi-role — H1 | “Where do you want to go?” |
| Multi-role — body | “This account is set up for more than one role. Each view shows different work.” |
| Tester card | “Tester” — “Application {status} · {n} invitation(s)” |
| Staff card | “Staff” — “Review applications and run the pilot.” |

---

# 13. Staff dashboard (internal)

Signed-in staff only, `noindex`. Mapped to page and panel level.

| Route | Eyebrow | H1 | Description |
|---|---|---|---|
| `/staff` | “Staff operations” | “Pilot operations” | “Live counts from the RAPID database. Nothing here is typed in.” |
| `/staff/applications` | “Staff” | “Applications” | “Review tester applications. Decisions notify the applicant by email and in their account.” |
| `/staff/applications/{id}` | “Application” | `{applicant name}`, or “No name” | `{email}` |
| `/staff/tests` | “Staff” | “Tests” | “Scope requests, invite matched testers, review responses and publish findings.” |
| `/staff/tests/{id}` | “Staff test workspace” | `{test title}`, or “Untitled test” | `{founder name} · {founder email}` |
| `/staff/team` | “Staff” | “Admins” | “Staff access is granted by invitation. There is no public admin sign-up.” |

**Panels and empty states**

| Page | Panel titles | Empty states |
|---|---|---|
| `/staff` | “Applications”, “Tests”, “Pilot totals”, “Export” | “The queue is empty” — “New tester applications and founder test requests appear here as they are submitted. No sample records are shown.” |
| `/staff/applications` | “Applicants” | “No applications match these filters” |
| `/staff/applications/{id}` | “Contact”, “Situation”, “Interests”, “What they told us”, “Decision”, “Privacy” | — |
| `/staff/tests` | “All tests” | “No tests match this filter” |
| `/staff/tests/{id}` | “Scope”, “Candidates”, “Invitations and responses”, “Findings” | “No testers to invite here”, “No testers invited yet” |
| `/staff/team` | “How an admin gets in”, “With access”, “Invited, not signed in yet”, “Invite an admin” | “No invitations are waiting.” |

Supporting descriptions carried in the panels:

- Applications — “What this applicant asked to be considered for.”
- Decision — “The applicant receives an in-app notification and an email.”
- Export — “CSV files contain contact details. Download only for a specific operational need, and delete the file afterwards.”
- With access — “Everyone here can review applications and run tests.”
- Invited — “The invite attaches to the account the first time that address signs in.”
- Candidates — “Approved testers who have not been invited to this test.”
- Invitations and responses — “What each invited tester did, in their own words.”
- Findings — “Draft, save, then publish. Publishing notifies the founder and opens their decision control.”
- Scope — “What the founder asked for, and what testers will be told.”

---

# 14. Forms and validation

## 14.1 Shared form behaviour

| Element | Copy |
|---|---|
| Saving overlay | “Hold on — we are saving your answers.” (plus the form’s own “Saving your details”) |
| Save failure | “We could not save your details. Please try again.” |
| Retry pattern | Error sentence, then “Your answers are still here. Retry when you are ready.”, then “Try again” |
| Server validation | “Check the highlighted fields and try again.” |
| Rate limit | “Too many attempts. Please wait a few minutes and try again.” |
| Privacy link target | `/privacy` (opens in a new tab) |

## 14.2 Founder request form

Used on `/contact`, and on the (now redirecting) founder sign-up step.

| Section | Field | Label | Hint / note |
|---|---|---|---|
| About you | Name | “Full name” | Required |
| About you | WhatsApp | “WhatsApp number” | “Include your country code, for example +234 801 234 5678.” |
| About you | Email | “Email (Optional)” or “Email” when pre-filled from an account | “This is the email on your account.” (account only) |
| What you need to learn | Idea | “What do you want to test?” | “What is your idea, and what do you need to learn before your next step?” |
| What you need to learn | Audience | “Who is it for?” | Options: “Students”, “Recent graduates”, “Working adults”, “More than one of these”, “Someone else” |
| What you need to learn | Audience detail | “Tell us who” | “A short description of the people you need to reach.” (shown for “More than one of these” and “Someone else”) |
| Consent | Privacy | “I have read the Privacy Policy and understand RAPID will contact me on WhatsApp about this request.” | Required |
| Submit | — | “Request a call” on `/contact`; “Send my request” with an account | Note below: “No pricing or payment step. We will follow up on WhatsApp.” |

Hidden anti-spam field label (not visible, not read by screen readers): “Company website”.

## 14.3 Tester application form

Used on `/sign-up/tester` step 2.

**About you**

| Field | Label | Hint / note |
|---|---|---|
| Name | “Full name” | Required |
| Email | “Email” | Read-only with an account: “This is the email on your account, so your application and invitations stay together.” |
| Confirm email | “Confirm email” | Required when there is no account |
| Country | “Country” | Required |
| City | “City or state” | Required |
| Age | “Age range” | Placeholder “Select your age range”; options “18–24”, “25–29”, “30–35”, “36 or older” |
| Age confirmation | “I confirm that I am 18 or older.” | Required |

**Your situation**

| Field | Label | Hint / note |
|---|---|---|
| Main situation | “Main situation” | Placeholder “Select your main situation”; hint “Early undergraduate means levels 100–200; late undergraduate means level 300 and above. Recent graduate means within two years.” |
| Other activities | “Other activities” | “Optional. Select anything else that applies. You can study and work at the same time.” |
| School | “School or university” | “Required if your main situation or other activities include undergraduate study or a recent graduate.” |
| Industry | “Industry” | “Required if your main situation or other activities include employed or self-employed.”; placeholder “Select your industry” |
| Industry (other) | “Your industry” | Shown when “Other” is chosen |

Situation options: “Early undergraduate” (Levels 100–200), “Late undergraduate” (Level 300 and above), “Recent graduate” (Within the last two years), “Employed”, “Entrepreneur or self-employed”, “Other”.

**What interests you**

| Field | Label | Hint / note |
|---|---|---|
| Interests | “Interests” | “Choose 1–3.” |
| Interest (other) | “Your interest” | Shown when “Other” is chosen |
| Recent problem | “Tell us about a recent problem” | Hint: “Tell us about a recent problem in your daily life, studies, or work. What happened, and what did you do? A clear answer matters more than fancy writing.” Counter “{n}/800” |

Interest options: “Education”, “Money and finance”, “Work and career”, “Food”, “Health and fitness”, “Transport”, “Housing”, “Technology”, “Entertainment”, “Shopping”, “Other”.

**Contact and consent**

| Field | Label | Hint / note |
|---|---|---|
| WhatsApp | “WhatsApp number (Optional)” | “Include your country code, for example +234 801 234 5678.” |
| Reminders | “You may send me WhatsApp reminders about my application and suitable tests.” | When ticked: “We will use the number above.” |
| Referral | “How did you hear about us?” | Placeholder “Select an option”; options “Friend”, “WhatsApp group”, “X”, “LinkedIn”, “School or hub”, “Other” |
| Privacy | “I have read the Privacy Policy and understand RAPID will use my details to review my application and email me about suitable tests. I can ask to be removed.” | Required |
| Submit | “Request your invite” | Note: “Applying does not guarantee a test or payment.” |

Hidden anti-spam field label: “Company website”.

**Config intro (not rendered)** — “Apply to join RAPID's tester pool. It takes about three minutes. We aim to review applications within three business days.” The visible intro on this step comes from §11.4; keep the two in step if either is edited.

---

# 15. SEO metadata

Page titles and descriptions, in route order.

| Route | Title | Description | Indexed |
|---|---|---|---|
| `/` | RAPID \| User research for founders in Nigeria | Test your startup idea with relevant people in Nigeria. RAPID helps founders plan research, recruit testers and turn feedback into clear next steps. | Yes |
| `/founders` | Startup user research in Nigeria \| RAPID | Recruit relevant testers, validate your startup idea and get actionable user research with RAPID. Request a call with our team. | Yes |
| `/join` | Become a product tester in Nigeria \| RAPID | Join RAPID’s tester community in Nigeria. Share honest feedback on new ideas and see each task and reward before you decide to take part. | Yes |
| `/how-it-works` | How user research works \| RAPID | See how RAPID helps founders scope a product test, recruit relevant testers and turn their feedback into actionable findings. | Yes |
| `/about` | About RAPID \| Human-centred research in Nigeria | Meet RAPID: a human-led research service connecting founders with relevant testers to inform better product decisions. | Yes |
| `/contact` | Request a research call \| RAPID | Tell RAPID what you are building and request a call to discuss customer research and product testing in Nigeria. | Yes |
| `/privacy` | Privacy Policy \| RAPID | How the RAPID pilot website collects, uses and protects tester applications and founder requests. | Yes |
| `/thanks/tester` | Thanks for applying \| RAPID | — | No |
| `/thanks/founder` | Thanks for your request \| RAPID | — | No |
| `/sign-in` | Sign in \| RAPID | Sign in to RAPID to see your application, invitations and test findings. | No |
| `/sign-up` | Create your account \| RAPID | Create a tester account or talk to the RAPID team about research. | Yes |
| `/sign-up/tester` | Create your tester account \| RAPID | The step-one intro line. | No |
| `/admin`, `/admin/sign-in`, `/admin/sign-up` | Admin access / Admin sign in / Admin account \| RAPID | Staff access to the RAPID pilot. | No |
| `/app/*`, `/staff/*` | Per-screen titles (`Tester account`, `Invitations`, `Profile`, `Staff`, …) | — | No |
| Unmatched route | Page not found \| RAPID | — | No |

---

# 16. Issues found while mapping

Ordered by what would cost the most if it shipped.

1. **The privacy policy prints a localhost URL.** “Website:” renders `localhost:5199` in this build. It falls back to `window.location.origin`/`VITE_SITE_URL`; the variable must be set at build time or the published legal page will show a local address.

2. **The founder form has two different submit labels.** On `/contact` the button says “Request a call”; the configured label is “Send my request”. The configured one only appears with an account, which no longer exists — so the configuration is effectively dead and the page’s own label is the real one.

3. **Founder account copy is unreachable.** `/sign-up/founder` redirects to `/contact`, and `/app/founder/*` redirects there too. `ROLE_COPY.founder`, `FounderOverview`, `FounderNewTest`, `FounderProfile` and `FounderTestDetail` still contain copy but no route reaches them. Either delete them or say plainly that founders never sign in.

4. **“RAPID is the same pilot for both.”** appears on both thank-you pages. It is ambiguous — same pilot for both audiences, or both sides of one study? Worth rewriting or removing.

5. **Ordering differs between surfaces.** The header, footer and homepage cards lead with founders. The sign-up picker numbers testers as 01 and founders as 02.

6. **Dead marketing copy in `pilot.ts`.** `HOME`, `TESTER_PAGE` and `FOUNDER_PAGE` are not imported anywhere; `ProductPreview` and its `SAMPLE` data are unrendered. Editing them changes nothing on screen. They are the most likely place for a future edit to silently go nowhere.

7. **The staff door exposes an implementation detail.** `/admin` prints `STAFF_EMAILS` at visitors. It is `noindex`, but the page is public; the env-var name belongs in a runbook, not in a page.

8. **Two product names for the same action.** “Start a project” (header), “Let’s test your idea” (hero), “Request a call” (founders), “Talk to the team” (closing). All lead to `/contact`; the variety is stylistic, but the noun shifts between *project*, *test* and *call*.

**Fixed since this map was written**

- **404 link labels** now read “For testers” and “For founders”, matching the header, instead of the retired “Request your invite” / “Request a test”.
- **Founder thank-you line** now says “A person reads every request.”; the tester page keeps “application”.
- **Sign-in naming** is “Sign in” everywhere — desktop header, mobile header, footer and the sign-up footer.

**Consistency that is working:** “three business days”, “18 or older”, “no pricing or payment step”, “anonymised” and “Illustrative photograph” are used consistently across public pages, forms and legal copy.

---

# 17. Source map

| Surface | File |
|---|---|
| Header, footer, skip link | `src/components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, `SkipLink.tsx` |
| Home | `src/pages/Home.tsx` |
| Founders | `src/pages/Founders.tsx` |
| Testers | `src/pages/Join.tsx` |
| How it works | `src/pages/HowItWorks.tsx` |
| About | `src/pages/About.tsx` |
| Contact | `src/pages/Contact.tsx` |
| Thank-you | `src/pages/Thanks.tsx` |
| 404 | `src/pages/NotFound.tsx` |
| Privacy policy | `src/pages/Privacy.tsx` (`POLICY` array) |
| FAQs, shared labels, thank-you and 404 strings | `src/content/pilot.ts` |
| Sign in | `src/pages/SignIn.tsx` |
| Sign-up picker and role steps | `src/pages/SignUp.tsx`, `src/pages/SignUpRole.tsx` |
| Admin access | `src/pages/Admin.tsx`, `AdminSignIn.tsx`, `AdminSignUp.tsx` |
| Founder form | `src/components/forms/FounderForm.tsx` |
| Tester form | `src/components/forms/TesterForm.tsx` |
| Field labels, hints, required marker | `src/components/forms/Field.tsx` |
| Saving overlay | `src/components/forms/SubmitOverlay.tsx` |
| Dashboard shell and navigation | `src/pages/app/AppLayout.tsx` |
| Tester screens | `src/pages/app/TesterOverview.tsx`, `TesterInvitations.tsx`, `TesterInvitationDetail.tsx`, `TesterHistory.tsx`, `TesterProfile.tsx`, `Notifications.tsx` |
| Shared dashboard components | `src/pages/app/Ui.tsx` |
| Status and invitation labels | `src/pages/app/application-status.ts`, `src/pages/app/status.ts` |
| Staff screens | `src/pages/app/Staff*.tsx` |
| Page metadata | `usePageMeta` calls at the top of each page |

---

*End of map.*
