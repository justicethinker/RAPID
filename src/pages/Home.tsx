import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardList,
  FileBarChart2,
  Lock,
  MessageSquareText,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Faq } from '@/components/site/Faq';
import { Marquee } from '@/components/site/Marquee';
import { FindingCard, ProductPreview } from '@/components/site/ProductPreview';
import { LoopSteps } from '@/components/site/LoopSteps';
import { CountUp } from '@/components/motion/CountUp';
import { Reveal, Stagger } from '@/components/motion/Reveal';
import { HOME, TESTER_FAQ } from '@/content/pilot';
import { cn } from '@/lib/cn';

const MARQUEE = ['Real people', 'Lagos', 'Enugu', 'Abuja', 'Honest feedback', 'Team-assisted matching', 'Clear next steps'];

const LOOP = [
  { title: 'Tell us what you’re testing', body: 'Share your idea, who it’s for and the one thing you need to find out.', icon: MessageSquareText },
  { title: 'We find the right people', body: 'Our team invites testers who fit your audience. They read the task and terms first, then choose.', icon: Users },
  { title: 'You get a clear answer', body: 'What people did, where they got stuck, the counts behind it and what it means for your next move.', icon: FileBarChart2 },
];

const SIDES = {
  founder: {
    label: 'I’m building something',
    title: 'Hear from real users before you build more.',
    body: 'Get your idea in front of people who live the problem. Find out what works, what confuses them and what to fix first.',
    points: HOME.value.founder.points,
    cta: { to: '/founders', label: 'See how it works for founders' },
    photo: { name: 'founder' as const, alt: 'A founder reviewing notes at her desk while a co-founder reads printed findings' },
  },
  tester: {
    label: 'I want to test products',
    title: 'Try it early. Say what you really think.',
    body: 'Test new products before they launch, give honest feedback and help shape what gets built. Some tasks come with a reward.',
    points: HOME.value.tester.points,
    cta: { to: '/join', label: 'See how it works for testers' },
    photo: { name: 'tester' as const, alt: 'Two students laughing while trying an app on a phone on campus' },
  },
};

type Side = keyof typeof SIDES;

const PROMISES = [
  { icon: Check, title: 'Always your choice', body: 'Taking part is voluntary. You can say no to any invitation.' },
  { icon: ClipboardList, title: 'Terms before yes', body: 'The task, time and any reward are shown before you accept.' },
  { icon: Lock, title: 'Private by default', body: 'Founders never see a tester’s name or contact details.' },
  { icon: ShieldCheck, title: 'No empty promises', body: 'Matching is team-assisted. Applying does not guarantee an invitation or payment.' },
];

