import { Ear, HeartHandshake, ScanSearch } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { PageHero } from '@/components/site/PageHero';
import { Reveal, Stagger } from '@/components/motion/Reveal';
import { usePageMeta } from '@/hooks/usePageMeta';

const VALUES = [
  { icon: Ear, title: 'Ask, then listen', body: 'Ask a clear question, and stay open to an answer you didn’t expect.' },
  { icon: HeartHandshake, title: 'Respect the people involved', body: 'Taking part is voluntary, the terms are explained up front and personal details stay protected.' },
  { icon: ScanSearch, title: 'Show the evidence', body: 'Every finding comes with its context, so teams know how far to trust it.' },
];

export default function About() {
  usePageMeta({
    title: 'About RAPID | People-led research in Nigeria',
    description:
      'RAPID is a people-led research service connecting founders with relevant testers in Nigeria, so product decisions rest on evidence.',
  });

  return (
    <PageShell>
      <PageHero
        kicker="About RAPID"
        title={
          <>
            Great products start with <span className="t-serif text-rapid-700">listening to the right people.</span>
          </>
        }
        lead="RAPID connects founders with the people they’re building for. We’re starting in Nigeria, turning clear questions and real experiences into decisions founders can act on."
        photo={{ name: 'team', alt: 'Three colleagues reviewing research notes around a table', width: 928, height: 1152 }}
      />

      <section aria-labelledby="values-heading" className="on-dark bg-rapid-950 py-24 text-white sm:py-32">
        <Container>
          <Reveal className="max-w-[720px]">
            <p className="kicker">How we work</p>
            <h2 id="values-heading" className="t-section mt-4">
              Good evidence starts <span className="t-serif text-sun-300">with respect.</span>
            </h2>
          </Reveal>
          <Stagger className="mt-14 grid gap-4 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, body }, index) => (
              <article key={title} className="rounded-[24px] bg-white/[0.05] p-7 ring-1 ring-inset ring-white/10">
                <span className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sun-500 text-ink">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span aria-hidden="true" data-n={`0${index + 1}`} className="font-display text-[44px] font-extrabold leading-none tracking-[-0.05em] text-white/15 before:content-[attr(data-n)]" />
                </span>
                <h3 className="mt-8 font-display text-[24px] font-bold tracking-[-0.02em]">{title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-rapid-100">{body}</p>
              </article>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container className="text-center">
          <Reveal>
            <h2 className="t-display mx-auto max-w-[820px] text-ink">
              Let’s find out <span className="t-serif text-rapid-700">together.</span>
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <ButtonLink to="/contact" size="lg" showArrow>
                Test my idea
              </ButtonLink>
              <ButtonLink to="/join" size="lg" variant="outline">
                Become a tester
              </ButtonLink>
            </div>
            <p className="mt-6 text-sm text-ink-faint">Joining does not guarantee a place.</p>
          </Reveal>
        </Container>
      </section>
    </PageShell>
  );
}
