import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/ui/Logo';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { cn } from '@/lib/cn';

interface PolicySection {
  id: string;
  num: number;
  title: string;
  body: ReactNode;
}

const pClass = 'text-[17px] leading-[1.7] text-light-muted';
const ulClass =
  'list-disc space-y-2 pl-6 text-[17px] leading-[1.7] text-light-muted marker:text-sand-400';

/** Contact details come from the same env vars the footer uses. */
function ContactBlock() {
  const email =
    (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || 'hello@rapid.africa';
  const siteUrl =
    (import.meta.env.VITE_SITE_URL as string | undefined) || window.location.origin;
  const linkClass =
    'break-all text-brand-700 underline underline-offset-2 transition-colors hover:text-ink';

  return (
    <div className="mt-5 rounded-2xl border border-sand-200 bg-white p-6 shadow-elev-1">
      <p className="mb-3 text-[17px] font-bold text-ink">RAPID</p>
      <dl className="space-y-2 text-[15px] text-light-muted">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-bold text-ink">Email:</dt>
          <dd>
            <a href={`mailto:${email}`} className={linkClass}>
              {email}
            </a>
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-bold text-ink">Country of operation:</dt>
          <dd>Nigeria</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-bold text-ink">Website:</dt>
          <dd>
            <a href={siteUrl} className={linkClass}>
              {siteUrl.replace(/^https?:\/\//, '')}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}

const POLICY: PolicySection[] = [
  {
    id: 'collect',
    num: 1,
    title: 'Information We Collect',
    body: (
      <>
        <p className={pClass}>
          When you use RAPID, we may collect information you provide directly to us. This may
          include:
        </p>
        <ul className={ulClass}>
          <li>Your name and email address</li>
          <li>Your role as a founder, validator, or both</li>
          <li>Your interests, skills, industry, and areas of experience</li>
          <li>Your location at a general city, state, or country level</li>
          <li>Information about problems or products you are interested in</li>
          <li>Founder pitches, idea descriptions, images, and videos</li>
          <li>Survey and interview responses</li>
          <li>Feedback you provide on ideas</li>
          <li>
            Actions such as showing interest, joining a waitlist, booking a call, requesting
            collaboration, or participating in a test
          </li>
          <li>Messages or other information you choose to share through RAPID</li>
        </ul>
        <p className={pClass}>
          We may also collect basic technical information such as your device type, browser,
          pages visited, and how you interact with the platform.
        </p>
      </>
    ),
  },
  {
    id: 'use',
    num: 2,
    title: 'How We Use Your Information',
    body: (
      <>
        <p className={pClass}>
          We use your information to operate and improve RAPID. This includes using information
          to:
        </p>
        <ul className={ulClass}>
          <li>Create and manage your account</li>
          <li>Match founders with relevant validators</li>
          <li>Recommend ideas, tests, or opportunities</li>
          <li>Help founders understand demand for their ideas</li>
          <li>Produce validation reports and insights</li>
          <li>Improve RAPID&#39;s matching system</li>
          <li>Improve recommendations based on activity and feedback</li>
          <li>Prevent spam, fraud, abuse, and misuse</li>
          <li>Communicate important updates about RAPID</li>
          <li>Understand how people use the platform</li>
        </ul>
        <p className={pClass}>We do not sell your personal information to advertisers.</p>
      </>
    ),
  },
  {
    id: 'matching',
    num: 3,
    title: 'Matching and AI',
    body: (
      <>
        <p className={pClass}>
          RAPID may use automated systems and artificial intelligence to help match founders with
          suitable validators.
        </p>
        <p className={pClass}>
          For example, our systems may consider information such as your interests, selected
          problems, industry, skills, previous interactions, and the types of products you have
          chosen to test.
        </p>
        <p className={pClass}>These systems are designed to make matching more relevant over time.</p>
        <p className={pClass}>
          Automated matching does not mean every recommendation will be perfect. Users remain free
          to choose whether they want to participate in any validation activity.
        </p>
      </>
    ),
  },
  {
    id: 'founder-content',
    num: 4,
    title: 'Founder Ideas and Content',
    body: (
      <>
        <p className={pClass}>
          Founders may submit information about ideas they want to validate. Some of this
          information may be shown to validators who have been selected or matched with the
          experiment.
        </p>
        <p className={pClass}>
          Founders should avoid submitting passwords, highly confidential business information,
          trade secrets, or information they are not comfortable sharing with selected
          participants.
        </p>
        <p className={pClass}>
          RAPID will aim to limit access to founder experiments to relevant users where
          appropriate, but we cannot guarantee that an idea shared with another person will never
          be copied, discussed, or disclosed by that person.
        </p>
      </>
    ),
  },
  {
    id: 'validators',
    num: 5,
    title: 'Validator Information',
    body: (
      <>
        <p className={pClass}>Validators control the information they choose to provide to RAPID.</p>
        <p className={pClass}>
          Information such as interests, skills, industry, or problem areas may be used to decide
          which experiments are relevant to them.
        </p>
        <p className={pClass}>
          Founders may receive information about validator responses and actions. Where possible,
          RAPID may provide this information as summaries, statistics, or profiles rather than
          exposing unnecessary personal information.
        </p>
      </>
    ),
  },
  {
    id: 'uploads',
    num: 6,
    title: 'Videos, Images and Uploaded Content',
    body: (
      <>
        <p className={pClass}>
          If you upload videos, images, documents, or other content, we may store and process them
          so that RAPID can provide the service. For example, a founder&#39;s pitch video may be
          shown to matched validators.
        </p>
        <p className={pClass}>You should only upload content that you have the right to share.</p>
      </>
    ),
  },
  {
    id: 'payments',
    num: 7,
    title: 'Payments',
    body: (
      <>
        <p className={pClass}>RAPID may use third-party payment providers to process payments.</p>
        <p className={pClass}>
          Payment providers may collect information such as your payment method, billing details,
          and transaction information.
        </p>
        <p className={pClass}>
          RAPID does not need to directly store your full debit or credit card details when
          payments are handled by an approved payment provider.
        </p>
        <p className={pClass}>The payment provider&#39;s own privacy policy may also apply.</p>
      </>
    ),
  },
  {
    id: 'sharing',
    num: 8,
    title: 'When We Share Information',
    body: (
      <>
        <p className={pClass}>
          We may share information with trusted service providers that help us operate RAPID.
          These may include providers for:
        </p>
        <ul className={ulClass}>
          <li>Cloud hosting</li>
          <li>Email delivery</li>
          <li>Analytics</li>
          <li>Authentication</li>
          <li>Payment processing</li>
          <li>AI and data processing</li>
          <li>Customer support</li>
        </ul>
        <p className={pClass}>
          These providers should only receive information needed to perform their services.
        </p>
        <p className={pClass}>
          We may also disclose information where required by law, to protect users, investigate
          fraud or abuse, or protect RAPID&#39;s legal rights.
        </p>
      </>
    ),
  },
  {
    id: 'no-sale',
    num: 9,
    title: 'We Do Not Sell Your Personal Data',
    body: (
      <>
        <p className={pClass}>RAPID does not sell your personal information.</p>
        <p className={pClass}>
          We also do not allow advertisers to purchase your private founder or validator
          information directly from us.
        </p>
        <p className={pClass}>
          If this changes in the future, this Privacy Policy will be updated and users will be
          informed where required.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    num: 10,
    title: 'Data Retention',
    body: (
      <>
        <p className={pClass}>
          We keep personal information only for as long as reasonably necessary to provide RAPID,
          improve the service, meet legal requirements, resolve disputes, and maintain appropriate
          business records.
        </p>
        <p className={pClass}>
          Some information may remain in backups for a limited period after deletion.
        </p>
      </>
    ),
  },
  {
    id: 'rights',
    num: 11,
    title: 'Your Choices and Rights',
    body: (
      <>
        <p className={pClass}>Depending on where you live, you may have the right to:</p>
        <ul className={ulClass}>
          <li>Ask what personal information we hold about you</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Withdraw certain permissions</li>
          <li>Object to certain uses of your information</li>
          <li>Request a copy of your information</li>
          <li>Close your RAPID account</li>
        </ul>
        <p className={pClass}>
          To make a privacy request, contact us using the details at the bottom of this page.
        </p>
        <p className={pClass}>
          Some information may need to be kept where required by law or for legitimate security,
          fraud-prevention, or record-keeping purposes.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    num: 12,
    title: 'Security',
    body: (
      <>
        <p className={pClass}>
          We use reasonable technical and organisational measures to protect information stored on
          RAPID. However, no online platform can guarantee complete security.
        </p>
        <p className={pClass}>
          Users should also protect their passwords, devices, and account information.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    num: 13,
    title: 'Cookies and Analytics',
    body: (
      <>
        <p className={pClass}>
          RAPID may use cookies or similar technologies to keep users signed in, remember
          preferences, measure website activity, and understand how the platform is being used.
        </p>
        <p className={pClass}>
          Where required, users may be given choices about optional cookies and analytics.
        </p>
      </>
    ),
  },
  {
    id: 'international',
    num: 14,
    title: 'International Data Processing',
    body: (
      <>
        <p className={pClass}>
          RAPID may use technology providers located in different countries. This means
          information may sometimes be processed or stored outside the country where you live.
        </p>
        <p className={pClass}>
          Where required, we will take reasonable steps to protect information when it is
          transferred internationally.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    num: 15,
    title: 'Children&#39;s Privacy',
    body: (
      <>
        <p className={pClass}>
          RAPID is not intended for children under the minimum age required to legally use the
          service in their country.
        </p>
        <p className={pClass}>
          Where RAPID requires users to be at least 18 years old, users must confirm that they
          meet this requirement before creating an account.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    num: 16,
    title: 'Changes to This Policy',
    body: (
      <>
        <p className={pClass}>RAPID may update this Privacy Policy as the platform changes.</p>
        <p className={pClass}>
          If we make important changes, we may notify users through the website, app, email, or
          another reasonable method.
        </p>
        <p className={pClass}>
          The latest version will always show its most recent update date.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    num: 17,
    title: 'Contact Us',
    body: (
      <>
        <p className={pClass}>
          If you have questions about this Privacy Policy, your personal information, or how RAPID
          handles data, contact:
        </p>
        <ContactBlock />
      </>
    ),
  },
];

const POLICY_IDS = POLICY.map((section) => section.id);

export default function Privacy() {
  const activeId = useScrollSpy(POLICY_IDS, 140);

  return (
    <div className="min-h-screen">
      {/* Sticky bar — same glass treatment as the home header */}
      <header className="glass-dark sticky top-0 z-40 h-16 border-b border-white/10">
        <Container className="flex h-full items-center justify-between">
          <a href="/" aria-label="RAPID home">
            <Logo size={28} />
          </a>
          <a
            href="/"
            className="text-sm font-semibold text-dark-text transition-colors hover:text-brand-500"
          >
            ← Back to home
          </a>
        </Container>
      </header>

      {/* Document hero — dark, matching the home page's opening mood */}
      {/* aria-labelledby makes this <section> a region landmark (axe: region rule) */}
      <section className="surface-dark" aria-labelledby="policy-title">
        <Container className="py-14 lg:py-20">
          <h1 id="policy-title" className="t-statement mb-4 text-dark-text">
            Privacy Policy
          </h1>
          <p className="mb-8 text-sm text-dark-muted">Last updated: September 22, 2026</p>
          <p className="lead mb-4">
            RAPID respects your privacy. This Privacy Policy explains what information we collect,
            why we collect it, how we use it, and the choices you have when using RAPID.
          </p>
          <p className="max-w-[58ch] text-[17px] text-dark-muted">
            RAPID is a platform that helps founders test ideas with people who may actually use,
            buy, support, or help shape those ideas.
          </p>
        </Container>
      </section>

      {/* Document */}
      <main className="surface-light seam-hairline on-light py-12 lg:py-16">
        <Container>
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
            {/* Contents rail */}
            <aside className="shrink-0 lg:w-[260px]">
              <details className="group mb-8 rounded-2xl border border-sand-200 bg-white shadow-elev-1 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold text-ink [&::-webkit-details-marker]:hidden">
                  On this page
                  <ChevronDown
                    size={16}
                    className="text-light-muted transition-transform group-open:rotate-180"
                  />
                </summary>
                <ul className="space-y-1 border-t border-sand-100 px-5 py-3">
                  {POLICY.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block py-1.5 text-sm text-light-muted transition-colors hover:text-ink"
                      >
                        {section.num}. {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>

              <nav
                aria-label="Privacy policy contents"
                className="sticky top-[88px] hidden lg:block"
              >
                <p className="mb-3 text-[13px] font-bold text-light-muted">Contents</p>
                <ul className="max-h-[calc(100vh-160px)] space-y-1 overflow-y-auto hide-scrollbar">
                  {POLICY.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className={cn(
                          'block border-l-2 border-sand-200 py-1 pl-3 text-sm leading-snug transition-colors',
                          activeId === section.id
                            ? 'border-brand-500 font-semibold text-ink'
                            : 'text-light-muted hover:text-ink'
                        )}
                      >
                        {section.num}. {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Policy text */}
            <div className="min-w-0 max-w-[760px] flex-1">
              {POLICY.map((section) => (
                <section key={section.id} id={section.id} className="mb-10 lg:mb-12">
                  <h2 className="mb-4 text-[26px] font-extrabold tracking-[-.02em] text-ink lg:text-[30px]">
                    {section.num}. {section.title}
                  </h2>
                  <div className="space-y-4">{section.body}</div>
                </section>
              ))}

              <div className="h-px bg-sand-200" />
              <p className={cn(pClass, 'mt-8')}>
                By using RAPID, you acknowledge that you have read this Privacy Policy and
                understand how your information may be collected and used.
              </p>
            </div>
          </div>
        </Container>
      </main>

      <footer className="surface-dark py-6" role="contentinfo">
        <Container className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <Logo size={22} />
          <p className="text-xs text-dark-muted/70">© RAPID. Nigeria pilot.</p>
        </Container>
      </footer>
    </div>
  );
}