function SideSwitch() {
  const [side, setSide] = useState<Side>('founder');
  const content = SIDES[side];

  return (
    <div>
      <div role="group" aria-label="Choose your side" className="inline-flex rounded-full bg-white p-1.5 shadow-elev-1 ring-1 ring-cream-200">
        {(Object.keys(SIDES) as Side[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={side === key}
            onClick={() => setSide(key)}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 sm:px-6 sm:text-[15px]',
              side === key ? 'bg-rapid-900 text-white shadow-elev-2' : 'text-ink-soft hover:text-ink',
            )}
          >
            {key === 'founder' ? <Rocket size={16} aria-hidden="true" /> : <UserRoundCheck size={16} aria-hidden="true" />}
            <span className="sm:hidden">{key === 'founder' ? 'Founder' : 'Tester'}</span>
            <span className="hidden sm:inline">{SIDES[key].label}</span>
          </button>
        ))}
      </div>

      <div key={side} className="mt-10 grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16" aria-live="polite">
        <div className="rise relative">
          <div className="overflow-hidden rounded-[28px] shadow-elev-3">
            <Photo
              name={content.photo.name}
              alt={content.photo.alt}
              sizes="(min-width: 1024px) 600px, 92vw"
              width={1200}
              height={896}
              className="aspect-[4/3] transition-transform duration-[1.2s] hover:scale-[1.03]"
            />
          </div>
          <span className="absolute -bottom-5 left-6 rounded-full bg-sun-500 px-5 py-2.5 font-display text-[15px] font-bold text-ink shadow-sun sm:left-8">
            {side === 'founder' ? 'For founders' : 'For testers'}
          </span>
        </div>
        <div className="rise" style={{ animationDelay: '90ms' }}>
          <h3 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[42px]">{content.title}</h3>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">{content.body}</p>
          <ul className="mt-7 space-y-3.5">
            {content.points.map((point) => (
              <li key={point} className="flex gap-3 text-[16px] leading-snug text-ink">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rapid-50 text-rapid-700">
                  <Check size={14} strokeWidth={2.6} aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <Link to={content.cta.to} className="text-arrow mt-8">
            {content.cta.label} <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  usePageMeta({
    title: 'RAPID | Test your startup idea with real people in Nigeria',
    description:
      'Find out if people will use your idea before you build it. RAPID recruits relevant testers in Nigeria and turns their feedback into clear next steps.',
  });

  return (
    <PageShell overlayHeader>
      {/* Hero ------------------------------------------------------------ */}
      <section className="on-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-rapid-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Photo
            name="hero"
            alt=""
            sizes="100vw"
            width={1920}
            height={1072}
            priority
            className="ken-burns h-full w-full object-cover object-[70%_center]"
          />
          <div className="hero-scrim absolute inset-0" />
          <div className="grain absolute inset-0" />
        </div>

        <Container className="relative flex w-full flex-1 flex-col justify-end pb-10 pt-32 sm:pt-36 lg:justify-center lg:pb-24">
          <div className="hero-stagger max-w-[760px]">
            <p className="kicker">Real feedback · Nigeria pilot</p>
            <h1 className="t-hero mt-6 text-white">
              Will people actually <span className="t-serif text-sun-300">use your idea?</span>
            </h1>
            <p className="mt-6 max-w-[560px] text-[18px] leading-relaxed text-cream-100 sm:text-[20px]">
              Find out before you build. RAPID puts your idea in front of real people in Nigeria, then shows you what
              they did, where they got stuck and what to fix next.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink to="/contact" size="lg" showArrow>
                Test my idea
              </ButtonLink>
              <ButtonLink to="/join" size="lg" variant="inverse">
                Become a tester
              </ButtonLink>
            </div>
            <p className="mt-5 text-sm text-rapid-100">
              Free for testers · Team-assisted matching · Joining does not guarantee a place.
            </p>
          </div>
          <FindingCard className="float-slow mt-10 lg:absolute lg:bottom-28 lg:right-10 lg:mt-0 xl:right-16" />
        </Container>

        <div className="relative border-t border-white/10 bg-rapid-950/60 py-5 backdrop-blur-md">
          <Marquee items={MARQUEE} className="font-display text-[20px] font-semibold tracking-[-0.01em] text-cream-50 sm:text-[24px]" />
        </div>
      </section>

      {/* Why ------------------------------------------------------------- */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <Container>
          <Reveal className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-end">
            <h2 id="value-heading" className="t-display text-ink">
              Friends say it’s great. <span className="t-serif text-rapid-700">Customers tell the truth.</span>
            </h2>
            <div className="space-y-4 text-[18px] leading-relaxed text-ink-soft">
              <p>
                Friends and family will cheer you on. People who actually need the product will tell you what’s wrong with
                it, and that is the feedback worth having.
              </p>
              <Link to="/how-it-works" className="text-arrow">
                See how it works <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <Stagger className="mt-16 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-rapid-900 p-7 text-white">
              <p className="font-display text-[64px] font-extrabold leading-none tracking-[-0.05em]">
                <CountUp value={3} /> <span className="text-[28px] tracking-[-0.02em] text-rapid-200">days</span>
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-rapid-100">Our aim for reviewing a tester application.</p>
            </div>
            <div className="rounded-[24px] bg-sun-500 p-7 text-ink">
              <p className="font-display text-[64px] font-extrabold leading-none tracking-[-0.05em]">
                10–<CountUp value={30} /> <span className="text-[28px] tracking-[-0.02em]">min</span>
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink">A typical task. Short, focused and done in your own time.</p>
            </div>
            <div className="rounded-[24px] bg-white p-7 ring-1 ring-cream-200">
              <p className="font-display text-[64px] font-extrabold leading-none tracking-[-0.05em] text-ink">0</p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">Tester names or contact details shared with founders.</p>
            </div>
          </Stagger>
        </Container>
      </section>

      {/* The loop -------------------------------------------------------- */}
      <section id="how-it-works" aria-labelledby="loop-heading" className="on-dark green-glow relative overflow-hidden py-24 text-white sm:py-32">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-[720px]">
              <p className="kicker">How it works</p>
              <h2 id="loop-heading" className="t-section mt-4">
                Three steps. <span className="t-serif text-sun-300">One clear answer.</span>
              </h2>
            </div>
            <Link to="/how-it-works" className="text-arrow">
              The full process <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </Reveal>
          <div className="mt-14">
            <LoopSteps steps={LOOP} />
          </div>
        </Container>
      </section>

      {/* Two sides ------------------------------------------------------- */}
      <section aria-labelledby="sides-heading" className="py-24 sm:py-32">
        <Container>
          <Reveal className="max-w-[760px]">
            <p className="kicker">Two ways in</p>
            <h2 id="sides-heading" className="t-section mt-4 text-ink">
              Which side are <span className="t-serif text-rapid-700">you on?</span>
            </h2>
          </Reveal>
          <div className="mt-10">
            <SideSwitch />
          </div>
        </Container>
      </section>

      {/* Proof ----------------------------------------------------------- */}
      <section aria-labelledby="proof-heading" className="relative overflow-hidden bg-cream-100 py-24 sm:py-32">
        <div aria-hidden="true" className="paper-grid absolute inset-0" />
        <Container className="relative">
          <Reveal className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="kicker">What you get back</p>
              <h2 id="proof-heading" className="t-section mt-4 text-ink">
                Not a survey. <span className="t-serif text-rapid-700">Evidence.</span>
              </h2>
            </div>
            <p className="lead">{HOME.proof.lead}</p>
          </Reveal>
          <Reveal className="mt-12" delay={120}>
            <ProductPreview />
          </Reveal>
        </Container>
      </section>

      {/* Honesty --------------------------------------------------------- */}
      <section aria-labelledby="honesty-heading" className="py-24 sm:py-32">
        <Container className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal className="relative">
            <div className="overflow-hidden rounded-[28px]">
              <Photo
                name="session"
                alt="A young woman typing feedback on a laptop in a café"
                sizes="(min-width: 1024px) 480px, 92vw"
                width={928}
                height={1152}
                className="aspect-[4/5] max-h-[620px]"
              />
            </div>
            <div className="absolute -right-3 bottom-8 max-w-[240px] rounded-[20px] bg-rapid-900 p-5 text-white shadow-float sm:-right-8">
              <Sparkles size={18} aria-hidden="true" className="text-sun-300" />
              <p className="mt-3 font-display text-[20px] font-bold leading-tight tracking-[-0.02em]">
                Your honest opinion <span className="t-serif text-sun-300">is the job.</span>
              </p>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="kicker">How we treat testers</p>
              <h2 id="honesty-heading" className="t-section mt-4 text-ink">
                Testers are people, <span className="t-serif text-rapid-700">not numbers.</span>
              </h2>
              <p className="lead mt-5">
                Good evidence starts with respect. Every test is voluntary, the terms come first, and personal details stay
                with RAPID.
              </p>
            </Reveal>
            <Stagger className="mt-10 grid gap-3 sm:grid-cols-2">
              {PROMISES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="lift rounded-[20px] bg-white p-5 ring-1 ring-cream-200">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rapid-50 text-rapid-700">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-[19px] font-bold tracking-[-0.015em] text-ink">{title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{body}</p>
                </div>
              ))}
            </Stagger>
            <Link to="/about" className="text-arrow mt-8">
              What we stand for <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>

      {/* FAQ ------------------------------------------------------------- */}
      <section aria-labelledby="faq-heading" className="border-t border-cream-200 py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="kicker">Questions</p>
            <h2 id="faq-heading" className="t-section mt-4 text-ink">
              Questions about <span className="t-serif text-rapid-700">testing?</span>
            </h2>
            <p className="mt-5 max-w-[36ch] text-[17px] leading-relaxed text-ink-soft">
              Quick, honest answers. Building something instead?{' '}
              <Link to="/founders" className="font-semibold text-rapid-700 underline underline-offset-4 hover:text-ink">
                Read the founder FAQ
              </Link>
              .
            </p>
          </Reveal>
          <Faq id="home" items={TESTER_FAQ} />
        </Container>
      </section>

      {/* Final CTA ------------------------------------------------------- */}
      <section aria-labelledby="final-cta-heading" className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="on-dark green-glow grain relative overflow-hidden rounded-[32px] px-6 py-20 text-white sm:px-12 sm:py-28">
          <Container className="relative text-center">
            <Reveal>
              <h2 id="final-cta-heading" className="t-display mx-auto max-w-[900px]">
                Got an idea? <span className="t-serif text-sun-300">Let’s test it.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-[560px] text-[18px] leading-relaxed text-rapid-100">
                Building something? Tell us about it. Want to test products? Tell us about you. Either way, it takes a few
                minutes to start.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <ButtonLink to="/contact" size="lg" showArrow>
                  Test my idea
                </ButtonLink>
                <ButtonLink to="/join" size="lg" variant="inverse">
                  Become a tester
                </ButtonLink>
              </div>
              <p className="mt-6 text-sm text-rapid-100">Joining does not guarantee a place.</p>
            </Reveal>
          </Container>
        </div>
      </section>
    </PageShell>
  );
}
