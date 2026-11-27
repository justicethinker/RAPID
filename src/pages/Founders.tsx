import { Link } from 'react-router-dom';
import { ArrowUpRight, ClipboardList, FileBarChart2, Lightbulb, MonitorSmartphone, PenTool, Rocket, Users } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { Faq } from '@/components/site/Faq';
import { LoopSteps } from '@/components/site/LoopSteps';
import { DotRatio, ProductPreview } from '@/components/site/ProductPreview';
import { Reveal, Stagger } from '@/components/motion/Reveal';
import { FOUNDER_FAQ, SAMPLE } from '@/content/pilot';
import { usePageMeta } from '@/hooks/usePageMeta';

const FOUNDER_STORIES = [
  {
    initials: 'CG',
    name: 'Caleb Godson',
    role: 'CEO, Jacmate',
    pull: 'One thing is to conduct a survey, but another thing is to analyse the responses.',
    paragraphs: [
      'I really loved the product, especially the analysis and reporting. One thing is to conduct a survey, but another thing is to analyse the responses.',
      'RAPID made everything easier by analysing and summarising the results, allowing me to understand the findings without having to do all the work myself.',
      'One improvement I would suggest is giving founders the option to provide their own survey questions or allow RAPID to handle everything for them.',
    ],
  },
  {
    initials: 'CE',
    name: 'Chioma Eugene',
    role: 'Founder, Dermalink',
    pull: 'I’d definitely pay to use RAPID again. Optimizing time as a founder is necessary.',
    paragraphs: [
      'I’d definitely pay to use RAPID again. Optimizing time as a founder is necessary.',
      'Conducting physical surveys myself takes time and effort. RAPID helps me save that time so I can focus on other important aspects of my business.',
      'You guys are really efficient. I’m impressed.',
    ],
  },
] as const;

const STAGES = [
  { icon: Lightbulb, title: 'A rough concept', body: 'Test whether the problem is real before you build anything.' },
  { icon: PenTool, title: 'A prototype', body: 'Watch where people hesitate, misread or give up.' },
  { icon: MonitorSmartphone, title: 'A live product', body: 'Find the step that loses people, and why.' },
];

const STEPS = [
  { icon: ClipboardList, title: 'A clear brief', body: 'We agree your question, audience, task and terms before anything starts.' },
  { icon: Users, title: 'The right testers', body: 'Our team invites reviewed testers whose situation and experience fit who you’re building for.' },
  { icon: FileBarChart2, title: 'Findings you can use', body: 'Outcomes, counts and anonymised quotes where testers agree, with the context to trust them.' },
];

