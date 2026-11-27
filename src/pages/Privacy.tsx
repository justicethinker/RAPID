import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { PRIVACY_LAST_UPDATED, PRIVACY_VERSION } from '@/content/pilot';
import { supportEmail, supportEmailHref } from '@/lib/site';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { cn } from '@/lib/cn';

interface PolicySection {
  id: string;
  num: number;
  title: string;
  body: ReactNode;
}

const p = 'text-[17px] leading-[1.7] text-ink-soft';
const ul = 'list-disc space-y-2 pl-6 text-[17px] leading-[1.7] text-ink-soft marker:text-cream-400';
const link =
  'font-semibold text-rapid-700 underline underline-offset-2 transition-colors hover:text-ink';

function ContactBlock() {
  const configured = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(
    /\/+$/,
    '',
  );
  // Never print a local preview address in a published legal page.
  const siteUrl =
    configured && !/localhost|127\.0\.0\.1/.test(configured)
      ? configured
      : 'https://rapid.africa';

  return (
    <div className="mt-5 rounded-2xl border border-cream-200 bg-cream-50 p-6">
      <p className="mb-3 text-[17px] font-bold text-ink">RAPID</p>
      <dl className="space-y-2 text-[15px] text-ink-soft">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-bold text-ink">Email:</dt>
          <dd>
            <a href={supportEmailHref} className={link}>
              {supportEmail}
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
            <a href={siteUrl} className={link}>
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
    id: 'about',
    num: 1,
    title: 'About this notice',
    body: (
      <>
        <p className={p}>
          This notice explains what the RAPID pilot website collects, why we collect it, and the
          choices you have. It covers tester applications and founder requests submitted through
          this site.
        </p>
        <p className={p}>
          RAPID is running a small pilot to learn whether we can find suitable people, get useful
          participation, and help founders make clearer decisions with less outreach effort. Testers
          and founders now have accounts, so this notice also covers sign-in, invitations, responses
          and the status shown in each dashboard.
        </p>
      </>
    ),
  },
  {
    id: 'collect',
    num: 2,
    title: 'Information we collect',
    body: (
      <>
        <p className={p}>
          <strong className="font-semibold text-ink">If you apply to be a tester</strong>, we
          collect your name, email address, country, city or state, age range, confirmation that
          you are 18 or older, main situation, optional other activities, school or university
          where relevant, industry where relevant, 1–3 interests, your answer about a recent
          problem, optional WhatsApp number and reminder consent, how you heard about us, and your
          privacy acknowledgement and its time.
        </p>
        <p className={p}>
          <strong className="font-semibold text-ink">If you request a test as a founder</strong>,
          we collect your name, WhatsApp number, optional email address, what you want to test, who
          the test is for, any short description you add, and your privacy acknowledgement and its
          time.
        </p>
        <p className={p}>
          <strong className="font-semibold text-ink">Technical and source information</strong> may
          include the form type, submission time, a random submission identifier, schema and privacy
          versions, landing path, and approved source, medium and campaign tags. Analytics records
          page views, button clicks, form starts, validation error field codes, save failures and
          confirmed new records. On public startup pages we also count profile views, post
          impressions and post opens for the founder. These counts use a random key stored in your
          browser to avoid counting the same browser twice for the same item on the same day; the
          key is not linked to your account, email address or IP address.
        </p>
        <p className={p}>
          <strong className="font-semibold text-ink">If you sign in</strong>, our identity provider
          processes your email address and a verification code. We store the resulting account ID,
          your verified email address and the profile details above. We never receive or store a
          password. We record invitations you receive, whether you accept or decline, the response
          you submit, any quote consent you give, and the reward status staff record.
        </p>
        <p className={p}>
          We do not send names, email addresses, phone numbers, written answers or raw tracking URLs
          to analytics. We do not collect identity numbers, income, home addresses or payment
          details.
        </p>
      </>
    ),
  },
  {
    id: 'use',
    num: 3,
    title: 'How we use your information',
    body: (
      <>
        <p className={p}>We use your information to:</p>
        <ul className={ul}>
          <li>Review your application and decide whether the pilot is a fit.</li>
          <li>Find suitable tests and email you about them.</li>
          <li>Contact founders on WhatsApp about a request.</li>
          <li>Run your account, show your application status and deliver invitations.</li>
          <li>Collect responses, record outcomes and share findings with the relevant founder.</li>
          <li>Record reward status so you can see whether a reward has been sent.</li>
          <li>Keep the records needed to run and review the pilot.</li>
          <li>Prevent spam, duplicate submissions and misuse of the forms.</li>
          <li>Understand how the website is used and improve it.</li>
        </ul>
        <p className={p}>
          The pilot uses team review. We do not use automated matching to decide who is accepted.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    num: 4,
    title: 'Email, WhatsApp and the optional group',
    body: (
      <>
        <p className={p}>
          Tasks arrive by email. WhatsApp reminders are optional and are only sent if you tick the
          reminder box and give a number. You can withdraw that consent at any time, and we will stop
          reminders after you decline or withdraw.
        </p>
        <p className={p}>
          After acceptance, we may offer an optional WhatsApp group. Members can see each other&#39;s
          phone numbers. The group is administered, join requests are checked against accepted
          applicants, and task answers or member contact lists are not posted there. Group membership
          has no effect on eligibility or rewards.
        </p>
      </>
    ),
  },
  {
    id: 'eligibility',
    num: 5,
    title: 'Who can use RAPID',
    body: (
      <p className={p}>
        The pilot is for adults aged 18 or above. We ask every tester to confirm their age before
        applying. Each test also has its own requirements.
      </p>
    ),
  },
  {
    id: 'sharing',
    num: 6,
    title: 'Who we share it with',
    body: (
      <>
        <p className={p}>
          We use service providers to run the pilot website and store the records. These currently
          include Vercel for hosting and server functions, Neon for the Postgres database, Clerk for
          passwordless sign-in, Resend for transactional email, and privacy-friendly analytics where
          enabled. Providers receive only what they need to perform their service.
        </p>
        <p className={p}>
          We may share relevant, anonymous findings with the founder who commissioned a test. The
          founder sees counts, outcomes and anonymised quotes only where the tester explicitly
          consented. We do not share names or contact details with a founder.
        </p>
        <p className={p}>
          We do not sell personal information. We may disclose information where required by law, to
          protect users, investigate abuse, or protect RAPID&#39;s legal rights.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    num: 7,
    title: 'Retention and deletion',
    body: (
      <>
        <p className={p}>
          We keep account and application records while the pilot runs and for up to 12 months after
          your last activity. Declined or inactive tester records are anonymised after 12 months
          unless there is a legal or operational reason to keep them longer. Invitation and response
          rows are kept without contact details so founder counts remain accurate.
        </p>
        <p className={p}>
          If you ask to be removed, we anonymise your person record in place: name, email, phone and
          written answers are cleared, and the account can no longer sign in. Counts stay intact.
          Some information may remain in backups for a limited period.
        </p>
      </>
    ),
  },
  {
    id: 'rights',
    num: 8,
    title: 'Your choices and rights',
    body: (
      <>
        <p className={p}>You can ask us to:</p>
        <ul className={ul}>
          <li>Tell you what personal information we hold about you.</li>
          <li>Correct inaccurate information.</li>
          <li>Delete your information.</li>
          <li>Withdraw WhatsApp reminder consent.</li>
          <li>Stop contacting you about tests or the pilot.</li>
        </ul>
        <p className={p}>
          To make a request, contact{' '}
          <a href={supportEmailHref} className={link}>
            {supportEmail}
          </a>
          . Some information may need to be kept where required by law or for legitimate security
          and record-keeping purposes.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    num: 9,
    title: 'Security',
    body: (
      <p className={p}>
        We use reasonable technical and organisational measures to protect the information we hold.
        Access to application records is limited to named team members. No online service can
        guarantee complete security.
      </p>
    ),
  },
  {
    id: 'analytics',
    num: 10,
    title: 'Cookies and analytics',
    body: (
      <>
        <p className={p}>
          Signing in uses essential cookies set by our identity provider. They keep you signed in
          and protect the session; they are not used for advertising. Server-side sessions are
          HttpOnly, Secure in production and SameSite=Lax.
        </p>
        <p className={p}>
          We use privacy-friendly analytics that does not use advertising cookies and does not build
          profiles across websites. We record page paths and limited interaction events, not the
          answers you type into a form, and authenticated dashboard paths are excluded. Our
          first-party audience counts use a random browser-local key described above, not an
          advertising cookie. If our analytics approach changes, we will update this notice and
          provide any choices required by law.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    num: 11,
    title: 'Changes to this notice',
    body: (
      <p className={p}>
        We may update this notice as the pilot changes. The latest version will show its revision
        date at the top. If a change materially affects how we use your information, we will take
        reasonable steps to tell you before it applies.
      </p>
    ),
  },
  {
    id: 'contact-us',
    num: 12,
    title: 'Contact us',
    body: (
      <>
        <p className={p}>
          If you have questions about this notice, your personal information, or how RAPID handles
          data, contact:
        </p>
        <ContactBlock />
      </>
    ),
  },
];

const POLICY_IDS = POLICY.map((section) => section.id);

export default function Privacy() {
  const activeId = useScrollSpy(POLICY_IDS, 140);
  usePageMeta({
    title: 'Privacy Policy | RAPID',
    description:
      'How the RAPID pilot website collects, uses and protects tester applications and founder requests.',
  });

  return (
    <PageShell>
      <section className="relative border-b border-cream-200 bg-cream-100" aria-labelledby="policy-title">
        <Container className="py-12 lg:py-16">
          <p className="kicker">Legal</p>
          <h1 id="policy-title" className="t-section mt-3 text-ink">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Last updated: {PRIVACY_LAST_UPDATED} · Notice version {PRIVACY_VERSION}
          </p>
          <p className="lead mt-5">
            RAPID respects your privacy. This notice explains what the pilot website collects, why
            we collect it, and the choices you have.
          </p>
        </Container>
      </section>

      <Container className="py-12 lg:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <aside className="shrink-0 lg:w-[250px]">
            <details className="group mb-8 rounded-2xl border border-cream-200 bg-white lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold text-ink [&::-webkit-details-marker]:hidden">
                On this page
                <ChevronDown
                  size={16}
                  className="text-ink-soft transition-transform group-open:rotate-180"
                />
              </summary>
              <ul className="space-y-1 border-t border-cream-200 px-5 py-3">
                {POLICY.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block py-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {section.num}. {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </details>

            <nav aria-label="Privacy policy contents" className="sticky top-[88px] hidden lg:block">
              <p className="mb-3 text-[13px] font-bold text-ink-soft">Contents</p>
              <ul className="max-h-[calc(100vh-160px)] space-y-1 overflow-y-auto">
                {POLICY.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={cn(
                        'block border-l-2 border-cream-200 py-1 pl-3 text-sm leading-snug transition-colors',
                        activeId === section.id
                          ? 'border-rapid-600 font-semibold text-ink'
                          : 'text-ink-soft hover:text-ink',
                      )}
                    >
                      {section.num}. {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0 max-w-[760px] flex-1">
            {POLICY.map((section) => (
              <section key={section.id} id={section.id} className="mb-10 lg:mb-12">
                <h2 className="font-display mb-4 text-[24px] font-bold tracking-[-.02em] text-ink lg:text-[28px]">
                  {section.num}. {section.title}
                </h2>
                <div className="space-y-4">{section.body}</div>
              </section>
            ))}

            <div className="h-px bg-cream-200" />
            <p className={cn(p, 'mt-8')}>
              By using the pilot website, you acknowledge that you have read this notice and
              understand how your information may be collected and used.
            </p>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
