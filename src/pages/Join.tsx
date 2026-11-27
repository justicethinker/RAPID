import { Link } from 'react-router-dom';
import { ArrowUpRight, BadgeCheck, Clock3, Coins, Eye, GraduationCap, Briefcase, Lock, MessageSquareText, RefreshCcw, Sparkles, Store } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { Faq } from '@/components/site/Faq';
import { Marquee } from '@/components/site/Marquee';
import { Reveal, Stagger } from '@/components/motion/Reveal';
import { SAMPLE, TESTER_FAQ } from '@/content/pilot';
import { usePageMeta } from '@/hooks/usePageMeta';

const WHO = [
  { icon: GraduationCap, label: 'Students' },
  { icon: BadgeCheck, label: 'Recent graduates' },
  { icon: Briefcase, label: 'Working adults' },
  { icon: Store, label: 'Traders & self-employed' },
];

const TERMS = [
  { icon: Eye, title: 'See the task first', body: 'Every invitation explains what to do and how long it takes before you decide.' },
  { icon: Coins, title: 'See the reward first', body: 'Any reward and its payment timing are shown before you accept. Invitations depend on the research and your experience.' },
  { icon: Lock, title: 'Your details stay private', body: 'Your contact details stay with RAPID. Founders only see anonymised responses.' },
];

const IMPACT = [
  { icon: MessageSquareText, title: 'You shared a blocker', body: '“I need to choose a pickup time.”' },
  { icon: RefreshCcw, title: 'The founder changed it', body: 'Pickup times were added to the next version.' },
  { icon: Sparkles, title: 'You saw the update', body: 'The next test showed what changed.' },
];

function InvitationCard() {
  const invitation = SAMPLE.invitation;
  return (
    <div className="w-[290px] rounded-[22px] bg-white p-5 text-ink shadow-float sm:w-[320px]">
      <div className="flex items-center justify-between text-xs font-semibold text-ink-faint">
        <span className="flex items-center gap-2">
          <span className="live-dot" aria-hidden="true" />
          New invitation
        </span>
        <span className="rounded-full bg-cream-100 px-2 py-0.5">Example</span>
      </div>
      <p className="mt-3 font-display text-[22px] font-bold leading-tight tracking-[-0.02em]">{invitation.title}</p>
      <p className="mt-1 text-sm text-ink-soft">{invitation.body}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-cream-50 px-3 py-2.5 text-sm font-semibold">
          <Clock3 size={15} aria-hidden="true" className="text-rapid-700" />
          {invitation.duration}
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-cream-50 px-3 py-2.5 text-sm font-semibold">
          <Coins size={15} aria-hidden="true" className="text-rapid-700" />
          {invitation.reward}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <span className="flex-1 rounded-full bg-sun-500 py-2.5 text-center text-sm font-semibold text-ink">{invitation.accept}</span>
        <span className="rounded-full px-3 py-2.5 text-sm font-semibold text-ink-soft ring-1 ring-cream-200">Decline</span>
      </div>
    </div>
  );
}