export default function Founders() {
  usePageMeta({
    title: 'User research for Nigerian startups | RAPID',
    description:
      'Get your product in front of the right people in Nigeria. RAPID recruits the testers, runs the research and shows you what to fix. Request a call.',
  });

  return (
    <PageShell overlayHeader>
      {/* Hero */}
      <section className="on-dark green-glow relative overflow-hidden text-white">
        <div aria-hidden="true" className="grain absolute inset-0" />
        <Container className="relative grid min-h-[92svh] items-center gap-12 pb-16 pt-32 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-20 lg:pt-36">
          <div className="hero-stagger">
            <p className="kicker">For founders &amp; teams</p>
            <h1 className="t-display mt-6">
              Know what customers think <span className="t-serif text-sun-300">before you build.</span>
            </h1>
            <p className="mt-6 max-w-[540px] text-[18px] leading-relaxed text-cream-100 sm:text-[19px]">
              RAPID puts your product in front of the right people in Nigeria and shows you what works, what confuses them
              and what to fix first.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink to="/contact" size="lg" showArrow>
                Test my idea
              </ButtonLink>
              <ButtonLink to="/how-it-works" size="lg" variant="inverse">
                How it works
              </ButtonLink>
            </div>
            <p className="mt-5 text-sm text-rapid-100">
              No account needed · Scope and cost agreed before recruitment · Requesting a test does not guarantee a place.
            </p>
          </div>

          <div className="relative">
            <div className="pop-in overflow-hidden rounded-[32px] shadow-float ring-1 ring-white/10">
              <Photo
                name="founder"
                alt="A founder reviewing sticky-note research at her desk while her co-founder reads printed findings"
                sizes="(min-width: 1024px) 560px, 92vw"
                width={1200}
                height={896}
                priority
                className="ken-burns aspect-[4/3.6] object-[40%_center]"
              />
            </div>
            <div className="float-slow absolute -bottom-6 left-4 w-[250px] rounded-[20px] bg-white p-4 text-ink shadow-float sm:-left-8 sm:w-[280px]">
              <div className="flex items-center justify-between text-xs font-semibold text-ink-faint">
                <span>{SAMPLE.brief.kicker}</span>
                <span className="rounded-full bg-cream-100 px-2 py-0.5">Example</span>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  ['Invited', SAMPLE.brief.invited],
                  ['Accepted', SAMPLE.brief.accepted],
                  ['Finished', SAMPLE.brief.completed],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-cream-50 py-2">
                    <dt className="text-[11px] text-ink-faint">{label}</dt>
                    <dd className="font-display text-[26px] font-bold leading-tight tracking-[-0.03em]">{value}</dd>
                  </div>
                ))}
              </dl>
              <DotRatio lit={7} of={9} size="sm" className="mt-3" />
              <p className="mt-2 text-[13px] font-semibold text-rapid-700">7 of 9 stopped at phone verification</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Why test first */}
      <section className="py-24 sm:py-32">
        <Container>
          <Reveal className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <h2 className="t-section text-ink">
              Every wrong assumption <span className="t-serif text-rapid-700">costs money.</span>
            </h2>
            <p className="lead">
              Finding out now is cheaper than finding out after launch. Whatever stage you’re at, we plan the right test and
              recruit people who fit your audience.
            </p>
          </Reveal>
          <Stagger className="mt-14 grid gap-4 md:grid-cols-3">
            {STAGES.map(({ icon: Icon, title, body }, index) => (
              <div
                key={title}
                className={
                  index === 1
                    ? 'lift rounded-[24px] bg-rapid-900 p-7 text-white'
                    : 'lift rounded-[24px] bg-white p-7 ring-1 ring-cream-200'
                }
              >
                <span
                  className={
                    index === 1
                      ? 'flex h-12 w-12 items-center justify-center rounded-full bg-sun-500 text-ink'
                      : 'flex h-12 w-12 items-center justify-center rounded-full bg-rapid-50 text-rapid-700'
                  }
                >
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className="mt-8 font-display text-[24px] font-bold tracking-[-0.02em]">{title}</h3>
                <p className={index === 1 ? 'mt-2 text-[15px] leading-relaxed text-rapid-100' : 'mt-2 text-[15px] leading-relaxed text-ink-soft'}>
                  {body}
                </p>
              </div>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* What you get */}
      <section aria-labelledby="founder-steps-heading" className="on-dark bg-rapid-950 py-24 text-white sm:py-32">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[720px]">
              <p className="kicker">What you get</p>
              <h2 id="founder-steps-heading" className="t-section mt-4">
                A question. A test. <span className="t-serif text-sun-300">An answer.</span>
              </h2>
            </div>
            <p className="max-w-[360px] text-[17px] leading-relaxed text-rapid-100">
              One team, from your first conversation to a decision you can act on.
            </p>
          </Reveal>
          <div className="mt-14">
            <LoopSteps steps={STEPS} />
          </div>
        </Container>
      </section>

      {/* Proof */}
      <section aria-labelledby="founder-proof-heading" className="relative overflow-hidden bg-cream-100 py-24 sm:py-32">
        <div aria-hidden="true" className="paper-grid absolute inset-0" />
        <Container className="relative">
          <Reveal className="max-w-[760px]">
            <p className="kicker">What a test looks like</p>
            <h2 id="founder-proof-heading" className="t-section mt-4 text-ink">
              One brief. <span className="t-serif text-rapid-700">One clear finding.</span>
            </h2>
            <p className="lead mt-5">Click through an example test, from the question you bring to the call you make.</p>
          </Reveal>
          <Reveal className="mt-12" delay={120}>
            <ProductPreview />
          </Reveal>
          <Link to="/contact" className="text-arrow mt-10">
            Start with your question <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </Container>
      </section>

      {/* Founder stories */}
      <section id="founder-stories" aria-labelledby="founder-stories-heading" className="py-24 sm:py-32">
        <Container>
          <Reveal className="max-w-[760px]">
            <p className="kicker">Founder stories</p>
            <h2 id="founder-stories-heading" className="t-section mt-4 text-ink">
              What founders <span className="t-serif text-rapid-700">told us.</span>
            </h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 lg:grid-cols-2">
            {FOUNDER_STORIES.map((story) => (
              <figure key={story.name} className="flex flex-col rounded-[28px] bg-white p-7 ring-1 ring-cream-200 sm:p-10">
                <span aria-hidden="true" className="font-serif text-[80px] leading-[0.6] text-sun-500">
                  “
                </span>
                <p aria-hidden="true" className="mt-4 font-serif text-[28px] italic leading-[1.2] text-ink sm:text-[32px]">
                  {story.pull}
                </p>
                <blockquote className="mt-2 flex-1">
                  {story.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="mt-4 text-[16px] leading-relaxed text-ink-soft">
                      {paragraph}
                    </p>
                  ))}
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3 border-t border-cream-200 pt-6">
                  <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-rapid-900 text-sm font-bold text-cream-50">
                    {story.initials}
                  </span>
                  <span>
                    <cite className="block font-semibold not-italic text-ink">{story.name}</cite>
                    <span className="text-sm text-ink-faint">{story.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* FAQ */}
      <section aria-labelledby="founder-faq-heading" className="border-t border-cream-200 py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="kicker">Before we start</p>
            <h2 id="founder-faq-heading" className="t-section mt-4 text-ink">
              Straight <span className="t-serif text-rapid-700">answers.</span>
            </h2>
            <p className="mt-5 max-w-[34ch] text-[17px] leading-relaxed text-ink-soft">What founders usually ask first.</p>
            <Link to="/contact" className="text-arrow mt-6">
              Talk to us <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </Reveal>
          <Faq id="founder-page" items={FOUNDER_FAQ} />
        </Container>
      </section>

      {/* CTA */}
      <section className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="on-dark green-glow grain relative overflow-hidden rounded-[32px] px-6 py-20 text-white sm:px-12 sm:py-28">
          <Container className="relative text-center">
            <Reveal>
              <Rocket size={28} aria-hidden="true" className="mx-auto text-sun-300" />
              <h2 className="t-display mx-auto mt-6 max-w-[900px]">
                Bring the question. <span className="t-serif text-sun-300">We’ll plan the test.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-[520px] text-[18px] leading-relaxed text-rapid-100">
                Tell us what you’re building. We’ll message you on WhatsApp to set up a call.
              </p>
              <div className="mt-10 flex justify-center">
                <ButtonLink to="/contact" size="lg" showArrow>
                  Test my idea
                </ButtonLink>
              </div>
              <p className="mt-6 text-sm text-rapid-100">Requesting a test does not guarantee a place in the pilot.</p>
            </Reveal>
          </Container>
        </div>
      </section>
    </PageShell>
  );
}
