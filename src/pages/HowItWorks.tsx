import { Link } from 'react-router-dom';
import { ArrowUpRight, CircleCheckBig, CircleStop, Hand, HandCoins, MessageSquareText, ClipboardList, Users, FileBarChart2 } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { PageHero } from '@/components/site/PageHero';
import { LoopSteps } from '@/components/site/LoopSteps';
import { Reveal, Stagger } from '@/components/motion/Reveal';
import { usePageMeta } from '@/hooks/usePageMeta';

const STEPS = [
  { icon: MessageSquareText, title: 'You ask', body: 'A founder tells us what they need to learn and who they need to hear from.' },
  { icon: ClipboardList, title: 'We plan', body: 'We agree the task, audience, timing and reward before any recruiting starts.' },
  { icon: Users, title: 'Testers take part', body: 'We invite suitable testers. Each one reads the terms and chooses whether to take part.' },
  { icon: FileBarChart2, title: 'You learn', body: 'We review the responses and share findings with counts, context and the limits of the evidence.' },
];

const ACTIONS = [
  { icon: CircleCheckBig, title: 'Finished the task', body: 'They completed the task you set and described what happened.' },
  { icon: CircleStop, title: 'Stopped at a specific step', body: 'They showed exactly where the idea or prototype lost them.' },
  { icon: Hand, title: 'Asked to hear more', body: 'They chose a next step instead of only giving an opinion.' },
  { icon: HandCoins, title: 'Said they would pay', body: 'A stated intent to pay. Useful, but not proof on its own.' },
];

export default function HowItWorks() {
  usePageMeta({
    title: 'How RAPID works | Product research in Nigeria',
    description:
      'See how RAPID takes a founder’s question to clear findings: scoping the test, recruiting testers, collecting responses and reporting what they mean.',
  });

  return (
    <PageShell overlayHeader>
      <PageHero
        tone="green"
        kicker="How RAPID works"
        title={
          <>
            From your question to <span className="t-serif text-sun-300">a clear answer.</span>
          </>
        }
        lead="A simple, people-led process that connects your idea with the people you’re building for."
      />

      <section aria-labelledby="process-heading" className="py-24 sm:py-32">
        <Container>
          <Reveal className="max-w-[720px]">
            <p className="kicker">The process</p>
            <h2 id="process-heading" className="t-section mt-4 text-ink">
              Four steps. <span className="t-serif text-rapid-700">No guesswork.</span>
            </h2>
          </Reveal>
          <div className="mt-14">
            <LoopSteps steps={STEPS} tone="light" />
          </div>
        </Container>
      </section>

      <section aria-labelledby="counts-heading" className="relative overflow-hidden bg-cream-100 py-24 sm:py-32">
        <div aria-hidden="true" className="paper-grid absolute inset-0" />
        <Container className="relative">
          <Reveal className="max-w-[820px]">
            <p className="kicker">What counts</p>
            <h2 id="counts-heading" className="t-section mt-4 text-ink">
              A polite answer is <span className="t-serif text-rapid-700">not a next step.</span>
            </h2>
            <p className="lead mt-5">
              We agree what a useful action looks like before recruitment, so a kind word is never mistaken for demand.
            </p>
          </Reveal>
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ACTIONS.map(({ icon: Icon, title, body }, index) => (
              <article key={title} className="lift flex flex-col rounded-[24px] bg-white p-6 ring-1 ring-cream-200">
                <span className={index === 3 ? 'flex h-11 w-11 items-center justify-center rounded-full bg-cream-100 text-ink-soft' : 'flex h-11 w-11 items-center justify-center rounded-full bg-rapid-50 text-rapid-700'}>
                  <Icon size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-[21px] font-bold leading-tight tracking-[-0.02em] text-ink">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{body}</p>
              </article>
            ))}
          </Stagger>
          <p className="mt-6 text-sm text-ink-faint">What counts depends on the test. We agree it with you before recruiting.</p>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container className="grid gap-5 md:grid-cols-2">
          <Reveal className="flex flex-col rounded-[28px] bg-rapid-900 p-8 text-white sm:p-12">
            <p className="kicker !text-rapid-100">For founders</p>
            <h2 className="mt-4 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em]">
              Start with what you <span className="t-serif text-sun-300">need to know.</span>
            </h2>
            <p className="mt-4 max-w-[44ch] flex-1 text-[16px] leading-relaxed text-rapid-100">
              Tell us your question. We’ll talk through fit, scope and cost before any recruiting begins.
            </p>
            <div className="on-dark mt-8">
              <ButtonLink to="/contact" showArrow>
                Test my idea
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={100} className="flex flex-col rounded-[28px] bg-white p-8 ring-1 ring-cream-200 sm:p-12">
            <p className="kicker">For testers</p>
            <h2 className="mt-4 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
              Your opinion, <span className="t-serif text-rapid-700">your choice.</span>
            </h2>
            <p className="mt-4 max-w-[44ch] flex-1 text-[16px] leading-relaxed text-ink-soft">
              Apply for free, get invited when a test fits, and track your participation and reward status in your account.
            </p>
            <Link className="text-arrow mt-8" to="/join">
              Become a tester <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </Reveal>
        </Container>
      </section>
    </PageShell>
  );
}
