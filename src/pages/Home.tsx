import * as Accordion from '@radix-ui/react-accordion';
import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { FAQ, HOME, SITE } from '@/content/pilot';
import { usePageMeta } from '@/hooks/usePageMeta';
import { trackEvent } from '@/lib/analytics';

function InviteCta({ location }: { location: string }) {
  return (
    <ButtonLink
      to="/join"
      size="lg"
      showArrow
      onClick={() => trackEvent('cta_click', { cta: 'request_invite', location })}
    >
      {SITE.requestInvite}
    </ButtonLink>
  );
}

function FaqAnswer({ answer, privacyLink }: { answer: string; privacyLink?: boolean }) {
  if (!privacyLink) {
    return <p className="text-[16px] leading-relaxed text-light-muted">{answer}</p>;
  }

  const [before, after] = answer.split('Privacy Policy');
  return (
    <p className="text-[16px] leading-relaxed text-light-muted">
      {before}
      <Link
        to="/privacy"
        className="font-semibold text-brand-700 underline underline-offset-2 hover:text-ink"
      >
        Privacy Policy
      </Link>
      {after}
    </p>
  );
}

export default function Home() {
  usePageMeta({ title: SITE.title, description: SITE.description });

  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-white">
        <Container className="pb-16 pt-14 sm:pt-20 lg:pb-24 lg:pt-24">
          <div className="max-w-[860px]">
            <p className="t-eyebrow text-brand-700">RAPID pilot</p>
            <h1 className="t-statement mt-5 text-ink">{HOME.hero.headline}</h1>
            <p className="lead mt-6">{HOME.hero.lead}</p>
            <div className="mt-8">
              <InviteCta location="hero" />
            </div>
            <p className="mt-4 max-w-[54ch] text-sm leading-relaxed text-light-muted">
              {HOME.hero.note}
            </p>
          </div>
        </Container>
      </section>

      {/* The problem */}
      <section className="border-y border-sand-200 bg-sand-50" aria-labelledby="problem-heading">
        <Container className="py-14 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-16">
            <div>
              <p className="t-eyebrow text-brand-700">Why this matters</p>
              <h2 id="problem-heading" className="t-section mt-3 text-ink">
                {HOME.problem.heading}
              </h2>
            </div>
            <p className="max-w-[58ch] text-[18px] leading-relaxed text-light-muted sm:text-[19px]">
              {HOME.problem.body}
            </p>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="bg-white" aria-labelledby="how-heading">
        <Container className="py-16 lg:py-24">
          <div className="max-w-[680px]">
            <h2 id="how-heading" className="t-section text-ink">
              {HOME.how.heading}
            </h2>
            <p className="lead mt-4">
              A short application, a human review, and invitations only when a test fits.
            </p>
          </div>

          <ol className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOME.how.steps.map((step, index) => (
              <li key={step} className="border-t border-sand-200 pt-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="mt-4 max-w-[30ch] text-[16px] leading-relaxed text-ink">{step}</p>
              </li>
            ))}
          </ol>

          <p className="mt-10 text-sm text-light-muted">{HOME.how.note}</p>
        </Container>
      </section>

      {/* Founders */}
      <section className="bg-white pb-16 lg:pb-24" aria-labelledby="founders-heading">
        <Container>
          <div className="rounded-3xl bg-brand-50 px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div className="max-w-[760px]">
              <p className="t-eyebrow text-brand-700">For founders</p>
              <h2 id="founders-heading" className="t-section mt-3 text-ink">
                {HOME.founders.heading}
              </h2>
              <p className="lead mt-5">{HOME.founders.body}</p>
              <div className="mt-7">
                <ButtonLink
                  to="/founders"
                  variant="primary"
                  showArrow
                  onClick={() => trackEvent('cta_click', { cta: 'request_test', location: 'home' })}
                >
                  {HOME.founders.cta}
                </ButtonLink>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-light-muted">
                {HOME.founders.note}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-y border-sand-200 bg-sand-50" aria-labelledby="faq-heading">
        <Container className="py-16 lg:py-24">
          <div className="mx-auto max-w-[760px]">
            <div className="max-w-[560px]">
              <h2 id="faq-heading" className="t-section text-ink">
                Questions testers ask
              </h2>
              <p className="lead mt-4">
                Quick answers about applying, payments and how your details are used.
              </p>
            </div>

            <Accordion.Root
              type="single"
              collapsible
              defaultValue="faq-0"
              className="mt-9 space-y-3"
            >
              {FAQ.map((item, index) => (
                <Accordion.Item
                  key={item.question}
                  value={`faq-${index}`}
                  className="overflow-hidden rounded-2xl border border-sand-200 bg-white data-[state=open]:border-brand-600"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sand-300 text-sm font-bold text-light-muted transition-colors group-data-[state=open]:border-brand-600 group-data-[state=open]:bg-brand-50 group-data-[state=open]:text-brand-700">
                        <span className="group-data-[state=open]:hidden" aria-hidden="true">
                          +
                        </span>
                        <span className="hidden group-data-[state=open]:inline" aria-hidden="true">
                          −
                        </span>
                      </span>
                      <span className="flex-1 text-[17px] font-semibold text-ink">
                        {item.question}
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-[accordionOpen_0.3s_ease] data-[state=closed]:animate-[accordionClose_0.3s_ease]">
                    <div className="pb-5 pl-[68px] pr-5 sm:pr-6">
                      <FaqAnswer answer={item.answer} privacyLink={item.privacyLink} />
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </Container>
      </section>

      {/* Repeat invite CTA */}
      <section className="bg-white" aria-labelledby="final-cta-heading">
        <Container className="py-16 lg:py-24">
          <div className="mx-auto max-w-[760px] text-center">
            <h2 id="final-cta-heading" className="t-statement text-[38px] text-ink sm:text-[48px]">
              {HOME.finalCta.heading}
            </h2>
            <p className="lead mx-auto mt-4">{HOME.finalCta.lead}</p>
            <div className="mt-8 flex justify-center">
              <InviteCta location="final" />
            </div>
            <p className="mt-4 text-sm text-light-muted">{HOME.finalCta.note}</p>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