export default function Join() {
  usePageMeta({
    title: 'Test new products in Nigeria | RAPID',
    description:
      'Join RAPID’s tester pool in Nigeria. Try new ideas, give honest feedback and see the task and any reward before you accept.',
  });

  return (
    <PageShell overlayHeader>
      {/* Hero */}
      <section className="on-dark relative isolate flex min-h-[94svh] flex-col overflow-hidden bg-rapid-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Photo
            name="tester"
            alt=""
            sizes="100vw"
            width={1200}
            height={896}
            priority
            className="ken-burns h-full w-full object-cover object-[65%_30%]"
          />
          <div className="hero-scrim absolute inset-0" />
          <div className="grain absolute inset-0" />
        </div>
        <Container className="relative flex w-full flex-1 flex-col justify-end gap-10 pb-12 pt-32 lg:flex-row lg:items-end lg:justify-between lg:pb-20">
          <div className="hero-stagger max-w-[680px]">
            <p className="kicker">For testers</p>
            <h1 className="t-hero mt-6">
              Try new ideas. <span className="t-serif text-sun-300">Get heard.</span>
            </h1>
            <p className="mt-6 max-w-[520px] text-[18px] leading-relaxed text-cream-100 sm:text-[20px]">
              Test products before they launch, tell founders what you really think and help shape what gets built. Some
              tasks come with a reward.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink to="/sign-up/tester" size="lg" showArrow>
                Become a tester
              </ButtonLink>
              <ButtonLink to="/sign-in" size="lg" variant="inverse">
                I’m already a tester
              </ButtonLink>
            </div>
            <p className="mt-5 text-sm text-rapid-100">Free to apply · Adults 18+ · Applying does not guarantee a place.</p>
          </div>
          <InvitationCard />
        </Container>
      </section>

      {/* Who */}
      <section className="py-24 sm:py-32">
        <Container>
          <Reveal className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <h2 className="t-section text-ink">
              You don’t need a title. <span className="t-serif text-rapid-700">Just an honest opinion.</span>
            </h2>
            <div className="space-y-4">
              <p className="lead">
                If you live in Nigeria, you know things founders need to hear. Apply, tell us about yourself, and we’ll
                invite you when a test fits. Each time, you decide.
              </p>
              <Link to="/sign-up/tester" className="text-arrow">
                Create your account <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
          <Stagger className="mt-12 flex flex-wrap gap-3">
            {WHO.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="lift inline-flex items-center gap-3 rounded-full bg-white py-2.5 pl-2.5 pr-6 font-display text-[18px] font-semibold tracking-[-0.01em] text-ink ring-1 ring-cream-200 sm:text-[20px]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rapid-50 text-rapid-700">
                  <Icon size={18} aria-hidden="true" />
                </span>
                {label}
              </span>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Your terms */}
      <section aria-labelledby="terms-heading" className="on-dark bg-rapid-950 py-24 text-white sm:py-32">
        <Container className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="kicker">On your terms</p>
            <h2 id="terms-heading" className="t-section mt-4">
              No <span className="t-serif text-sun-300">surprises.</span>
            </h2>
            <p className="mt-5 max-w-[40ch] text-[18px] leading-relaxed text-rapid-100">
              You’ll know the task, the time it takes and any reward before you say yes.
            </p>
            <div className="mt-10 overflow-hidden rounded-[24px]">
              <Photo
                name="session"
                alt="A young woman typing feedback on a laptop in a café"
                sizes="(min-width: 1024px) 420px, 92vw"
                width={928}
                height={1152}
                className="aspect-[5/4] object-[center_35%]"
              />
            </div>
          </Reveal>
          <Stagger as="ol" className="space-y-4">
            {TERMS.map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="group flex flex-col gap-4 rounded-[24px] bg-white/[0.05] p-6 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.09] sm:flex-row sm:gap-5 sm:p-8">
                <span className="font-display text-[56px] font-extrabold leading-[0.8] tracking-[-0.05em] text-white/15 transition-colors group-hover:text-sun-300">
                  0{index + 1}
                </span>
                <div>
                  <Icon size={20} aria-hidden="true" className="text-sun-300" />
                  <h3 className="mt-3 font-display text-[24px] font-bold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-rapid-100">{body}</p>
                </div>
              </li>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Impact */}
      <section aria-labelledby="impact-heading" className="relative overflow-hidden py-24 sm:py-32">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[720px]">
              <p className="kicker">What your feedback changes</p>
              <h2 id="impact-heading" className="t-section mt-4 text-ink">
                See what your input <span className="t-serif text-rapid-700">helped change.</span>
              </h2>
            </div>
            <span className="rounded-full bg-cream-100 px-3 py-1 text-sm font-semibold text-ink-faint">Example loop</span>
          </Reveal>
          <Stagger as="ol" className="mt-12 grid gap-4 md:grid-cols-3">
            {IMPACT.map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="relative rounded-[24px] bg-white p-7 ring-1 ring-cream-200">
                <div className="flex items-center gap-3">
                  <span className={index === 2 ? 'flex h-11 w-11 items-center justify-center rounded-full bg-sun-500 text-ink' : 'flex h-11 w-11 items-center justify-center rounded-full bg-rapid-900 text-white'}>
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-ink-faint">Step {index + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-[24px] font-bold tracking-[-0.02em] text-ink">{title}</h3>
                <p className={index === 0 ? 'mt-2 font-serif text-[20px] italic leading-snug text-ink' : 'mt-2 text-[16px] leading-relaxed text-ink-soft'}>
                  {body}
                </p>
              </li>
            ))}
          </Stagger>
        </Container>
      </section>

      <div className="border-y border-cream-200 bg-white py-5">
        <Marquee
          items={['Try it early', 'Say what you think', 'See the terms first', 'Your details stay private', 'Help shape what gets built']}
          className="font-display text-[22px] font-semibold tracking-[-0.01em] text-ink"
        />
      </div>

      {/* FAQ */}
      <section aria-labelledby="tester-faq-heading" className="py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="kicker">Before you apply</p>
            <h2 id="tester-faq-heading" className="t-section mt-4 text-ink">
              Questions? <span className="t-serif text-rapid-700">Answered.</span>
            </h2>
            <Link to="/how-it-works" className="text-arrow mt-6">
              See how it works <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </Reveal>
          <Faq id="tester-page" items={TESTER_FAQ} />
        </Container>
      </section>

      {/* CTA */}
      <section className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="on-dark green-glow grain relative overflow-hidden rounded-[32px] px-6 py-20 text-white sm:px-12 sm:py-28">
          <Container className="relative text-center">
            <Reveal>
              <h2 className="t-display mx-auto max-w-[900px]">
                Your opinion <span className="t-serif text-sun-300">is worth something.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-[540px] text-[18px] leading-relaxed text-rapid-100">
                Create an account to track your application, invitations and reward status in one place.
              </p>
              <div className="mt-10 flex justify-center">
                <ButtonLink to="/sign-up/tester" size="lg" showArrow>
                  Create a tester account
                </ButtonLink>
              </div>
              <p className="mt-6 text-sm text-rapid-100">Free to apply · Adults 18+ · Joining does not guarantee a place.</p>
            </Reveal>
          </Container>
        </div>
      </section>
    </PageShell>
  );
}
